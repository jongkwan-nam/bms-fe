import submitOfAccept from '../logic/submit/submitOfAccept';

/**
 * 결재
 */
export default class AcceptButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_148;
    this.classList.add('btn', 'btn-primary');
    this.addEventListener('click', async (e) => this.#doAction());
  }

  async #doAction() {
    await submitOfAccept();
  }
}

customElements.define('accept-button', AcceptButton, { extends: 'button' });
