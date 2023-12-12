import { getText, setText } from '../../utils/hoxUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeKeepPeriod.scss';

/**
 * 보존기간
 */
export default class FeKeepPeriod extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    let keepPeriodRange = doccfg.keepPeriodRange.split(',');
    for (let keepPeriod of keepPeriodRange) {
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'radio';
      input.name = 'keepPeriod';
      input.id = 'keepPeriod_' + keepPeriod;
      input.value = keepPeriod;
      input.addEventListener('change', (e) => {
        //
        console.log('FeKeepPeriod change', e.target.value);
        setText(this.hox, 'docInfo keepPeriod', e.target.value);
      });

      let label = wrapper.appendChild(document.createElement('label'));
      label.setAttribute('for', 'keepPeriod_' + keepPeriod);
      label.innerHTML = GWWEBMessage['keepPeriodRange_' + keepPeriod];
    }
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    super.setHox(hox);

    let keepPeriod = getText(this.hox, 'docInfo keepPeriod');
    let input = this.shadowRoot.querySelector(`#keepPeriod_${keepPeriod}`);
    if (input) {
      input.checked = true;
    }
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('input').forEach((input) => (input.disabled = this.contentNumber > 1));
  }
}

// Define the new element
customElements.define('fe-keepperiod', FeKeepPeriod);
