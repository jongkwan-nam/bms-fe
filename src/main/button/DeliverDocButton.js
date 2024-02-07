import FeDeliverDocDialog from '../FeDeliverDocDialog';

/**
 * 접수: 배부 수신부서 선택
 */
export default class DeliverDocButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_0017;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    const feDeliverDocDialog = new FeDeliverDocDialog();
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.textContent = null;
    modalContainer.append(feDeliverDocDialog);
    modalContainer.classList.add('open');
    const ret = await feDeliverDocDialog.open();
    console.log('ret', ret);
    if (ret === 0) {
      // 지정 완료. 창 닫기
      modalContainer.classList.remove('open');
    } else if (ret === 1) {
      // 취소
      modalContainer.classList.remove('open');
    } else {
      // 에러
    }
  }
}

customElements.define('deliverdoc-button', DeliverDocButton, { extends: 'button' });
