import DragUtils from '../utils/DragUtils';
import { HoxEventType, createNode, dispatchHoxEvent, getNode, getNodes, getText, setAttr } from '../utils/xmlUtils';
import './FeContent.scss';

/**
 * 안 관리
 * - 안 추가
 * - 안 삭제
 * - 안 위로 이동
 * - 안 아래로 이동
 * - 안 선택
 */
export default class FeContent extends HTMLElement {
  currentContentNumber = 1;
  contentLength = 1;

  constructor() {
    super();
  }

  connectedCallback() {
    console.debug('FeContent connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './main.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-content');
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.appr_batchdraft_008}</label>
        <button type="button" id="foldBtn" title="${GWWEBMessage.cmsg_2490}">
          <svg x="0px" y="0px" viewBox="0 0 13 13" width="15" height="13">
            <polygon points="10.5,4 8.8,4 6.5,7 4.3,4 2.5,4 6.5,9.2"></polygon>
          </svg>
        </button>
      </div>
      <div class="body">
        <div>
          <button type="button" id="addBtn">${GWWEBMessage.cmsg_765} ${GWWEBMessage.cmsg_1510}</button>
          <button type="button" id="delBtn">${GWWEBMessage.cmsg_765} ${GWWEBMessage.cmsg_1511}</button>
          <button type="button" id="upBtn" title="${GWWEBMessage.cmsg_1154}">△</button>
          <button type="button" id="downBtn" title="${GWWEBMessage.cmsg_1155}">▽</button>
        </div>
        <ol></ol>
      </div>
      <div class="resizable"></div>
    `;

    this.shadowRoot.append(LINK, wrapper);

    // 안 추가 이벤트
    this.shadowRoot.querySelector('#addBtn').addEventListener('click', async (e) => {
      await this.addContent();
    });

    // 안 삭제 이벤트
    this.shadowRoot.querySelector('#delBtn').addEventListener('click', async (e) => {
      await this.removeContent();
    });

    // 안 선택 이벤트
    this.shadowRoot.querySelector('.body ol').addEventListener('click', async (e) => {
      //
      const selectedLi = e.target.closest('li');
      this.shadowRoot.querySelectorAll('.body ol li').forEach((li, i) => {
        if (li === selectedLi) {
          li.classList.add('selected');
          this.currentContentNumber = i + 1;
          feMain.feEditor1.selectContent(this.currentContentNumber);
          dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'select', this.currentContentNumber);
        } else {
          li.classList.remove('selected');
        }
      });
    });

    // TODO 안 이동을 어떻게 할것인가? 이동과 동시에 바로 반영? 확정 클릭시 반영. 웹한글 반응 속도에 따라

    // 안 위로 이벤트
    this.shadowRoot.querySelector('#upBtn').addEventListener('click', async (e) => {
      // 선택된 안 찾기
      const selectedLi = this.shadowRoot.querySelector('.body ol li.selected');
      if (selectedLi !== null) {
        const prevLi = selectedLi.previousSibling;
        if (prevLi !== null) {
          this.shadowRoot.querySelector('.body ol').insertBefore(selectedLi, prevLi);
          // TODO 위로 이동
          let from = selectedLi.querySelector('input').value;
          let to = prevLi.querySelector('input').value;
          await feMain.feEditor1.moveContent(from, to);
          dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'move', { from: from, to: to });
        }
      }
    });

    // 안 아래로 이벤트
    this.shadowRoot.querySelector('#downBtn').addEventListener('click', async (e) => {
      const selectedLi = this.shadowRoot.querySelector('.body ol li.selected');
      if (selectedLi !== null) {
        const nextLi = selectedLi.nextSibling;
        if (nextLi) {
          this.shadowRoot.querySelector('.body ol').insertBefore(selectedLi, nextLi?.nextSibling);
          // TODO 아래로 이동
          let from = selectedLi.querySelector('input').value;
          let to = nextLi.querySelector('input').value;
          await feMain.feEditor1.moveContent(from, to);
          dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'move', { from: from, to: to });
        }
      }
    });

    // 접기 이벤트
    this.shadowRoot.querySelector('#foldBtn').addEventListener('click', (e) => {
      wrapper.classList.toggle('fold');
      this.classList.toggle('fold');
    });

    DragUtils.moveableElement(this, this.shadowRoot.querySelector('div.header > label'));
    DragUtils.resizableElement(this, this.shadowRoot.querySelector('.resizable'));

    this.#renderContentList();
    // this.#appendLastContentItem();

    feMain.hox.addEventListener(HoxEventType.TITLE, (e) => {
      console.log('FeEditor', HoxEventType.TITLE, e.detail.type);
      if (e.detail.type === 'change') {
        // 변경된 제목, 발송정보 반영
        this.shadowRoot.querySelectorAll('.body ol li').forEach((li, i) => {
          //
          const nodeContent = getNode(feMain.hox, 'docInfo content', i);
          const title = getText(nodeContent, 'title');
          const enforceType = getText(nodeContent, 'enforceType');

          li.querySelector('.content-enforcetype').innerHTML = `[${GWWEBMessage[enforceType]}]`;
          li.querySelector('.content-title').innerHTML = title;
        });
      }
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   * @deprecated
   */
  set(hox) {
    feMain.hox = hox;

    // set 호출 -> 일괄기안이 처음 설정 -> 첫 content에 title, enforceMethod, pageCnt 추가
    const titleNode = createNode(`<title><![CDATA[${getText(feMain.hox, 'docInfo title')}]]></title>`);
    const enforceMethodNode = createNode('<enforceMethod>enforcemethod_direct</enforceMethod>');
    const pageCntNode = createNode('<pageCnt>1</pageCnt>');
    getNode(feMain.hox, 'docInfo content').append(titleNode, enforceMethodNode, pageCntNode);

    this.#appendLastContentItem();

    feMain.hox.addEventListener(HoxEventType.TITLE, (e) => {
      if (e.detail.type === 'change') {
        // 변경된 제목 반영
        this.shadowRoot.querySelectorAll('.body ol li').forEach((li, i) => {
          //
          const nodeContent = getNode(feMain.hox, 'docInfo content', i);
          const title = getText(nodeContent, 'title');
          li.querySelector('.content-title').innerHTML = title;
        });
      }
    });
  }

  /**
   * 안추가
   */
  async addContent() {
    const title = getText(feMain.hox, 'docInfo title');
    const enforceType = getText(feMain.hox, 'docInfo enforceType');
    //
    const xml = `
      <content>
        <title>${title}</title>
      	<enforceType>${enforceType}</enforceType>
        <enforceMethod>enforcemethod_direct</enforceMethod>
        <receiptInfo>
          <recipient/>
          <displayString/>
          <displayRefString/>
          <senderName/>
          <senderDeptID/> 
          <senderID/>
          <sendOrgName/>
        </receiptInfo>
			  <attachInfo>
          <attach></attach>
        </attachInfo>
        <pageCnt>1</pageCnt>
      </content>
    `;
    const contentNode = createNode(xml);
    const docInfoNode = feMain.hox.querySelector('docInfo');
    const contentNodeList = feMain.hox.querySelectorAll('docInfo content');
    const contentLength = contentNodeList.length;
    const lastContentNode = contentNodeList[contentLength - 1];
    docInfoNode.insertBefore(contentNode, lastContentNode.nextSibling);
    //
    this.#appendLastContentItem();

    this.contentLength = getNodes(feMain.hox, 'docInfo content').length;
    setAttr(feMain.hox, 'hox', 'type', this.contentLength > 1 ? 'multiDraft' : 'draft');

    // hox 이벤트 전파
    await feMain.feEditor1.addContent();
    dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'add', contentNode);
    // 추가된 안(마지막 안) 선택
    this.shadowRoot.querySelector('.body ol li:last-child').click();
  }

  #renderContentList() {
    const ol = this.shadowRoot.querySelector('.body ol');
    ol.textContent = null;
    feMain.hox.querySelectorAll('docInfo content').forEach((content, i) => {
      const enforceType = getText(content, 'enforceType');
      const title = getText(content, 'title');
      const contentNumber = i + 1;

      const li = ol.appendChild(document.createElement('li'));
      li.innerHTML = `
        <input type="checkbox" name="contentChecker" value="${contentNumber}" ${contentNumber === 1 ? 'disabled' : ''}>
        <label class="content-number">${contentNumber} ${GWWEBMessage.cmsg_765}</label>
        <label class="content-enforcetype">[${GWWEBMessage[enforceType]}]</label>
        <label class="content-title">${title}</label>
      `;
    });
  }

  /**
   * hox content 내용으로 안바로가기에 li 추가
   */
  #appendLastContentItem() {
    const contentNodeList = feMain.hox.querySelectorAll('docInfo content');
    const contentLength = contentNodeList.length;
    const lastContentNode = contentNodeList[contentLength - 1];
    const enforceType = getText(lastContentNode, 'enforceType');
    const title = getText(lastContentNode, 'title');

    const ol = this.shadowRoot.querySelector('.body ol');
    const li = ol.appendChild(document.createElement('li'));
    li.innerHTML = `
      <input type="checkbox" name="contentChecker" value="${contentLength}" ${contentLength === 1 ? 'disabled' : ''}>
      <label class="content-number">${contentLength} ${GWWEBMessage.cmsg_765}</label>
      <label class="content-enforcetype">[${GWWEBMessage[enforceType]}]</label>
      <label class="content-title">${title}</label>
    `;
  }

  async removeContent() {
    //
    const checkedContentCheckerList = this.shadowRoot.querySelectorAll('.body ol input[type="checkbox"]:checked');
    console.log('checkedContent', checkedContentCheckerList);
    if (checkedContentCheckerList.length === 0) {
      return;
    }

    const contentNodeList = feMain.hox.querySelectorAll('docInfo content');
    const checkedContentNumberArray = [];
    checkedContentCheckerList.forEach((contentChecker) => {
      console.log('checked ContentNumber', contentChecker.value);
      let contentNumber = parseInt(contentChecker.value);
      checkedContentNumberArray.push(contentNumber);
      // hox에서 삭제
      contentNodeList[contentNumber - 1].remove();
      // 화면에서 삭제
      contentChecker.closest('li').remove();
    });

    // 안번호 다시 조정
    this.shadowRoot.querySelectorAll('.body ol li').forEach((li, i) => {
      li.querySelector('.content-number').innerHTML = `${i + 1} ${GWWEBMessage.cmsg_765}`;
      li.querySelector('input').value = i + 1;
    });

    //
    this.contentLength = getNodes(feMain.hox, 'docInfo content').length;
    setAttr(feMain.hox, 'hox', 'type', this.contentLength > 1 ? 'multiDraft' : 'draft');

    // hox 이벤트 전파
    await feMain.feEditor1.deleteContent(...checkedContentNumberArray);
    dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'delete', checkedContentNumberArray);

    // 1개 안만 있으면, 스스로 숨기기
    if (this.shadowRoot.querySelectorAll('.body ol li').length === 1) {
      this.classList.remove('show');
    } else {
      // 삭제된 안의 가장 작은 안 번호 선택
      let nextContentNumber = Math.min(...checkedContentNumberArray) - 1;
      this.shadowRoot.querySelectorAll('.body ol li')[nextContentNumber].click();
    }
  }
}

customElements.define('fe-content', FeContent);
