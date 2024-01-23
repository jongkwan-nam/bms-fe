/**
 * PC저장(배포용)
 */
export default class SaveHwpDistButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_103 + '(' + GWWEBMessage.appr_webhwp_distributeformat + ')';
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    //
    feMain.feEditor1.saveDistributeHwp();
  }
}

customElements.define('savehwpdist-button', SaveHwpDistButton, { extends: 'button' });
