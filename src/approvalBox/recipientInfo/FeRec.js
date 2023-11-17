/**
 * 수신부서: 선택된 수신자
 */
export default class FeRec extends HTMLElement {
  constructor() {
    super();
    console.debug('FeRec init');
  }

  connectedCallback() {
    console.debug('FeRec connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-recipient', 'tree-list');

    this.shadowRoot.append(LINK, wrapper);
  }

  set(dtnode) {
    //
  }
}

customElements.define('fe-rec', FeRec);
