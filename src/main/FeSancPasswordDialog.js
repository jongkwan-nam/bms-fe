import StringUtils from '../utils/StringUtils';
import './FeSancPasswordDialog.scss';

/**
 * 결재 비밀번호 확인
 */
export default class FeSancPasswordDialog extends HTMLElement {
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
        <label>${GWWEBMessage.hsappr_0351}</label>
      </div>
      <div class="body">
        <input type="password" placeholder="${GWWEBMessage.hsappr_0353}">
      </div>
      <div class="footer">
        <button type="button" id="btnVerify" class="btn btn-primary">${GWWEBMessage.cmsg_0006}</button>
        <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.shadowRoot.querySelector('#btnVerify').addEventListener('click', async () => {
      // 확인 로직 수행
      this.ret = await this.#checkPassword();
    });

    this.shadowRoot.querySelector('#btnCancel').addEventListener('click', () => {
      //
      this.ret = 1; // 취소
    });

    this.shadowRoot.querySelector('.body input').addEventListener('keyup', async (e) => {
      if (e.keyCode === 13) {
        this.ret = await this.#checkPassword();
      }
    });
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

  async #checkPassword() {
    const inputPassword = this.shadowRoot.querySelector('.body input').value;
    if (StringUtils.isBlank(inputPassword)) {
      return -1;
    }

    const formData = new FormData();
    formData.append('userID', rInfo.user.ID);
    formData.append('text', inputPassword);
    const ret = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveUserValidCheck.act`, { method: 'POST', body: formData }).then((res) => res.json());
    if (ret.ok) {
      if (ret.isValid) {
        return 0;
      } else {
        alert(GWWEBMessage.cmsg_997);
        return -1;
      }
    } else {
      alert(GWWEBMessage.answer_message_error);
      return 2;
    }
  }
}

customElements.define('fe-sancpassworddialog', FeSancPasswordDialog);
