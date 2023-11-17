import { getText, setText } from '../../utils/hoxUtils';
import './FeKeepPeriod.scss';

/**
 *
 */
export default class FeKeepPeriod extends HTMLElement {
  constructor() {
    super();
    console.debug('FeKeepPeriod init');
  }

  connectedCallback() {
    console.debug('FeKeepPeriod connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-keepperiod');
    this.shadowRoot.append(LINK, wrapper);

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
    this.hox = hox;

    let keepPeriod = getText(this.hox, 'docInfo keepPeriod');
    let input = this.shadowRoot.querySelector(`#keepPeriod_${keepPeriod}`);
    console.log('FeKeepPeriod set', input);
    if (input) {
      input.checked = true;
    }
  }
}

// Define the new element
customElements.define('fe-keepperiod', FeKeepPeriod);
