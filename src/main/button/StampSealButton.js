import FeStampDialog from '../FeStampDialog';

/**
 * 관인 날인
 */
export default class StampSealButton extends HTMLButtonElement {
  feStampDialog = null;

  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_427;
    this.classList.add('btn', 'btn-primary');
    this.addEventListener('click', async (e) => this.#doAction());
  }

  async #doAction() {
    //
    if (this.feStampDialog === null) {
      this.feStampDialog = new FeStampDialog();
    }
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.textContent = null;
    modalContainer.append(this.feStampDialog);
    modalContainer.classList.add('open');
    await this.feStampDialog.await();
    modalContainer.classList.remove('open');
  }
}

customElements.define('stampseal-button', StampSealButton, { extends: 'button' });
