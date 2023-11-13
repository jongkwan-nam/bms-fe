/**
 *
 */
export default class FeEditor extends HTMLElement {
  active = false;

  constructor() {
    super();
    console.log('FeEditor init');
  }

  connectedCallback() {
    console.log('FeEditor connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './index.css');

    this.shadowRoot.append(LINK);
  }

  /**
   *
   * @param {XMLDocument} hox
   * @param {URL} docUrl
   */
  set(hox, docUrl) {
    this.hox = hox;
    this.docUrl = docUrl;

    this.id = this.getAttribute('id');

    console.time('hwpctrl_init');
    const wrapper = document.createElement('iframe');
    wrapper.classList.add('fe-editor');
    wrapper.src = './hwpctrlframe.html?id=' + this.id;
    wrapper.onload = () => {
      console.log('hwpctrlframe loaded');
      this.active = true;
    };

    this.shadowRoot.append(wrapper);
  }

  /**
   * hwpctrlframe.html 에서 에디터 빌드가 완료되면 호출되는 콜백
   *
   * @param {HwpCtrl} hwpCtrl
   */
  setHwpCtrl(hwpCtrl) {
    console.timeEnd('hwpctrl_init', hwpCtrl);

    console.time('hwpctrl_open');
    console.log('setHwpCtrl', hwpCtrl);
    this.hwpCtrl = hwpCtrl;

    if (this.docUrl) {
      this.open(this.docUrl);
    }
  }

  open(docUrl) {
    this.hwpCtrl.Open(docUrl, '', 'imagedownsize', (e) => {
      console.timeEnd('hwpctrl_open');
      console.log('hwpCtrl.Open callback', e);
    });
  }

  set title(title) {
    this.hwpCtrl.PutFieldText('결재제목', title);
  }
  get title() {
    return this.hwpCtrl.GetFieldText('결재제목');
  }
}

// Define the new element
customElements.define('fe-editor', FeEditor);
