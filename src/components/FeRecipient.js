import $ from 'jquery';
import '../_open_sources/dynatree';

const CSS = `
.fe-recipient {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
}
.fe-recipient .folder {
  width: 49%;
  height: 100%;
  overflow: auto;
  border: 1px solid #ccc;
}
.fe-recipient .list {
  width: 49%;
  height: 100%;
  overflow: auto;
  border: 1px solid #ccc;
}

`;

export default class FeRecipient extends HTMLElement {
  constructor() {
    super();
    console.log('FeRecipient init');
  }

  connectedCallback() {
    console.log('FeRecipient connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './css/common.css');

    const LINK2 = document.createElement('link');
    LINK2.setAttribute('rel', 'stylesheet');
    LINK2.setAttribute('href', './css/dynatree.css');

    const STYLE = document.createElement('style');
    STYLE.innerHTML = CSS;

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-recipient');
    wrapper.innerHTML = `
      <div id="tree" class="folder"></div>
      <ul id="list" class="list sortable-list"></ul>
    `;

    this.shadowRoot.append(LINK, LINK2, STYLE, wrapper);
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    this.renderTree();
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
