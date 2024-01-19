import { addNode, addNodes, existsNode, getNode, getNodes } from '../../utils/xmlUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeSpecialList.scss';

/**
 * 검색어
 */
export default class FeSpecialList extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    for (let i = 0; i < 3; i++) {
      this.input = wrapper.appendChild(document.createElement('input'));
      this.input.type = 'search';
      this.input.placeholder = GWWEBMessage.cmsg_414 + (i + 1);
      this.input.id = 'specialItem' + i;
      this.input.addEventListener('change', (e) => {
        console.log(e.target.id, 'change', e.target.value);
        // set hox
        getNodes(this.hox, 'docInfo specialList specialItem')[i].textContent = e.target.value;
      });
    }
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    super.setHox(hox);

    // element 존재여부 체크
    if (!existsNode(this.hox, 'docInfo specialList')) {
      const docInfo = getNode(this.hox, 'docInfo');
      addNode(docInfo, 'specialList');
      addNodes(docInfo, 'specialList', 'specialItem', 'specialItem', 'specialItem');
    }

    getNodes(this.hox, 'docInfo specialList specialItem').forEach((item, i) => {
      //
      this.shadowRoot.querySelector('#specialItem' + i).value = item.textContent;
    });
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('input').forEach((input) => (input.disabled = this.contentNumber > 1));
  }
}

// Define the new element
customElements.define('fe-speciallist', FeSpecialList);
