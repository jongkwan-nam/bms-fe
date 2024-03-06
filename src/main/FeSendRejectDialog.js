import DateUtils from '../utils/DateUtils';
import IDUtils from '../utils/IDUtils';
import StringUtils from '../utils/StringUtils';
import { addNodes, createNode, existsNode, getNode, getNodes, getText, serializeXmlToString, setText } from '../utils/xmlUtils';
import './FeSendRejectDialog.scss';

/**
 * 접수: 반송 다이얼로그
 */
export default class FeSendRejectDialog extends HTMLElement {
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
        <label>${GWWEBMessage.cmsg_550}</label>
      </div>
      <div class="body">
        <div class="comment-write">
          <textarea placeholder="${GWWEBMessage.cmsg_0067}"></textarea>
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
      // 반송 처리
      const opinion = this.shadowRoot.querySelector('textarea').value;
      if (StringUtils.isBlank(opinion)) {
        alert(GWWEBMessage.cmsg_537);
        return;
      }

      const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');

      // content 반송처리
      for (const content of getNodes(feMain.hox, 'content')) {
        //
        if (existsNode(content, 'enforce sendStatus')) {
          if ('apprstatus_finish' !== getText(content, 'enforce sendStatus')) {
            setText(content, 'enforce sendStatus', 'apprstatus_reject');
            if (!existsNode(content, 'examRequest exam date')) {
              addNodes(content, 'examRequest exam', 'date');
            }
            setText(content, 'examRequest exam date', todayNow);
          }
        }
      }
      setText(feMain.hox, 'examRequest exam examiner status', 'partapprstatus_reject');
      setText(feMain.hox, 'examRequest exam examStatus', 'apprstatus_reject');

      getNode(feMain.hox, 'examRequest exam examiner comment')?.remove();
      const commentNode = createNode(`
        <comment type="comment_type_reject" intoDocument="false">
          <userInfo>/O=${rInfo.user.deptName}/P=${rInfo.user.positionName}/U=${rInfo.user.name}/D=${DateUtils.format(rInfo.currentDate, 'YYYY.MM.DD HH24:MI')}</userInfo>
          <userID>${rInfo.user.ID}</userID>
          <text>${opinion}</text>
        </comment>
      `);
      getNode(feMain.hox, 'examRequest exam examiner').append(commentNode);

      const apprID = getText(feMain.hox, 'docInfo apprID');
      const orgApprID = getText(feMain.hox, 'docInfo orgApprID');

      const formData = new FormData();
      formData.append('UID', rInfo.user.ID);
      formData.append('DID', rInfo.dept.ID);
      formData.append('WORDTYPE', rInfo.WORDTYPE);
      formData.append('apprID', apprID);
      formData.append('orgApprID', orgApprID);
      formData.append('block_' + IDUtils.getObjectID(apprID, 2), serializeXmlToString(feMain.hox)); // hox

      const res = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageDocSndng.act`, { method: 'POST', body: formData }).then((res) => res.text());
      if ('{RESULT:OK}' === res.trim()) {
        this.ret = 0;
        alert(GWWEBMessage.cmsg_0001); // 문서를 반송하였습니다.
      } else {
        alert(GWWEBMessage.cmsg_0002); // 반송이 실패하였습니다.
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
}

customElements.define('fe-sendrejectdialog', FeSendRejectDialog);
