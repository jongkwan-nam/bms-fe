import * as actionKyul from '../logic/actionKyul';
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
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    //
    await actionKyul.process();
  }
}

customElements.define('kyul-button', KyulButton, { extends: 'button' });
