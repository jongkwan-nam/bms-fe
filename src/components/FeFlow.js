import $ from 'jquery';
import '../_open_sources/dynatree';
import FeParticipant from './FeParticipant';

const CSS = `
.fe-flow {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
}
.fe-flow .folder {
  width: 49%;
  height: 100%;
  overflow: auto;
  border: 1px solid #ccc;
}
.fe-flow .list {
  width: 49%;
  height: 100%;
  overflow: auto;
  border: 1px solid #ccc;  
}

.sortable-list {
  width: 425px;
  padding: 25px;
  background: #fff;
  border-radius: 7px;
  margin: 0;
  padding: 30px 25px 20px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}
.sortable-list .item {
  list-style: none;
  display: flex;
  cursor: move;
  background: #fff;
  align-items: center;
  border-radius: 5px;
  padding: 10px 13px;
  margin-bottom: 11px;
  /* box-shadow: 0 2px 4px rgba(0,0,0,0.06); */
  border: 1px solid #ccc;
  justify-content: space-between;
}
.item .details {
  display: flex;
  align-items: center;
}
.item .details img {
  height: 43px;
  width: 43px;
  pointer-events: none;
  margin-right: 12px;
  object-fit: cover;
  border-radius: 50%;
}
.item .details span {
  font-size: 1.13rem;
}
.item i {
  color: #474747;
  font-size: 1.13rem;
}
.item.dragging {
  opacity: 0.6;
}
.item.dragging :where(.details, i) {
  opacity: 0;
}
`;

/**
 * 결재선 화면
 * 조직도 트리와 선택된 participant 관리
 */
export default class FeFlow extends HTMLElement {
  constructor() {
    super();
    console.log('FeFlow init');
  }

  connectedCallback() {
    console.log('FeFlow connected');
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
    wrapper.classList.add('fe-flow');
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

    this.renderFlow();
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

    this.hox.querySelectorAll('approvalFlow participant').forEach((participant, idx) => {
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
