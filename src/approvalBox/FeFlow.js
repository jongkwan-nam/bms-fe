import $ from 'jquery';
import '../lib/dynatree';
import { getNodes, getText } from '../utils/xmlUtils';
import './FeFlow.scss';
import './flowInfo/FeParticipantList';
import FeParticipantList from './flowInfo/FeParticipantList';

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
      </div>
    `;

    this.shadowRoot.append(LINK, LINK2, wrapper);

    this.orgTree = this.shadowRoot.querySelector('#tree');
    this.feParticipantlist = this.shadowRoot.querySelector('.list').appendChild(new FeParticipantList());

    this.feParticipantlist.addEventListener('delete', (e) => {
      console.log('Event', e.type, e.target, e);
      let id = e.detail.id;
      $(this.orgTree).dynatree('getRoot').tree.getNodeByKey(id)?._select(false, false);
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

    this.hox = hox;
    this.renderOrgTree();
    this.feParticipantlist.set(hox);

    this.active = true;
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
        console.debug('initOrgTree', data);

        const ROOT_FOLDER_ID = '00000000000000000001';

        $(this.orgTree)
          .dynatree({
            title: 'orgTree',
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
                // TODO 중복 사용자를 추가할 방법!
                this.feParticipantlist.add(dtnode);
              } else {
                // 결재선에서 제거
                this.feParticipantlist.delete(dtnode);
              }
            },
            onClick: (dtnode, event) => {
              console.debug('[dynatree] onClick', dtnode.data.title, dtnode.getEventTargetType(event), dtnode, event);
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
              if (dtnode.data.rbox == 'false') {
                dtnode.data.unselectable = true;
                $(nodeSpan).addClass('ui-dynatree-notuse');
              } else {
                $(nodeSpan).addClass('ui-dynatree-rbox-have');
              }
              // 부재
              if (!dtnode.data.isFolder && dtnode.data.absent) {
                $(nodeSpan).append(`<a onclick="orgPopup.viewUserAbsent('${dtnode.data.key}')" class='usr_attnd'>${GWWEBMessage.W3156}</a>`);
              }
            },
          })
          .dynatree('getRoot')
          .tree.getNodeByKey(rInfo.user.ID)
          .activate();

        this.#matchTreeAndHox();
      });
  }

  #matchTreeAndHox() {
    getNodes(this.hox, 'approvalFlow participant').forEach((participant) => {
      let id = getText(participant, 'ID');
      $(this.orgTree).dynatree('getRoot').tree.getNodeByKey(id)?._select(true, false);
    });
  }

  // renderFlow() {
  //   //
  //   getNodes(this.hox, 'approvalFlow participant').forEach((participant, idx) => {
  //     console.log('[FeFlow]', idx, participant);
  //     //

  //     const item = document.createElement('li');
  //     item.classList.add('item');
  //     item.setAttribute('draggable', true);

  //     this.shadowRoot.querySelector('#list').prepend(item);

  //     let feParticipant = item.appendChild(new FeParticipant());
  //     feParticipant.set(participant);
  //   });

  //   const sortableList = this.shadowRoot.querySelector('.sortable-list');
  //   const items = sortableList.querySelectorAll('.item');

  //   items.forEach((item) => {
  //     item.addEventListener('dragstart', () => {
  //       // Adding dragging class to item after a delay
  //       setTimeout(() => item.classList.add('dragging'), 0);
  //     });
  //     // Removing dragging class from item on dragend event
  //     item.addEventListener('dragend', () => item.classList.remove('dragging'));
  //   });
  //   const initSortableList = (e) => {
  //     e.preventDefault();
  //     const draggingItem = this.shadowRoot.querySelector('.dragging');
  //     // Getting all items except currently dragging and making array of them
  //     let siblings = [...sortableList.querySelectorAll('.item:not(.dragging)')];
  //     // Finding the sibling after which the dragging item should be placed
  //     let nextSibling = siblings.find((sibling) => {
  //       console.log(sibling, e.clientY, sibling.offsetTop, sibling.offsetHeight);
  //       return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
  //     });
  //     // Inserting the dragging item before the found sibling
  //     sortableList.insertBefore(draggingItem, nextSibling);
  //   };
  //   sortableList.addEventListener('dragover', initSortableList);
  //   sortableList.addEventListener('dragenter', (e) => e.preventDefault());
  // }
}

// Define the new element
customElements.define('fe-flow', FeFlow);
