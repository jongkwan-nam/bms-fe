import $ from 'jquery';
import syncFetch from 'sync-fetch';
import '../_open_sources/dynatree';
import tagUi from '../utils/TabUI';
import { addNode, createNode, existsNode, getNode, getNodes } from '../utils/hoxUtils';
import './FeRecipient.scss';
import FeRec from './recipientInfo/FeRec';

export default class FeRecipient extends HTMLElement {
  active = false;

  constructor() {
    super();
    console.debug('FeRecipient init');
  }

  connectedCallback() {
    console.debug('FeRecipient connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const LINK2 = document.createElement('link');
    LINK2.setAttribute('rel', 'stylesheet');
    LINK2.setAttribute('href', './css/dynatree.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-recipient', 'tree-list');
    wrapper.innerHTML = `
      <div class="tree">
        <div class="tab-group" role="tablist">
          <button type="button" class="tab-button" role="tab" target="#orgTreePanel" active>${GWWEBMessage.cabinet_msg_48 /* 조직도 */}</button>
          <button type="button" class="tab-button" role="tab" target="#groupTreePanel">${GWWEBMessage.cmsg_1166 /* 수신부서 그룹 */}</button>
          <button type="button" class="tab-button" role="tab" target="#manualPanel">${GWWEBMessage.cmsg_1167 /* 외부 */}</button>
          <button type="button" class="tab-button" role="tab" target="#ldapTreePanel">${GWWEBMessage.cmsg_2200 /* LDAP */}</button>
        </div>
        <div>
          <div class="tab-content" role="tabpanel" id="orgTreePanel">
            <div id="tree" class="folder"></div>
          </div>
          <div class="tab-content" role="tabpanel" id="groupTreePanel">
            <div id="groupTree" class="folder"></div>
          </div>
          <div class="tab-content" role="tabpanel" id="manualPanel">
            <div id="manual" class="folder"></div>
          </div>
          <div class="tab-content" role="tabpanel" id="ldapTreePanel">
            <div id="ldapTree" class="folder"></div>
          </div>
        </div>
      </div>
      <div class="list">
        <ul id="list" class="sortable-list"></ul>
        <div class="recipient-info">
          <div>
            <input type="checkbox" id="displayCheckbox" />
            <label for="displayCheckbox">${GWWEBMessage.cmsg_1178}</label>
          </div>
          <input type="text" id="displayString" placeholder="${GWWEBMessage.W2850}" />
          <label for="senderName">${GWWEBMessage.cmsg_759}</label>
          <select id="senderName"></select>
        </div>
      </div>

    `;

    this.shadowRoot.append(LINK, LINK2, wrapper);
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    if (this.active) {
      return;
    }

    tagUi(this.shadowRoot);

    // 탭 선택 이벤트 리스너
    this.shadowRoot.querySelectorAll('[role="tabpanel"]').forEach((tabpanel) => {
      //
      tabpanel.addEventListener('active', (e) => {
        //
        console.log('tabpanel active', e.target.id);
        let id = e.target.id;

        switch (id) {
          case 'orgTreePanel':
            this.renderOrgTree();
            break;
          case 'groupTreePanel':
            this.renderGroupTree();
            break;
          case 'manualPanel':
            this.renderManual();
            break;
          case 'ldapTreePanel':
            this.renderLdapTree();
            break;
          default:
            throw new Error('undefined tabId: ' + id);
        }
      });
    });

    this.hox = hox;
    this.renderOrgTree(); // 첫탭. 조직도 트리 그리기
    this.renderRec(); // hox기반 수신부서(fe-rec) 그리기
    this.active = true;
  }

  renderOrgTree() {
    let tree = this.shadowRoot.querySelector('#tree');

    const params = {
      acton: 'initOrgTree',
      baseDept: '000010100',
      startDept: '',
      notUseDept: '000000101',
      checkbox: 'both',
      display: ',userListHeight255px',
      informalUser: false,
    };
    const queryString = new URLSearchParams(params).toString();
    fetch('/directory-web/org.do?' + queryString)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        const ROOT_FOLDER_ID = '00000000000000000001';

        $(tree)
          .dynatree({
            title: 'tree',
            persist: false,
            checkbox: true,
            selectMode: 2,
            clickFolderMode: 1,
            key: ROOT_FOLDER_ID,
            fx: { height: 'toggle', duration: 200 },
            children: data,
            /**
             *
             * @param {boolean} select 선택/해제 여부
             * @param {*} dtnode 해당 노드
             */
            onSelect: (select, dtnode) => {
              console.log('[dynatree] onSelect', select, dtnode.data.title, dtnode);
              if (select) {
                // 결재선에 추가
                this.addRecipient(dtnode);
              } else {
                // 결재선에서 제거
                this.removeRecipient(dtnode);
              }
              this.renderDisplayString();
            },
            onClick: (dtnode, event) => {
              console.log('[dynatree] onClick', dtnode.data.title, dtnode.getEventTargetType(event), dtnode, event);

              if (!dtnode.data.isFolder) {
                dtnode.parent.childList.forEach((child) => {
                  console.log('onClick', child.isSelected(), child.data.title);
                  if (!child.data.isFolder && child.isSelected()) {
                    child.select(false);
                  }
                });
              }

              if (dtnode.getEventTargetType(event) === 'title') {
                dtnode.toggleSelect();
              }
            },
            onLazyRead: function (dtnode) {
              console.log('[dynatree] onLazyRead', dtnode.data.title, dtnode);
              var params = {
                acton: 'expandOrgTree',
                deptID: dtnode.data.key,
                notUseDept: '000000101',
                checkbox: 'both',
                display: ',userListHeight255px',
                informalUser: false,
              };
              dtnode.appendAjax({
                url: '/directory-web/org.do',
                type: 'post',
                data: params,
                success: function (dtnode) {
                  console.log('[dynatree] appendAjax', dtnode.data.title, dtnode);
                },
              });
            },
            onRender: function (dtnode, nodeSpan) {
              console.log('onLoader', dtnode, nodeSpan);
              if (!dtnode.data.isFolder) {
                var res = $(nodeSpan).html().replace('dynatree-checkbox', 'dynatree-radio');
                $(nodeSpan).html(res);
              }

              if (dtnode.data.rbox == 'false') {
                dtnode.data.unselectable = true;
                $(nodeSpan).addClass('ui-dynatree-notuse');
              } else {
                $(nodeSpan).addClass('ui-dynatree-rbox-have');
              }
            },
          })
          .dynatree('getRoot')
          .tree.getNodeByKey(rInfo.user.deptID)
          .activate();
      });
  }

  renderGroupTree() {
    //
  }

  renderManual() {
    //
  }

  renderLdapTree() {
    //
  }

  /**
   * 트리에서 선택
   * @param {Object} dtnode
   */
  addRecipient(dtnode) {
    let rec;
    if (dtnode.data.isFolder) {
      rec = this.#dtnodeToRecDept(dtnode);
    } else {
      rec = this.#dtnodeToRecUser(dtnode);
    }

    //
    let recData = dtnode.data;
    const LIST = this.shadowRoot.querySelector('#list');
    const LI = LIST.appendChild(document.createElement('li'));
    // LI.id = 'rec' + recData.key;
    let feRec = LI.appendChild(new FeRec());
    feRec.set(rec);
    feRec.addEventListener('delete', () => {
      //
      if (dtnode) {
        dtnode.toggleSelect();
      }
      LI.remove();
    });
    dtnode['li'] = LI;

    // LI.innerHTML = `
    //   <div class="recipient-bar">
    //     <span class="rec-type">${recData.isFolder ? GWWEBMessage.hsappr_0164 : GWWEBMessage.W2440}</span>
    //     <div class="rec-info">
    //       <span class="img-profile" style="background-image: url('${recData.isFolder ? `/user/img/team_profile_blank.png` : `/jsp/org/view/ViewPicture.jsp?user_id=${recData.key}`}')"></span>
    //       <span class="name">${recData.isFolder ? recData.title : recData.name}</span>
    //       ${recData.isFolder ? '' : `<span class="rank">${recData.positionName}</span><span class="team">${recData.deptName}</span>`}
    //     </div>
    //     <div class="rec-close">
    //       <button type="button">&times;</button>
    //     </div>
    //   </div>
    // `;
    // LI.querySelector('button').addEventListener('click', () => {
    //   dtnode.toggleSelect();
    //   LI.remove();
    // });
  }

  removeRecipient(dtnode) {
    let recData = dtnode.data;
    const LIST = this.shadowRoot.querySelector('#list');
    //
    // LIST.querySelector('#rec' + recData.key).remove();
    dtnode.li.remove();
  }

  renderDisplayString() {
    //
  }

  renderRec() {
    //
    const LIST = this.shadowRoot.querySelector('#list');

    getNodes(this.hox, 'docInfo content receiptInfo recipient rec').forEach((rec) => {
      console.log('recipient rec', rec);
      //
      const LI = LIST.appendChild(document.createElement('li'));
      let feRec = LI.appendChild(new FeRec());
      feRec.set(rec);
      feRec.addEventListener('delete', () => {
        //
        LI.remove();
      });
    });
  }

  #checkRecipientNode() {
    if (!existsNode(this.hox, 'docInfo content receiptInfo recipient')) {
      addNode(this.hox, 'docInfo content receiptInfo', 'recipient');
    }
  }

  #dtnodeToRecDept(dtnode) {
    this.#checkRecipientNode();
    //

    let xmlText = `
    <rec type="rectype_dept">
      <ID>${dtnode.data.key}</ID>
      <name>${dtnode.data.title}</name>
      <charger>
        <ID/>
        <name/>
        <positionName/>
        <department>
          <ID/>
          <name/>
        </department>
      </charger>
      <displayString>${dtnode.data.title}${GWWEBMessage.cmsg_0034}</displayString>
    </rec>
    `;
    return getNode(this.hox, 'docInfo content receiptInfo recipient').appendChild(createNode(xmlText));
  }

  #dtnodeToRecUser(dtnode) {
    this.#checkRecipientNode();
    //
    let saveDeptInfo = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSaveDeptInfo.act?DID=${dtnode.data.deptID}`).json();
    if (!saveDeptInfo.ok) {
      throw new Error('notfound dept: ' + dtnode.data.deptID);
    }
    //
    let xmlText = `
    <rec type="rectype_dept">
      <ID>${saveDeptInfo.dept.ID}</ID>
      <name>${saveDeptInfo.dept.name}</name>
      <charger>
        <ID>${dtnode.data.key}</ID>
        <name>${dtnode.data.name}</name>
        <positionName>${dtnode.data.positionName}</positionName>
        <department>
          <ID>${dtnode.data.deptID}</ID>
          <name>${dtnode.data.deptName}</name>
        </department>
      </charger>
      <displayString>system${GWWEBMessage.cmsg_0034}</displayString>
    </rec>
    `;
    return getNode(this.hox, 'docInfo content receiptInfo recipient').appendChild(createNode(xmlText));
  }
}

// Define the new element
customElements.define('fe-recipient', FeRecipient);
