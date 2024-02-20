import syncFetch from 'sync-fetch';
import '../lib/dynatree';
import FeRecGroupTree from '../tree/FeRecGroupTree';
import FeRecOrgTree from '../tree/FeRecOrgTree';
import ArrayUtils from '../utils/ArrayUtils';
import StringUtils from '../utils/StringUtils';
import TagUI from '../utils/TabUI';
import { HoxEventType, getAttr, getNodes, getText, setText } from '../utils/xmlUtils';
import FeApprovalBox from './FeApprovalBox';
import './FeRecipient.scss';
import './recipientInfo/FeRecList';

/**
 * 수신부서
 */
export default class FeRecipient extends FeApprovalBox {
  active = false;

  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    wrapper.classList.add('tree-list');
    wrapper.innerHTML = `
      <div class="tree">
        <div class="tab-group" role="tablist">
          <button type="button" class="tab-button" role="tab" target="#orgTreePanel" active>${GWWEBMessage.cabinet_msg_48 /* 조직도 */}</button>
          <button type="button" class="tab-button" role="tab" target="#groupTreePanel">${GWWEBMessage.cmsg_1166 /* 수신부서 그룹 */}</button>
          <button type="button" class="tab-button" role="tab" target="#manualPanel">${GWWEBMessage.cmsg_1167 /* 외부 */}</button>
          <button type="button" class="tab-button" role="tab" target="#ldapTreePanel">${GWWEBMessage.cmsg_2200 /* LDAP */}</button>
          <button type="button" class="tab-button" role="tab" target="#doc24TreePanel">${GWWEBMessage.appr_doc24 /* 문서24 */}</button>
        </div>
        <div>
          <div class="tab-content" role="tabpanel" id="orgTreePanel">
          </div>
          <div class="tab-content" role="tabpanel" id="groupTreePanel">
          </div>
          <div class="tab-content" role="tabpanel" id="manualPanel">
            <div id="manual" class="folder"></div>
          </div>
          <div class="tab-content" role="tabpanel" id="ldapTreePanel">
            <div id="ldapTree" class="folder"></div>
          </div>
          <div class="tab-content" role="tabpanel" id="doc24TreePanel">
            <div id="doc24Tree" class="folder"></div>
          </div>
        </div>
      </div>
      <div class="list">
        <fe-reclist></fe-reclist>
        <div class="recipient-info">
          <div>
            <input type="checkbox" id="displayCheckbox" />
            <label for="displayCheckbox">${GWWEBMessage.cmsg_1178}</label>
          </div>
          <input type="text" id="displayString" placeholder="${GWWEBMessage.W2850}" readOnly />
          <label for="senderName">${GWWEBMessage.cmsg_759}</label>
          <select id="senderName"></select>
        </div>
      </div>
    `;

