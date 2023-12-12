import { HoxEventType, dispatchHoxEvent, getText, setText } from '../../utils/hoxUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeEnforceType.scss';

/**
 * 발송종류
 */
export default class FeEnforceType extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    const enforcetypes = ['enforcetype_external', 'enforcetype_internal', 'enforcetype_not'];
    enforcetypes.forEach((type) => {
      const input = wrapper.appendChild(document.createElement('input'));
      input.type = 'radio';
      input.name = 'enforcetype';
      input.id = type;
      input.value = type;
      input.addEventListener('change', (e) => {
        console.debug('Event', e.type, e.target.value);
        //
        if (this.contentNumber === 1) {
          // TODO 전체의 최대값
          setText(this.hox, 'docInfo enforceType', e.target.value);
        }
        setText(this.contentNode, 'enforceType', e.target.value);

        console.info('hoxEvent dispatch', HoxEventType.ENFORCETYPE);
        dispatchHoxEvent(this.contentNode, null, HoxEventType.ENFORCETYPE, 'change', e.target.value);
      });

      const label = wrapper.appendChild(document.createElement('label'));
      label.setAttribute('for', type);
      label.innerHTML = GWWEBMessage[type];
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    super.setHox(hox);

    let enforceType = getText(hox, 'docInfo enforceType');
    let enforceTypeRadio = this.shadowRoot.querySelector('#' + enforceType);
    if (enforceTypeRadio) {
      enforceTypeRadio.click();
    }
  }

  changeContentNumberCallback() {
    const enforceType = getText(this.contentNode, 'enforceType');

    this.shadowRoot.querySelector('#' + enforceType)?.click();
  }
}

// Define the new element
customElements.define('fe-enforcetype', FeEnforceType);
