import * as actionDraft from '../logic/actionDraft';

/**
 * 기안 버튼
 */
export default class DraftButton extends HTMLButtonElement {
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
    // 기안전, validation check
    const validationResult = actionDraft.validate(feMain.hox);
    if (!validationResult.ok) {
      alert(validationResult.message);
      return;
    }

    // 의견 입력
    // const commentResult = await actionDraft.preProcessComment(feMain.hox);
    // if (!commentResult.ok) {
    //   // 의견 미작성
    //   // return;
    // }

    // 서명 선택
    const signResult = await actionDraft.preProcessSign(feMain.hox);
    if (!signResult.ok) {
      // 서명 취소
      return;
    }

    // 기안 처리
    console.time('actionDraft.process');
    const processResult = await actionDraft.process(feMain.hox);
    console.timeEnd('actionDraft.process');
    if (processResult.ok) {
      // 기안 성공 후처리
      alert('완료되었습니다.');
    } else {
      // 기안 실패 후처리
      alert('실패하였습니다. code: ' + processResult.message);
    }
  }
}

customElements.define('draft-button', DraftButton, { extends: 'button' });
