import '../../approvalBox/recipientInfo/FeRecList';
import '../../css/tree-list.scss';
import FeOrgTree from '../../tree/FeOrgTree';
import FePubshowGroupTree from '../../tree/FePubshowGroupTree';
import TagUI from '../../utils/TabUI';
import { getNodes, getText } from '../../utils/xmlUtils';
import './FePubshowBody.scss';
import FePubshowList from './FePubshowList';

/**
 * 배부시 수신부서,그룹 트리 및 선택 목록 화면
 */
export default class FePubshowBody extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './main.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.classList.add('tree-list');
    wrapper.innerHTML = `
      <div class="tree">
        <div class="tab-group" role="tablist">
          <button type="button" class="tab-button" role="tab" target="#orgTreePanel" active>${GWWEBMessage.cabinet_msg_48 /* 조직도 */}</button>
          <button type="button" class="tab-button" role="tab" target="#groupTreePanel">${GWWEBMessage.cmsg_748 /* 공람그룹 */}</button>
        </div>
        <div>
          <div class="tab-content" role="tabpanel" id="orgTreePanel">
          </div>
          <div class="tab-content" role="tabpanel" id="groupTreePanel">
          </div>
        </div>
      </div>
      <div class="list"></div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.fePubshowList = this.shadowRoot.querySelector('.list').appendChild(new FePubshowList());

    // FePubshow에서 x 삭제 이벤트
    this.fePubshowList.addEventListener('deletePubshow', (e) => {
      console.log('Event', e.type, e.target, e);
      let id = e.detail.id;
      let type = e.detail.type;

      // 트리에서 선택 해제 시도
      if (type === 'dept' || type === 'user') {
        this.feOrgTree.dynatree.dynatree('getRoot').tree.getNodeByKey(id)?._select(false, false);
        //
      } else {
        try {
          this.fePubshowGroupTree.dynatree.dynatree('getRoot').tree.getNodeByKey(id)?._select(false, false);
        } catch (error) {
          // do nothing
        }
      }
    });

    this.fePubshowList.addEventListener('change', () => {
      console.log('fePubshowList change', this.hox.querySelector('pubShowInfo'));
    });

    this.hox = feMain.hox.cloneNode(true); // hox 복사

    this.fePubshowList.set(this.hox);

    TagUI.init(this.shadowRoot, (activeTab) => {
      switch (activeTab.id) {
        case 'orgTreePanel':
          this.renderOrgTree();
          break;
        case 'groupTreePanel':
          this.renderGroupTree();
          break;
        default:
          throw new Error('undefined tabId: ' + activeTab.id);
      }
    });
    TagUI.select(this.shadowRoot, 1);
  }

  /**
   *
   * @returns {Element[]} pubShow 노드 배열
   */
  getData() {
    return getNodes(this.hox, 'pubShowInfo pubShow');
  }

  renderOrgTree() {
    if (!this.feOrgTree) {
      this.feOrgTree = this.shadowRoot.querySelector('#orgTreePanel').appendChild(new FeOrgTree());
      this.feOrgTree.addEventListener('select', (e) => {
        if (e.detail.isSelected) {
          this.fePubshowList.add(e.detail.dtnode, 'org');
        } else {
          this.fePubshowList.delete(e.detail.dtnode, 'org');
        }
      });
      this.feOrgTree.addEventListener('lazy', (e) => {
        this.#matchTreeAndHox();
      });
    }

    this.#matchTreeAndHox();
  }

  renderGroupTree() {
    if (!this.fePubshowGroupTree) {
      this.fePubshowGroupTree = this.shadowRoot.querySelector('#groupTreePanel').appendChild(new FePubshowGroupTree());
      this.fePubshowGroupTree.addEventListener('select', (e) => {
        if (e.detail.isSelected) {
          this.fePubshowList.add(e.detail.dtnode, 'group');
        } else {
          this.fePubshowList.delete(e.detail.dtnode, 'group');
        }
      });
    }

    this.#matchTreeAndHox();
  }

  #deselectAllTree() {
    try {
      this.feOrgTree.dynatree.dynatree('getRoot').visit((dtnode) => dtnode._select(false, false));
    } catch (ignore) {
      console.log(ignore.message);
    }
    try {
      this.fePubshowGroupTree.dynatree.dynatree('getRoot').visit((dtnode) => dtnode._select(false, false));
    } catch (ignore) {
      console.log(ignore.message);
    }
  }

  #matchTreeAndHox() {
    // 모두 선택 해제
    this.#deselectAllTree();

    //
    getNodes(this.hox, 'pubShowInfo pubShow').forEach((node) => {
      //
      let id = getText(node, 'ID');
      let type = getText(node, 'type');
      if (type === 'dept' || type === 'user') {
        this.feOrgTree.dynatree.dynatree('getRoot').tree.getNodeByKey(id)?._select(true, false);
      } else if (type === 'deptGroup') {
        this.fePubshowGroupTree?.dynatree.dynatree('getRoot').tree.getNodeByKey(id)?._select(true, false);
      }
    });
  }
}

// Define the new element
customElements.define('fe-pubshowbody', FePubshowBody);
