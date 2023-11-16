import { addNode, existsNode, getNodes } from '../../utils/hoxUtils';

/**
 *
 */
export default class FeSpecialList extends HTMLElement {
  constructor() {
    super();
    console.debug('FeSpecialList init');
  }

  connectedCallback() {
    console.debug('FeSpecialList connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-speciallist');
    this.shadowRoot.append(LINK, wrapper);

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
    this.hox = hox;

    // element 존재여부 체크

    if (!existsNode(this.hox, 'docInfo specialList')) {
      addNode(this.hox, 'docInfo', 'specialList');
      addNode(this.hox, 'docInfo specialList', 'specialItem');
      addNode(this.hox, 'docInfo specialList', 'specialItem');
      addNode(this.hox, 'docInfo specialList', 'specialItem');
    }

    getNodes(this.hox, 'docInfo specialList specialItem').forEach((item, i) => {
      //
      this.shadowRoot.querySelector('#specialItem' + i).value = item.textContent;
    });
  }
}

// Define the new element
customElements.define('fe-speciallist', FeSpecialList);
