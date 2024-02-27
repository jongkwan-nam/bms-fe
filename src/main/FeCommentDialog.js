import DateUtils from '../utils/DateUtils';
import StringUtils from '../utils/StringUtils';
import { createNode, existsNode, getAttr, getNodes, getText } from '../utils/xmlUtils';
import './FeCommentDialog.scss';
import { FeMode, getFeMode } from './FeMode';

export default class FeCommentDialog extends HTMLElement {
  isClose = false;

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
        <label>${GWWEBMessage.cmsg_1809}</label>
      </div>
      <div class="comment-list">
        <ul></ul>
      </div>
      <div class="comment-write">
        <textarea placeholder="${GWWEBMessage.cmsg_0069}"></textarea>
        <label><span class="comment-length">0</span>/${window.commentLengthMaxSize}</label>
        <button type="button" class="btn" id="btnWrite">${GWWEBMessage.W3215}
      </div>
      <div class="footer">
        <button type="button" id="btnVerify" class="btn btn-primary">${GWWEBMessage.cmsg_0006}</button>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    const feMode = getFeMode();
    if (feMode === FeMode.VIEW) {
      wrapper.classList.add('readonly');
    } else {
      //
    }

    const textarea = this.shadowRoot.querySelector('textarea');
    // 글자갯수
    textarea.addEventListener('keyup', (e) => {
      const commentText = StringUtils.cutByMaxBytes(e.target.value, window.commentLengthMaxSize);
      const bytesLength = StringUtils.getBytesLength(commentText);
      if (bytesLength === window.commentLengthMaxSize) {
        e.target.value = commentText;
      }
      this.shadowRoot.querySelector('.comment-length').innerHTML = bytesLength;
    });

    // 의견등록
    const btnWrite = this.shadowRoot.querySelector('#btnWrite');
    btnWrite.addEventListener('click', () => {
      // set hox
      const type = 'comment_type_normal';
      const typeText = '일반의견';
      const comment = textarea.value;
      const userID = rInfo.user.ID;
      const name = rInfo.user.name;
      const dept = rInfo.user.deptName;
      const pos = rInfo.user.positionName;
      const date = DateUtils.format(Date.now(), 'YYYY.MM.DD HH24:MI');
      const dateT = DateUtils.format(Date.now(), 'YYYY.MM.DDTHH24:MI:SS');
      const commentXmlText = `
        <comment type="${type}" intoDocument="false" dirty="new">
          <userInfo>/O=${dept}/P=${pos}/U=${name}/D=${date}/T=${typeText}</userInfo>
          <userID>${userID}</userID>
          <date>${dateT}</date>
          <text><![CDATA[${comment}]]></text>
        </comment>      
      `;
      const nodeComment = createNode(commentXmlText);

      const nodeParticipant = feMain.getCurrentParticipant();
      nodeParticipant.querySelector('comment')?.remove();
      nodeParticipant.append(nodeComment);

      this.#renderList();
    });

    // 확인
    this.shadowRoot.querySelector('#btnVerify').addEventListener('click', () => {
      this.isClose = true;
    });
  }

  connectedCallback() {
    this.isClose = false;

    this.#renderList();
  }

  async await() {
    return new Promise((resolve, reject) => {
      //
      const interval = setInterval(() => {
        if (this.isClose) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }

  #renderList() {
    const list = this.shadowRoot.querySelector('.comment-list ul');
    list.textContent = null;
    const hox = feMain.hox;
    getNodes(hox, 'approvalFlow participant')
      .filter((participant) => getText(participant, 'validStatus') === 'valid')
      .filter((participant) => existsNode(participant, 'comment'))
      .forEach((participant) => {
        //
        const type = getAttr(participant, 'comment', 'type');
        // <userInfo>/O=결재개발팀/P=수석연구원/U=남종관/D=2024.01.02 17:13/T=일반의견</userInfo>
        const userInfo = getText(participant, 'comment userInfo');
        const [name, dept, pos, date] = parseUserInfo(userInfo);

        const li = list.appendChild(document.createElement('li'));
        li.innerHTML = `
          <div>
            <label class="name">${name}</label>
            <label class="pos">${pos}</label>
            <label class="dept">${dept}</label>
            <label class="date">${date}</label>
          </div>
          <pre></pre>
        `;
        li.querySelector('pre').innerText = getText(participant, 'comment text');
      });
  }
}

customElements.define('fe-commentdialog', FeCommentDialog);

function parseUserInfo(userInfo) {
  const splited = userInfo.split('/');
  const namePart = splited.filter((text) => text.startsWith('U')).toString();
  const deptPart = splited.filter((text) => text.startsWith('O')).toString();
  const posPart = splited.filter((text) => text.startsWith('P')).toString();
  const datePart = splited.filter((text) => text.startsWith('D')).toString();
  return [namePart.split('=')[1], deptPart.split('=')[1], posPart.split('=')[1], datePart.split('=')[1]];
}
