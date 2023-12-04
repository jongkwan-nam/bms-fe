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
import { createNode, getAttr, getNode, getNodes, getText, setAttr } from '../utils/hoxUtils';
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
   * 파일박스 클릭 이밴트
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
   * hox 기준 첨부 표시
   */
  renderFileListByHox() {
    let publicationType = getAttr(this.hox, 'docInfo publication', 'type');
    let [disabled0, disabled1, checked0, checked1] = getOpenFlagCondition(publicationType);
    //
    getNodes(this.hox, 'docInfo objectIDList objectID').forEach((objectID) => {
      //
      let id = getText(objectID, 'ID');
      let name = getText(objectID, 'name');
      let size = getText(objectID, 'size');
      let contentNumber = getText(objectID, 'contentNumber');
      let participantID = getText(objectID, 'participantID');
      let openFlag = getText(objectID, 'openFlag');

      const li = this.attachList.appendChild(document.createElement('li'));
      li.dataset.id = id;
      li.dataset.length = size;
      li.dataset.contentnumber = contentNumber;
      li.dataset.participantid = participantID;
      li.innerHTML += `
        <label class="file-checkbox"><input type="checkbox" /></label>
        <label class="file-name"><a href="#">${name}</a></label>
        <label class="file-size">${FileUtils.formatSize(size)}</label>
        <span class="radio-group">
          <input type="radio" name="openFlag_${this.liIndex}" id="openFlag_0" value="true" ${disabled0} ${openFlag === 'true' ? 'checked' : ''}><label for="openFlag_0">${GWWEBMessage.cmsg_2086}</label>
          <input type="radio" name="openFlag_${this.liIndex}" id="openFlag_1" value="false" ${disabled1} ${openFlag === 'true' ? '' : 'checked'}><label for="openFlag_1">${GWWEBMessage.cmsg_2087}</label>
        </span>
        <button class="file-remove">X</button>
      `;
      li.addEventListener('click', (e) => {
        console.log('li click', e.target.tagName, li);
        //
        if (e.target.tagName === 'A') {
          // 첨부 다운로드
          const formData = new FormData();
          formData.append('DOCID', rInfo.apprMsgID);
          formData.append('USERID', rInfo.user.ID);
          formData.append('APPLID', rInfo.applID);
          formData.append('FILEID', id);
          formData.append('VIEWRANGE', false);
          formData.append('DOCCRDEXEBBS', window.doccrdExeBBS);
          formData.append('FLDRSHARE', false); // TODO 고정값 아닐거임. 어디서 참조하애 하는지 찾아야 함
          fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveDownloadInfo.act`, {
            method: 'POST',
            body: formData,
          })
            .then((res) => res.json())
            .then((ret) => {
              //
              if (ret.ok) {
                const formData2 = new FormData();
                formData2.append('FILEID', id);
                formData2.append('APPRID', ret.apprID);
                formData2.append('fileName', name);
                formData2.append('AUTHTOKEN', ret.authtoken);
                formData2.append('useWasDRM', ret.useWasDRM);
                fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/downloadDocFile.act`, {
                  method: 'POST',
                  body: formData2,
                });
              }
            });
        } else if (e.target.tagName === 'BUTTON') {
          // 첨부 삭제
          setAttr(objectID, null, 'dirty', true);
          li.remove();
          this.fileCount--;
          this.fileLength -= parseInt(size);
          this.renderSummary();
        }
      });

      this.fileCount++;
      this.fileLength += parseInt(size);
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
      console.log('file', file, file.name, file.size, file.type, file.lastModified);
      //
      this.attachList.innerHTML += `
          <li class="uploading">
            <label class="file-checkbox"><input type="checkbox" /></label>
            <label class="file-name"><a href="">${file.name}</a></label>
            <label class="file-size">${FileUtils.formatSize(file.size)}</label>
            <span class="uploading-bar">
              
            </span>
            <button class="file-remove"></button>
          </li>`;
    });
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

    this.attachList.querySelectorAll('.uploading').forEach((li) => li.remove());

    let publicationType = getAttr(this.hox, 'docInfo publication', 'type');
    let [disabled0, disabled1, checked0, checked1] = getOpenFlagCondition(publicationType);

    let contentNumber = this.contentNumber.value;

    Array.from(uploadResult.files).forEach((file) => {
      let id = ''; // submit시 신규 object id 채번해서 넣어 준다
      let participantID = ''; // submit시 현재 participant를 찾아서 넣어 준다
      let downloadURL = `${PROJECT_CODE}/com/hs/gwweb/appr/manageFileDwld.act?TRID=${file.fileID}&fileName=${file.orgFileName}`;

      const li = this.attachList.appendChild(document.createElement('li'));
      li.dataset.id = id;
      li.dataset.length = file.attachFileSize;
      li.dataset.contentnumber = contentNumber;
      li.dataset.participantid = participantID;
      li.innerHTML += `
        <label class="file-checkbox"><input type="checkbox" /></label>
        <label class="file-name"><a href="${downloadURL}">${file.orgFileName}</a></label>
        <label class="file-size">${FileUtils.formatSize(file.attachFileSize)}</label>
        <span class="radio-group">
          <input type="radio" name="openFlag_${this.liIndex}" id="openFlag_0" value="true" ${disabled0} ${checked0}><label for="openFlag_0">${GWWEBMessage.cmsg_2086}</label>
          <input type="radio" name="openFlag_${this.liIndex}" id="openFlag_1" value="false" ${disabled1} ${checked1}><label for="openFlag_1">${GWWEBMessage.cmsg_2087}</label>
        </span>
        <button class="file-remove">X</button>
      `;
      li.addEventListener('click', (e) => {
        console.log('li click', e.target.tagName, li, hoxObjectID);
        //
        if (e.target.tagName === 'A') {
          //
        } else if (e.target.tagName === 'BUTTON') {
          // 삭제
          hoxObjectID.remove();
          li.remove();
          this.fileCount--;
          this.fileLength -= parseInt(file.attachFileSize);
          this.renderSummary();
        }
      });

      let openFlag = li.querySelector(`[name="openFlag_${this.liIndex}"]:checked`).value;
      let xmlText = `
        <objectID dirty="" type="objectidtype_attach">
          <ID>${id}</ID>
          <name>${file.orgFileName}</name>
          <src />
          <attachType>${contentNumber}</attachType>
          <size>${file.attachFileSize}</size>
          <restriction hidden="false" modify="true" move="true" remove="true" save="true" view="true" />
          <contentNumber>${contentNumber}</contentNumber>
          <linkID>00000000000000000000</linkID>
          <participantID>${participantID}</participantID>
          <openFlag>${openFlag}</openFlag>
        </objectID>
      `;
      console.log(xmlText);
      let hoxObjectID = createNode(xmlText);
      getNode(this.hox, 'docInfo objectIDList').appendChild(hoxObjectID);

      // 크기, 갯수 합산
      this.fileCount++;
      this.fileLength += parseInt(file.attachFileSize);
      this.liIndex++;
    });

    // summary render
    this.renderSummary();
  }

  renderSummary() {
    this.shadowRoot.querySelector('.file-count').innerHTML = this.fileCount;
    this.shadowRoot.querySelector('.file-length').innerHTML = FileUtils.formatSize(this.fileLength);

    this.wrapper.classList.toggle('file-empty', this.fileCount === 0);
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

function getOpenFlagCondition(publicationType) {
  let [disabled0, disabled1, checked0, checked1] = ['', '', '', ''];

  if (publicationType === 'pubtype_open') {
    [disabled0, disabled1, checked0, checked1] = ['', 'disabled', 'checked', ''];
  } else if (publicationType === 'pubtype_partial') {
    [disabled0, disabled1, checked0, checked1] = ['', '', '', 'checked'];
  } else {
    [disabled0, disabled1, checked0, checked1] = ['disabled', '', '', 'checked'];
  }
  console.log('publicationType', publicationType, disabled0, disabled1, checked0, checked1);

  return [disabled0, disabled1, checked0, checked1];
}
