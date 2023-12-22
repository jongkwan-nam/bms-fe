export default class ApprovalBoxButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.approvalinfo;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    window.open('./approvalBox.html', 'approvalBox', 'width=1020px,height=720px');
  }
}

customElements.define('approvalbox-button', ApprovalBoxButton, { extends: 'button' });
