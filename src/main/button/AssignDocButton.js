import FeAssignDocDialog from '../FeAssignDocDialog';

/**
 * 접수: 담당자 지정. 자기 하위 부서원 1명 선택
 */
export default class AssignDocButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.assign;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    const feAssignDocDialog = new FeAssignDocDialog();
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.textContent = null;
    modalContainer.append(feAssignDocDialog);
    modalContainer.classList.add('open');
    const ret = await feAssignDocDialog.open();
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

customElements.define('assigndoc-button', AssignDocButton, { extends: 'button' });
