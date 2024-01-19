import { findNodeOfDocNumber } from '../../main/logic/do/docNumber';
import { getText } from '../../utils/xmlUtils';
import './FeDocNumber.scss';

/**
 * 문서번호
 * - displayDocNumber가 비었을 경우, expression format속성을 사용
 */
export default class FeDocNumber extends HTMLElement {
  constructor() {
    super();
    console.debug('FeDocNumber init');
  }

  connectedCallback() {
    console.debug('FeDocNumber connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-docnumber');
    this.shadowRoot.append(LINK, wrapper);

    this.label = wrapper.appendChild(document.createElement('label'));
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    const nodeOfDocNumber = findNodeOfDocNumber(hox);

    this.label.innerHTML = getText(nodeOfDocNumber, 'displayDocNumber');
  }
}

// Define the new element
customElements.define('fe-docnumber', FeDocNumber);
