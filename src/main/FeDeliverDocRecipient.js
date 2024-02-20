import '../approvalBox/recipientInfo/FeRecList';
import '../css/tree-list.scss';
import '../lib/dynatree';
import FeRecGroupTree from '../tree/FeRecGroupTree';
import FeRecOrgTree from '../tree/FeRecOrgTree';
import StringUtils from '../utils/StringUtils';
import TagUI from '../utils/TabUI';
import { createNode, getAttr, getNodes, getText } from '../utils/xmlUtils';
import './FeDeliverDocRecipient.scss';

/**
 * 배부시 수신부서,그룹 트리 및 선택 목록 화면
 */
export default class FeDeliverDocRecipient extends HTMLElement {
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
          <button type="button" class="tab-button" role="tab" target="#groupTreePanel">${GWWEBMessage.cmsg_1166 /* 수신부서 그룹 */}</button>
        </div>
        <div>
          <div class="tab-content" role="tabpanel" id="orgTreePanel">
          </div>
          <div class="tab-content" role="tabpanel" id="groupTreePanel">
          </div>
        </div>
      </div>
      <div class="list">
        <fe-reclist></fe-reclist>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.feRecList = this.shadowRoot.querySelector('fe-reclist');

    // FeRec에서 x 삭제 이벤트
    this.feRecList.addEventListener('deleteRec', (e) => {
      console.log('Event', e.type, e.target, e);
      let id = e.detail.id;
      let chargerID = e.detail.chargerID;
      let type = e.detail.type;

      // 트리에서 선택 해제 시도
      if (type === 'rectype_dept' || type === 'rectype_unifiedgroup') {
        if (StringUtils.isBlank(chargerID)) {
          this.feRecOrgTree.dynatree.dynatree('getRoot').tree.getNodeByKey(id)?._select(false, false);
        } else {
          this.feRecOrgTree.dynatree.dynatree('getRoot').tree.getNodeByKey(chargerID)?._select(false, false);
        }
        //
        try {
          this.feRecGroupTree.dynatree.dynatree('getRoot').tree.getNodeByKey(id)?._select(false, false);
        } catch (error) {
          // do nothing
        }
      }
    });

    this.feRecList.addEventListener('change', () => {
      console.log('reclist change', this.hox.querySelector('recipient'));
    });

    this.hox = createNode(`<hox><docInfo><content><receiptInfo><recipient></recipient></receiptInfo></content></docInfo></hox>`);

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

    this.feRecList.set(this.hox);
  }

  /**
   *
   * @returns {XMLDocument} hox
   */
  getHox() {
    return this.hox;
  }

  renderOrgTree() {
    if (!this.feRecOrgTree) {
      this.feRecOrgTree = this.shadowRoot.querySelector('#orgTreePanel').appendChild(new FeRecOrgTree());
      this.feRecOrgTree.addEventListener('select', (e) => {
        if (e.detail.isSelected) {
          this.feRecList.add(e.detail.dtnode, 'org');
        } else {
          this.feRecList.delete(e.detail.dtnode, 'org');
        }
      });
      this.feRecOrgTree.addEventListener('lazy', (e) => {
        this.#matchTreeAndHox();
      });
    }

    this.#matchTreeAndHox();
  }

  renderGroupTree() {
    if (!this.feRecGroupTree) {
      this.feRecGroupTree = this.shadowRoot.querySelector('#groupTreePanel').appendChild(new FeRecGroupTree());
      this.feRecGroupTree.addEventListener('select', (e) => {
        if (e.detail.isSelected) {
          this.feRecList.add(e.detail.dtnode, 'group');
        } else {
          this.feRecList.delete(e.detail.dtnode, 'group');
        }
      });
    }
  }

  #deselectAllTree() {
    try {
      this.feRecOrgTree.dynatree.dynatree('getRoot').visit((dtnode) => dtnode._select(false, false));
    } catch (ignore) {
      console.log(ignore.message);
    }
    try {
      this.feRecGroupTree.dynatree.dynatree('getRoot').visit((dtnode) => dtnode._select(false, false));
    } catch (ignore) {
      console.log(ignore.message);
    }
  }

  #matchTreeAndHox() {
    // 모두 선택 해제
    this.#deselectAllTree();

    //
    getNodes(this.hox, 'content rec').forEach((rec) => {
      //
      let id = getText(rec, 'ID');
      let type = getAttr(rec, null, 'type');
      if (type === 'rectype_dept') {
        let chargerID = getText(rec, 'charger ID');
        if (StringUtils.isBlank(chargerID)) {
          this.feRecOrgTree.dynatree.dynatree('getRoot').tree.getNodeByKey(id)?._select(true, false);
        } else {
          this.feRecOrgTree.dynatree.dynatree('getRoot').tree.getNodeByKey(chargerID)?._select(true, false);
        }
      } else if (type === 'rectype_unifiedgroup') {
        this.feRecGroupTree?.dynatree.dynatree('getRoot').tree.getNodeByKey(id)?._select(true, false);
      }
    });
  }
}

// Define the new element
customElements.define('fe-deliverdocrecipient', FeDeliverDocRecipient);
