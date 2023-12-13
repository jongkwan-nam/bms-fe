import { getText, setText } from '../../utils/hoxUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeTitle.scss';

/**
 *
 */
export default class FeTitle extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    this.input = wrapper.appendChild(document.createElement('input'));
    this.input.type = 'text';
    this.input.addEventListener('change', (e) => {
      let title = e.target.value;
      // set hox
      if (this.contentNumber === 1) {
        // 1안이면, docInfo/title도 수정
        setText(this.hox, 'docInfo title', title, true);
      }
      setText(this.contentNode, 'title', title, true);
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    super.setHox(hox);

    this.input.value = getText(hox, 'docInfo title', true);
  }

  changeContentNumberCallback() {
    this.input.value = getText(this.contentNode, 'title', true);
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
