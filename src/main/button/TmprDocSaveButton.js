import FeTmprDocSaveDialog from '../FeTmprDocSaveDialog';

/**
 * 임시저장
 */
export default class TmprDocSaveButton extends HTMLButtonElement {
  fePubshowDialog = null;

  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_787;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    feMain.cmd = 'saveTemp';
    //
    const feTmprDocSaveDialog = new FeTmprDocSaveDialog();
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.textContent = null;
    modalContainer.append(feTmprDocSaveDialog);
    modalContainer.classList.add('open');
    await feTmprDocSaveDialog.open();
    modalContainer.classList.remove('open');
  }
}

customElements.define('tmprdocsave-button', TmprDocSaveButton, { extends: 'button' });
