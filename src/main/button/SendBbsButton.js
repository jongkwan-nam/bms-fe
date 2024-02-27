import { getNumber, getText } from '../../utils/xmlUtils';

/**
 * 게시하기 버튼
 */
export default class SendBbsButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_398;
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

    const bodyFileInfo = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/getFileFromURL.act?url=${saveRet.downloadURL}`).then((res) => res.json());
    if (!bodyFileInfo.ok) {
      console.error('downloadURL=%d, bodyFileInfo=%d', saveRet.downloadURL, bodyFileInfo);
      throw new Error('웹한글 파일 저장 오류.');
    }
    const bodyTRID = bodyFileInfo.TRID;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('apprID', apprID);
    formData.append('UID', rInfo.user.ID);
    formData.append('DID', rInfo.dept.ID);
    formData.append('app', 2); // APP_BBS = 2
    formData.append('isAttachSecurityDoc', isAttachSecurity ? 'Y' : 'N');
    formData.append('WORDTYPE', 5);
    formData.append('extBodyTRID', bodyTRID);
    formData.append('extBodyTRIDSuffix', 'pdf');
    const sendRet = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/extSend.act`, { method: 'POST', body: formData }).then((res) => res.json());

    // 팝업 URL
    const url = `/servlet/HIServlet?U=${userId}&SENDER_ID=${userId}&SERVER_FILENAME=${sendRet.msgFileName}&K=${szKEY}&SLET=bbs.BBSMtrlWriteWin.java&MENU=BWRITE&LMET=CLOSE&MET=EXT&RL=&COMMUNITY_ID=${rInfo.user.communityID}`;
    const windowProxy = window.open(url, 'sendBbs' + apprID, 'width=850px,height=767px');
    if (windowProxy === null) {
      alert(GWWEBMessage.cmsg_1255); // 팝업이 차단되었습니다. 현재 사이트의 팝업을 허용하십시오.
    }
  }
}

customElements.define('sendbbs-button', SendBbsButton, { extends: 'button' });
