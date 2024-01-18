import DateUtils from '../../utils/DateUtils';
import { createNode, getAttr, getNode, getText } from '../../utils/hoxUtils';
import './FeDocNumber.scss';

/**
 * 문서번호
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

    let docNumberNode = getNode(this.hox, 'docInfo docNumber');

    if (['draft', 'accept'].includes(rInfo.cltType)) {
      /*
       * bms: process.js function setDocNumber(
       */
      if (rInfo.cltType === 'draft') {
        docNumberNode = getNode(this.hox, 'docInfo docNumber');
      } else if (rInfo.cltType === 'accept') {
        // TODO pInfo.signDepth
        let signDepth = 1;
        docNumberNode = getNode(this.hox, 'previewInfo receipt', signDepth - 1).querySelector('docNumber');
      }

      let expressionNode = getNode(docNumberNode, 'expression');
      let displayDocNumber = getAttr(expressionNode, null, 'format');

      if (expressionNode.childElementCount === 0) {
        expressionNode.textContent = null; // text 노드 지우기
        let format = expressionNode.getAttribute('format');
        format.match(/(@\w)/gim).forEach((item) => {
          expressionNode.append(createNode(`<param name="${item}"></param>`));
        });
      }

      /* TODO 문서번호 구현
       * 문서번호 채번형식 정의
       *   @D : 부서명,     @d : 부서약어,
       *   @Y : 년도4자리,  @y : 년도2자리,
       *   @R : 기관명 표시 및 기관 기준 채번,  @r : 기관 약어 표시 및 기관 기준 채번,
       *   @C : 분류번호 표시 (code.txt 필요)
       */
      const params = [
        ['@D', rInfo.dept.name],
        ['@d', rInfo.dept.alias],
        ['@r', rInfo.repDept.alias],
        ['@R', rInfo.repDept.name],
        ['@Y', DateUtils.format(rInfo.currentDate, 'YYYY')],
        ['@y', DateUtils.format(rInfo.currentDate, 'YY')],
      ];

      params.forEach((param) => {
        displayDocNumber = displayDocNumber.replace(param[0], param[1]);

        expressionNode.childNodes.forEach((child) => {
          let name = child.getAttribute('name');
          if (name === param[0]) {
            child.textContent = param[1];
          }
        });
      });

      docNumberNode.querySelector('displayDocNumber').textContent = displayDocNumber;
    }

    this.label.innerHTML = getText(hox, 'docInfo docNumber displayDocNumber');
  }
}

// Define the new element
customElements.define('fe-docnumber', FeDocNumber);
