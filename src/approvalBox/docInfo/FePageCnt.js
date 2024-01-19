import { getText, setText } from '../../utils/xmlUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FePageCnt.scss';

/**
 *
 */
export default class FePageCnt extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    this.input = wrapper.appendChild(document.createElement('input'));
    this.input.type = 'number';
    this.input.min = 0;
    this.input.addEventListener('change', (e) => {
      if (this.contentNumber === 1) {
        setText(this.hox, 'docInfo pageCnt', e.target.value);
      }
      setText(this.contentNode, 'pageCnt', e.target.value);
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    super.setHox(hox);

    this.input.value = getText(this.hox, 'docInfo pageCnt');
  }

  changeContentNumberCallback() {
    this.input.value = getText(this.contentNode, 'pageCnt');
  }
}

// Define the new element
customElements.define('fe-pagecnt', FePageCnt);
