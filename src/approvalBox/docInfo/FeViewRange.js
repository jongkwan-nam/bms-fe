import { getText, setText } from '../../utils/hoxUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeViewRange.scss';

/**
 * 열람법위
 */
export default class FeViewRange extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    let viewRanges = [
      ['all', 'cabinet_msg_1'],
      ['org', 'cabinet_msg_2'],
      ['dept', 'cabinet_msg_3'],
    ];
    for (let viewRange of viewRanges) {
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'radio';
      input.name = 'viewRange';
      input.id = 'viewRange_' + viewRange[0];
      input.value = viewRange[0];
      input.addEventListener('change', (e) => {
        //
        console.log('FeViewRange change', e.target.value);
        setText(this.hox, 'docInfo viewRange', e.target.value);
      });

      let label = wrapper.appendChild(document.createElement('label'));
      label.setAttribute('for', 'viewRange_' + viewRange[0]);
      label.innerHTML = GWWEBMessage[viewRange[1]];
    }
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    super.setHox(hox);

    let viewRange = getText(this.hox, 'docInfo viewRange');
    let input = this.shadowRoot.querySelector(`#viewRange_${viewRange}`);
    if (input) {
      input.checked = true;
    }
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('input').forEach((input) => (input.disabled = this.contentNumber > 1));
  }
}

// Define the new element
customElements.define('fe-viewrange', FeViewRange);
