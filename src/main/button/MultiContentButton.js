import { getText } from '../../utils/xmlUtils';

export default class MultiContentButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (getText(feMain.hox, 'docInfo formInfo formType') !== 'formtype_uniform') {
      this.remove();
    }
    //
    this.innerText = GWWEBMessage.cmsg_768;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    let feContent = document.querySelector('fe-content');
    feContent.classList.add('show');
    feContent.addContent();
  }
}

customElements.define('multicontent-button', MultiContentButton, { extends: 'button' });
