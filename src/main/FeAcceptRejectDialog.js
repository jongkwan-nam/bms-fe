import syncFetch from 'sync-fetch';
import IDUtils from '../utils/IDUtils';
import StringUtils from '../utils/StringUtils';
import { getText } from '../utils/xmlUtils';
import './FeAcceptRejectDialog.scss';

/**
 * 접수: 반송 다이얼로그
 */
export default class FeAcceptRejectDialog extends HTMLElement {
  ret = -1;

  constructor() {
    super();
    this.init();
  }

  init() {
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './main.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.cmsg_550}</label>
      </div>
      <div class="comment-write">
        <textarea placeholder="${GWWEBMessage.cmsg_0067}"></textarea>
        <label><span class="comment-length">0</span>/${window.commentLengthMaxSize}</label>
      </div>
      <div class="footer">
        <div>
          <button type="button" id="btnVerify" class="btn btn-primary">${GWWEBMessage.cmsg_0006}</button>
          <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
        </div>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    // 글자갯수
    this.shadowRoot.querySelector('textarea').addEventListener('keyup', (e) => {
      const commentText = StringUtils.cutByMaxBytes(e.target.value, window.commentLengthMaxSize);
      const bytesLength = StringUtils.getBytesLength(commentText);
      if (bytesLength === window.commentLengthMaxSize) {
        e.target.value = commentText;
      }
      this.shadowRoot.querySelector('.comment-length').innerHTML = bytesLength;
    });

    this.shadowRoot.querySelector('#btnVerify').addEventListener('click', async () => {
      //
      const opinion = this.shadowRoot.querySelector('textarea').value;
      if (StringUtils.isBlank(opinion)) {
        alert(GWWEBMessage.cmsg_537);
        return;
      }

      /*
        /bms/com/hs/gwweb/appr/manageDocRetrnProgrs.act
        - SENDID
        - UID
        - DID
        - USERNAME
        - opinionWritng
        - opinionWritngHdn
        - orgApprID
        - orgHashCode
        - WORDTYPE
        - apprID
      */

      const orgApprID = getText(feMain.hox, 'docInfo orgApprID');
      const no = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSynchrnNo.act?FID=${IDUtils.getObjectID(orgApprID, 1)}`).json();
      if (!no.ok) {
        throw new Error('fail to get hashcode: ' + orgApprID);
      }
      const orgHashCode = no.hashCode;

      const formData = new FormData();
      formData.append('UID', rInfo.user.ID);
      formData.append('DID', rInfo.dept.ID);
      formData.append('SENDID', rInfo.sendID);
      formData.append('USERNAME', rInfo.user.name);
      formData.append('WORDTYPE', rInfo.WORDTYPE);
      formData.append('opinionWritng', opinion);
      formData.append('opinionWritngHdn', encodeURI(opinion));
      formData.append('apprID', '');
      formData.append('orgApprID', orgApprID);
      formData.append('orgHashCode', orgHashCode);

      const res = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageDocRetrnProgrs.act`, { method: 'POST', body: formData }).then((res) => res.json());
      if (res.ok) {
        this.ret = 0;
        alert(GWWEBMessage.cmsg_0001); // 문서를 반송하였습니다.
      } else {
        alert(GWWEBMessage.cmsg_0002 + ' ' + res.rc); // 반송이 실패하였습니다.
      }

      // TODO 반려 서명처리 전 QDB 연동
      //
    });

    this.shadowRoot.querySelector('#btnCancel').addEventListener('click', () => {
      //
      this.ret = 1;
    });
  }

  /**
   *
   * @returns 지정 결과. 0: 지정 완료, 1: 취소, 2: 오류
   */
  async open() {
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
}

customElements.define('fe-acceptrejectdialog', FeAcceptRejectDialog);
