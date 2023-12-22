export default class TemplateButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_0011;
    this.classList.add('btn', 'btn-primary');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    const hox = feMain.hox;
  }
}

customElements.define('template-button', TemplateButton, { extends: 'button' });
