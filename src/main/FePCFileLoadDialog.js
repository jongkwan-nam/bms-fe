import Cell from './CellNames';
import './FePCFileLoadDialog.scss';

/**
 * PC 읽어오기
 */
export default class FePCFileLoadDialog extends HTMLElement {
  ret = -1;

  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './main.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.cmsg_2504} ${GWWEBMessage.cmsg_789}</label>
      </div>
      <div class="body">
        <input type="file" accept=".hwp, .hwx, .hwpx" placeholder="${GWWEBMessage.appr_loadpc_only_webhwp_file_warn}">
        <pre></pre>
      </div>
      <div class="footer">
        <div>
          <button type="button" id="btnVerify" class="btn">${GWWEBMessage.cmsg_380}</button>
        </div>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.shadowRoot.querySelector('#btnVerify').addEventListener('click', async () => {
      // 확인 로직 수행
      this.ret = 0;
    });

    this.shadowRoot.querySelector('.body input[type="file"]').addEventListener('change', async (e) => {
      console.log('input file', e.target.files);
      const file = e.target.files.item(0);
      const editor = await feMain.getEditor4Extra();
      const progress = this.shadowRoot.querySelector('pre');
      progress.innerHTML = '';

      if (doccfg.useDRM) {
        const formData = new FormData();
        formData.append('BODY', file);
        const data = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageFileUpload.act`, { method: 'POST', body: formData }).then((res) => res.json());
        if (!data.ok) {
          throw new Error('서버 업로드 실패');
        }

        const { TRID, fileName, size } = data.files[0];
        let bodyURL = `${location.origin}/${PROJECT_CODE}/com/hs/gwweb/appr/manageFileDwld.act?TRID=${TRID}&wordType=5&WORDTYPE=5&fileName=${encodeURIComponent(fileName)}&ConvertHTM=false&K=${szKEY}`;
        await editor.openOnly(bodyURL);
      } else {
        // file to blob
        const blob = await this.fileToBlob(file);
        await editor.open(blob);
      }
      progress.innerHTML += '<b>문서 열기 완료</b>\n';

      // 제목 추출 > 반영
      if (editor.existField(Cell.DOC_TITLE)) {
        progress.innerHTML += '<b>문서 제목 확인</b>';
        progress.innerHTML += ': ' + editor.title + '\n';

        feMain.feEditor1.putFieldText(Cell.DOC_TITLE, editor.title);
      } else {
        progress.innerHTML += '<b class="danger">문서 제목 확인 실패</b>\n';
      }

      // 본문 추출 > 반영
      if (editor.existField(Cell.CBODY)) {
        progress.innerHTML += '<b>문서 본문 확인</b>';
        progress.innerHTML += ': ' + editor.cbody.substring(0, 100) + '\n';

        // getTextFile
        const jsonData = await editor.getCellBodyAsJSON();
        await feMain.feEditor1.setCellBodyAsJSON(jsonData);

        // feMain.feEditor1.putFieldText(Cell.CBODY, editor.cbody);
      } else {
        progress.innerHTML += '<b class="danger">문서 본문 확인 실패</b>\n';
      }
    });
  }

  /**
   *
   * @param {File} file
   * @returns
   */
  async fileToBlob(file) {
    return new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type });
  }

  /**
   *
   * @returns 결과. 0: 완료, 1: 취소, 2: 오류
   */
  async open() {
    return new Promise((resolve, reject) => {
      //
      const interval = setInterval(() => {
        if (this.ret > -1) {
          clearInterval(interval);
          resolve(this.ret);
        }
      }, 100);
    });
  }
}

customElements.define('fe-pcfileloaddialog', FePCFileLoadDialog);
