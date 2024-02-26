import FePCFileLoadDialog from '../FePCFileLoadDialog';

/**
 * 관련문서 버튼
 */
export default class PCFileLoadButton extends HTMLButtonElement {
  fePubshowDialog = null;

  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_789;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    //
    const fePCFileLoadDialog = new FePCFileLoadDialog();
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.textContent = null;
    modalContainer.append(fePCFileLoadDialog);
    modalContainer.classList.add('open');
    await fePCFileLoadDialog.open();
    modalContainer.classList.remove('open');
  }
}

customElements.define('pcfileload-button', PCFileLoadButton, { extends: 'button' });
