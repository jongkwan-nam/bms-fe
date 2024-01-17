import submitOfDraft from '../logic/submit/submitOfDraft';

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
    await submitOfDraft();
  }
}

customElements.define('draft-button', DraftButton, { extends: 'button' });
