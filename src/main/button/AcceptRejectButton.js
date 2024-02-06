import FeAcceptRejectDialog from '../FeAcceptRejectDialog';

/**
 * 접수: 반송
 */
export default class AcceptRejectButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_550;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    const feAcceptRejectDialog = new FeAcceptRejectDialog();
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.textContent = null;
    modalContainer.append(feAcceptRejectDialog);
    modalContainer.classList.add('open');
    const ret = await feAcceptRejectDialog.open();
    console.log('ret', ret);
    if (ret === 0) {
      // 지정 완료. 창 닫기
      modalContainer.classList.remove('open');
    } else if (ret === 1) {
      // 취소
      modalContainer.classList.remove('open');
    } else {
      // 에러
    }
  }
}

customElements.define('acceptreject-button', AcceptRejectButton, { extends: 'button' });
