import { getNodes, getText } from '../utils/xmlUtils';
import './FeContentNavigator.scss';
import FeContentSplitter from './FeContentSplitter';

/**
 * 발송처리 일괄기안 안 바로가기
 */
export default class FeContentNavigator extends FeContentSplitter {
  internalContentNumbers = [];
  externalContentNumbers = [];

  constructor() {
    super();
  }

  connectedCallback() {
    super.init();

    this.shadowRoot.querySelector('.header label').innerHTML = GWWEBMessage.appr_batchdraft_008;
    this.shadowRoot.querySelector('#splitDocBtn').click();

    // 발송상태 표시
    getNodes(feMain.hox, 'docInfo content').forEach((content, i) => {
      const enforceType = getText(content, 'enforceType');
      const sendStatus = getText(content, 'enforce sendStatus');
      if ('enforcetype_not' === enforceType) {
        return;
      }
      if ('apprstatus_finish' === sendStatus) {
        this.shadowRoot.querySelectorAll('.content-status')[i].innerHTML = '완료';
        return;
      }
      if ('enforcetype_internal' === enforceType) {
        this.internalContentNumbers.push(i + 1);
      } else if ('enforcetype_external' === enforceType) {
        this.externalContentNumbers.push(i + 1);
      }
    });
    console.log('internalContentNumbers', this.internalContentNumbers, 'externalContentNumbers', this.externalContentNumbers);
  }

  /**
   * 관인/부서장인 날인 표시하기
   * @param {number} contentNumber 안 번호
   */
  setCompletedOfSealStamp(contentNumber) {
    this.shadowRoot.querySelectorAll('.content-status')[contentNumber - 1].innerHTML = '날인';
  }
}

customElements.define('fe-contentnavigator', FeContentNavigator);
