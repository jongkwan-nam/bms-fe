import Cell from '../../main/CellNames';
import OrgUtils from '../../utils/OrgUtils';
import { createNode, getNode, getNodes, getText } from '../../utils/xmlUtils';
import FeParticipant from './FeParticipant';
import './FeParticipantList.scss';
import { decideApprovalType } from './decideApprovalType';

/**
 * 전체 결재선 관리
 *
 * 전체 결재선을 고려하여, 선택 가능한 approvalTypes을 각 요소에 전달. #decideApprovalType()
 * - 기존 결재선을 그린 후
 * - 신규 결재자가 추가된 후
 * - 기존 결재자가 삭제된 후
 * - 결재방법이 변경된 후
 *
 * 전체 결재선을 고려하여 순번, 셀명(mappingCell cellName) 전달
 */
export default class FeParticipantList extends HTMLElement {
  constructor() {
    super();
    console.debug('FeParticipantList init');
  }

  connectedCallback() {
    console.debug('FeParticipantList connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-participantlist');
    wrapper.innerHTML = `
      <header>
        <label>${GWWEBMessage.cmsg_543}</label>
        <div>
          <button type="button" id="upBtn" title="${GWWEBMessage.cmsg_1154}">△</button>
          <button type="button" id="downBtn" title="${GWWEBMessage.cmsg_1155}">▽</button>
        </div>
      </header>
      <ul id="list" class="list"></ul>
    `;

    this.shadowRoot.append(LINK, wrapper);

    this.LIST = this.shadowRoot.querySelector('#list');

    // 결재선 삭제시 이벤트 리스너
    this.LIST.addEventListener('delete', (e) => {
      console.log('FeParticipantList', e.type, e.target.tagName, e.detail);

      // 동일 사용자가 남아 있지 않으면, 트리에서 체크해제하도록 이벤트 전파
      e.stopImmediatePropagation();
      let deletedId = e.detail.id;
      let isMulti =
        Array.from(this.LIST.querySelectorAll('fe-participant'))
          .map((feParticipant) => feParticipant.id)
          .filter((id) => id == deletedId).length > 1;
      if (!isMulti) {
        this.dispatchEvent(new CustomEvent('delete', { bubbles: true, composed: true, detail: { index: this.index, id: deletedId } }));
      }

      this.#deleteParticipant(e.target);
    });

    // 결재방법 변경시 이벤트 리스너
    this.LIST.addEventListener('change', (e) => {
      console.log('FeParticipantList', e.type, e.target.tagName, e.detail);

      this.#decideApprovalType(e.detail);
    });

    // 결재자 선택
    this.LIST.addEventListener('click', (e) => {
      this.LIST.querySelectorAll('li').forEach((li) => li.classList.remove('selected'));
      e.target.closest('li')?.classList.add('selected');
    });

    // 수신부서 위로 버튼 이벤트
    this.shadowRoot.querySelector('#upBtn').addEventListener('click', () => {
      let selectedLI = this.LIST.querySelector('.selected');
      if (selectedLI !== null && selectedLI.previousSibling) {
        this.LIST.insertBefore(selectedLI, selectedLI.previousSibling);

        this.#decideApprovalType();
      }
    });
    // 수신부서 아래로 버튼 이벤트
    this.shadowRoot.querySelector('#downBtn').addEventListener('click', () => {
      let selectedLI = this.LIST.querySelector('.selected');
      if (selectedLI !== null) {
        this.LIST.insertBefore(selectedLI, selectedLI.nextSibling?.nextSibling);

        this.#decideApprovalType();
      }
    });
  }

  set(hox) {
    this.hox = hox;
    //
    this.#renderParticipantList();
  }

  /**
   * hox 기준 결재목록 설정
   */
  #renderParticipantList() {
    getNodes(this.hox, 'approvalFlow participant').forEach((participant, idx) => {
      console.log('participant', idx, participant);
      //
      let li = document.createElement('li');
      li.appendChild(new FeParticipant()).set(participant);
      this.LIST.prepend(li);
    });

