import Cell from './CellNames';

const TIME_LABEL_INIT = 'Editor-init';
const TIME_LABEL_OPEN = 'Editor-open';

/**
 * 웹한글 에디터
 */
export default class FeEditor extends HTMLElement {
  active = false;
  hwpCtrl = null;

  constructor() {
    super();
    console.debug('FeEditor init');
  }

  connectedCallback() {
    console.debug('FeEditor connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './main.css');

    const wrapper = document.createElement('iframe');
    wrapper.classList.add('fe-editor');

    this.shadowRoot.append(LINK, wrapper);
  }

  /**
   * hwpctrlframe.html 에서 에디터 빌드가 완료되면 호출되는 콜백
   *
   * @param {HwpCtrl} hwpCtrl
   */
  buildWebHwpCtrlCallback(hwpCtrl) {
    this.hwpCtrl = hwpCtrl;
    this.active = true;
  }

  /**
   *
   * @param {URL} docUrl
   */
  async init() {
    console.time(TIME_LABEL_INIT);

    this.id = this.getAttribute('id');

    return new Promise((resolve, reject) => {
      this.shadowRoot.querySelector('iframe').src = './hwpctrlframe.html?id=' + this.id;

      let timer = setInterval(() => {
        if (this.hwpCtrl !== null) {
          console.timeEnd(TIME_LABEL_INIT);
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }

  async open(docUrl) {
    console.time(TIME_LABEL_OPEN);
    return new Promise((resolve, reject) => {
      //
      this.hwpCtrl.Open(docUrl, '', 'imagedownsize', (e) => {
        console.timeEnd(TIME_LABEL_OPEN);
        console.log('hwpCtrl.Open callback', e);
        if (e.result) {
          resolve();
        } else {
          reject(e.errorMessage);
        }
      });
    });
  }

  putFieldText(name, text) {
    this.hwpCtrl.PutFieldText(name, text);
  }

  set title(title) {
    this.hwpCtrl.PutFieldText(Cell.DOC_TITLE, title);
  }
  get title() {
    return this.hwpCtrl.GetFieldText(Cell.DOC_TITLE);
  }
}

// Define the new element
customElements.define('fe-editor', FeEditor);
