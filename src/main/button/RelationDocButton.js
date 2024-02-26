import { existsFlag } from '../../utils/xmlUtils';
import { FeMode, getFeMode } from '../FeMode';
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

    // 기안, 결재가 아니면 관련문서가 없을때 버튼 삭제
    if (![FeMode.DRAFT, FeMode.KYUL].includes(getFeMode())) {
      if (!existsFlag(feMain.hox, 'approvalFlag', 'apprflag_relationdoc')) {
        this.remove();
      }
    }
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
