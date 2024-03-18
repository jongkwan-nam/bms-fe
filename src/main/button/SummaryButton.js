import { existsFlag } from '../../utils/xmlUtils';
import { FeMode, getFeMode } from '../FeMode';

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
    switch (getFeMode()) {
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
    const windowProxy = window.open(`./${rInfo.clientIp}/summaryBox.html`, 'summaryBox', 'width=800px,height=920px');
    if (windowProxy === null) {
      alert(GWWEBMessage.cmsg_1255); // 팝업이 차단되었습니다. 현재 사이트의 팝업을 허용하십시오.
    }
  }
}

customElements.define('summary-button', SummaryButton, { extends: 'button' });
