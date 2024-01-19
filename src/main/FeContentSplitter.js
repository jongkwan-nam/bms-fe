import DragUtils from '../utils/DragUtils';
import { HoxEventType, dispatchHoxEvent, getText } from '../utils/xmlUtils';
import './FeContentSplitter.scss';
import splitDocToExam from './logic/splitDocToExam';

export default class FeContentSplitter extends HTMLElement {
  viewMode = 'draft';
  draftDocSelectedIndex = 0;
  examDocSelectedIndex = 0;

  constructor() {
    super();
  }

  connectedCallback() {
    console.debug('FeContentSplitter connected');
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './main.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.content_split}</label>
      </div>
      <div class="body">
        <div>
          <button type="button" id="draftDocViewBtn" class="active">${GWWEBMessage.hsappr_0470}</button>
          <button type="button" id="examDocViewBtn" disabled>${GWWEBMessage.cmsg_636}</button>
          <button type="button" id="splitDocBtn">${GWWEBMessage.content_split}</button>
        </div>
        <ol></ol>
      </div>
      <div class="resizable"></div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.#renderContentList();

    // 안 선택 이벤트
    this.shadowRoot.querySelectorAll('.body ol').forEach((ol) => {
      ol.addEventListener('click', (e) => {
        //
        const selectedLi = e.target.closest('li');
        if (selectedLi === null) {
          return;
        }
        if (this.viewMode === 'exam' && selectedLi.dataset.type === 'enforcetype_not') {
          // 기안문: 모든안 선택가능
          // 시행문: 내부결재(enforcetype_not) 제외한 안 선택 가능
          return;
        }
        ol.querySelectorAll('li').forEach((li, i) => {
          if (li === selectedLi) {
            li.classList.add('selected');
            if (this.viewMode === 'draft') {
              this.draftDocSelectedIndex = i;
              dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'select', i + 1);
              feMain.feEditor1.setReadMode(true);
            } else {
              this.examDocSelectedIndex = i;
              dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.CONTENT, 'select', i + 1);
              // feEditor2 에 본문 붙여넣기
              const examDoc = feMain.splitedExamDocMap.get('content' + (i + 1));
              feMain.feEditor2.insertContent(examDoc.hwp);
              feMain.feEditor2.setReadMode(true);
            }
          } else {
            li.classList.remove('selected');
          }
        });
      });
    });

    const btnDraftDocView = this.shadowRoot.querySelector('#draftDocViewBtn');
    const btnExamDocView = this.shadowRoot.querySelector('#examDocViewBtn');

    // 기안문 보기 버튼 이벤트
    btnDraftDocView.addEventListener('click', (e) => {
      if (this.viewMode === 'draft') {
        return;
      }

      btnDraftDocView.classList.add('active');
      btnExamDocView.classList.remove('active');

      feMain.feEditor1.show();
      feMain.feEditor2.hide();

      this.viewMode = 'draft';
      //
      const li = this.shadowRoot.querySelectorAll('.body ol li')[this.draftDocSelectedIndex];
      li.click();
    });

    // 시행문 보기 버튼 이벤트
    btnExamDocView.addEventListener('click', () => {
      if (this.viewMode === 'exam') {
        return;
      }

      btnDraftDocView.classList.remove('active');
      btnExamDocView.classList.add('active');

      feMain.feEditor1.hide();
      feMain.feEditor2.show();

      this.viewMode = 'exam';
      //
      const li = this.shadowRoot.querySelectorAll('.body ol li')[this.examDocSelectedIndex];
      li.click();
    });

    // 시행문으로 분리 버튼 이벤트
    this.shadowRoot.querySelector('#splitDocBtn').addEventListener('click', async (e) => {
      //
      // 체크된 contentNumber 모음
      const contentNumbers = Array.from(this.shadowRoot.querySelectorAll('.body ol input:checked')).map((input) => parseInt(input.value));
      this.examDocSelectedIndex = contentNumbers[0] - 1; // 안분리후 처음 보여줄 안 index 설정

      feMain.splitedExamDocMap = await splitDocToExam(contentNumbers);
      console.table(feMain.splitedExamDocMap);

      btnExamDocView.removeAttribute('disabled');
      btnExamDocView.click();

      document.querySelector('.modal-container').classList.remove('open');
      e.target.style.display = 'none';
    });

    DragUtils.moveableElement(this, this.shadowRoot.querySelector('div.header > label'));
    DragUtils.resizableElement(this, this.shadowRoot.querySelector('.resizable'));

    // 안분리 전까지 메인화면 레이어로 가리기
    document.querySelector('.modal-container').classList.add('open');
  }

  #renderContentList() {
    const list = this.shadowRoot.querySelector('.body ol');
    list.textContent = null;

    feMain.hox.querySelectorAll('docInfo content').forEach((content, i) => {
      const enforceType = getText(content, 'enforceType');
      const title = getText(content, 'title');
      const contentNumber = i + 1;
      const isDisabled = enforceType === 'enforcetype_not' ? 'disabled' : '';

      const item = list.appendChild(document.createElement('li'));
      item.dataset.type = enforceType;
      item.innerHTML = `
        <input type="checkbox" name="contentChecker" value="${contentNumber}" ${isDisabled} ${isDisabled ? '' : 'checked'}>
        <label class="content-number">${contentNumber} ${GWWEBMessage.cmsg_765}</label>
        <label class="content-enforcetype">[${GWWEBMessage[enforceType]}]</label>
        <label class="content-title">${title}</label>
        <label class="content-status"></label>
      `;
    });
  }
}

customElements.define('fe-contentsplitter', FeContentSplitter);
