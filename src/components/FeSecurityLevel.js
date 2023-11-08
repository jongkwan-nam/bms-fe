const CSS = `
div.title {
  position: relative;
  text-align: center;
}
div.title input {
  display: block;
}
`;

/**
 *
 */
export default class FeSecurityLevel extends HTMLElement {
  constructor() {
    super();
    console.log('FeSecurityLevel init');
  }

  connectedCallback() {
    console.log('FeSecurityLevel connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './css/common.css');

    const STYLE = document.createElement('style');
    STYLE.innerHTML = CSS;

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-securitylevel');
    this.shadowRoot.append(LINK, STYLE, wrapper);

    this.input = wrapper.appendChild(document.createElement('input'));
    this.input.type = 'number';
    this.input.min = 1;
    this.input.max = 99;
    this.input.addEventListener('change', (e) => {
      // set hox
      let level = e.target.value;
      level = Math.max(level, 1);
      level = Math.min(level, 99);
      console.log('FeSecurityLevel change', e.target.value, level);
      e.target.value = level;

      this.hox.querySelector('docInfo securityLevel').textContent = level;

      this.dispatchEvent(new CustomEvent('change', { detail: { securityLevel: level } }));
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    this.input.value = hox.querySelector('docInfo securityLevel').textContent;
  }
}

// Define the new element
customElements.define('fe-securitylevel', FeSecurityLevel);
