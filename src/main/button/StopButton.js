import { getText, serializeHoxToString, setText } from '../../utils/hoxUtils';
import IDUtils from '../../utils/IDUtils';

/**
 * 중단
 */
export default class StopButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_0016;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    const hox = feMain.hox;
    const nodeParticipant = feMain.getCurrentParticipant();
    const apprId = getText(hox, 'docInfo apprID');
    const participantID = getText(nodeParticipant, 'participantID');
    const participantApprovalType = getText(nodeParticipant, 'approvalType');

    // hox에 cease 표시
    setText(hox, 'docInfo approvalStatus', 'apprstatus_cease');
    setText(nodeParticipant, 'approvalStatus', 'partapprstatus_cease');

    // submit
    const formData = new FormData();
    formData.append('apprID', apprId);
    formData.append('UID', rInfo.user.ID);
    formData.append('DID', rInfo.user.deptID);
    formData.append('WORDTYPE', rInfo.objForm1.wordType);
    formData.append('myApprType', participantApprovalType);
    formData.append('PARTICIPANTID', participantID);

    // hox
    formData.append('block_' + IDUtils.getObjectID(apprId, 2), serializeHoxToString(hox));

    const ret = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageDocProgrs.act`, {
      method: 'POST',
      body: formData,
    }).then((res) => res.text());
    //  {RESULT:OK}
    console.log('ret', ret);

    const ok = '{RESULT:OK}' === ret.trim();
    if (ok) {
      // 중단 성공 후처리
      alert('중단되었습니다.');
    } else {
      // 중단 실패 후처리
      alert('실패하였습니다.');
    }
    // 중단된 문서는 문서함 > 중단함(8080)으로 이동됨
  }
}

customElements.define('stop-button', StopButton, { extends: 'button' });
