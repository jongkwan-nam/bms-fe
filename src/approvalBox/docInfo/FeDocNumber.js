import { existsNode, getAttr, getText } from '../../utils/hoxUtils';

/**
 *
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

    let format = getAttr(hox, 'docInfo docNumber expression', 'format');

    if (existsNode(hox, 'docInfo docNumber expression param')) {
      /* TODO
       * 문서번호 채번형식 정의
       *   @D : 부서명,     @d : 부서약어,
       *   @Y : 년도4자리,  @y : 년도2자리,
       *   @R : 기관명 표시 및 기관 기준 채번,  @r : 기관 약어 표시 및 기관 기준 채번,
       *   @C : 분류번호 표시 (code.txt 필요)
       */
    }

    this.label.innerHTML = getText(hox, 'docInfo docNumber displayDocNumber');
  }
}

// Define the new element
customElements.define('fe-docnumber', FeDocNumber);
