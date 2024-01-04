import { existsFlag } from '../../utils/hoxUtils';
import { FeMode } from '../FeMode';

export default class SummaryButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_408;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
    /*
      기안은 항상 보이기
      결재는 doccfg.summaryAddableApprover
        - true 이면 항상 보이기. 신규 생성가능 하게
        - false 미면 요약이 있을때만 보이기
      보기는 요약이 있을때만 보이기
     */
    switch (feMain.feMode) {
      case FeMode.KYUL: {
        if (!doccfg.summaryAddableApprover) {
          // 요약이 없으면
          if (!existsFlag(feMain.hox, 'approvalFlag', 'apprflag_summary')) {
            this.remove();
          }
        }
        break;
      }
      case FeMode.DRAFT:
        break;
      default: {
        if (!existsFlag(feMain.hox, 'approvalFlag', 'apprflag_summary')) {
          this.remove();
        }
        break;
      }
    }
  }

  async #doAction() {
    window.open('./summaryBox.html', 'summaryBox', 'width=800px,height=920px');
  }
}

customElements.define('summary-button', SummaryButton, { extends: 'button' });
