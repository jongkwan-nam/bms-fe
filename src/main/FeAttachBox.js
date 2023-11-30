/**
 * 화면 접기 Fold
 * 첨부 갯수
 * 전체 크기
 * input:file multi file selector -> /servlet/FileUploadServlet?acton=upload
 * drag&drop file selector
 * uploading progress bar
 * file 공개/비공개
 * file 삭제
 * 개별 파일 다운로드 -> /bms/com/hs/gwweb/appr/manageFileDwld.act
 * 전체 파일 다운로드 -> /bms/com/hs/gwweb/appr/makeZipFile.act
 */

import * as FileUtils from '../utils/fileUtils';
import { getAttr } from '../utils/hoxUtils';
import './FeAttachBox.scss';

const MULTIPART = {
  maxFileSize: FileUtils.MB * 30, // max-file-size=30MB
  maxRequestSize: FileUtils.MB * 100, // max-request-size=100MB
};

const OPT_DEFAULT = {
  id: 'feAttachBox',
  totalFileCount: window.AttachMaxNum,
  totalFileLength: window.MaxFileSize,
};

export default class FeAttachBox extends HTMLElement {
  fileCount = 0;
  fileLength = 0;

  constructor(opts) {
    super();

    this.options = { ...OPT_DEFAULT, ...opts };
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './main.css');
    this.shadowRoot.append(LINK);

    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'fe-attachbox');
    this.wrapper.innerHTML = `
      <input type="file" multiple="multiple">
      <div class="file-box">
        <ol class="file-list"></ol>
        <div class="file-summary">
          <label class="file-count">0 / 0</label>
          <label id="fileSelector">Select</label>
          <label class="file-length">0 / 0</label>
          <label>
            <select class="content-number">
              <option value="0">${GWWEBMessage.appr_batchdraft_001}</opton>
            </select>
          </label>
        </div>
      </div>
    `;
    this.shadowRoot.append(this.wrapper);

    this.fileBox = this.shadowRoot.querySelector('.file-box');
    this.fileSummary = this.shadowRoot.querySelector('.file-summary');
    this.fileList = this.shadowRoot.querySelector('.file-list');
    this.fileInput = this.shadowRoot.querySelector('input[type="file"]');
    this.contentNumber = this.shadowRoot.querySelector('.content-number');

    this.#addFileDragEventListener();
    this.#addFileFinderClickEventListener();
    this.#addFileRemoveEventListener();
  }

  /**
   * 파일 드래그&드롭 이벤트
   */
  #addFileDragEventListener() {
    this.fileList.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.wrapper.classList.add('file-dragover');
    });

    this.fileList.addEventListener('dragenter', (e) => {});

    this.fileList.addEventListener('dragleave', (e) => {
      this.wrapper.classList.remove('file-dragover');
    });

    this.fileList.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.wrapper.classList.remove('file-dragover');
      this.insertFile(e.dataTransfer.files);
    });
  }

  /**
   * 파일박스 클릭 이밴트
   */
  #addFileFinderClickEventListener() {
    this.fileSummary.addEventListener('click', (e) => {
      if (e.target.id !== 'fileSelector') return;
      this.fileInput.click();
    });
    this.fileInput.addEventListener('change', (e) => {
      this.insertFile(e.target.files);
    });
  }

  /**
   * 파일 제거 이벤트
   */
  #addFileRemoveEventListener() {
    this.fileList.addEventListener('click', (e) => {
      if (e.target.className !== 'file-remove') return;
      this.removeFile(e.target.closest('li'));
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    // hox: docInfo objectIDList objectID ID
    // hox: docInfo content attachInfo attach ID

    this.renderFileListByHox();
  }

  /**
   * 파일 추가
   * 중복 파일, 제한 크기 초과 체크 후 서버로 전송
   * @param {FileList} dataTransferFiles
   * @returns
   */
  insertFile(dataTransferFiles) {
    let drapedFileArray = [];
    let drapedFileLength = 0;
    let duplicatedText = [];
    let overflowText = [];

    // 허용, 불가 확장자 체크
    // allowedExtensions = ''
    // prohibitedExtensions = 'js;jsp'

    // 중복 파일이 있는지
    Array.from(dataTransferFiles).forEach((file) => {
      if (this.containsFile(file)) {
        duplicatedText.push(file.name);
      }
    });
    if (duplicatedText.length > 0) {
      alert(`중복 파일이 있습니다.\n\t${duplicatedText.join('\n\t')}`);
      return;
    }

    // 단일 파일 최대 크기 초과 했는지
    Array.from(dataTransferFiles).forEach((file) => {
      if (0 < MULTIPART.maxFileSize && MULTIPART.maxFileSize < file.size) {
        overflowText.push(`${file.name}: ${FileUtils.formatSize(file.size, 'MB')}`);
      }
    });
    if (overflowText.length > 0) {
      alert(`제한 크기(${FileUtils.formatSize(MULTIPART.maxFileSize, 'MB')})를 초과한 파일이 있습니다.\n\t${overflowText.join('\n\t')}`);
      return;
    }

    Array.from(dataTransferFiles).forEach((file) => {
      drapedFileArray.push(file);
      drapedFileLength += file.size;
    });

    // 단일 요청의 최대 크기 초과 했는지
    if (0 < MULTIPART.maxRequestSize && MULTIPART.maxRequestSize < drapedFileLength) {
      alert(`단일 요청의 최대 크기(${FileUtils.formatSize(MULTIPART.maxRequestSize, 'MB')})를 초과했습니다.
        현재 첨부한 파일의 전체 크기: ${FileUtils.formatSize(drapedFileLength, 'MB')}`);
      return;
    }

    // 파일 갯수를 초과 했는지
    if (0 < this.options.totalFileCount && this.options.totalFileCount < drapedFileArray.length + this.fileCount) {
      alert(`첨부 가능한 파일 갯수(${this.options.totalFileCount})를 초과했습니다.
        현재 개수: ${this.fileCount}, 추가한 갯수: ${drapedFileArray.length}`);
      return;
    }

    // 전체 파일 크기를 초과 했는지
    if (0 < this.options.totalFileLength && this.options.totalFileLength < drapedFileLength + this.fileLength) {
      alert(`첨부 가능한 전체 파일 크기(${FileUtils.formatSize(this.options.totalFileLength, 'MB')})를 초과했습니다.
        현재 크기: ${FileUtils.formatSize(this.fileLength, 'MB')}, 추가한 크기: ${FileUtils.formatSize(drapedFileLength, 'MB')}`);
      return;
    }

    this.wrapper.classList.add('file-transfer'); // 업로드 진행중 표시

    // 체크가 완료된 파일
    const dataTransfer = new DataTransfer();
    Array.from(drapedFileArray).forEach((file) => dataTransfer.items.add(file));

    // 서버로 업로드 호출
    this.uploadToServer(dataTransfer);
  }

  /**
   * 파일 제거
   * @param {Number} uniqueKey 클릭된 파일 인덱스
   */
  removeFile(removedElement) {
    // this.wrapper.classList.add('file-transfer');

    // 서버로 파일 제거 호출
    // this.removeToServer(attachfileid);

    this.fileCount--;
    this.fileLength -= parseInt(removedElement.dataset.length);

    removedElement.remove();

    this.renderSummary();

    this.writeHox();
  }

  writeHox() {
    //
  }

  /**
   * TODO 동일 파일이 있는지. 파일 이름으로 체크
   * @param {File} newFile
   * @returns
   */
  containsFile(newFile) {
    return false;
  }

  renderFileListByHox() {
    //
  }

  /**
   * 드랍된 파일을 서버로 전송한다
   * @param {DataTransfer} dataTransfer
   */
  uploadToServer(dataTransfer) {
    const formData = new FormData();
    for (const file of dataTransfer.files) {
      formData.append('file', file);
    }

    fetch('/servlet/FileUploadServlet?acton=upload', { method: 'POST', body: formData })
      .then((response) => response.json())
      .then((ret) => {
        if (ret.response.success === 'true') {
          this.uploadSuccessCallback(ret.response);
        } else {
          throw new Error('Upload fail: ' + ret.response.error);
        }
      });
  }

  /**
   * 첨부 업로드 완료 콜백
   * @param {object} uploadResult 업로드 응답
     ```json 
      {
        "success": "true",
        "maxUploadSize": "",
        "error": "",
        "itemId": "",
        "files": [
          {
            "orgFileName": "2023.11월 4주 주간식단표 (1).pdf",
            "sysFileName": "/20231130/09/12/10001db1336f2278e0f0c180822a776e01df3.pdf",
            "attachFileSize": "314939",
            "fileID": "2f32303233313133302f30392f31322f313030303164623133333666323237386530663063313830383232613737366530316466332e706466",
            "itemID": ""
          }
        ],
        "acton": "upload"
      }```
   */
  uploadSuccessCallback(uploadResult) {
    console.log('uploadSuccessCallback', uploadResult);

    let publicationType = getAttr(this.hox, 'docInfo publication', 'type');
    let [disabled0, disabled1] = ['', ''];
    let [checked0, checked1] = ['', ''];

    if (publicationType === 'pubtype_open') {
      [disabled0, disabled1] = ['', 'disabled'];
      [checked0, checked1] = ['checked', ''];
    } else if (publicationType === 'pubtype_partial') {
      [disabled0, disabled1] = ['', ''];
      [checked0, checked1] = ['', 'checked'];
    } else {
      [disabled0, disabled1] = ['disabled', ''];
      [checked0, checked1] = ['', 'checked'];
    }
    console.log('publicationType', publicationType, [disabled0, disabled1], [checked0, checked1]);

    Array.from(uploadResult.files).forEach((file) => {
      // 화면 출력
      this.fileList.innerHTML += `
          <li data-fileid="${file.fileID}" data-length="${file.attachFileSize}">
            <label class="file-icon"><i>O</i></label>
            <label class="file-name"><a href="/attach/${file.fileID}/download">${file.orgFileName}</a></label>
            <label class="file-size">${FileUtils.formatSize(file.attachFileSize)}</label>
            <span class="radio-group">
              <input type="radio" name="openFlag" id="openFlag_0" value="true" ${disabled0} ${checked0}><label for="openFlag_0">${GWWEBMessage.cmsg_2086}</label>
              <input type="radio" name="openFlag" id="openFlag_1" value="false" ${disabled1} ${checked1}><label for="openFlag_1">${GWWEBMessage.cmsg_2087}</label>
            </span>
            <button class="file-remove">X</button>
          </li>`;

      let id = ''; // submit시 신규 object id 채번해서 넣어 준다
      let participantId = ''; // submit시 현재 participant를 찾아서 넣어 준다
      let contentNumber = this.contentNumber.value;
      let openFlag = this.shadowRoot.querySelector('[name="openFlag"]:checked').value;
      let text = `
        <objectID dirty="" type="objectidtype_attach">
          <ID>${id}</ID>
          <name>${file.orgFileName}</name>
          <src />
          <attachType>${contentNumber}</attachType>
          <size>${file.attachFileSize}</size>
          <restriction hidden="false" modify="true" move="true" remove="true" save="true" view="true" />
          <contentNumber>${contentNumber}</contentNumber>
          <linkID>00000000000000000000</linkID>
          <participantID>${participantId}</participantID>
          <openFlag>${openFlag}</openFlag>
        </objectID>
      `;
      console.log(text);

      // 크기, 갯수 합산
      this.fileCount++;
      this.fileLength += parseInt(file.attachFileSize);
    });

    // summary render
    this.shadowRoot.querySelector('.file-count').innerHTML = `${this.fileCount} / ${this.options.totalFileCount}`;
    this.shadowRoot.querySelector('.file-length').innerHTML = `${FileUtils.formatSize(this.fileLength)} / ${FileUtils.formatSize(this.options.totalFileLength)}`;

    this.wrapper.classList.remove('file-transfer');
    this.wrapper.classList.toggle('file-empty', this.fileCount === 0);

    this.dispatchEvent(new CustomEvent('attach', { detail: { files: uploadResult.files }, cancelable: true, composed: false, bubbles: false }));
  }

  /**
   * TODO 서버에 임시 저장된 파일 삭제
   * @param {String} attachFileId
   */
  removeToServer(attachFileId) {
    const formData = new FormData();
    formData.append('id', this.attach.id);
    formData.append('attachFileId', attachFileId);

    fetch('/attach', {
      method: 'DELETE',
      body: formData,
    })
      .then((response) => response.json())
      .then((attach) => this.uploadSuccessCallback(attach))
      .catch((error) => console.error('remove', error));
  }
}

// Define the new element
customElements.define('fe-attachbox', FeAttachBox);
