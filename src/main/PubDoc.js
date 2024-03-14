import syncFetch from 'sync-fetch';
import StringUtils from '../utils/StringUtils';
import { getAttr, getNode, getNodes, getText, loadXml, serializeXmlToString, setText } from '../utils/xmlUtils';
import Cell from './CellNames';
import FeAttachBox from './FeAttachBox';
import FeEditor from './FeEditor';
import { stamp_method_approval_hwp, stamp_method_daekyul_hwp, stamp_method_finish_approval_hwp, stamp_method_jeonkyul_hwp } from './const/CommonConst';

export default class PubDoc {
  /** 유통 xml */
  pubDocDom = null;
  domHox1;
  feEditor;
  feAttachBox;

  /**
   *
   * @param {XMLDocument} domHox1
   * @param {FeEditor} feEditor
   * @param {FeAttachBox} feAttachBox
   */
  constructor(domHox1, feEditor, feAttachBox) {
    this.domHox1 = domHox1;
    this.feEditor = feEditor;
    this.feAttachBox = feAttachBox;
  }

  async open() {
    const isModified = this.feEditor.modified;

    await this.#loadPubDocXml();
    await this.#setAttach();
    await this.#setPubDoc();
    await this.#setBody();
    await this.#setLogo();
    await this.#setSymbol();
    await this.#setTextToFieldIfTextExist();
    await this.#setSealToDoc();

    this.feEditor.modified = isModified;
  }

  /**
   *
   * @returns 수신처에 LDAP 이 있는지 여부
   */
  isLdap() {
    const recNodes = getNodes(this.domHox1, 'docInfo content receiptInfo recipient rec');

    const isLdap1 = recNodes.filter((rec) => getAttr(rec, null, 'type') === 'rectype_ldap').length > 0;
    if (isLdap1) return true;

    const isLdap2 = getNodes(recNodes, 'recSymbolItems recSymbolItem').filter((recSymbolItem) => getAttr(recSymbolItem, null, 'rectype_ldap')).length > 0;
    if (isLdap2) return true;

    const isLdap3 = this.#containsLdapMemner(recNodes.filter((rec) => getAttr(rec, null, 'type') === 'rectype_unifiedgroup'));
    if (isLdap3) return true;

    return false;
  }

