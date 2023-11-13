import $ from 'jquery';
import '../_open_sources/dynatree';

export default class FeSender extends HTMLElement {
  constructor() {
    super();
    console.log('FeSender init');
  }

  connectedCallback() {
    console.log('FeSender connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './index.css');

    const LINK2 = document.createElement('link');
    LINK2.setAttribute('rel', 'stylesheet');
    LINK2.setAttribute('href', './css/dynatree.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-sender', 'tree-list');
    wrapper.innerHTML = `
      <div class="tree">
        <div id="tree"></div>
      </div>
      <div class="list>
        <ul id="list"></ul>
      </div>
    `;

    this.shadowRoot.append(LINK, LINK2, wrapper);
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

    const initParam = {
      acton: 'initOrgTree',
      baseDept: '000010100',
      startDept: '',
      notUseDept: '000000101',
      checkbox: 'tree',
      display: 'org',
      informalUser: false,
    };

    const ROOT_FOLDER_ID = '00000000000000000001';
    $(tree)
      .dynatree({
        checkbox: true,
        selectMode: 1,
        classNames: { checkbox: 'dynatree-radio' },
        clickFolderMode: 2,
        fx: { height: 'toggle', duration: 200 },
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
          console.debug('[dynatree] onClick', dtnode.data.title, dtnode.getEventTargetType(event), dtnode, event);
          if (dtnode.getEventTargetType(event) === 'title') {
            dtnode.toggleSelect();
          }
        },
        onLazyRead: function (dtnode) {
          console.debug('[dynatree] onLazyRead', dtnode);
          const lazyParam = {
            ...initParam,
            ...{
              acton: 'expandOrgTree',
              deptID: dtnode.data.key,
            },
          };

          dtnode.appendAjax({
            url: '/directory-web/org.do',
            type: 'post',
            data: lazyParam,
            success: function (dtnode) {
              console.debug('[dynatree] appendAjax', dtnode);
              dtnode.visit((dtnode) => activeInController(dtnode));
            },
          });
        },
      })
      .dynatree('getRoot')
      .appendAjax({
        url: '/directory-web/org.do',
        type: 'post',
        data: initParam,
        success: function (dtnode) {
          console.log('[dynatree] appendAjax', dtnode);
          dtnode.visit((dtnode) => activeInController(dtnode));

          dtnode.tree.getNodeByKey(rInfo.user.deptID).activate();

          markDefaultInController(dtnode.tree.getNodeByKey(rInfo.user.deptID));
        },
      });
  }
}

// Define the new element
customElements.define('fe-sender', FeSender);

/**
 * 발송부서 아이콘 표시 및 비발송부서 선택 못하게 설정
 * @param {*} dtnode
 */
function activeInController(dtnode) {
  if (dtnode.data.inController === 'true') {
    dtnode.data.addClass += ' ' + 'ui-dynatree-in-controller';
    if (dtnode.isVisible()) {
      dtnode.render();
    }
  } else {
    dtnode.data.unselectable = true;
  }
}

function markDefaultInController(dtnode) {
  console.log('markDefaultInController', dtnode.data.title, dtnode);
  if (dtnode.data.inController === 'true') {
    dtnode.toggleSelect();
    dtnode.activate();
  } else {
    if (dtnode.parent !== null) {
      markDefaultInController(dtnode.parent);
    }
  }
}
