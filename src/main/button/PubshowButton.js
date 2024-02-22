import FePubshowDialog from '../pubshow/FePubshowDialog';

/**
 * 공람지정 버튼
 */
export default class PubshowButton extends HTMLButtonElement {
  fePubshowDialog = null;

  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_1807;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    //
    const fePubshowDialog = new FePubshowDialog();

    const modalContainer = document.querySelector('.modal-container');
    modalContainer.textContent = null;
    modalContainer.append(fePubshowDialog);
    modalContainer.classList.add('open');
    await fePubshowDialog.open();
    modalContainer.classList.remove('open');
  }
}

customElements.define('pubshow-button', PubshowButton, { extends: 'button' });