  /**
   * 수신처 ID등에 LDAP이 포함되어 있는지 여부
   * @param {Element[]} recList
   */
  #containsLdapMemner(recList) {
    const ids = recList.map((rec) => getText(rec, 'ID')).join(',');
    const contains = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveLdapMember.act?groupIDs=${ids}`).json();
    return contains.ok;
  }

  async #loadPubDocXml() {
    if (!rInfo.pubdocFileTRID) {
      throw new Error('rInfo.pubdocFileTRID is undefined');
    }

    const url = `${PROJECT_CODE}/com/hs/gwweb/appr/retrieveXmlFromWasByTrid.act?TRID=${rInfo.pubdocFileTRID}&method=file&encoding=euc-kr`;
    this.pubDocDom = await loadXml(url, true);
    console.log('this.pubDocDom', this.pubDocDom);
  }

  async #setAttach() {
    // addAttachToDoc
    if (rInfo.attachFileTRID && rInfo.attachFileNames && rInfo.attachFileSizes) {
      const trids = rInfo.attachFileTRID.split(',');
      const names = rInfo.attachFileNames.split(':');
      const sizes = rInfo.attachFileSizes.split(',');
      for (let i = 0; i < trids.length; i++) {
        if (sizes[i] == 0) {
          const msg = GWWEBMessage.cmsg_1375 + '  >> ' + GWWEBMessage.cmsg_1376 + ': ' + names[i]; // 수신된 유통 문서에 아래와 같은 첨부 파일이 누락되었습니다. 발송기관에 재발송 요청하시기 바랍니다.\n\n  >> 누락된 첨부 파일명
          alert(msg);
          throw new Error(msg);
        }

        // FeAttachBox에 추가
        this.feAttachBox.addAttach(trids[i], names[i], sizes[i]);
      }
    }

    // addAttachBodyToDoc
    if (rInfo.attachBodyFileTRID && rInfo.attachBodyFileNames && rInfo.attachBodyFileSizes) {
      const trids = rInfo.attachBodyFileTRID.split(',');
      const names = rInfo.attachBodyFileNames.split(':');
      const sizes = rInfo.attachBodyFileSizes.split(',');
      for (let i = 0; i < trids.length; i++) {
        if (sizes[i] == 0) {
          const msg = GWWEBMessage.cmsg_1375 + '  >> ' + GWWEBMessage.cmsg_1376 + ': ' + names[i];
          alert(msg);
          throw new Error(msg);
        }

        // FeAttachBox에 추가
        this.feAttachBox.addAttach(trids[i], names[i], sizes[i]);
      }
    }
  }

  /**
   * 유통xml 내용으로 문서를 채운다.
   * - 결재선 등
   * - 본문
   */
  async #setPubDoc() {
    // setOrgDraftDeptIDNullToHox
    setText(this.domHox1, 'docInfo orgDraftDept ID', '00000000000000000000');

    // setOrganToDoc
    const organ = getText(this.pubDocDom, 'pubdoc head organ');
    if (StringUtils.isNotBlank(organ)) {
      this.feEditor.putFieldText(Cell.ORGAN, organ); // 발신기관명
    }

    // setRecipientToDoc
    const refer = getAttr(this.pubDocDom, 'pubdoc head receiptinfo recipient', 'refer');
    const rec = getText(this.pubDocDom, 'pubdoc head receiptinfo recipient rec');
    if (refer && rec) {
      if (refer === 'true') {
        this.feEditor.putFieldText(Cell.RECLIST, rec); // 수신처
        this.feEditor.putFieldText(Cell.RECEIVE, '수신자 참조'); // 수신
        this.feEditor.putFieldText(Cell.RECV_CAPTION, '수신자'); // 수신처캡션
      } else {
        this.feEditor.putFieldText(Cell.RECLIST, ''); // 수신처
        this.feEditor.putFieldText(Cell.RECEIVE, rec); // 수신
        this.feEditor.putFieldText(Cell.RECV_CAPTION, ''); // 수신처캡션
      }
    }

    // setApprovalInfoToDoc
    const signFileList = this.#downloadSign();

    this.feEditor.clearSignCell();

    // 결재자
    const approvalNodes = getNodes(this.pubDocDom, 'pubdoc foot approvalinfo approval');
    for (let i = 0; i < approvalNodes.length; i++) {
      const approvalNode = approvalNodes[i];
      console.debug('유통문서 approval 노드', approvalNode);
      //
      const type = getText(approvalNode, 'type');
      const signposition = getText(approvalNode, 'signposition');
      const name = getText(approvalNode, 'name');
      const date = getText(approvalNode, 'date');
      const img = getAttr(approvalNode, 'signimage img', 'src');
      const pos = i + 1;
      const posCellName = Cell.POS + '.' + pos;
      const signCellName = Cell.SIGN + '.' + pos;

      this.feEditor.putFieldText(posCellName, signposition); // 직위 입력

      // 서명
      var options;
      if (type == '결재') options = stamp_method_finish_approval_hwp;
      else if (type == '전결') options = stamp_method_jeonkyul_hwp;
      else if (type == '대결') options = stamp_method_daekyul_hwp;
      else options = stamp_method_approval_hwp;

      const [opt0, opt1] = options;
      const signimageNode = getNode(approvalNode, 'signimage');

      if (type === '결재' || type === '전결' || type === '대결') {
        let signPrefix = this.#convertDateToSignFormat(date) + '\r\n';

        if (type == '전결' || type == '대결') signPrefix = type + ' ' + signPrefix;

        // 최종 결재의 날짜, 전결/대결 표시
        this.feEditor.putFieldText(signCellName, signPrefix, opt0.color, opt0.height, opt0.fontName, null, opt0.bold);

        if (img && signFileList && signFileList[img]) {
          // 이미지 서명일때
          await this.#setSignImage(signimageNode, signFileList[img], signCellName);
        } else {
          // 텍스트 서명일때
          this.feEditor.appendFieldText(signCellName, name, opt1.color, opt1.height, opt1.fontName, null, opt1.bold);
        }
      } else {
        // 최종 결재가 아닌 사용자
        if (img && signFileList && signFileList[img]) {
          // 이미지 서명일때
          await this.#setSignImage(signimageNode, signFileList[img], signCellName);
        } else {
          // 텍스트 서명일때
          this.feEditor.putFieldText(signCellName, name, opt0.color, opt0.height, opt0.fontName, null, opt0.bold);
        }
      }
    }

    // 협조자
    const assistNodes = getNodes(this.pubDocDom, 'pubdoc foot approvalinfo assist');
    for (let i = 0; i < assistNodes.length; i++) {
      const assistNode = assistNodes[i];

      const signposition = getText(assistNode, 'signposition');
      const name = getText(assistNode, 'name');
      const img = getAttr(assistNode, 'signimage img', 'src');
      const pos = i + 1;
      const signimageNode = getNode(assistNode, 'signimage');
      const signCellName = Cell.AGREE_SIGN + '.' + pos;
      const posCellName = Cell.AGREE_POS + '.' + pos;

      this.feEditor.putFieldText(posCellName, signposition); // 협조 직위 입력

      if (img && signFileList && signFileList[img]) {
        this.#setSignImage(signimageNode, signFileList[img], signCellName);
      } else {
        const opt0 = options[0];
        this.feEditor.putFieldText(signCellName, name, opt0.color, opt0.height, opt0.fontName, null, opt0.bold);
      }
    }
  }

  // setBodyContentToDoc
  async #setBody() {
    const domPubForBody = await loadXml(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSanctnTmplPubDocXmlInfo.act`); // loadTemplatePubDocXML();
    const contentNode = getNode(this.pubDocDom, 'pubdoc body content');
    var oldnode = getNode(domPubForBody, 'pubdoc body content');
    getNode(domPubForBody, 'pubdoc body').replaceChild(contentNode, oldnode);
    console.log('domPubForBody replaced', domPubForBody);

    const pubdocXmlHeader = `<?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE pubdoc [<!ENTITY nbsp "&#160;">]>
    <!-- 본 문서는 공문서 본문구조 정의에 따라 한글에서 생성된 문서 입니다. -->
    `;

    const formData = new FormData();
    formData.append('xmlText', pubdocXmlHeader + serializeXmlToString(domPubForBody));
    const bodyObj = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageFileUploadXMLFile.act`, { method: 'POST', body: formData }).then((res) => res.json());

    // if (!hwpCtrlMain.MoveToField(CELL_CBODY, true, true, true)) {
    //   alert('서식에 본문 누름틀이 존재하지 않아서 공문서 유통 문서를 변환할 수 없습니다.\n관리자에게 문의하시기 바랍니다.');
    //   return false;
    // }
    // if (window.console) console.log('현재 캐럿 위치에 문서 파일을 삽입');
    // if (window.console) console.log('hwpCtrlMain.GetCurFieldName=' + hwpCtrlMain.GetCurFieldName());
    //현재 캐럿 위치에 문서 파일을 삽입

    var pubdocurl = location.origin + PROJECT_CODE + '/com/hs/gwweb/appr/manageFileDwld.act?TRID=' + bodyObj.TRID + '&fileName=body.xml&K=' + szKEY;
    this.feEditor.moveToField(Cell.CBODY, true, true, true);
    await this.feEditor.insert(pubdocurl, 'PUBDOCBODY', 'lock:FALSE;versionwarning:FALSE');

    // validateBody
    if (StringUtils.isBlank(this.feEditor.cbody)) {
      throw new Error('본문내용이 없습니다');
    }
  }

  #downloadSign() {
    var signFileList = [];
    if (rInfo.signFileTRID && rInfo.signFileNames) {
      var trids = rInfo.signFileTRID.split(',');
      var names = rInfo.signFileNames.split(',');

      for (var i = 0, iEnd = trids.length; i < iEnd; i++) {
        signFileList[names[i]] = PROJECT_CODE + '/com/hs/gwweb/appr/manageFileDwld.act?TRID=' + trids[i] + '&fileName=' + names[i] + '&K=' + szKEY;
      }
    }
    return signFileList;
  }

  #convertDateToSignFormat(date) {
    if (date && date.length > 0) {
      var temp = null;
      if (date.indexOf('.') >= 0) temp = date.split('.');
      else temp = date.split('-');
      return temp[1] + '/' + temp[2];
    } else {
      return '';
    }
  }

  async #setSignImage(signImageNode, imagePath, fieldName) {
    if (!signImageNode || !imagePath || !fieldName) return;

    var width = 0;
    var widthString = getAttr(signImageNode, 'img', 'width');
    var idx = widthString.indexOf('mm');
    if (idx > 0) width = Math.round(widthString.substring(0, idx).valueOf());

    var height = 0;
    var heightString = getAttr(signImageNode, 'img', 'height');
    idx = heightString.indexOf('mm');
    if (idx > 0) height = Math.round(heightString.substring(0, idx).valueOf());

    var sizeOption = 2;
    if (width > 0 && width < 20 && height > 0 && height < 10) sizeOption = 1;

    // IMPL_InsertPicture(imagePath, fieldName, sizeOption, true, width, height);
    await this.feEditor.insertPicture(imagePath, true, sizeOption, false, false, 0, width, height);
  }

  /**
   * 로고 삽입. 발신기관명 좌측
   */
  async #setLogo() {
    this.feEditor.putFieldText(Cell.LOGO, '');
    if (rInfo.logoFileTRID) {
      var url = PROJECT_CODE + '/com/hs/gwweb/appr/manageFileDwld.act?TRID=' + rInfo.logoFileTRID + '&fileName=logo&K=' + szKEY;
      this.feEditor.moveToField(Cell.LOGO, true, true, false);
      await this.feEditor.insertPicture(url, true, 3, false, false, 0);
    }
  }

  /**
   * 심볼 삽입. 발신기관명 우측
   */
  async #setSymbol() {
    this.feEditor.putFieldText(Cell.SYMBOL, '');
    if (rInfo.symbolFileTRID) {
      var url = PROJECT_CODE + '/com/hs/gwweb/appr/manageFileDwld.act?TRID=' + rInfo.symbolFileTRID + '&fileName=symbol&K=' + szKEY;
      this.feEditor.moveToField(Cell.SYMBOL, true, true, true);
      await this.feEditor.insertPicture(url, true, 3, false, false, 0);
    }
  }

  #getPubDocFindField(strCells) {
    const cells = strCells.split(',');
    for (let i = 0; i < cells.length; i++) {
      let name = cells[i];
      let pName = '%' + name;
      if (this.feEditor.existField(name)) {
        return name;
      }
      if (this.feEditor.existField(pName)) {
        return pName;
      }
    }
    return '';
  }

  /**
   * 부가 정보를 본문에 반영
   * - 머리표어,  공개여부, 이메일, 주소, 시행일자, 문서번호 등
   */
  async #setTextToFieldIfTextExist() {
    const PUBDOC_EMAIL_CELL = this.#getPubDocFindField(doccfg.pubdocEmail);
    const PUBDOC_FAX_CELL = this.#getPubDocFindField(doccfg.pubdocFax);
    const PUBDOC_TELEPHONE_CELL = this.#getPubDocFindField(doccfg.pubdocTelephone);
    const PUBDOC_HOMEURL_CELL = this.#getPubDocFindField(doccfg.pubdocHomeurl);
    const PUBDOC_ADDRESS_CELL = this.#getPubDocFindField(doccfg.pubdocAddress);
    const PUBDOC_ZIPCODE_CELL = this.#getPubDocFindField(doccfg.pubdocZipcode);

    const nameAndPaths = [
      [Cell.HEAD_CAMPAIGN, 'pubdoc foot campaign headcampaign'],
      [Cell.FOOT_CAMPAIGN, 'pubdoc foot campaign footcampaign'],
      [Cell.DOC_PUBLIC, 'pubdoc foot sendinfo publication'],
      [PUBDOC_EMAIL_CELL, 'pubdoc foot sendinfo email'],
      [PUBDOC_FAX_CELL, 'pubdoc foot sendinfo fax'],
      [PUBDOC_TELEPHONE_CELL, 'pubdoc foot sendinfo telephone'],
      [PUBDOC_HOMEURL_CELL, 'pubdoc foot sendinfo homeurl'],
      [PUBDOC_ADDRESS_CELL, 'pubdoc foot sendinfo address'],
      [PUBDOC_ZIPCODE_CELL, 'pubdoc foot sendinfo zipcode'],
      [Cell.ENFORCE_DATE, 'pubdoc foot processinfo enforcedate'],
      [Cell.DOC_NUM, 'pubdoc foot processinfo regnumber'],
      [Cell.SENDERNAME, 'pubdoc foot sendername'],
      [Cell.VIA, 'pubdoc head receiptinfo via'],
      [Cell.DOC_TITLE, 'pubdoc body title'],
    ];

    for (let i = 0; i < nameAndPaths.length; i++) {
      const name = nameAndPaths[i][0];
      if (StringUtils.isBlank(name)) {
        continue;
      }
      const path = nameAndPaths[i][1];
      let text = getText(this.pubDocDom, path);
      if (text) {
        if (name === Cell.ENFORCE_DATE) {
          text = this.#convertEnforceDateToDocFormat(text);
        }
      } else {
        text = '';
      }
      this.feEditor.putFieldText(name, text);
    }

    // 기안자 셀 지우기
    this.feEditor.putFieldText(Cell.DRAFTER, '');
  }

  #convertEnforceDateToDocFormat(date) {
    let temp;
    if (date.indexOf('-') >= 0) {
      temp = date.split('-');
    } else {
      temp = date.split('.');
    }
    return temp[0] + '.' + temp[1] + '.' + temp[2] + '.';
  }

  /**
   * 관인 추가
   */
  async #setSealToDoc() {
    const omit = getAttr(this.pubDocDom, 'pubdoc foot seal', 'omit');
    // this.feEditor.loadStampTable();
    if (omit === 'true') {
      const skipStampUrl = URL.createObjectURL(syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveServerFile.act?UID=${rInfo.user.ID}&res=skipstamp.bmp&fileType=attach`).blob());

      this.feEditor.doSkipStamp(skipStampUrl);
    } else {
      if (rInfo.sealFileTRID) {
        const imageUrl = URL.createObjectURL(syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageFileDwld.act?TRID=${rInfo.sealFileTRID}&fileName=seal&K=${szKEY}`).blob());

        // <img alt="" border="0" height="28.4806mm" hspace="0.0000mm" src="PICDD79B9AB.png" vspace="0.0000mm" width="28.2513mm"/></seal>
        const width = getAttr(this.pubDocDom, 'pubdoc foot seal img', 'width').replace('mm', '');
        const height = getAttr(this.pubDocDom, 'pubdoc foot seal img', 'height').replace('mm', '');
        console.log('pubdoc seal img. width', width, 'height', height);

        this.feEditor.doSealStamp(imageUrl, width, height);
      }
    }
  }
}
