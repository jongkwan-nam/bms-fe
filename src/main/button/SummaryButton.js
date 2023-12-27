export default class SummaryButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_408;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    window.open('./summaryBox.html', 'summaryBox', 'width=800px,height=920px');
  }
}

customElements.define('summary-button', SummaryButton, { extends: 'button' });
