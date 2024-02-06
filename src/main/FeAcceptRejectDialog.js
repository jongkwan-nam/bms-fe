import StringUtils from '../utils/StringUtils';
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
      if (StringUtils.isBlank(this.shadowRoot.querySelector('textarea').value)) {
        alert(GWWEBMessage.cmsg_537);
        return;
      }
      this.ret = 0;

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
