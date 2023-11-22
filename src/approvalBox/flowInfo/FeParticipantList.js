import { createNode, getNode, getNodes } from '../../utils/hoxUtils';
import FeParticipant from './FeParticipant';

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
    this.LIST.addEventListener('deleteParticipant', (e) => {
      console.log('Event', e.type, e.target, e);
      // li 삭제
      let li = e.target.closest('li');
      li.remove();

      // hox 업데이트
      this.#updateHox();
      // this.postProcess();
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
    let xmlText = `
      <participant xmlns="http://www.handysoft.com/xsd/2002/04/HOX/1.0" IPAddress="" absent="false" current="false" mandatory="false" opinion="false" serverID="0" signStyle="text">
        <participantID />
        <position>대표이사</position>
        <dutyName />
        <rankName />
        <ID>004003824</ID>
        <name>이희준</name>
        <type>user</type>
        <department>
            <ID>000000101</ID>
            <name>system</name>
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
        <signerLevel>1</signerLevel>
        <signlessCode name="" />
        <date>1970-01-01T09:00:00</date>
        <timezone />
        <signMethod />
        <approvalType>user_approval</approvalType>
        <approvalSubType />
        <displayApprovalType>결재</displayApprovalType>
        <displayResourceCode>@@st_current@@</displayResourceCode>
        <approvalStatus>partapprstatus_will</approvalStatus>
        <validStatus>valid</validStatus>
        <grantedAction>defaultaction_setupflow defaultaction_addattach defaultaction_editdoc </grantedAction>
        <dutyType />
        <participantFlag />
        <mappingCell>
            <cellGroupID>0</cellGroupID>
            <cellName>서명.3</cellName>
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
        <bodyFileVersion />
      </participant>    
    `;
    let participant = getNode(this.hox, 'docInfo content receiptInfo recipient').appendChild(createNode(xmlText));
    let li = this.LIST.appendChild(document.createElement('li'));
    li.appendChild(new FeParticipant()).set(participant);
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
      let li = this.LIST.appendChild(document.createElement('li'));
      li.appendChild(new FeParticipant()).set(participant);
    });
  }

  #updateHox() {
    getNode(this.hox, 'approvalFlow participant').textContent = null;
    //
    this.LIST.querySelectorAll('fe-participant').forEach((feParticipant) => {
      //
      getNode(this.hox, 'approvalFlow participant').appendChild(feParticipant.participant);
    });
  }
}

customElements.define('fe-participantlist', FeParticipantList);
