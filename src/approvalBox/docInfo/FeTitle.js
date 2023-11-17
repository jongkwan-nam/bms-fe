import { getText, setTextCDATA } from '../../utils/hoxUtils';
import './FeTitle.scss';

/**
 *
 */
export default class FeTitle extends HTMLElement {
  constructor() {
    super();
    console.debug('FeTitle init');
  }

  connectedCallback() {
    console.debug('FeTitle connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-title');
    this.shadowRoot.append(LINK, wrapper);

    this.input = wrapper.appendChild(document.createElement('input'));
    this.input.type = 'text';
    this.input.addEventListener('change', (e) => {
      let title = e.target.value;
      // set hox
      setTextCDATA(this.hox, 'docInfo title', title);

      this.dispatchEvent(new CustomEvent('change', { detail: { title: title } }));
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    this.input.value = getText(hox, 'docInfo title');
  }

  set title(title) {
    this.input.value = title;
  }
  get title() {
    return this.input.value;
  }
}

// Define the new element
customElements.define('fe-title', FeTitle);
