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
    const windowProxy = window.open(`./${rInfo.clientIp}/approvalBox.html`, 'approvalBox', 'width=1020px,height=720px');
    if (windowProxy === null) {
      alert(GWWEBMessage.cmsg_1255); // 팝업이 차단되었습니다. 현재 사이트의 팝업을 허용하십시오.
    }
  }
}

customElements.define('approvalbox-button', ApprovalBoxButton, { extends: 'button' });
