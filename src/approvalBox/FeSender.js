import $ from 'jquery';
import '../tree/dynatree';
import { setText } from '../utils/xmlUtils';
import FeApprovalBox from './FeApprovalBox';
import './FeSender.scss';

export default class FeSender extends FeApprovalBox {
  active = false;

  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    const dynatreeLink = document.createElement('link');
    dynatreeLink.setAttribute('rel', 'stylesheet');
    dynatreeLink.setAttribute('href', './css/dynatree.css');
    this.shadowRoot.append(dynatreeLink);

    wrapper.classList.add('tree-list');
    wrapper.innerHTML = `
      <div class="tree">
        <div class="search-input">
          <input type="search" />
        </div>
        <div id="tree" class="folder"></div>
      </div>
      <div class="list">
        <header>
          <label>${GWWEBMessage.cmsg_2655}</label>
        </header>
        <ul id="list"></ul>
      </div>
    `;
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    if (this.active) {
      return;
    }

    super.setHox(hox);
    this.renderTree();

    this.active = true;
  }

  changeContentNumberCallback() {
    // 발송부서는 어떤 경우든 1안에서만 보인다
    super.toggleDisabled(this.contentNumber > 1);
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

    $(tree)
      .dynatree({
        checkbox: true,
        selectMode: 1,
        classNames: { checkbox: 'dynatree-radio' },
        clickFolderMode: 1,
        fx: { height: 'toggle', duration: 200 },
        /**
         *
         * @param {boolean} select 선택/해제 여부
         * @param {*} dtnode 해당 노드
         */
        onSelect: (select, dtnode) => {
          console.log('[dynatree] onSelect', select, dtnode.data.title, dtnode);
          this.selectSender(dtnode, select);
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

  selectSender(dtnode, select) {
    let deptData = dtnode.data;
    const LIST = this.shadowRoot.querySelector('#list');

    // 기존 부서 제거
    LIST.textContent = null;
    setText(this.hox, 'examRequest exam examiner department ID', '');
    setText(this.hox, 'examRequest exam examiner department name', '');

    if (select) {
      // 선택 부서 추가
      const LI = LIST.appendChild(document.createElement('li'));
      const DIV = LI.appendChild(document.createElement('div'));
      DIV.classList.add('sender-bar');
      const LABEL = DIV.appendChild(document.createElement('label'));
      LABEL.innerHTML = deptData.title;
      const BUTTON = DIV.appendChild(document.createElement('button'));
      BUTTON.innerHTML = '&times;';
      BUTTON.addEventListener('click', () => {
        //
        dtnode.toggleSelect();
      });

      // examRequest exam examiner participantID
      // examRequest exam examiner position
      // examRequest exam examiner ID
      // examRequest exam examiner name
      // examRequest exam examiner department ID
      // examRequest exam examiner department name
      setText(this.hox, 'examRequest exam examiner department ID', deptData.key);
      setText(this.hox, 'examRequest exam examiner department name', deptData.title);
    }
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
    dtnode.data.addClass = 'ui-dynatree-in-controller';
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
