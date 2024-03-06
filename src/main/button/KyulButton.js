import FeSancPasswordDialog from '../FeSancPasswordDialog';
import submitOfKyul from '../logic/submit/submitOfKyul';
import { validateForKyul } from '../logic/validator/forKyul';

/**
 * 결재 버튼
 */
export default class KyulButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_0012;
    this.classList.add('btn', 'btn-primary');
    this.addEventListener('click', async (e) => this.#doAction());
  }

  async #doAction() {
    const validationResult = validateForKyul(feMain.hox);
    if (!validationResult.ok) {
      alert(validationResult.message);
      return;
    }

    if (doccfg.useSancPasswd) {
      if (!doccfg.sancPasswordOnlyFirst || feMain.apprComptList.length === 0) {
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

    await submitOfKyul();
  }
}

customElements.define('kyul-button', KyulButton, { extends: 'button' });
