import { getText, setText } from '../../utils/xmlUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeSecurityLevel.scss';

/**
 *
 */
export default class FeSecurityLevel extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

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
    super.setHox(hox);

    this.input.value = getText(hox, 'docInfo securityLevel');
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('input').forEach((input) => (input.disabled = this.contentNumber > 1));
  }
}

// Define the new element
customElements.define('fe-securitylevel', FeSecurityLevel);
