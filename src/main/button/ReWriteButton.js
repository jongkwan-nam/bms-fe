import { getText } from '../../utils/xmlUtils';
import { addActionLogSave } from '../ActionLog';

/**
 * 재작성 버튼
 */
export default class ReWriteButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_101;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());

    if ('apprstatus_finish' !== getText(feMain.hox, 'docInfo approvalStatus')) {
      this.remove();
    }
  }

  async #doAction() {
    const formID = getText(feMain.hox, 'docInfo formInfo formID');
    const title = getText(feMain.hox, 'docInfo title');

    addActionLogSave(rInfo.apprMsgID, title);

    const formRet = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveFormatInfo.act?formID=${formID}`).then((res) => res.json());
    if (formRet.ok) {
      // 기안기 호출
      const url = `${PROJECT_CODE}/fe/retrieveDoccrdWritng.act?UID=${rInfo.user.ID}&WORDTYPE=5&FORMID=${formID}&APPRIDXID=${rInfo.apprMsgID}&DUPATTACH=${0}&CLTAPP=${2}`;
      const windowProxy = window.open(url, 'appr1', 'width=1270px,height=900px');
      if (windowProxy === null) {
        alert(GWWEBMessage.cmsg_1255); // 팝업이 차단되었습니다. 현재 사이트의 팝업을 허용하십시오.
      }
    } else {
      // TODO 서식 선택
    }
  }
}

customElements.define('rewrite-button', ReWriteButton, { extends: 'button' });
