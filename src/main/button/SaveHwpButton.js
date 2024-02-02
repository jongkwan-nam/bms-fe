import { getNodes, getText } from '../../utils/xmlUtils';
import Cell from '../CellNames';

/**
 * PC저장(배포용)
 */
export default class SaveHwpButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.cmsg_103;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    // 문서 복사 붙여넣기
    const jsonData = await feMain.feEditor1.copyDocument('JSON');

    const editor = await feMain.getEditor4Extra();
    await editor.openByJSON(jsonData);
    // 서명셀 제거
    getNodes(feMain.hox, 'clientInfo cellInfo cell').forEach((cell) => {
      const signCellName = getText(cell, 'cellName');
      editor.putFieldText(signCellName, '');
    });

    // 관인셀 제거
    editor.putFieldText(Cell.SEAL_STAMP, '');
    editor.putFieldText(Cell.SEAL_OMISSION, '');

    // hwpx로 다운로드
    editor.saveHwp();
  }
}

customElements.define('savehwp-button', SaveHwpButton, { extends: 'button' });
