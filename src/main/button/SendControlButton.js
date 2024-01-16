import * as DateUtils from '../../utils/dateUtils';
import { getAttr, getNode, getNodeArray, getText, setAttr, setText } from '../../utils/hoxUtils';
import { makeEnforceHox4DraftForm, makeEnforceHox4MultiDoc } from '../logic/makeEnforceHox';

/**
 * 발송처리 버튼
 */
export default class SendControlButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.W2605;
    this.classList.add('btn', 'btn-primary');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    /*
      발송처리
      docInfo content enforceType in (enforcetype_internal, enforcetype_external)
        docInfo content enforce sendStatus == apprstatus_ing
          docInfo content enforce docID = 새 apprID 채번
          docInfo content enforce docNumber = {새 docNumber 채번}
          docInfo content enforce sendStatus = apprstatus_finish
          새 시행문 hox, body 생성
          docInfo content stampName = 오상_관인1.jpg # TODO 관인날인시 추가됨
      docInfo enforceDate = {currentDate}
      docInfo examRequest exam examiner position
      docInfo examRequest exam examiner ID
      docInfo examRequest exam examiner name
      docInfo examRequest exam examiner date = {currentDate}
      docInfo examRequest exam examiner status = partapprstatus_done
      docInfo examRequest exam examDate = {currentDate}
      docInfo examRequest exam examStatus = apprstatus_finish
    */

    const hoxType = getAttr(feMain.hox, 'hox', 'type'); // draft or multiDraft
    const isMultiDraft = 'multiDraft' === hoxType;
    const isDraftForm = 'formtype_draft' === getText(feMain.hox, 'formInfo formType');

    const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');

    const enforceHoxList = [];

    if (isMultiDraft || isDraftForm) {
      getNodeArray(feMain.hox, 'docInfo content').forEach((content, i) => {
        const enforceType = getText(content, 'enforceType');
        const sendStatus = getText(content, 'enforce sendStatus');

        if ('enforcetype_not' === enforceType) {
          return;
        }
        if ('apprstatus_ing' !== sendStatus) {
          return;
        }

        // 시행문 hox 생성

        let enforceHox = null;
        if (isMultiDraft) {
          enforceHox = makeEnforceHox4MultiDoc(feMain.hox, i + 1);
          const enforceApprID = getText(enforceHox, 'docInfo apprID');

          // 시행문 apprID를 content enforce docID에 설정
          setText(content, 'enforce docID', enforceApprID);
          setText(content, 'enforce sendStatus', 'apprstatus_finish');
          // 시행문의 docNumber를 enforce노드에 추가
          const nodeOfDocNumber = getNode(enforceHox, 'docNumber');
          getNode(content, 'enforce').append(nodeOfDocNumber.cloneNode(true));
        } else {
          enforceHox = makeEnforceHox4DraftForm(feMain.hox);
        }

        enforceHoxList.push(enforceHox);
      });
    }

    setAttr(feMain.hox, 'docInfo', 'modification', 'no');
    setText(feMain.hox, 'docInfo enforceDate', todayNow);

    setText(feMain.hox, 'docInfo examRequest exam examiner position', rInfo.user.positionName);
    setText(feMain.hox, 'docInfo examRequest exam examiner ID', rInfo.user.ID);
    setText(feMain.hox, 'docInfo examRequest exam examiner name', rInfo.user.name);
    setText(feMain.hox, 'docInfo examRequest exam examiner date', todayNow);
    setText(feMain.hox, 'docInfo examRequest exam examiner status', 'partapprstatus_done');
    setText(feMain.hox, 'docInfo examRequest exam examDate', todayNow);
    setText(feMain.hox, 'docInfo examRequest exam examStatus', 'apprstatus_finish');
  }
}

customElements.define('sendcontrol-button', SendControlButton, { extends: 'button' });
