import syncFetch from 'sync-fetch';
import StringUtils from '../utils/StringUtils';
import './FeReCallDialog.scss';

/**
 * 접수: 배부 다이얼로그
 */
export default class FeReCallDialog extends HTMLElement {
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
    wrapper.classList.add(this.tagName.toLocaleLowerCase(), 'dialog');
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.cmsg_1808}</label>
      </div>
      <div class="body">
        <div class="comment-write">
          <textarea placeholder="${GWWEBMessage.cmsg_389}"></textarea>
          <label><span class="comment-length">0</span>/${window.commentLengthMaxSize}</label>
        </div>
      </div>
      <div class="footer">
        <button type="button" id="btnVerify" class="btn btn-primary">${GWWEBMessage.cmsg_0006}</button>
        <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
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
      // 로직 수행

      // /bms/com/hs/gwweb/appr/manageDocCardRtrvl.act
      // - USERID: 500023621
      // - DEPTID: 000010313
      // - ACTION: 3
      // - APPRIDLIST: JHOMS240590000476000
      // - EXAMIDLIST:
      // - PARTICIPANTIDLIST:
      // - rtrvlOpinion: 12121321321
      // - opinion: 12121321321
      // - title: 기안자가 아니므로 회수 버튼이 보이지 않는다

      const opinion = this.shadowRoot.querySelector('textarea').value.trim();

      const formData = new FormData();
      formData.append('USERID', rInfo.user.ID);
      formData.append('DEPTID', rInfo.dept.ID);
      formData.append('ACTION', 3);
      formData.append('APPRIDLIST', rInfo.apprMsgID);
      formData.append('EXAMIDLIST', '');
      formData.append('PARTICIPANTIDLIST', '');
      formData.append('rtrvlOpinion', encodeURI(opinion));

      const ret = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageDocCardRtrvl.act`, { method: 'POST', body: formData }).then((res) => res.json());
      if (ret.ok) {
        alert(GWWEBMessage.W2053);
        this.ret = 0;
      } else {
        console.log('DocCardRtrvl', ret);
        alert(GWWEBMessage.cmsg_740);
        this.ret = 2;
      }
    });

    this.shadowRoot.querySelector('#btnCancel').addEventListener('click', () => {
      //
      this.ret = 1; // 취소
    });
  }

  /**
   * 회수 가능한지
   * @returns
   */
  isPossible() {
    // 구문서는 회수 불가
    const ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/checkOldDoc.act?APPRIDLIST=${rInfo.apprMsgID}`).json();
    if (ret.ok) {
      if (ret.olddoclist.indexOf(rInfo.apprMsgID) > -1) {
        alert(GWWEBMessage.hsappr_0035);
        return false;
      }
    }

    // qdb 문서 불가
    const DOCATTR_QDB = 48;
    if (doccfg.disableViewerCancel) {
      if (!!rInfo.docattr && rInfo.docattr.length > parseInt(DOCATTR_QDB) && '1' === rInfo.docattr.charAt(DOCATTR_QDB)) {
        return false;
      }
    }

    return true;
  }

  /**
   *
   * @returns 결과. 0: 완료, 1: 취소, 2: 오류
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

customElements.define('fe-recalldialog', FeReCallDialog);
