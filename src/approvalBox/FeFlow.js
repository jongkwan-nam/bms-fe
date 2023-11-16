import $ from 'jquery';
import '../_open_sources/dynatree';
import { getNodes } from '../utils/hoxUtils';
import FeParticipant from './flowInfo/FeParticipant';

/**
 * 결재선 화면
 * 조직도 트리와 선택된 participant 관리
 */
export default class FeFlow extends HTMLElement {
  active = false;

  constructor() {
    super();
    console.debug('FeFlow init');
  }

  connectedCallback() {
    console.debug('FeFlow connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const LINK2 = document.createElement('link');
    LINK2.setAttribute('rel', 'stylesheet');
    LINK2.setAttribute('href', './css/dynatree.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-flow', 'tree-list');
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
    this.renderFlow();

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
          .tree.getNodeByKey(rInfo.user.ID)
          .activate();
      });
  }

  renderFlow() {
    //
    getNodes(this.hox, 'approvalFlow participant').forEach((participant, idx) => {
      console.log('[FeFlow]', idx, participant);
      //

      const item = document.createElement('li');
      item.classList.add('item');
      item.setAttribute('draggable', true);

      this.shadowRoot.querySelector('#list').prepend(item);

      let feParticipant = item.appendChild(new FeParticipant());
      feParticipant.set(participant);
    });

    const sortableList = this.shadowRoot.querySelector('.sortable-list');
    const items = sortableList.querySelectorAll('.item');

    items.forEach((item) => {
      item.addEventListener('dragstart', () => {
        // Adding dragging class to item after a delay
        setTimeout(() => item.classList.add('dragging'), 0);
      });
      // Removing dragging class from item on dragend event
      item.addEventListener('dragend', () => item.classList.remove('dragging'));
    });
    const initSortableList = (e) => {
      e.preventDefault();
      const draggingItem = this.shadowRoot.querySelector('.dragging');
      // Getting all items except currently dragging and making array of them
      let siblings = [...sortableList.querySelectorAll('.item:not(.dragging)')];
      // Finding the sibling after which the dragging item should be placed
      let nextSibling = siblings.find((sibling) => {
        console.log(sibling, e.clientY, sibling.offsetTop, sibling.offsetHeight);
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
      });
      // Inserting the dragging item before the found sibling
      sortableList.insertBefore(draggingItem, nextSibling);
    };
    sortableList.addEventListener('dragover', initSortableList);
    sortableList.addEventListener('dragenter', (e) => e.preventDefault());
  }
}

// Define the new element
customElements.define('fe-flow', FeFlow);
