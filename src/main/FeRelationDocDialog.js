import syncFetch from 'sync-fetch';
import DateUtils from '../utils/DateUtils';
import StringUtils from '../utils/StringUtils';
import './FeRelationDocDialog.scss';

/**
 * 접수: 배부 다이얼로그
 */
export default class FeRelationDocDialog extends HTMLElement {
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
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.cmsg_2263}</label>
        <button type="button" class="btn" id="addBtn">${GWWEBMessage.cmsg_1510}</button>
      </div>
      <div class="body">
        <div class="item head">
          <label class="">${GWWEBMessage.W2932 /* 문서번호 */}</label>
          <label class="">${GWWEBMessage.W3205 /* 제목 */}</label>
          <label class="">${GWWEBMessage.W2688 /* 기안일 */}</label>
          <label class="">${GWWEBMessage.W2992 /* 기안자 */}</label>
          <label class="">${GWWEBMessage.W2836 /* 기안부서 */}</label>
        </div>
      </div>
      <div class="footer">
        <div>
          <button type="button" id="btnVerify" class="btn btn-primary">${GWWEBMessage.cmsg_0006}</button>
          <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
        </div>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    // window.domHox1 = feMain.hox;
    // window.get_text = (hox, path) => {
    //   //
    // };

    /**
     * 관련문서 팝업에서 확인시 콜백
     * @param {string} ids
     * @param {string[]} titles
     */
    window.btSetLinkDoc = (ids, titles) => {
      console.log('btSetLinkDoc', ids, titles);
      const idList = ids.split(',').filter((id) => StringUtils.isNotBlank(id));
      for (const apprId of idList) {
        //
        const docInfo = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveDocInfo.act?apprID=${apprId}`).json();
        console.log('docInfo', docInfo);
        if (!docInfo.ok) {
          throw new Error('문서함 문서 정보 구하기 오류');
        }

        const item = `<div class="item">
          <label>${docInfo.docRegNo}</label>
          <label>${docInfo.title}</label>
          <label>${DateUtils.format(parseInt(docInfo.draftDate), 'YYYY-MM-DD')}</label>
          <label>${docInfo.drafterName}</label>
          <label>${docInfo.draftDeptName}</label>
        </div>`;

        this.shadowRoot.querySelector('.body').innerHTML += item;
      }
    };

    // 관련문서 문서목록 화면 팝업
    this.shadowRoot.querySelector('#addBtn').addEventListener('click', () => {
      const url = `${PROJECT_CODE}/com/hs/gwweb/list/retrieveRelationDocMainList.act?APPLID=8010&applId=8010&APPLTYPE=3&USS=1&userId=${rInfo.user.ID}&deptId=${rInfo.dept.ID}&userDeptId=${rInfo.dept.ID}&K=${szKEY}&folderEndYear=${new Date().getFullYear()}&isBodyTemplate=Y`;
      const windowProxy = window.open(url, 'relationDocBox', 'width=1000px,height=735px');
      if (windowProxy === null) {
        alert(GWWEBMessage.cmsg_1255); // 팝업이 차단되었습니다. 현재 사이트의 팝업을 허용하십시오.
      }
    });

    this.shadowRoot.querySelector('#btnVerify').addEventListener('click', async () => {
      // 확인 로직 수행
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

customElements.define('fe-relationdocdialog', FeRelationDocDialog);
