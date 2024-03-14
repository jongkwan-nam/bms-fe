import { getNodes, getText } from '../../utils/xmlUtils';
import { addActionLogSave } from '../ActionLog';
import Cell from '../CellNames';
import './SavePCButton.scss';

/**
 * 이전 다음 버튼
 */
export default class SavePCButton extends HTMLButtonElement {
  feCommentDialog = null;

  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerHTML = `<span id="saveHwp">${GWWEBMessage.cmsg_103}</span> 
      <span id="saveMore"><svg x="0px" y="0px" viewBox="0 0 13 13" width="15" height="13"><polygon points="10.5,4 8.8,4 6.5,7 4.3,4 2.5,4 6.5,9.2"></polygon></svg></span>
      <div id="saveBtnWrap">
        <button type="button" id="saveHwpx">${GWWEBMessage.cmsg_624} hwpx</button>
        <button type="button" id="saveDist">${GWWEBMessage.cmsg_624} ${GWWEBMessage.appr_webhwp_distributeformat}</button>
        <button type="button" id="saveFully">${GWWEBMessage.cmsg_624} 전체</button>
      </div>
      `;
    this.classList.add('btn', 'save-btn');
    this.addEventListener('click', (e) => this.#doAction(e));

    this.querySelector('#saveMore').addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = this.getBoundingClientRect();
      console.log('rect', rect);
      const saveBtnWrap = this.querySelector('#saveBtnWrap');
      saveBtnWrap.classList.toggle('show');
      saveBtnWrap.style.top = rect.top + rect.height - 1 + 'px';
      saveBtnWrap.style.left = rect.left + 'px';
      saveBtnWrap.style.width = rect.width + 'px';
    });

    this.querySelector('#saveHwp').addEventListener('click', this.#saveHwp);
    this.querySelector('#saveHwpx').addEventListener('click', this.#saveHwpx);
    this.querySelector('#saveDist').addEventListener('click', this.#saveDist);
    this.querySelector('#saveFully').addEventListener('click', this.#saveFully); // FIXME 디버그용. 서명,관인 제거하지 않고 저장
  }

  async #doAction(e) {
    this.querySelector('#saveBtnWrap').classList.toggle('show', false);
  }

  async #saveHwp() {
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

    addActionLogSave(getText(feMain.hox, 'docInfo apprID'), getText(feMain.hox, 'docInfo title'));
  }

  async #saveHwpx() {
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
    editor.saveHwpx();

    addActionLogSave(getText(feMain.hox, 'docInfo apprID'), getText(feMain.hox, 'docInfo title'));
  }

  async #saveDist() {
    feMain.feEditor1.saveDistributeHwp();

    addActionLogSave(getText(feMain.hox, 'docInfo apprID'), getText(feMain.hox, 'docInfo title'));
  }

  async #saveFully() {
    feMain.feEditor1.saveHwp();
  }
}

customElements.define('savepc-button', SavePCButton, { extends: 'button' });
