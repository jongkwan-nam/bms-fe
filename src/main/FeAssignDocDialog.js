import FeAssignOrgTree from '../tree/FeAssignOrgTree';
import StringUtils from '../utils/StringUtils';
import './FeAssignDocDialog.scss';

/**
 * 접수: 담당자 지정 다이얼로그
 */
export default class FeAssignDocDialog extends HTMLElement {
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
        <label>${GWWEBMessage.cmsg_2390}</label>
      </div>
      <div class="body">
        <div class="comment-write">
          <textarea placeholder="${GWWEBMessage.cmsg_1809}"></textarea>
          <label><span class="comment-length">0</span>/${window.commentLengthMaxSize}</label>
        </div>
      </div>
      <div class="footer">
        <button type="button" id="btnVerify" class="btn btn-primary">${GWWEBMessage.cmsg_0006}</button>
        <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.renderOrgTree();

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
      if (StringUtils.isBlank(this.userId)) {
        alert(GWWEBMessage.cmsg_0043);
        return;
      }
      this.ret = 0;

      const formData = new FormData();
      formData.append('SENDIDLIST', rInfo.sendID);
      formData.append('TYPEDNAME', '0');
      formData.append('ASSIGNID', this.userId);
      formData.append('ASSIGNNAME', this.userName);
      formData.append('APPRDEPTID', this.deptId);
      formData.append('opinionWritngHdn', this.shadowRoot.querySelector('textarea').value);
      // opinionWritng

      const ret = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/actBatchAssign.act`, {
        method: 'POST',
        body: formData,
      }).then((res) => res.json());
      console.log('actBatchAssign ret', ret);

      if (ret.ok) {
        alert(GWWEBMessage.cmsg_963);
      } else {
        if (ret.rc === 3208) {
          alert(GWWEBMessage.cmsg_2251);
        } else if (ret.rc === 3422) {
          alert(GWWEBMessage.cmsg_0003);
        } else if (StringUtils.isNotBlank(ret.errorMsg)) {
          alert(ret.errorMsg);
        } else {
          alert(GWWEBMessage.smsg_err_errManagerCall_msg + ' : ' + ret.rc);
        }
        this.ret = 2;
      }
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

  #setUser(dtnode) {
    this.userId = dtnode.data.key;
    this.userName = dtnode.data.name;
    this.deptId = dtnode.data.deptID;
  }

  #clearUser() {
    this.userId = null;
    this.userName = null;
    this.deptId = null;
  }

  renderOrgTree() {
    this.shadowRoot.querySelector('.body').prepend(new FeAssignOrgTree());
    this.shadowRoot.addEventListener('select', (e) => {
      if (e.detail.isSelected) {
        this.#setUser(e.detail.dtnode);
      } else {
        this.#clearUser();
      }
    });
  }
}

customElements.define('fe-assigndocdialog', FeAssignDocDialog);
