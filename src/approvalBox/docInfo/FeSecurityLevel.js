import { getText, setText } from '../../utils/hoxUtils';

/**
 *
 */
export default class FeSecurityLevel extends HTMLElement {
  constructor() {
    super();
    console.debug('FeSecurityLevel init');
  }

  connectedCallback() {
    console.debug('FeSecurityLevel connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-securitylevel');
    this.shadowRoot.append(LINK, wrapper);

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

      setText(this.hox, 'docInfo securityLevel', level);

      this.dispatchEvent(new CustomEvent('change', { detail: { securityLevel: level } }));
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    this.input.value = getText(hox, 'docInfo securityLevel');
  }
}

// Define the new element
customElements.define('fe-securitylevel', FeSecurityLevel);
