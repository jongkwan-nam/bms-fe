import { getText } from '../../utils/xmlUtils';
import FeReCallDialog from '../FeReCallDialog';

export default class ReCallButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_1808;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());

    // 자기가 기안한 문서가 아니면
    if (rInfo.user.ID !== getText(feMain.hox, 'docInfo drafter ID')) {
      this.remove();
    }
  }

  async #doAction() {
    const feReCallDialog = new FeReCallDialog();
    // 회수 가능한지 판단
    if (feReCallDialog.isPossible()) {
      const modalContainer = document.querySelector('.modal-container');
      modalContainer.textContent = null;
      modalContainer.append(feReCallDialog);
      modalContainer.classList.add('open');
      const ret = await feReCallDialog.open();
      if (ret === 0) {
        // 완료. 창 닫기
        modalContainer.classList.remove('open');
      } else if (ret === 1) {
        // 취소
        modalContainer.classList.remove('open');
      } else {
        // 에러
      }
    }
  }
}

customElements.define('recall-button', ReCallButton, { extends: 'button' });
