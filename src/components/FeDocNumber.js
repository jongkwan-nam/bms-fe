/**
 *
 */
export default class FeDocNumber extends HTMLElement {
  constructor() {
    super();
    console.log('FeDocNumber init');
  }

  connectedCallback() {
    console.log('FeDocNumber connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './index.css');

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

    let expression = hox.querySelector('docInfo docNumber expression');
    let format = expression.getAttribute('format');

    let expressionParams = hox.querySelectorAll('docInfo docNumber expression param');
    if (expressionParams === null) {
      /*
       * 문서번호 채번형식 정의
       *   @D : 부서명,     @d : 부서약어,
       *   @Y : 년도4자리,  @y : 년도2자리,
       *   @R : 기관명 표시 및 기관 기준 채번,  @r : 기관 약어 표시 및 기관 기준 채번,
       *   @C : 분류번호 표시 (code.txt 필요)
       */
    }

    this.label.innerHTML = hox.querySelector('docInfo docNumber displayDocNumber').textContent;
  }
}

// Define the new element
customElements.define('fe-docnumber', FeDocNumber);
