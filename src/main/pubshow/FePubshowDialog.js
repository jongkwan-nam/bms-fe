import { getNode, toggleFlag } from '../../utils/xmlUtils';
import FePubshowBody from './FePubshowBody';
import './FePubshowDialog.scss';

/**
 * 접수: 배부 다이얼로그
 */
export default class FePubshowDialog extends HTMLElement {
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
        <label>${GWWEBMessage.cmsg_1807}</label>
      </div>
      <div class="body">
      </div>
      <div class="footer">
        <button type="button" id="btnVerify" class="btn btn-primary">${GWWEBMessage.cmsg_0006}</button>
        <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.fePubshowBody = this.shadowRoot.querySelector('.body').appendChild(new FePubshowBody());

    this.shadowRoot.querySelector('#btnVerify').addEventListener('click', async () => {
      // 공람지정 로직 수행
      const pubshowNodes = this.fePubshowBody.getData();
      const pubShowInfo = getNode(feMain.hox, 'pubShowInfo');
      pubShowInfo.textContent = null;
      pubShowInfo.append(...pubshowNodes);

      toggleFlag(feMain.hox, 'approvalFlag', 'apprflag_pubshow', pubshowNodes.length > 0);

      this.ret = 0;
    });

    this.shadowRoot.querySelector('#btnCancel').addEventListener('click', () => {
      //
      this.ret = 1; // 취소
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
}

customElements.define('fe-pubshowdialog', FePubshowDialog);
