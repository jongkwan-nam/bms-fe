import { HoxEventType, dispatchHoxEvent, getText, setText } from '../../utils/hoxUtils';
import './FeEnforceType.scss';

/**
 * 발송종류
 */
export default class FeEnforceType extends HTMLElement {
  constructor() {
    super();
    console.debug('FeEnforceType init');
  }

  connectedCallback() {
    console.debug('FeEnforceType connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-enforcetype');
    this.shadowRoot.append(LINK, wrapper);

    let enforcetypes = ['enforcetype_external', 'enforcetype_internal', 'enforcetype_not'];

    enforcetypes.forEach((type) => {
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'radio';
      input.name = 'enforcetype';
      input.id = type;
      input.value = type;
      input.addEventListener('change', (e) => {
        console.debug('Event', e.type, e.target.value);
        //
        setText(this.hox, 'docInfo enforceType', e.target.value);

        console.info('hoxEvent dispatch', HoxEventType.ENFORCETYPE);
        dispatchHoxEvent(this.hox, 'docInfo enforceType', HoxEventType.ENFORCETYPE, 'change', e.target.value);
      });

      let label = wrapper.appendChild(document.createElement('label'));
      label.setAttribute('for', type);
      label.innerHTML = GWWEBMessage[type];
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    let enforceType = getText(hox, 'docInfo enforceType');
    let enforceTypeRadio = this.shadowRoot.querySelector('#' + enforceType);
    if (enforceTypeRadio) {
      enforceTypeRadio.click();
    }
  }
}

// Define the new element
customElements.define('fe-enforcetype', FeEnforceType);
