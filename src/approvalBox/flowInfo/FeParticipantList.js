import Cell from '../../main/CellNames';
import { createNode, getNode, getNodes, getText, setText } from '../../utils/hoxUtils';
import * as OrgUtils from '../../utils/orgUtils';
import FeParticipant from './FeParticipant';
import './FeParticipantList.scss';

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
    wrapper.innerHTML = `<ul id="list" class="list"></ul>`;

    this.shadowRoot.append(LINK, wrapper);

    this.LIST = this.shadowRoot.querySelector('#list');
    // 결재선 삭제시 이벤트 리스너
    this.LIST.addEventListener('delete', (e) => {
      console.log('FeParticipantList', e.type, e.target.tagName);
      // li 삭제
      let li = e.target.closest('li');
      li.remove();

      // hox 업데이트
      this.#updateHox();
    });
    // 결재방법 변경시 이벤트 리스너
    this.LIST.addEventListener('change', (e) => {
      console.log('FeParticipantList', e.type, e.target.tagName);
      // hox 업데이트
      this.#updateHox();
    });

    // 결재자 선택
    this.LIST.addEventListener('click', (e) => {
      this.LIST.querySelectorAll('li').forEach((li) => li.classList.remove('selected'));
      e.target.closest('li').classList.add('selected');
    });
  }

  set(hox) {
    this.hox = hox;
    //
    this.#renderParticipantList();
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
    this.LIST.prepend(li);

    // hox 업데이트
    this.#updateHox();
  }

  /**
   * 왼쪽 트리영역에서 선택해제된 값
   * @param {DynaTreeNode} dtnode
   */
  delete(dtnode) {
    console.log('delete', dtnode);
  }

  #renderParticipantList() {
    getNodes(this.hox, 'approvalFlow participant').forEach((participant, idx) => {
      console.log('participant', idx, participant);
      //
      let li = document.createElement('li');
      li.appendChild(new FeParticipant()).set(participant);
      this.LIST.prepend(li);
    });
  }

  /**
   * participant XML 조합
   * - approvalType에 따른 displayApprovalType 설정
   * - approvalType에 따른 cellName 설정
   */
  #updateHox() {
    //
    let participantNodeList = Array.from(this.LIST.querySelectorAll('fe-participant'));
    participantNodeList.reverse(); // 화면표시 순서와 hox 순서가 반대이므로, 배열 반전

    // 순회하면서, 셀명(cellName), 결재방법이름(displayApprovalType) 설정
    let signCellCount = 0;
    let agreeCellCount = 0;
    participantNodeList.forEach((feParticipant, i) => {
      let participant = feParticipant.participant;
      //
      let approvalType = getText(participant, 'approvalType');
      switch (approvalType) {
        case 'user_approval':
        case 'user_jeonkyul':
        case 'user_daekyul':
          setText(participant, 'mappingCell cellName', `${Cell.SIGN}.${++signCellCount}`);
          break;
        case 'user_agree_s':
        case 'user_agree_p':
        case 'dept_agree_s':
        case 'dept_agree_p':
          setText(participant, 'mappingCell cellName', `${Cell.AGREE_SIGN}.${++agreeCellCount}`);
          break;
        default:
          setText(participant, 'mappingCell cellName', '');
          break;
      }
      switch (approvalType) {
        case 'user_approval':
          // 기안, 검토, 결재 결정 필요
          break;
        case 'user_jeonkyul':
          break;
        case 'user_daekyul':
          break;
        case 'user_agree_s':
          break;
        case 'user_agree_p':
          break;
        case 'dept_agree_s':
          break;
        case 'dept_agree_p':
          break;
        case 'user_nosign':
          break;
        case 'user_refer':
          break;
        case 'user_noapproval':
          break;
        default:
          throw new Error('undefined approvalType: ' + approvalType);
      }
    });

    getNode(this.hox, 'approvalFlow').textContent = null;
    getNode(this.hox, 'approvalFlow').append(...participantNodeList.map((feParticipant) => feParticipant.participant));
  }
}

customElements.define('fe-participantlist', FeParticipantList);
