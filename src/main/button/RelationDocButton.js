import FeRelationDocDialog from '../FeRelationDocDialog';

/**
 * 관련문서 버튼
 */
export default class RelationDocButton extends HTMLButtonElement {
  fePubshowDialog = null;

  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_2263;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    //
    const feRelationDocDialog = new FeRelationDocDialog();
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.textContent = null;
    modalContainer.append(feRelationDocDialog);
    modalContainer.classList.add('open');
    await feRelationDocDialog.open();
    modalContainer.classList.remove('open');
  }
}

customElements.define('relationdoc-button', RelationDocButton, { extends: 'button' });