    this.#decideApprovalType();
  }

  exists(checkId) {
    return (
      Array.from(this.LIST.querySelectorAll('fe-participant'))
        .map((feParticipant) => feParticipant.id)
        .filter((id) => id == checkId).length > 0
    );
  }

  /**
   * 왼쪽 트리영역에서 선택된 값
   * @param {DynaTreeNode} dtnode
   */
  add(dtnode) {
    console.log('add', dtnode);

    //
    let key = dtnode.data.key;
    let isDept = dtnode.data.isFolder;
    let isAbsent = !dtnode.data.isFolder && dtnode.data.absent;
    let name = isDept ? dtnode.data.title : dtnode.data.name;
    let type = isDept ? 'dept' : 'user';
    let position = dtnode.data.positionName;
    let deptId = isDept ? dtnode.data.key : dtnode.data.deptID;
    let deptName = isDept ? dtnode.data.title : dtnode.data.deptName;
    let signerLevel = isDept ? '1' : OrgUtils.getUser(key).sancLevel;
    let approvalType = isDept ? 'dept_agree_p' : 'user_approval'; // default set
    let displayApprovalType = '';
    let cellName = '';

    let xmlText = `
      <participant xmlns="http://www.handysoft.com/xsd/2002/04/HOX/1.0" IPAddress="" absent="${isAbsent}" current="false" mandatory="false" opinion="false" serverID="0" signStyle="text">
        <participantID />
        <position>${position}</position>
        <dutyName />
        <rankName />
        <ID>${key}</ID>
        <name>${name}</name>
        <type>${type}</type>
        <department>
          <ID>${deptId}</ID>
          <name>${deptName}</name>
        </department>
        <charger>
          <ID />
          <name />
          <position />
          <department>
            <ID />
            <name />
          </department>
        </charger>
        <signerLevel>${signerLevel}</signerLevel>
        <signlessCode name="" />
        <date>1970-01-01T09:00:00</date>
        <timezone />
        <signMethod />
        <approvalType>${approvalType}</approvalType>
        <approvalSubType />
        <displayApprovalType>${displayApprovalType}</displayApprovalType>
        <displayResourceCode></displayResourceCode>
        <approvalStatus>partapprstatus_will</approvalStatus>
        <validStatus>valid</validStatus>
        <grantedAction>defaultaction_setupflow defaultaction_addattach defaultaction_editdoc </grantedAction>
        <dutyType />
        <participantFlag />
        <mappingCell>
          <cellGroupID>0</cellGroupID>
          <cellName>${cellName}</cellName>
          <cellFormat>0</cellFormat>
          <cellName_Log />
        </mappingCell>
        <backup>
          <approvalType />
          <approvalSubType />
          <auditType />
          <complianceType />
          <date>1970-01-01T09:00:00</date>
        </backup>
        <bodyFileVersion>
          <major>0</major>
          <minor>0</minor>
        </bodyFileVersion>
      </participant>    
    `;
    let participant = getNode(this.hox, 'approvalFlow').appendChild(createNode(xmlText));

    let li = document.createElement('li');
    li.appendChild(new FeParticipant()).set(participant);

    let selectedElement = this.shadowRoot.querySelector('#list .selected');
    if (selectedElement === null) {
      this.LIST.prepend(li);
    } else {
      selectedElement.insertAdjacentElement('beforebegin', li);
    }
    li.click();

    this.#decideApprovalType();
  }

  /**
   * 왼쪽 트리영역에서 선택해제된 값
   * @param {DynaTreeNode} dtnode
   */
  delete(dtnode) {
    console.log('delete', dtnode);

    Array.from(this.LIST.querySelectorAll('fe-participant'))
      .filter((feParticipant) => feParticipant.id === dtnode.data.key)
      .forEach((feParticipant) => this.#deleteParticipant(feParticipant));
  }

  /**
   * list에서 FeParticipant 삭제.
   * - FeParticipant에서 x 버튼
   * - 트리에서 체크 해제
   * @param {FeParticipant} feParticipant
   */
  #deleteParticipant(feParticipant) {
    let li = feParticipant.closest('li');
    li.remove();

    this.#decideApprovalType();
  }

  /**
   *
   * @param {CustomEvent.detail} detail
   */
  #decideApprovalType(detail = null) {
    let feParticipantNodeList = Array.from(this.LIST.querySelectorAll('fe-participant'));
    feParticipantNodeList.reverse(); // 화면표시 순서와 hox 순서가 반대이므로, 배열 반전
    decideApprovalType(this.hox, feParticipantNodeList, detail);

    this.#decideCellName();
    this.#updateHox();
  }

  /**
   * 셀명 설정
   */
  #decideCellName() {
    //
    let feParticipantNodeList = Array.from(this.LIST.querySelectorAll('fe-participant'));
    feParticipantNodeList.reverse(); // 화면표시 순서와 hox 순서가 반대이므로, 배열 반전

    let signCellCount = 0;
    let agreeCellCount = 0;
    feParticipantNodeList.forEach((feParticipant, i) => {
      let participant = feParticipant.participant;
      //
      let approvalType = getText(participant, 'approvalType');
      switch (approvalType) {
        case 'user_approval':
        case 'user_jeonkyul':
        case 'user_daekyul':
          feParticipant.setCellName(`${Cell.SIGN}.${++signCellCount}`);
          break;
        case 'user_agree_s':
        case 'user_agree_p':
        case 'dept_agree_s':
        case 'dept_agree_p':
          feParticipant.setCellName(`${Cell.AGREE_SIGN}.${++agreeCellCount}`);
          break;
        default:
          feParticipant.setCellName('');
          break;
      }
    });
  }

  /**
   * participant XML 조합
   */
  #updateHox() {
    let participantNodeList = Array.from(this.LIST.querySelectorAll('fe-participant'));
    participantNodeList.reverse(); // 화면표시 순서와 hox 순서가 반대이므로, 배열 반전

    getNode(this.hox, 'approvalFlow').textContent = null;
    getNode(this.hox, 'approvalFlow').append(...participantNodeList.map((feParticipant) => feParticipant.participant));
  }
}

customElements.define('fe-participantlist', FeParticipantList);
