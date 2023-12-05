import * as FileUtils from '../../utils/fileUtils';
import { HoxEventType, createNode, dispatchHoxEvent, getAttr, getBoolean, getNumber, getText, setAttr, setText } from '../../utils/hoxUtils';
import * as StringUtils from '../../utils/stringUtils';
import './FeAttach.scss';

/*
//hox/docInfo/objectIDList/objectID@type
#define OBJECTIDTYPE_HOX_STR                      _T("objectidtype_hox")
#define OBJECTIDTYPE_SUMMARY_STR                  _T("objectidtype_summary")
#define OBJECTIDTYPE_HISTORY_STR                  _T("objectidtype_history")
#define OBJECTIDTYPE_AUDITCOMMENT_STR             _T("objectidtype_auditcomment")
#define OBJECTIDTYPE_FORM_STR                     _T("objectidtype_form")
#define OBJECTIDTYPE_DOC_STR                      _T("objectidtype_doc")
#define OBJECTIDTYPE_DELIBERATE_STR               _T("objectidtype_deliberate")
#define OBJECTIDTYPE_ATTACH_STR                   _T("objectidtype_attach")
#define OBJECTIDTYPE_BODYHTML_STR                 _T("objectidtype_bodyhtml")
#define OBJECTIDTYPE_COMMENTXML_STR               _T("objectidtype_commentxml")
#define OBJECTIDTYPE_AUDITMODIFYCOMMENT_STR       _T("obejctidtype_auditmodifycomment")
#define OBJECTIDTYPE_BUDGETDISCUSSIONCOMMENT_STR  _T("obejctidtype_budgetdiscussioncomment")
#define OBJECTIDTYPE_PRIORMANAGEMENT_STR          _T("objectidtype_priormanagement")
#define OBJECTIDTYPE_AUDITORGDOC_STR              _T("objectidtype_auditorgdoc")
#define OBJECTIDTYPE_TRANSLATEDOC_STR             _T("objectidtype_translateddoc")

//hox/docInfo/objectIDList/objectID/attachType
#define ATTACHTYPE_NORMAL_STR            _T("attachtype_normal")
#define ATTACHTYPE_ED_BODY_STR           _T("attachtype_ed_body")
#define ATTACHTYPE_ADMINXML_STR          _T("attachtype_adminxml")
#define ATTACHTYPE_ADMINXSL_STR          _T("attachtype_adminxsl")
#define ATTACHTYPE_ADMINATTACH_STR       _T("attachtype_adminattach")
#define ATTACHTYPE_AUDITCOMMENT_STR      _T("attachtype_auditcomment") => no use
#define ATTACHTYPE_DELIBERATECOMMENT_STR _T("attachtype_deliberatecomment")
#define ATTACHTYPE_ADDENDUM_STR          _T("attachtype_addendum")
#define ATTACHTYPE_PRIORMANAGEMENT_STR   _T("attachtype_prior_management")
*/

/**
 * 첨부 파일
 *
 * - 신규 파일 표시 -> dirty=new
 * - 파일명 수정    -> dirty=modified
 * - 첨부 삭제      -> dirty=deleted
 * - 기존 hox 파일 표시
 * - 첨부 선택
 * - 파일 다운로드
 * - 공개여부 설정
 */
