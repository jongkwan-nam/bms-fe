import $ from 'jquery';
import '../lib/dynatree';
import StringUtils from '../utils/StringUtils';
import './FeDeliverDocDialog.scss';

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

    const dynatreeLink = document.createElement('link');
    dynatreeLink.setAttribute('rel', 'stylesheet');
    dynatreeLink.setAttribute('href', './css/dynatree.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.cmsg_0017}</label>
      </div>
      <div class="body">
        <div id="tree" class="folder"></div>
      </div>
      <div class="comment-write">
        <textarea placeholder="${GWWEBMessage.cmsg_160}"></textarea>
        <label><span class="comment-length">0</span>/${window.commentLengthMaxSize}</label>
      </div>
      <div class="footer">
        <div>
          <button type="button" id="btnVerify" class="btn btn-primary">${GWWEBMessage.cmsg_0006}</button>
          <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
        </div>
      </div>
    `;

    this.shadowRoot.append(link, dynatreeLink, wrapper);

    this.orgTree = this.shadowRoot.querySelector('#tree');
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
      // TODO 배부 로직 수행
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
    const params = {
      acton: 'initOrgTree',
      baseDept: rInfo.dept.ID,
      startDept: rInfo.dept.ID,
      notUseDept: '000000101',
      checkbox: 'list',
      display: 'org,rootdept',
    };
    const queryString = new URLSearchParams(params).toString();
    fetch('/directory-web/org.do?' + queryString)
      .then((res) => res.json())
      .then((data) => {
        console.log('org.do data', data);

        // 부서 펼치기, 자신 선택 제외
        data.forEach((item) => {
          item.expand = true;
          item.children.forEach((child) => {
            if (child.key === rInfo.user.ID) {
              child.unselectable = true;
            }
          });
        });

        const ROOT_FOLDER_ID = '00000000000000000001';

        $(this.orgTree).dynatree({
          title: 'orgtree',
          persist: false,
          checkbox: true,
          selectMode: 1,
          clickFolderMode: 1,
          key: ROOT_FOLDER_ID,
          fx: { height: 'toggle', duration: 200 },
          children: data,
          /**
           *
           * @param {boolean} select 선택/해제 여부
           * @param {*} dtnode 해당 노드
           */
          onSelect: (select, dtnode) => {
            console.log('[dynatree] onSelect', select, dtnode.data.title, dtnode);
            if (select) {
              this.#setUser(dtnode);
            } else {
              this.#clearUser();
            }
          },
          onClick: (dtnode, event) => {
            const eventTarget = dtnode.getEventTargetType(event); // title or checkbox
            // console.debug('[dynatree] onClick', dtnode.data.title, eventTarget, dtnode);
            if (eventTarget === 'title') {
              dtnode.toggleSelect();
            } else if (eventTarget === 'checkbox') {
              dtnode.activate();
            }
          },
          onLazyRead: (dtnode) => {
            console.debug('[dynatree] onLazyRead', dtnode.data.title, dtnode);
            const lazyParam = {
              ...params,
              ...{
                acton: 'expandOrgTree',
                deptID: dtnode.data.key,
              },
            };

            dtnode.appendAjax({
              url: '/directory-web/org.do',
              type: 'post',
              data: lazyParam,
              success: (dtnode) => {
                console.debug('[dynatree] appendAjax', dtnode.data.title, dtnode);
              },
            });
          },
          onRender: (dtnode, nodeSpan) => {
            // console.debug('onLoader', dtnode, nodeSpan);
            if (!dtnode.data.isFolder) {
              var res = $(nodeSpan).html().replace('dynatree-checkbox', 'dynatree-radio');
              $(nodeSpan).html(res);
            }
          },
        });
      });
  }
}

customElements.define('fe-deliverdocdialog', FeDeliverDocDialog);
