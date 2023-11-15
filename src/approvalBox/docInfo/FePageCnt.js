/**
 *
 */
export default class FePageCnt extends HTMLElement {
  constructor() {
    super();
    console.debug('FePageCnt init');
  }

  connectedCallback() {
    console.debug('FePageCnt connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-pagecnt');
    this.shadowRoot.append(LINK, wrapper);

    this.input = wrapper.appendChild(document.createElement('input'));
    this.input.type = 'number';
    this.input.min = 0;
    this.input.addEventListener('change', (e) => {
      console.log('FePageCnt change', e.target.value);
      //
      this.hox.querySelector('docInfo pageCnt').textContent = e.target.value;
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    this.input.value = this.hox.querySelector('docInfo pageCnt').textContent;
  }
}

// Define the new element
customElements.define('fe-pagecnt', FePageCnt);
