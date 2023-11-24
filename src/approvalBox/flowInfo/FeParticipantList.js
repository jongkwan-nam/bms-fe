import Cell from '../../main/CellNames';
import { createNode, getNode, getNodes, getText, setText } from '../../utils/hoxUtils';
import * as OrgUtils from '../../utils/orgUtils';
import ATO from '../flowInfo/ApprovalTypeOptions';
import FeParticipant from './FeParticipant';
import './FeParticipantList.scss';

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
    wrapper.innerHTML = `<ul id="list" class="list"></ul>`;

    this.shadowRoot.append(LINK, wrapper);

    this.LIST = this.shadowRoot.querySelector('#list');
    // 결재선 삭제시 이벤트 리스너
    this.LIST.addEventListener('delete', (e) => {
      console.log('FeParticipantList', e.type, e.target.tagName, e.detail);
      // li 삭제
      let li = e.target.closest('li');
      li.remove();

      this.#decideApprovalType();
      // hox 업데이트
      // this.#updateHox();
    });
    // 결재방법 변경시 이벤트 리스너
    this.LIST.addEventListener('change', (e) => {
      console.log('FeParticipantList', e.type, e.target.tagName, e.detail);

      let index = e.detail.index;
      this.#decideApprovalType(index);
      // hox 업데이트
      // this.#updateHox();
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

    let selectedElement = this.shadowRoot.querySelector('#list .selected');
    if (selectedElement === null) {
      this.LIST.prepend(li);
    } else {
      selectedElement.insertAdjacentElement('beforebegin', li);
    }
    li.click();

    this.#decideApprovalType();

    // hox 업데이트
    // this.#updateHox();
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

    this.#decideApprovalType();
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

  #decideApprovalType() {
    //
    let feParticipantNodeList = Array.from(this.LIST.querySelectorAll('fe-participant'));
    feParticipantNodeList.reverse(); // 화면표시 순서와 hox 순서가 반대이므로, 배열 반전

    let drafterId = getText(this.hox, 'docInfo drafter ID');

    let lastUserIndex = -1; // 최종결재자의 인덱스
    let isSetJeonkyul = false; // 전결이 설정되었는지
    let jeonkyulIndex = -1; // 전결의 인덱스

    for (let i = 0; i < feParticipantNodeList.length; i++) {
      let feParticipant = feParticipantNodeList[i];
      if (feParticipant.type === 'user') {
        lastUserIndex = i;

        if (feParticipant.approvalType === 'user_jeonkyul') {
          isSetJeonkyul = true;
          jeonkyulIndex = i;
        }
      }
    }

    let isCanDaekyul = false; // 대결 선택 조건이 되는지. lastUserIndex - 1 이 사용자이면 가능
    let daekyulIndex = -1; // 대결을 선택할수 있는 결재자 인덱스
    let isSetDaekyul = false; // 대결이 설정되었는지

    let prevFeParticipant = feParticipantNodeList[lastUserIndex - 1];
    if (prevFeParticipant.type === 'user' && prevFeParticipant.approvalType === 'user_approval') {
      isCanDaekyul = true;
      daekyulIndex = lastUserIndex - 1;
      if (prevFeParticipant.approvalType === 'user_daekyul') {
        isSetDaekyul = true;
      }
    }

    console.log(`
      lastUserIndex = ${lastUserIndex}
      isSetJeonkyul = ${isSetJeonkyul}
      jeonkyulIndex = ${jeonkyulIndex}
      isCanDaekyul  = ${isCanDaekyul}
      daekyulIndex  = ${daekyulIndex}
      isSetDaekyul  = ${isSetDaekyul}
    `);

    let approvalTypes = [];

    for (let i = 0; i < feParticipantNodeList.length; i++) {
      let feParticipant = feParticipantNodeList[i];
      //
      if (feParticipant.type === 'dept') {
        // 부서는 [순차협조, 병렬협조]
        approvalTypes = [ATO.DEPT_HYEOBJO_S, ATO.DEPT_HYEOBJO_P];
      } else {
        // 사용자
        if (i === 0 && feParticipant.id === drafterId) {
          // 첫번째 + 기안자이면 = [기안, 전결, 확인]
          approvalTypes = [ATO.GIAN, ATO.JEONKYUL, ATO.HWAGIN];
        } else if (lastUserIndex === i) {
          // 최종결재 = [결재, 전결, 협조, 병렬협조, 확인, 참조, 결재안함]
          approvalTypes = [ATO.KYULJAE, ATO.JEONKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM];
        } else {
          // 중간결재 = [검토, 전결, 협조, 병렬협조, 확인, 참조, 결재안함]
          approvalTypes = [ATO.GEOMTO, ATO.JEONKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM];
        }

        // TODO (전결 -> 검토), (검토 -> 전결) 변경은 이후 결재선의 강제 변경이 필요

        if (isSetJeonkyul && jeonkyulIndex < i) {
          // 전결 다음부터 = [결재안함, 협조, 병렬협조, 참조]
          // 변화의 원인이면, 강제 변환
          approvalTypes = [ATO.KYULJAE_ANHAM, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.REFER];
        }
        if (isCanDaekyul) {
          if (daekyulIndex === i) {
            // 대결 가능 = [검토, 전결, 대결, 협조, 병렬협조, 확인, 참조, 결재안함]
            approvalTypes = [ATO.GEOMTO, ATO.JEONKYUL, ATO.DAEKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM];
          } else if (isSetDaekyul && daekyulIndex + 1 === i) {
            // 대결 뒤 = [후열, 후결, 후열안함]
            approvalTypes = [ATO.HUYEOL, ATO.HUKYUL, ATO.HUYEOL_ANHAM];
          }
        }
      }
      feParticipant.setApprovalTypes(approvalTypes);
      feParticipant.setIndex(i);
    }
  }

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
}

customElements.define('fe-participantlist', FeParticipantList);
