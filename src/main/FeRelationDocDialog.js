import syncFetch from 'sync-fetch';
import DateUtils from '../utils/DateUtils';
import StringUtils from '../utils/StringUtils';
import { createNode, getNode, getNodes, getText, setAttr, toggleFlag } from '../utils/xmlUtils';
import { FeMode, getFeMode } from './FeMode';
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
          <label class="">${GWWEBMessage.W2992 /* 기안자 */}</label>
          <label class="">${GWWEBMessage.W2836 /* 기안부서 */}</label>
          <label class="">${GWWEBMessage.W2688 /* 기안일 */}</label>
          <label class="">&nbsp;</label>
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

    /**
     * 관련문서 팝업에서 확인시 콜백
     * @param {string} ids
     * @param {string[]} titles
     */
    window.btSetLinkDoc = (ids, titles) => {
      console.log('btSetLinkDoc', ids, titles);
      const linkDocItemList = ids
        .split(',')
        .filter((id) => StringUtils.isNotBlank(id))
        .map((id) => {
          return { apprID: id };
        });

      this.#renderList(linkDocItemList);
    };

    // 관련문서 문서목록 화면 팝업 핸들러
    this.shadowRoot.querySelector('#addBtn').addEventListener('click', () => {
      const selectedApprIds = this.#getSelectedApprIds();
      const url = `${PROJECT_CODE}/com/hs/gwweb/list/retrieveRelationDocMainList.act?APPLID=8010&applId=8010&APPLTYPE=3&USS=1&userId=${rInfo.user.ID}&deptId=${rInfo.dept.ID}&userDeptId=${rInfo.dept.ID}&K=${szKEY}&folderEndYear=${new Date().getFullYear()}&isBodyTemplate=Y&selectedApprIds=${selectedApprIds}`;
      const windowProxy = window.open(url, 'relationDocBox', 'width=1000px,height=735px');
      if (windowProxy === null) {
        alert(GWWEBMessage.cmsg_1255); // 팝업이 차단되었습니다. 현재 사이트의 팝업을 허용하십시오.
      }
    });

    this.shadowRoot.querySelector('#btnVerify').addEventListener('click', async () => {
      // 확인 로직 수행
      const linkDocList = getNode(feMain.hox, 'docInfo linkDocList');
      linkDocList.textContent = null;
      setAttr(linkDocList, null, 'dirty', 'new');
      this.shadowRoot.querySelectorAll('.item:not(.head)').forEach((item) => {
        linkDocList.appendChild(
          // 문서번호 노드가 다름. 클라:displayDocNumber, 웹:docNumber
          createNode(`<linkDocItem>
            <apprID>${item.dataset.apprid}</apprID>
            <displayDocNumber>${item.querySelector('.no').innerText}</displayDocNumber>
            <docNumber>${item.querySelector('.no').innerText}</docNumber>
            <title>${item.querySelector('.title').innerText}</title>
            <drafterName>${item.querySelector('.name').innerText}</drafterName>
            <draftDeptName>${item.querySelector('.dept').innerText}</draftDeptName>
            <draftDate>${item.querySelector('.time').innerText}</draftDate>
          </linkDocItem>`)
        );
      });
      toggleFlag(feMain.hox, 'docInfo approvalFlag', 'apprflag_relationdoc', getNodes(feMain.hox, 'docInfo linkDocList linkDocItem').length > 0);

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
    // hox 기준으로 관련문서 표시
    const linkDocItemList = getNodes(feMain.hox, 'docInfo linkDocList linkDocItem').map((linkDocItem) => {
      const apprID = getText(linkDocItem, 'apprID');
      const displayDocNumber = getText(linkDocItem, 'displayDocNumber');
      const docNumber = getText(linkDocItem, 'docNumber');
      const title = getText(linkDocItem, 'title');
      const drafterName = getText(linkDocItem, 'drafterName');
      const draftDeptName = getText(linkDocItem, 'draftDeptName');
      const draftDate = getText(linkDocItem, 'draftDate');
      return {
        apprID: apprID,
        docRegNo: StringUtils.isNotBlank(displayDocNumber) ? displayDocNumber : docNumber,
        title: title,
        drafterName: drafterName,
        draftDeptName: draftDeptName,
        draftDate: draftDate,
      };
    });
    this.#renderList(linkDocItemList);

    // 기안이고, 선택된 관련문서가 없으면 목록 선택창 오픈
    if (getFeMode() === FeMode.DRAFT) {
      if (this.shadowRoot.querySelectorAll('.item:not(.head)').length === 0) {
        this.shadowRoot.querySelector('#addBtn').click();
      }
    } else {
      // 기안, 결재가 아니면 추가 버튼 hidden
      if (![FeMode.DRAFT, FeMode.KYUL].includes(getFeMode())) {
        this.shadowRoot.querySelector('#addBtn').remove();
      }
    }

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

  #renderList(list) {
    this.shadowRoot.querySelector('.body').textContent = null;
    //
    for (let docInfo of list) {
      //
      if (StringUtils.isBlank(docInfo.title)) {
        docInfo = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveDocInfo.act?apprID=${docInfo.apprID}`).json();
        console.log('docInfo', docInfo);
        if (!docInfo.ok) {
          throw new Error('문서함 문서 정보 구하기 오류');
        }
        docInfo.draftDate = DateUtils.format(parseInt(docInfo.draftDate), 'YYYY-MM-DD');
      }

      // 기존 목록에 있으면, 삭제 후 추가
      this.shadowRoot.querySelector(`[data-apprid="${docInfo.apprID}"]`)?.remove();

      const item = document.createElement('div');
      item.classList.add('item');
      item.dataset.apprid = docInfo.apprID;
      item.innerHTML = `
          <label class="no">${docInfo.docRegNo}</label>
          <label class="title"><a>${docInfo.title}</a></label>
          <label class="name">${docInfo.drafterName}</label>
          <label class="dept">${docInfo.draftDeptName}</label>
          <label class="time">${docInfo.draftDate}</label>
          <label class="del"><a>&times</a></label>
        `;
      item.querySelector('.title a').addEventListener('click', () => {
        console.log('title click');
      });
      item.querySelector('.del a').addEventListener('click', (e) => {
        console.log('del click');
        e.target.closest('div.item').remove();
      });

      this.shadowRoot.querySelector('.body').append(item);
    }
  }

  #getSelectedApprIds() {
    return Array.from(this.shadowRoot.querySelectorAll('.item:not(.head)'))
      .map((item) => item.dataset.apprid)
      .join(',');
  }
}

customElements.define('fe-relationdocdialog', FeRelationDocDialog);
