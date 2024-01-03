import FeCommentDialog from '../FeCommentDialog';

export default class CommentButton extends HTMLButtonElement {
  feCommentDialog = null;

  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_1809;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    //
    if (this.feCommentDialog === null) {
      this.feCommentDialog = new FeCommentDialog();
    }
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.textContent = null;
    modalContainer.append(this.feCommentDialog);
    modalContainer.classList.add('open');
    await this.feCommentDialog.await();
    modalContainer.classList.remove('open');
  }
}

customElements.define('comment-button', CommentButton, { extends: 'button' });
