import ServerConfig from '../../ini/ServerConfig';
import { HANDYDEF } from '../../ini/handydefini';
import { getText, setText } from '../../utils/xmlUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeViewRange.scss';

/**
 * 열람범위
 */
export default class FeViewRange extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    const showViewlevel = ServerConfig.getJhomsConfig('approval', 'show_viewlevel');

    let viewRangeSplit = HANDYDEF.Sanction['ViewRange'].split(',');
    let viewRanges = [];
    for (let i = 0; i < viewRangeSplit.length; i++) {
      viewRanges.push([viewRangeSplit[i], 'cabinet_msg_' + [i + 1]]);
    }

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
    let ViewRangeDefault = HANDYDEF.Sanction['ViewRangeDefault'];
    this.shadowRoot.querySelector('#viewRange_' + ViewRangeDefault)?.click();
  }
}

// Define the new element
customElements.define('fe-viewrange', FeViewRange);