export default class FeAttach extends HTMLElement {
  hox = null;
  objectID = null; // hox objectID
  id = null;
  name = null;
  size = -1;
  contentNumber = 0;
  participantID = null;
  openFlag = null;
  fileID = null; // 신규 첨부일때, 서버의 TRID

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './main.css');
    this.shadowRoot.append(LINK);

    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', 'fe-attach');
    this.wrapper.innerHTML = `
      <label class="file-checkbox"><input type="checkbox" /></label>
      <label class="file-name"><a href="#"></a></label>
      <label class="file-uploading"></label>
      <label class="file-size"></label>
      <span class="radio-group">
        <input type="radio" name="openFlag" id="openFlag_0" value="true" ><label for="openFlag_0">${GWWEBMessage.cmsg_2086}</label>
        <input type="radio" name="openFlag" id="openFlag_1" value="false"><label for="openFlag_1">${GWWEBMessage.cmsg_2087}</label>
      </span>
      <button class="file-remove">X</button>
    `;

    this.shadowRoot.append(this.wrapper);

    // 첨부 삭제
    this.wrapper.querySelector('.file-remove').addEventListener('click', (e) => {
      if (StringUtils.isNotBlank(this.id)) {
        setAttr(this.objectID, null, 'dirty', 'deleted');
      } else {
        this.objectID.remove();
      }
      dispatchHoxEvent(this.hox, 'docInfo objectIDList', HoxEventType.OBJECTIDLIST, 'delete', this.id);

      this.remove();
      this.parentElement?.remove(); // TODO 삭제 전파 필요!!!
    });

    // 공개여부 변경
    this.wrapper.querySelectorAll('[name="openFlag"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        console.log('openFlag changed', e.target.value);
        setText(this.objectID, 'openFlag', e.target.value);
      });
    });

    // 첨부 다운로드 클릭
    this.wrapper.querySelector('.file-name a').addEventListener('click', (e) => {
      if (StringUtils.isBlank(this.id)) {
        // 신규첨부인지
        downloadFileAttach(this.fileID, this.name);
      } else {
        // hox첨부인지
        downloadHoxAttach(this.id);
      }
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    // 공개여부 변경에 따라  let publicationType = getAttr(this.hox, 'docInfo publication', 'type');
    this.hox.addEventListener(HoxEventType.PUBLICATIONTYPE, (e) => {
      console.info('hoxEvent listen', e.type, e.detail);
      let publicationType = e.detail.value;
      // 공개여부의 disabled 설정과, 체크 변경
      let [disabled0, disabled1, checked0, checked1] = getOpenFlagCondition(publicationType);
      let currOpenFlagId = this.wrapper.querySelector('[name="openFlag"]:checked').id;

      if (disabled0 && currOpenFlagId === 'openFlag_0') {
        // 비공개로 변경됬는데, 첨부 공개로 설정되어 있으면 -> 첨부 비공개로 변경
        this.shadowRoot.querySelector('#openFlag_0').toggleAttribute('checked', false);
        this.shadowRoot.querySelector('#openFlag_1').toggleAttribute('checked', true);
        setText(this.objectID, 'openFlag', '');
      } else if (disabled1 && currOpenFlagId === 'openFlag_1') {
        // 공개로 변경됬는데, 첨부 비공개로 설정되어 있으면 -> 첨부 공개로 변경
        this.shadowRoot.querySelector('#openFlag_0').toggleAttribute('checked', true);
        this.shadowRoot.querySelector('#openFlag_1').toggleAttribute('checked', false);
        setText(this.objectID, 'openFlag', 'true');
      }

      this.shadowRoot.querySelector('#openFlag_0').toggleAttribute('disabled', disabled0);
      this.shadowRoot.querySelector('#openFlag_1').toggleAttribute('disabled', disabled1);
    });
  }

  /**
   * hox의 objectID
   * @param {Element} objectID hox중 첨부부분 xml
   */
  setObjectID(objectID) {
    this.objectID = objectID;
    //
    this.id = getText(objectID, 'ID');
    this.name = getText(objectID, 'name');
    this.size = getNumber(objectID, 'size');
    this.contentNumber = getText(objectID, 'contentNumber');
    this.participantID = getText(objectID, 'participantID');
    this.openFlag = getBoolean(objectID, 'openFlag');

    this.#displayAttach();
  }

  /**
   * 서버 업로드 전 임시 file
   * @param {File} file
   * @param {number} contentNumber
   */
  setFile(file, contentNumber) {
    /*
      lastModified: 1701652260023
      lastModifiedDate: Mon Dec 04 2023 10:11:00 GMT+0900 (한국 표준시) {}
      name: "2023.12월 1주 주간식단표_00.pdf"
      size: 301968
      type: "application/pdf"
      webkitRelativePath: ""
    */
    this.name = file.name;
    this.size = file.size;
    this.contentNumber = contentNumber;

    this.#displayAttach();
  }

  /**
   * 서버 업로드 완료된 파일
   * @param {object} file
   * @param {number} contentNumber
   */
  setUploadedFile(file, contentNumber) {
    /*
      orgFileName: 2023.11월 4주 주간식단표 (1).pdf
      sysFileName: /20231130/09/12/10001db1336f2278e0f0c180822a776e01df3.pdf
      attachFileSize: '314939'
      fileID: 2f32303233313133302f30392f31322f313030303164623133333666323237386530663063313830383232613737366530316466332e706466
      itemID:
    */
    this.id = '';
    this.name = file.orgFileName;
    this.size = parseInt(file.attachFileSize);
    this.contentNumber = contentNumber;
    this.participantID = '';

    this.fileID = file.fileID;

    this.#displayAttach();
    this.#createObjectID();
  }

  /**
   * 안 이동
   * - 같은 안에서 순서는 FeAttachBox에서 처리
   * @param {number} n
   */
  setContentNumber(n) {
    this.contentNumber = n;
    setText(this.objectID, 'attachType', n);
    setText(this.objectID, 'contentNumber', n);
  }

  delete() {
    // 첨부 삭제
  }

  /**
   * 화면에 그린다
   */
  #displayAttach() {
    //
    this.shadowRoot.querySelector('.file-name a').innerHTML = this.name;
    this.shadowRoot.querySelector('.file-size').innerHTML = FileUtils.formatSize(this.size);

    let publicationType = getAttr(this.hox, 'docInfo publication', 'type');
    let [disabled0, disabled1, checked0, checked1] = getOpenFlagCondition(publicationType);

    this.shadowRoot.querySelector('#openFlag_0').toggleAttribute('disabled', disabled0);
    this.shadowRoot.querySelector('#openFlag_1').toggleAttribute('disabled', disabled1);
    this.shadowRoot.querySelector('#openFlag_0').toggleAttribute('checked', checked0);
    this.shadowRoot.querySelector('#openFlag_1').toggleAttribute('checked', checked1);
    if (this.openFlag !== null) {
      this.shadowRoot.querySelector('#openFlag_' + (this.openFlag ? '0' : '1')).checked = true;
    }

    this.openFlag = this.shadowRoot.querySelector(`[name="openFlag"]:checked`).value;
  }

  #createObjectID() {
    let xmlText = `
      <objectID dirty="new" type="objectidtype_attach">
        <ID>${this.id}</ID>
        <name>${this.name}</name>
        <src />
        <attachType>attachtype_normal</attachType>
        <size>${this.size}</size>
        <restriction hidden="false" modify="true" move="true" remove="true" save="true" view="true" />
        <contentNumber>${this.contentNumber}</contentNumber>
        <linkID>00000000000000000000</linkID>
        <participantID>${this.participantID}</participantID>
        <openFlag>${this.openFlag}</openFlag>
      </objectID>
    `;
    console.log(xmlText);
    this.objectID = createNode(xmlText);
    this.hox.querySelector('docInfo objectIDList').append(this.objectID);
  }
}

customElements.define('fe-attach', FeAttach);

/**
 * 공개여부에 따라, 첨부 공개여부 preset 결정
 * @param {string} publicationType
 * @returns [disabled0, disabled1, checked0, checked1]
 */
function getOpenFlagCondition(publicationType) {
  switch (publicationType) {
    case 'pubtype_open':
      return [false, true, true, false];
    case 'pubtype_partial':
      return [false, false, false, true];
    default:
      return [true, false, false, true];
  }
}

/**
 * hox의 첨부 다운로드
 * @param {string} id objectID / ID
 */
function downloadHoxAttach(id, name) {
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
        })
          .then((res) => res.blob())
          .then((blob) => {
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            a.remove();
          });
      }
    });
}

/**
 * 서버에 임시 저장된 파일 다운로드
 * @param {string} fileID TRID
 */
function downloadFileAttach(fileID, name) {
  // TODO 다운로드를 위해선, fetch로
  fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageFileDwld.act?TRID=${fileID}&fileName=${name}`)
    .then((res) => res.blob())
    .then((blob) => {
      let url = window.URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
      a.click();
      a.remove();
    });
}
