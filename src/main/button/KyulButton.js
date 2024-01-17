import submitOfKyul from '../logic/submit/submitOfKyul';

/**
 * 결재
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
    await submitOfKyul();
  }
}

customElements.define('kyul-button', KyulButton, { extends: 'button' });