    this.feRecList = this.shadowRoot.querySelector('fe-reclist');
    this.displayCheckbox = this.shadowRoot.querySelector('#displayCheckbox');
    this.displayString = this.shadowRoot.querySelector('#displayString');
    this.senderName = this.shadowRoot.querySelector('#senderName');

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
      } else if (type === 'rectype_ldap') {
        // TODO ldap 트리에서 선택 해제 시도
      }

      // 수신부서표기명 업데이트
      this.#renderDisplayString();
    });

    // FeRecList에서 순서 변경 이벤트
    this.feRecList.addEventListener('change', (e) => {
      // 수신부서표기명 업데이트
      this.#renderDisplayString();
    });

    // 수신부서표기명 체크박스 이벤트
    this.displayCheckbox.addEventListener('change', (e) => {
      console.log('Event', e.type, e.target, e.checked);
      //
      this.displayString.readOnly = !e.target.checked;
      if (!e.target.checked) {
        this.#renderDisplayString();
      }
    });

    // 수신부서표기 input 이벤트
    this.displayString.addEventListener('change', (e) => {
      console.log('Event', e.type, e.target, e.value);
      //
      setText(this.contentNode, 'receiptInfo > displayString', e.target.value);
    });

    // 발신명의 선택 이벤트
    this.senderName.addEventListener('change', (e) => {
      console.log('Event', e.type, e.target, e.value);
      //
      setText(this.contentNode, 'senderName', e.target.value);
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

    super.setHox(hox);

    TagUI.init(this.shadowRoot, (activeTab) => {
      switch (activeTab.id) {
        case 'orgTreePanel':
          this.renderOrgTree();
          break;
        case 'groupTreePanel':
          this.renderGroupTree();
          break;
        case 'manualPanel':
          this.renderManual();
          break;
        case 'ldapTreePanel':
          this.renderLdapTree();
          break;
        case 'doc24TreePanel':
          this.renderDoc24();
          break;
        default:
          throw new Error('undefined tabId: ' + activeTab.id);
      }
    });
    TagUI.select(this.shadowRoot, 1);

    this.active = true;

    this.feRecList.set(hox);

    // this.renderOrgTree(); // 첫탭. 조직도 트리 그리기
    this.#renderDisplayString();
    this.change();

    this.hox.addEventListener(HoxEventType.ENFORCETYPE, (e) => {
      console.info('hoxEvent listen', e.type, e.detail);
      //
      this.#renderDisplayString();
      this.change();
    });
  }

  changeContentNumberCallback() {
    console.log('FeRecipient changeContentNumberCallback');
    // 선택된 안에 맞게, tree 선택, fe-reclist 다시 그리기
    this.change();
    this.#matchTreeAndHox();
  }

  /**
   * 외부에서 hox가 수정되었을때 호출됨
   */
  change() {
    if (!this.active) {
      return;
    }

    // 발송종류에 따라
    let enforcetype = getText(this.contentNode, 'enforceType');
    switch (enforcetype) {
      case 'enforcetype_external': {
        TagUI.active(this.shadowRoot, 3, true);
        TagUI.active(this.shadowRoot, 4, true);
        TagUI.active(this.shadowRoot, 5, true);
        super.toggleDisabled(false);
        break;
      }
      case 'enforcetype_internal': {
        TagUI.active(this.shadowRoot, 3, false);
        TagUI.active(this.shadowRoot, 4, false);
        TagUI.active(this.shadowRoot, 5, false);
        super.toggleDisabled(false);
        break;
      }
      case 'enforcetype_not': {
        // 내부결재면, 트리선택, 수신부서표기명, 발신명의 disable
        super.toggleDisabled(true);
        break;
      }
      default:
        break;
    }

    this.#renderSenderName();
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

  renderManual() {
    // TODO
  }

  renderLdapTree() {
    // TODO
  }

  renderDoc24() {
    // TODO
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

  #renderDisplayString() {
    //
    if (!this.displayCheckbox.checked) {
      this.displayString.value = this.feRecList.displayString;
      setText(this.contentNode, 'receiptInfo > displayString', this.feRecList.displayString);
    }
  }

  /**
   * hox enforceType 기준으로 발신명의 select 구성
   */
  #renderSenderName() {
    //
    let enforcetype = getText(this.contentNode, 'enforceType');
    let draftDeptId = rInfo.user.deptID; // TODO 결재선 기안자의 부서
    let lastSignDeptId = rInfo.user.deptID; // TODO 결재선 최종결재자의 부서
    let ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSenderNames.act?enforceType=${enforcetype}&draftDeptId=${draftDeptId}&lastSignDeptId=${lastSignDeptId}`).json();
    if (!ret.ok) {
      throw new Error(`notfound senderNames by enforceType=${enforcetype} draftDeptId=${draftDeptId} lastSignDeptId=${lastSignDeptId}`);
    }
    this.senderName.textContent = null;
    ArrayUtils.split(ret.senderNames, ';').forEach((name, i) => {
      this.senderName.innerHTML += `<option value="${name}">${name}</option>`;
      if (i === 0) {
        setText(this.contentNode, 'senderName', name);
      }
    });
  }

  #matchTreeAndHox() {
    // 모두 선택 해제
    this.#deselectAllTree();

    //
    getNodes(this.contentNode, 'rec').forEach((rec) => {
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
      } else if (type === 'rectype_ldap') {
        // TODO ldap 트리에 체크박스 선택
      }
    });
  }
}

// Define the new element
customElements.define('fe-recipient', FeRecipient);
