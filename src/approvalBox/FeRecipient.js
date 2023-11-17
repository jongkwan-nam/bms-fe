import $ from 'jquery';
import '../_open_sources/dynatree';
import './FeRecipient.scss';

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
        <div id="tree" class="folder"></div>
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

    this.hox = hox;
    this.renderTree();

    this.active = true;
  }

  renderTree() {
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

  addRecipient(dtnode) {
    let recData = dtnode.data;
    const LIST = this.shadowRoot.querySelector('#list');
    //
    const LI = LIST.appendChild(document.createElement('li'));
    LI.id = 'rec' + recData.key;
    LI.innerHTML = `
      <div class="recipient-bar">
        <span class="rec-type">${recData.isFolder ? GWWEBMessage.hsappr_0164 : GWWEBMessage.W2440}</span>
        <div class="rec-info">
          <span class="img-profile" style="background-image: url('${recData.isFolder ? `/user/img/team_profile_blank.png` : `/jsp/org/view/ViewPicture.jsp?user_id=${recData.key}`}')"></span>
          <span class="name">${recData.isFolder ? recData.title : recData.name}</span>
          ${recData.isFolder ? '' : `<span class="rank">${recData.positionName}</span><span class="team">${recData.deptName}</span>`}
        </div>
        <div class="rec-close">
          <button type="button">&times;</button>
        </div>
      </div>
    `;
    LI.querySelector('button').addEventListener('click', () => {
      dtnode.toggleSelect();
      LI.remove();
    });
  }

  removeRecipient(dtnode) {
    let recData = dtnode.data;
    const LIST = this.shadowRoot.querySelector('#list');
    //
    LIST.querySelector('#rec' + recData.key).remove();
  }

  renderDisplayString() {
    //
  }
}

// Define the new element
customElements.define('fe-recipient', FeRecipient);
