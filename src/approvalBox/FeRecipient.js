import $ from 'jquery';
import syncFetch from 'sync-fetch';
import '../_open_sources/dynatree';
import * as TagUI from '../utils/TabUI';
import * as ArrayUtils from '../utils/arrayUtils';
import { getAttr, getNodes, getText, setText } from '../utils/hoxUtils';
import * as StringUtils from '../utils/stringUtils';
import './FeRecipient.scss';
import './recipientInfo/FeRecList';

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
          <button type="button" class="tab-button" role="tab" target="#doc24TreePanel">${GWWEBMessage.appr_doc24 /* 문서24 */}</button>
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
          <div class="tab-content" role="tabpanel" id="doc24TreePanel">
            <div id="doc24Tree" class="folder"></div>
          </div>
        </div>
      </div>
      <div class="list">
        <fe-reclist></fe-reclist>
        <div class="recipient-info">
          <div>
            <input type="checkbox" id="displayCheckbox" />
            <label for="displayCheckbox">${GWWEBMessage.cmsg_1178}</label>
          </div>
          <input type="text" id="displayString" placeholder="${GWWEBMessage.W2850}" readOnly />
          <label for="senderName">${GWWEBMessage.cmsg_759}</label>
          <select id="senderName"></select>
        </div>
      </div>
    `;

    this.shadowRoot.append(LINK, LINK2, wrapper);

    this.orgTree = this.shadowRoot.querySelector('#tree');
    this.groupTree = this.shadowRoot.querySelector('#groupTree');

    this.feRecList = this.shadowRoot.querySelector('fe-reclist');
    this.displayCheckbox = this.shadowRoot.querySelector('#displayCheckbox');
    this.displayString = this.shadowRoot.querySelector('#displayString');
    this.senderName = this.shadowRoot.querySelector('#senderName');

    // FeRec에서 x 삭제 이벤트
    this.feRecList.addEventListener('deleteRec', (e) => {
      console.log('Event', e.type, e.target, e);
      let id = e.detail.id;
      let chargerID = e.detail.chargerID;
      let type = e.detail.type;

      // 트리에서 선택 해제 시도
      if (type === 'rectype_dept' || type === 'rectype_unifiedgroup') {
        if (StringUtils.isBlank(chargerID)) {
          $(this.orgTree).dynatree('getRoot').tree.getNodeByKey(id)?._select(false, false);
        } else {
          $(this.orgTree).dynatree('getRoot').tree.getNodeByKey(chargerID)?._select(false, false);
        }
        //
        try {
          $(this.groupTree).dynatree('getRoot').tree.getNodeByKey(id)?._select(false, false);
        } catch (error) {
          // do nothing
        }
      } else if (type === 'rectype_ldap') {
        // TODO
      }

      // 수신부서표기명 업데이트
      this.#renderDisplayString();
      // 발신명의 업데이트?
      this.#renderSenderName();
    });

    // 수신부서표기명 체크박스 이벤트
    this.displayCheckbox.addEventListener('change', (e) => {
      console.log('Event', e.type, e.target, e.checked);
      //
      this.displayString.readOnly = !e.target.checked;
      if (!e.target.checked) {
        this.#renderDisplayString();
      }
    });

    // 수신부서표기 input 이벤트
    this.displayString.addEventListener('change', (e) => {
      console.log('Event', e.type, e.target, e.value);
      //
      setText(this.hox, 'docInfo content displayString', e.target.value);
    });

    // 발신명의 선택 이벤트
    this.senderName.addEventListener('change', (e) => {
      console.log('Event', e.type, e.target, e.value);
      //
      setText(this.hox, 'docInfo content senderName', e.target.value);
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    if (this.active) {
      return;
    }

    TagUI.init(this.shadowRoot, (activeTab) => {
      switch (activeTab.id) {
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
        case 'doc24TreePanel':
          this.renderDoc24();
          break;
        default:
          throw new Error('undefined tabId: ' + activeTab.id);
      }
    });
    TagUI.select(this.shadowRoot, 1);

    this.active = true;

    this.hox = hox;
    this.feRecList.set(hox);

    // this.renderOrgTree(); // 첫탭. 조직도 트리 그리기
    this.#renderDisplayString();
    this.change();
  }

  /**
   * 외부에서 hox가 수정되었을때 호출됨
   */
  change() {
    if (!this.active) {
      return;
    }

    // 발송종류에 따라
    let enforcetype = getText(this.hox, 'docInfo enforceType');
    switch (enforcetype) {
      case 'enforcetype_external': {
        TagUI.active(this.shadowRoot, 3, true);
        TagUI.active(this.shadowRoot, 4, true);
        TagUI.active(this.shadowRoot, 5, true);
        break;
      }
      case 'enforcetype_internal': {
        TagUI.active(this.shadowRoot, 3, false);
        TagUI.active(this.shadowRoot, 4, false);
        TagUI.active(this.shadowRoot, 5, false);
        break;
      }
      case 'enforcetype_not': {
        // 내부결재면, 여기로 들어오지 못함
        break;
      }
      default:
        break;
    }

    this.#renderSenderName();
  }

  renderOrgTree() {
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

        $(this.orgTree)
          .dynatree({
            title: 'orgtree',
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
                // 수신목록에 추가
                this.feRecList.add(dtnode, 'org');
              } else {
                // 수신목록에서 제거
                this.feRecList.delete(dtnode, 'org');
              }
            },
            onClick: (dtnode, event) => {
              console.debug('[dynatree] onClick', dtnode.data.title, dtnode.getEventTargetType(event), dtnode, event);

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
            onLazyRead: (dtnode) => {
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
                success: (dtnode) => {
                  console.log('[dynatree] appendAjax', dtnode.data.title, dtnode);
                  this.#matchTreeAndHox();
                },
              });
            },
            onRender: (dtnode, nodeSpan) => {
              console.debug('onLoader', dtnode, nodeSpan);
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

        this.#matchTreeAndHox();
      });
  }

  renderGroupTree() {
    //
    const params = {
      acton: 'groupTree',
      base: '001000001',
      groupType: 'A',
      checkbox: 'both',
      display: 'org, rootdept, group, ldap, doc24, ucorg2, userSingle',
    };
    const queryString = new URLSearchParams(params).toString();
    fetch('/directory-web/org.do?' + queryString)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        //
        $(this.groupTree).dynatree({
          checkbox: true,
          selectMode: 2,
          clickFolderMode: 1,
          children: data,
          onSelect: (select, dtnode) => {
            console.log('onSelect groupTree', select, dtnode);
            if (select) {
              // 수신목록에 추가
              this.feRecList.add(dtnode, 'group');
            } else {
              // 수신목록에서 제거
              this.feRecList.delete(dtnode, 'group');
            }
          },
        });
      });
  }

  renderManual() {
    //
  }

  renderLdapTree() {
    //
  }

  renderDoc24() {
    //
  }

  #renderDisplayString() {
    //
    if (!this.displayCheckbox.checked) {
      this.displayString.value = this.feRecList.displayString;
    }
  }

  #renderSenderName() {
    //
    let enforcetype = getText(this.hox, 'docInfo enforceType');
    let draftDeptId = rInfo.user.deptID; // TODO 결재선 기안자의 부서
    let lastSignDeptId = rInfo.user.deptID; // TODO 결재선 최종결재자의 부서
    let ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSenderNames.act?enforceType=${enforcetype}&draftDeptId=${draftDeptId}&lastSignDeptId=${lastSignDeptId}`).json();
    if (!ret.ok) {
      throw new Error(`notfound senderNames by enforceType=${enforcetype} draftDeptId=${draftDeptId} lastSignDeptId=${lastSignDeptId}`);
    }
    this.senderName.textContent = null;
    ArrayUtils.split(ret.senderNames, ';').forEach((name) => {
      this.senderName.innerHTML += `<option value="${name}">${name}</option>`;
    });
  }

  #matchTreeAndHox() {
    getNodes(this.hox, 'docInfo content rec').forEach((rec) => {
      //
      let id = getText(rec, 'ID');
      let type = getAttr(rec, null, 'type');
      if (type === 'rectype_dept') {
        let chargerID = getText(rec, 'charger ID');
        if (StringUtils.isBlank(chargerID)) {
          $(this.orgTree).dynatree('getRoot').tree.getNodeByKey(id)?._select(true, false);
        } else {
          $(this.orgTree).dynatree('getRoot').tree.getNodeByKey(chargerID)?._select(true, false);
        }
      } else if (type === 'rectype_unifiedgroup') {
        $(this.groupTree)?.dynatree('getRoot').tree.getNodeByKey(id)?._select(true, false);
      } else if (type === 'rectype_ldap') {
        // TODO
      }
    });
  }
}

// Define the new element
customElements.define('fe-recipient', FeRecipient);
