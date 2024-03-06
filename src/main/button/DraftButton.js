import FeSancPasswordDialog from '../FeSancPasswordDialog';
import submitOfDraft from '../logic/submit/submitOfDraft';
import { validateForDraft } from '../logic/validator/forDraft';

/**
 * 기안 버튼
 */
export default class DraftButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_0011;
    this.classList.add('btn', 'btn-primary');
    this.addEventListener('click', async (e) => this.#doAction());
  }

  async #doAction() {
    const validationResult = validateForDraft(feMain.hox);
    if (!validationResult.ok) {
      alert(validationResult.message);
      return;
    }

    if (doccfg.useSancPasswd) {
      if (doccfg.passwordCheckWhenDraft) {
        const feSancPasswordDialog = new FeSancPasswordDialog();
        const modalContainer = document.querySelector('.modal-container');
        modalContainer.textContent = null;
        modalContainer.append(feSancPasswordDialog);
        modalContainer.classList.add('open');
        const ret = await feSancPasswordDialog.open();
        console.log('ret', ret);
        if (ret === 0) {
          // 암호 확인
          modalContainer.classList.remove('open');
        } else if (ret === 1) {
          // 취소
          modalContainer.classList.remove('open');
          return;
        } else {
          // 에러
          return;
        }
      }
    }

    this.disabled = true;
    this.disabled = await submitOfDraft();
  }
}

customElements.define('draft-button', DraftButton, { extends: 'button' });
