import StringUtils from '../utils/StringUtils';
import { getNodes, getText, serializeXmlToString } from '../utils/xmlUtils';
import './FeDeliverDocDialog.scss';
import FeDeliverDocRecipient from './FeDeliverDocRecipient';

/**
 * 접수: 배부 다이얼로그
 */
export default class FeDeliverDocDialog extends HTMLElement {
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
    wrapper.classList.add(this.tagName.toLocaleLowerCase(), 'dialog');
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.cmsg_0017}</label>
      </div>
      <div class="body">
        <div class="recipient-wrap">
        </div>
        <div class="comment-write">
          <textarea placeholder="${GWWEBMessage.cmsg_160}"></textarea>
          <label><span class="comment-length">0</span>/${window.commentLengthMaxSize}</label>
        </div>
      </div>
      <div class="footer">
        <button type="button" id="btnVerify" class="btn btn-primary">${GWWEBMessage.cmsg_0006}</button>
        <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.feDeliverDocRecipient = this.shadowRoot.querySelector('.recipient-wrap').appendChild(new FeDeliverDocRecipient());

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
      // 배부 로직 수행
      const recHox = this.feDeliverDocRecipient.getHox();
      const recLength = getNodes(recHox, 'content recipient rec').length;
      console.log('rec', recLength, recHox);
      if (recLength === 0) {
        alert('배부처 선택 필요');
      } else {
        /*
          /bms/com/hs/gwweb/appr/manageDocDlry.act
          - HOXDATA
          - APPRIDLIST
          - SENDIDLIST
          - SENDTYPELIST 1
          - opinionWritng
          - opinionWritngHdn urlEncode
        */

        const SEND_BROAD = 3; // 대내배부
        const SEND_BROAD_FOREIGN = 4; // 대외배부

        let sendtype = SEND_BROAD;
        if ('enforcetype_external' === getText(feMain.hox, 'docInfo enforceType')) {
          sendtype = SEND_BROAD_FOREIGN;
        }

        const opinion = this.shadowRoot.querySelector('textarea').value;
        if (StringUtils.isBlank(opinion)) {
          alert('배부의견 필요');
        } else {
          const formData = new FormData();
          formData.append('APPRIDLIST', rInfo.apprMsgID);
          formData.append('SENDIDLIST', rInfo.sendID);
          formData.append('SENDTYPELIST', sendtype);
          formData.append('topDeptID', rInfo.dept.ID);
          // formData.append('opinionWritng', opinion);
          formData.append('opinionWritngHdn', encodeURI(opinion));
          formData.append('HOXDATA', encodeURI(serializeXmlToString(recHox)));

          const ret = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageDocDlry.act`, {
            method: 'POST',
            body: formData,
          }).then((res) => res.json());
          console.log('manageDocDlry.act', ret);

          if (ret.ok) {
            this.ret = 0;
            if (ret.duplicated) {
              alert(ret.duplicatedMessage + ' ' + ret.duplicatedDeptNameList);
            }
          }
          alert(ret.msg);
        }
      }
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

customElements.define('fe-deliverdocdialog', FeDeliverDocDialog);
