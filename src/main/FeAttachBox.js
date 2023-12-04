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
 * 모든 안의 첨부 표현
 * 첨부 순서 및 안 이동 기능
 */

import * as FileUtils from '../utils/fileUtils';
import { getNodes } from '../utils/hoxUtils';
import './FeAttachBox.scss';
import FeAttach from './attach/FeAttach';

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
  liIndex = 0;

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
      <div class="attach-box">
        <ol class="attach-list"></ol>
        <div class="attach-header">
          <label class="header-item title">${GWWEBMessage.W3175}</label>
          <button type="button" class="header-item" id="fileSelector">
            ${GWWEBMessage.cmsg_2492}
          </button>
          <button type="button" class="header-item" id="cabinetSelector">
            ${GWWEBMessage.W2966}
          </button>
          <label class="header-item">
            <span class="file-count">0</span> / ${this.options.totalFileCount} ${GWWEBMessage.cmsg_1276}
          </label>
          <label class="header-item">
            <span class="file-length">0</span> / ${FileUtils.formatSize(this.options.totalFileLength)}
          </label>
          <label class="header-item">
            <select><option value="0">${GWWEBMessage.appr_batchdraft_001}</opton></select>
          </label>
          <button type="button" class="header-item" id="foldBtn" title="${GWWEBMessage.cmsg_2490}">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 13 13" xml:space="preserve" width="15" height="13"><polygon points="10.5,4 8.8,4 6.5,7 4.3,4 2.5,4 6.5,9.2"></polygon></svg>
          </button>
        </div>
      </div>
    `;
    this.shadowRoot.append(this.wrapper);

    this.attachBox = this.shadowRoot.querySelector('.attach-box');
    this.attachHeader = this.shadowRoot.querySelector('.attach-header');
    this.attachList = this.shadowRoot.querySelector('.attach-list');

    this.fileSelector = this.shadowRoot.querySelector('#fileSelector');
    this.cabinetSelector = this.shadowRoot.querySelector('#cabinetSelector');

    this.fileInput = this.shadowRoot.querySelector('input[type="file"]');
    this.contentNumber = this.shadowRoot.querySelector('select');

    this.foldBtn = this.shadowRoot.querySelector('#foldBtn');

    this.#addFileDragEventListener();
    this.#addFileFinderClickEventListener();
    this.#addFoldEventListener();
    this.#addSelectEventListener();
  }

  /**
   * 파일 드래그&드롭 이벤트
   */
  #addFileDragEventListener() {
    this.attachList.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.wrapper.classList.add('file-dragover');
    });

    this.attachList.addEventListener('dragenter', (e) => {});

    this.attachList.addEventListener('dragleave', (e) => {
      this.wrapper.classList.remove('file-dragover');
    });

    this.attachList.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.wrapper.classList.remove('file-dragover');
      this.insertFile(e.dataTransfer.files);
    });
  }

  /**
   * 파일 추가 클릭 이밴트
   */
  #addFileFinderClickEventListener() {
    // pc 파일
    this.fileSelector.addEventListener('click', (e) => {
      this.fileInput.click();
    });
    this.fileInput.addEventListener('change', (e) => {
      this.insertFile(e.target.files);
    });
    // 문서함
    this.cabinetSelector.addEventListener('click', (e) => {
      // 문서함 선택 화면 팝업
    });
  }

  /**
   * 접기 이벤트
   */
  #addFoldEventListener() {
    this.foldBtn.addEventListener('click', (e) => {
      //
      this.attachList.classList.toggle('fold');
      this.foldBtn.classList.toggle('fold');
      this.parentElement.closest('main').classList.toggle('fold-attachbox');
    });
  }

  /**
   * 첨부 선택 이벤트
   */
  #addSelectEventListener() {
    this.attachList.addEventListener('click', (e) => {
      let li = e.target.closest('li');
      console.log('li select', li);
      //
      this.attachList.querySelectorAll('li').forEach((li) => li.classList.remove('selected'));
      li?.classList.add('selected');
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

    // 체크가 완료된 파일
    const dataTransfer = new DataTransfer();
    Array.from(drapedFileArray).forEach((file) => dataTransfer.items.add(file));

    // 화면에 먼저 표현
    this.renderFileListByPreprocess(drapedFileArray);

    // 서버로 업로드 호출
    this.uploadToServer(dataTransfer);
  }

  /**
   * TODO 동일 파일이 있는지. 파일 이름으로 체크
   * @param {File} newFile
   * @returns
   */
  containsFile(newFile) {
    return false;
  }

  /**
   * 드랍된 파일을 서버로 전송한다
   * @param {DataTransfer} dataTransfer
   */
  uploadToServer(dataTransfer) {
    this.wrapper.classList.add('file-transfer'); // 업로드 진행중 표시

    const formData = new FormData();
    for (const file of dataTransfer.files) {
      formData.append('file', file);
    }

    fetch('/servlet/FileUploadServlet?acton=upload', { method: 'POST', body: formData })
      .then((response) => response.json())
      .then((ret) => {
        console.log('uploaded', ret);
        if (ret.response.success === 'true') {
          this.uploadSuccessCallback(ret.response);
        } else {
          throw new Error('Upload fail: ' + ret.response.error);
        }
      })
      .then(() => {
        this.wrapper.classList.remove('file-transfer');
      });
  }

  /**
   * hox 기준 첨부 표시
   */
  renderFileListByHox() {
    //
    getNodes(this.hox, 'docInfo objectIDList objectID').forEach((objectID) => {
      console.log('objectID', objectID);
      //
      const li = this.attachList.appendChild(document.createElement('li'));
      const feAttach = li.appendChild(new FeAttach());
      feAttach.set(this.hox);
      feAttach.setObjectID(objectID);
    });

    this.renderSummary();
  }

  /**
   * 업로드 전에 화면에 파일 출력
   *
   * @param {File[]} files
   */
  renderFileListByPreprocess(files) {
    //
    Array.from(files).forEach((file) => {
      console.log('file', file);
      //
      const li = this.attachList.appendChild(document.createElement('li'));
      li.classList.add('uploading');
      const feAttach = li.appendChild(new FeAttach());
      feAttach.set(this.hox);
      feAttach.setFile(file, this.contentNumber.value);
    });

    this.renderSummary();
  }

  /**
   * 첨부 업로드 완료 콜백
   * @param {object} uploadResult 업로드 응답
   */
  uploadSuccessCallback(uploadResult) {
    console.log('uploadSuccessCallback', uploadResult);

    this.attachList.querySelectorAll('.uploading').forEach((li) => li.remove());

    Array.from(uploadResult.files).forEach((file) => {
      console.log('uploaded', file);
      //
      const li = this.attachList.appendChild(document.createElement('li'));
      const feAttach = li.appendChild(new FeAttach());
      feAttach.set(this.hox);
      feAttach.setUploadedFile(file, this.contentNumber.value);
    });

    this.renderSummary();
  }

  renderSummary() {
    let [count, length] = [0, 0];
    this.attachList.querySelectorAll('fe-attach').forEach((feAttach) => {
      count++;
      length += feAttach.size;
    });
    this.shadowRoot.querySelector('.file-count').innerHTML = count;
    this.shadowRoot.querySelector('.file-length').innerHTML = FileUtils.formatSize(length);
    this.wrapper.classList.toggle('file-empty', count === 0);
  }

  /**
   * TODO 서버에 임시 저장된 파일 삭제
   * @param {String} attachFileId
   */
  removeFromServer(attachFileId) {
    const formData = new FormData();
    formData.append('delFileName', this.attach.id);
    formData.append('attachFileId', attachFileId);

    fetch('/attach', {
      method: 'POST',
      body: formData,
    });
  }
}

// Define the new element
customElements.define('fe-attachbox', FeAttachBox);
