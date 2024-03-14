import Capi from '../../utils/Capi';
import { getNumber, getText } from '../../utils/xmlUtils';
import { addActionLogSave } from '../ActionLog';

/**
 * 메일쓰기 버튼
 */
export default class SendMainButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_823;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    //
    const feEditor = feMain.feEditor1;
    const hox = feMain.hox;
    const userId = rInfo.user.ID;
    const title = getText(hox, 'docInfo title');
    const apprID = getText(hox, 'docInfo apprID');
    const isAttachSecurity = getNumber(hox, 'docInfo attachSecurityLevel') < 99;

    // save hwp to pdf
    const saveRet = await feEditor.saveServer(title, 'PDF', ';code:ks');

    const bodyFileInfo = Capi.getFileFromURL(saveRet.downloadURL);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('apprID', apprID);
    formData.append('UID', rInfo.user.ID);
    formData.append('DID', rInfo.dept.ID);
    formData.append('app', 1); // APP_MAIL = 1
    formData.append('isAttachSecurityDoc', isAttachSecurity ? 'Y' : 'N');
    formData.append('WORDTYPE', 5);
    formData.append('extBodyTRID', bodyFileInfo.TRID);
    formData.append('extBodyTRIDSuffix', 'pdf');
    const sendRet = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/extSend.act`, { method: 'POST', body: formData }).then((res) => res.json());

    // 팝업 URL
    const url = `/wma/msgm.do?uid=${userId}&acton=extcompose&GWLANG=${rInfo.user.locale}&SENDER_ID=${userId}&SERVER_FILENAME=${sendRet.msgFileName}&key=${szKEY}`;
    const windowProxy = window.open(url, 'sendMail' + apprID, 'width=850px,height=767px');
    if (windowProxy === null) {
      alert(GWWEBMessage.cmsg_1255); // 팝업이 차단되었습니다. 현재 사이트의 팝업을 허용하십시오.
    }

    addActionLogSave(apprID, title);
  }
}

customElements.define('sendmail-button', SendMainButton, { extends: 'button' });
