import IDUtils from '../../utils/IDUtils';
import { getText, serializeXmlToString, setText } from '../../utils/xmlUtils';

/**
 * 보류
 */
export default class HoldButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_0015;
    this.classList.add('btn', 'btn-warning');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    const hox = feMain.hox;
    const nodeParticipant = feMain.getCurrentParticipant();
    const apprId = getText(hox, 'docInfo apprID');
    const participantID = getText(nodeParticipant, 'participantID');
    const participantApprovalType = getText(nodeParticipant, 'approvalType');

    // hox에 postpone 표시
    setText(hox, 'docInfo approvalStatus', 'apprstatus_postpone');
    setText(nodeParticipant, 'approvalStatus', 'partapprstatus_postpone');

    // submit
    const formData = new FormData();
    formData.append('apprID', apprId);
    formData.append('UID', rInfo.user.ID);
    formData.append('DID', rInfo.user.deptID);
    formData.append('WORDTYPE', rInfo.objForm1.wordType);
    formData.append('myApprType', participantApprovalType);
    formData.append('PARTICIPANTID', participantID);

    // hox
    formData.append('block_' + IDUtils.getObjectID(apprId, 2), serializeXmlToString(hox));

    const ret = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageDocProgrs.act`, {
      method: 'POST',
      body: formData,
    }).then((res) => res.text());
    //  {RESULT:OK}
    console.log('ret', ret);

    const ok = '{RESULT:OK}' === ret.trim();
    if (ok) {
      // 보류 성공 후처리
      alert('보류되었습니다.');
    } else {
      // 보류 실패 후처리
      alert('실패하였습니다.');
    }
  }
}

customElements.define('hold-button', HoldButton, { extends: 'button' });
