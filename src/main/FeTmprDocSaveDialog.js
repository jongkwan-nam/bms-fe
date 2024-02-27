import IDUtils from '../utils/IDUtils';
import StringUtils from '../utils/StringUtils';
import { getText, serializeXmlToString } from '../utils/xmlUtils';
import './FeTmprDocSaveDialog.scss';
import { doNewApprID } from './logic/do/apprID';
import { doSetContentAttachID } from './logic/do/content';
import { doNewObjectIDofAttach, doNewObjectIDofSummary } from './logic/do/objectIDList';
import { doNewParticipantID } from './logic/do/participant';

/**
 * 임시저장
 */
export default class FeTmprDocSaveDialog extends HTMLElement {
  ret = -1;

  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './main.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.cmsg_787}</label>
      </div>
      <div class="body">
        <input type="text" placeholder="${GWWEBMessage.W2849}">
        <pre></pre>
      </div>
      <div class="footer">
        <div>
          <button type="button" id="btnVerify" class="btn btn-primary" disabled>${GWWEBMessage.cmsg_0006}</button>
          <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
        </div>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.shadowRoot.querySelector('#btnVerify').addEventListener('click', async () => {
      this.ret = await this.#save();
    });

    // 취소
    this.shadowRoot.querySelector('#btnCancel').addEventListener('click', (e) => {
      this.ret = 1;
    });

    this.shadowRoot.querySelector('.body input').addEventListener('keyup', () => {
      // 제목이 비었으면, 확인 버튼 비활성
      if (StringUtils.isBlank(this.shadowRoot.querySelector('.body input').value)) {
        this.shadowRoot.querySelector('#btnVerify').setAttribute('disabled', true);
      } else {
        this.shadowRoot.querySelector('#btnVerify').removeAttribute('disabled');
      }
    });
  }

  /**
   *
   * @returns 결과. 0: 완료, 1: 취소, 2: 오류
   */
  async open() {
    // 제목 설정
    this.shadowRoot.querySelector('.body input').value = getText(feMain.hox, 'docInfo title');
    this.shadowRoot.querySelector('.body input').dispatchEvent(new Event('keyup'));

    return new Promise((resolve, reject) => {
      //
      const interval = setInterval(() => {
        if (this.ret > -1) {
          clearInterval(interval);
          resolve(this.ret);
        }
      }, 100);
    });
  }

  async #save() {
    const hox = feMain.hox.cloneNode(true);
    const title = this.shadowRoot.querySelector('.body input').value.trim();

    // 확인 로직 수행
    // /bms/com/hs/gwweb/appr/retrieveServerFileNmDplct.act?title=
    // > {"exists":false,"ok":true}
    const nmDplctData = new FormData();
    nmDplctData.append('title', title);
    const retObj = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveServerFileNmDplct.act`, { method: 'POST', body: nmDplctData }).then((res) => res.json());
    if (retObj.exists) {
      // TODO QDB 문서가 아니면, 덮어 쓸지 묻는다
      if (!confirm(StringUtils.formatMessage(GWWEBMessage.cmsg_552, title))) {
        return -1;
      }
    }

    // apprId, participantId 채번
    const currentParticipant = feMain.getCurrentParticipant();
    const apprID = doNewApprID(hox);
    doNewParticipantID(hox);
    doNewObjectIDofAttach(hox, currentParticipant);
    doNewObjectIDofSummary(hox, currentParticipant);
    doSetContentAttachID(hox);

    // 본문 저장
    const saveRet = await feMain.feEditor1.saveServer(apprID);
    const bodyFileInfo = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/getFileFromURL.act?url=${saveRet.downloadURL}`).then((res) => res.json());
    if (!bodyFileInfo.ok) {
      console.error('downloadURL=%d, bodyFileInfo=%d', saveRet.downloadURL, bodyFileInfo);
      throw new Error('웹한글 파일 저장 오류.');
    }
    const bodyTRID = bodyFileInfo.TRID;

    // /bms/com/hs/gwweb/appr/createTmprDoc.act
    // - apprID, UID, DID, ref_~~001, ref_~~003, block_~~~002
    const formData = new FormData();
    formData.append('apprID', apprID);
    formData.append('UID', rInfo.user.ID);
    formData.append('DID', rInfo.dept.ID);
    formData.append('tempTitle', title);
    formData.append('WORDTYPE', 5);
    // 본문
    formData.append('ref_' + IDUtils.getObjectID(apprID, 1), bodyTRID);
    // 첨부
    feMain.feAttachBox.listFileIDs().forEach((trid, i) => {
      formData.append('ref_' + IDUtils.getObjectID(apprID, 100 + i), trid);
    });
    // 요약전
    if (feMain.summary.TRID !== null) {
      formData.append('ref_' + IDUtils.getObjectID(apprID, 3), feMain.summary.TRID);
    }
    // hox
    formData.append('block_' + IDUtils.getObjectID(apprID, 2), serializeXmlToString(hox));

    const ret = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/createTmprDoc.act`, { method: 'POST', body: formData }).then((res) => res.text());
    console.log('ret', ret);

    if ('{RESULT:OK}' === ret.trim()) {
      alert(GWWEBMessage.cmsg_1040); // 완료했습니다.
      return 1;
    } else {
      throw new Error('임시저장에 실패하였습니다.');
    }
  }
}

customElements.define('fe-tmprdocsavedialog', FeTmprDocSaveDialog);
