const CSS = ``;

/**
 *
 */
export default class FePageCnt extends HTMLElement {
  constructor() {
    super();
    console.log('FePageCnt init');
  }

  connectedCallback() {
    console.log('FePageCnt connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './css/common.css');

    const STYLE = document.createElement('style');
    STYLE.innerHTML = CSS;

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-pagecnt');
    this.shadowRoot.append(LINK, STYLE, wrapper);

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
