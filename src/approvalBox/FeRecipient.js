import $ from 'jquery';
import '../_open_sources/dynatree';

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
              } else {
                // 결재선에서 제거
              }
            },
            onClick: (dtnode, event) => {
              console.log('[dynatree] onClick', dtnode.data.title, dtnode.getEventTargetType(event), dtnode, event);

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
          })
          .dynatree('getRoot')
          .tree.getNodeByKey(rInfo.user.deptID)
          .activate();
      });
  }
}

// Define the new element
customElements.define('fe-recipient', FeRecipient);
