import { HoxEventType, dispatchHoxEvent, getNodes, getText, setText } from '../../utils/xmlUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeEnforceType.scss';

const enforcetypes = ['enforcetype_external', 'enforcetype_internal', 'enforcetype_not'];

/**
 * 발송종류
 */
export default class FeEnforceType extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    enforcetypes.forEach((type) => {
      const input = wrapper.appendChild(document.createElement('input'));
      input.type = 'radio';
      input.name = 'enforcetype';
      input.id = type;
      input.value = type;

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

    this.shadowRoot.querySelectorAll('input').forEach((input) => {
      input.addEventListener('change', (e) => {
        setText(this.contentNode, 'enforceType', e.target.value);

        this.#setDocInfoEnforceType();

        console.info('hoxEvent dispatch', HoxEventType.ENFORCETYPE);
        dispatchHoxEvent(this.contentNode, null, HoxEventType.ENFORCETYPE, 'change', e.target.value);
      });
    });

    this.#setDocInfoEnforceType();
  }

  changeContentNumberCallback() {
    const enforceType = getText(this.contentNode, 'enforceType');

    this.shadowRoot.querySelector('#' + enforceType)?.click();
  }

  /**
   * 개별안의 발송종류로부터 docInfo enforceType을 결정하여 설정
   */
  #setDocInfoEnforceType() {
    const intCount = getNodes(this.hox, 'docInfo content').filter((content) => 'enforcetype_internal' === getText(content, 'enforceType')).length;
    const extCount = getNodes(this.hox, 'docInfo content').filter((content) => 'enforcetype_external' === getText(content, 'enforceType')).length;

    let enforceType = 'enforcetype_not';
    if (extCount > 0) {
      enforceType = 'enforcetype_external';
    } else if (intCount > 0) {
      enforceType = 'enforcetype_internal';
    }
    setText(this.hox, 'docInfo enforceType', enforceType);
  }
}

// Define the new element
customElements.define('fe-enforcetype', FeEnforceType);
