import { HoxEventType, createNode, dispatchHoxEvent, getNode, getText } from '../utils/hoxUtils';
import './FeContent.scss';

/**
 * 안 관리
 */
export default class FeContent extends HTMLElement {
  currentContentNumber = 1;

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
    this.shadowRoot.querySelector('#addBtn').addEventListener('click', (e) => {
      this.addContent();
    });

    // 안 삭제 이벤트
    this.shadowRoot.querySelector('#delBtn').addEventListener('click', (e) => {
      this.removeContent();
    });

    // 안 선택 이벤트
    this.shadowRoot.querySelector('.body ol').addEventListener('click', (e) => {
      //
      const selectedLi = e.target.closest('li');
      this.shadowRoot.querySelectorAll('.body ol li').forEach((li, i) => {
        if (li === selectedLi) {
          li.classList.add('selected');
          this.currentContentNumber = i + 1;
          dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'select', i + 1);
        } else {
          li.classList.remove('selected');
        }
      });
    });

    // TODO 안 이동을 어떻게 할것인가? 이동과 동시에 바로 반영? 확정 클릭시 반영. 웹한글 반응 속도에 따라

    // 안 위로 이벤트
    this.shadowRoot.querySelector('#upBtn').addEventListener('click', (e) => {
      // 선택된 안 찾기
      const selectedLi = this.shadowRoot.querySelector('.body ol li.selected');
      if (selectedLi !== null) {
        const prevLi = selectedLi.previousSibling;
        if (prevLi !== null) {
          this.shadowRoot.querySelector('.body ol').insertBefore(selectedLi, prevLi);
          // TODO 위로 이동
          let from = selectedLi.querySelector('input').value;
          let to = prevLi.querySelector('input').value;
          dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'move', { from: from, to: to });
        }
      }
    });

    // 안 아래로 이벤트
    this.shadowRoot.querySelector('#downBtn').addEventListener('click', (e) => {
      const selectedLi = this.shadowRoot.querySelector('.body ol li.selected');
      if (selectedLi !== null) {
        const nextLi = selectedLi.nextSibling;
        if (nextLi) {
          this.shadowRoot.querySelector('.body ol').insertBefore(selectedLi, nextLi?.nextSibling);
          // TODO 아래로 이동
          let from = selectedLi.querySelector('input').value;
          let to = nextLi.querySelector('input').value;
          dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'move', { from: from, to: to });
        }
      }
    });

    // 접기 이벤트
    this.shadowRoot.querySelector('#foldBtn').addEventListener('click', (e) => {
      wrapper.classList.toggle('fold');
      this.classList.toggle('fold');
    });

    moveableElement(this, this.shadowRoot.querySelector('div.header > label'));
    resizableElement(this, this.shadowRoot.querySelector('.resizable'));

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
   *
   * @param {XMLDocument} hox
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
  addContent() {
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
    // hox 이벤트 전파
    dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'add', contentNode);
    // 추가된 안(마지막 안) 선택
    this.shadowRoot.querySelector('.body ol li:last-child').click();
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

  removeContent() {
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

    // hox 이벤트 전파
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

function moveableElement(elmnt, header) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;

    // console.log('dragMouseDown', pos1, pos2, pos3, pos4);
    elmnt.classList.add('moveable');

    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // console.log('elementDrag', elmnt.offsetTop, pos2, elmnt.offsetLeft, pos1);

    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
    elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
  }

  function closeDragElement() {
    // console.log('closeDragElement');
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    elmnt.classList.remove('moveable');
  }
}

function resizableElement(elmnt, resizer) {
  resizer.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    elmnt.classList.add('moveable');
  }

  function elementDrag(e) {
    e.preventDefault();

    // console.log(`
    //   elmnt.offsetLeft: ${elmnt.offsetLeft}
    //          e.clientX: ${e.clientX}                 => ${e.clientX - elmnt.offsetLeft}
    //    elmnt.offsetTop: ${elmnt.offsetTop}
    //          e.clientY: ${e.clientY}                 => ${e.clientY - elmnt.offsetTop}
    // `);

    elmnt.style.width = e.clientX - elmnt.offsetLeft + resizer.offsetWidth / 2 + 'px';
    elmnt.style.height = e.clientY - elmnt.offsetTop + resizer.offsetWidth / 2 + 'px';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    elmnt.classList.remove('moveable');
  }
}
