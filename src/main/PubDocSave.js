import syncFetch from 'sync-fetch';
import Capi from '../utils/Capi';
import StringUtils from '../utils/StringUtils';
import { addNode, getAttr, getNode, getNodes, getText, loadXml, serializeXmlToString, setAttr, setText } from '../utils/xmlUtils';
import Cell from './CellNames';
import FeEditor from './FeEditor';
import { USER_DAEKYUL_STR, USER_JEONHOO_STR, USER_JEONKYUL_STR, USER_NOAPPROVAL_STR } from './const/CommonConst';

export default class PubDocSave {
  pubdocTRID;

  /**
   *
   * @param {XMLDocument} hox
   * @param {FeEditor} feEditor
   */
  constructor(hox, feEditor) {
    this.hox = hox;
    this.feEditor = feEditor;
  }

  /**
   *
   * @returns 수신처에 LDAP 이 있는지 여부
   */
  isLdap() {
    const recNodes = getNodes(this.hox, 'docInfo content receiptInfo recipient rec');

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

  async process() {
    this.domPub = await loadXml(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSanctnTmplPubDocXmlInfo.act`);
    this.makeHead();
    await this.makeBody();
    this.makeFoot();
    this.makeAttach();

    this.upload();
  }

  makeHead() {
    console.log('makeHead START');
    // head/organ, 기관명
    setText(this.domPub, '/pubdoc/head/organ', this.feEditor.IMPL_GetFieldText(Cell.ORGAN));

    // head/receiptinfo/recipient/rec, 수신자 및 참조
    // head/receiptinfo/recipient@refer
    // 1개 refer="false", 2개 이상 true
    const recNodes = getNodes(this.hox, 'docInfo content receiptInfo recipient rec');
    if (recNodes) {
      const recipientNodeDomPub = getNode(this.domPub, 'pubdoc head receiptinfo recipient');

      let refer = 'false';
      let rec = '';
      if (recNodes.length === 1) {
        const recType = recNodes[0].getAttribute('type');
        if (recType != null && (recType == 'rectype_unifiedgroup' || recType == 'rectype_deptgroup' || recType == 'rectype_ldapgroup')) {
          refer = 'true';
          rec = this.feEditor.getFieldText(Cell.RECLIST);
        } else {
          refer = 'false';
          rec = this.feEditor.getFieldText(Cell.RECEIVE);
        }
      } else if (recNodes.length > 1) {
        refer = 'true';
        rec = this.feEditor.getFieldText(Cell.RECLIST);
      }
      recipientNodeDomPub.setAttribute('refer', refer);
      setText(this.domPub, 'pubdoc head receiptinfo recipient rec', rec);
    }

    // head/receiptinfo/via, 경유
    setText(this.domPub, 'pubdoc head receiptinfo via', this.feEditor.getFieldText(Cell.VIA));

    console.log('makeHead END');
  }

  async makeBody() {
    console.log('makeBody START');

    // body/title
    setText(this.domPub, 'pubdoc body title', this.feEditor.getFieldText(Cell.DOC_TITLE));

    // body/content
    if (this.feEditor.isFieldEmpty(Cell.CBODY)) {
      throw new Error('makeBody error BODY CELL is EMPTY');
    } else {
      await this.getNodeByField(Cell.CBODY, 'tempbody.xml', 'pubdoc body content');
    }
    //TODO: filterBodyValue 		pubdocBodySize 구해야함.
    //if(window.console) console.log('[PubDoc.makeBody] filterBodyValue 		pubdocBodySize 구해야함.')
    console.log('makeBody END');
  }

  async makeFoot() {
    console.log('makeFoot START');
    // foot/sendername, 발신명의
    setText(this.domPub, 'pubdoc foot sendername', this.feEditor.getFieldText(Cell.SENDERNAME));

    // foot/seal, 관인
    // foot/seal@omit
    // 본문에서 관인정보를 추출하여 pubdoc에 추가.
    if (this.feEditor.isFieldEmpty(Cell.SEAL_STAMP)) {
      this.getNodeByField(this.wordID, Cell.SEAL_STAMP, 'tempseal.xml', '//img'); // FIXME
    }

    // foot/approvalinfo
    this.processApproval(this.hox); // FIXME

    // foot/processinfo
    // foot/processinfo/regnumber, 문서번호
    // <regnumber regnumbercode="4545456000039">회신3팀:2010-39</regnumber>
    setText(this.domPub, 'pubdoc foot processinfo regnumber', this.feEditor.getFieldText(Cell.DOC_NUM));

    // foot/processinfo/regnumber@regnumbercode, 문서등록번호
    // 기관코드 7자리 + 일련번호 6자리
    const regno = getText(this.hox, 'docInfo docNumber regNumber');
    setAttr(this.domPub, 'pubdoc foot processinfo regnumber', 'regnumbercode', rInfo.dept.deptCode + this.getRegNumberFromRegNo(regno));

    // foot/processinfo/enforcedate, 시행일자
    var enforceDate = this.feEditor.getFieldText(Cell.ENFORCE_DATE);
    setText(this.domPub, 'pubdoc foot processinfo enforcedate', this.convertEnforceDateToPubDocFormat(enforceDate));

    if (getText(this.domPub, 'pubdoc foot processinfo enforcedate') == '') {
      console.error('enforcedate is empty');
      throw new Error('enforcedate is empty');
    }

    // foot/sendinfo

    // foot/sendinfo/zipcode, ...
    this.setSendInfo();

    // foot/sendinfo/publication
    this.setPublicationCode();

    // foot/sendinfo/symbol
    // remove old symbol img node
    // get symbol node
    if (this.feEditor.isFieldEmpty(Cell.SYMBOL)) {
      this.getNodeByField(Cell.SYMBOL, 'tempsymbol.xml', '//img'); // FIXME
    }

    // get logo node
    if (this.feEditor.isFieldEmpty(Cell.LOGO)) {
      this.getNodeByField(Cell.LOGO, 'templogo.xml', '//img'); // FIXME
    }

    // foot/campaign
    setText(this.domPub, 'pubdoc foot campaign headcampaign', this.feEditor.getFieldText(Cell.HEAD_CAMPAIGN));
    setText(this.domPub, 'pubdoc foot campaign footcampaign', this.feEditor.getFieldText(Cell.FOOT_CAMPAIGN));

    console.log('makeFoot END');
  }

  async getNodeByField(field, tempFileName, nodePath) {
    //
    this.feEditor.moveToField(field, true, true, false);
    const saveRet = await this.feEditor.saveServer(tempFileName, 'PUBDOCBODY', 'fieldtype:clickhere;fieldname:' + field);
    const fileInfo = Capi.getFileFromURL(saveRet.downloadURL);

    const fieldXmlPubDoc = await loadXml(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveXmlFromWasByTrid.act?TRID=${fileInfo.TRID}&encoding=utf-8`);

    const node = getNode(fieldXmlPubDoc, nodePath);
    const oldNode = getNode(this.domPub, nodePath);
    getNode(this.domPub, 'body').replaceChild(node, oldNode);
  }

  getRegNumberFromRegNo(regNo) {
    if (!regNo) return 0;
    if (regNo.length <= 6) return 0;

    return regNo.substring(regNo.length - 6); // 뒤에서부터 6자리를 잘라서 반환한다.
  }

  convertEnforceDateToPubDocFormat(enforceDate) {
    if (enforceDate.indexOf('.') >= 0) {
      var temp = enforceDate.split('.');
      var year = temp[0];
      var month = this.paddingFrontWithZero(2, temp[1].trim());
      var day = '00';
      if (temp.length > 2) {
        day = this.paddingFrontWithZero(2, temp[2].trim());
      }
      return year + '-' + month + '-' + day;
    } else {
      return enforceDate;
    }
  }

  /**
   * foot/approvalinfo
   * @param {*} domHox
   */
  processApproval(domHox) {
    // 기존결재 정보 클리어
    getNode(this.domPub, 'pubdoc foot approvalinfo').textContent = null;

    const signPartNodes = new Array(); // 결재 모음
    const agreePartNodes = new Array(); // 협조 모음

    const partNodes = getNodes(domHox, 'hox approvalFlow participant');
    for (const partNode of partNodes) {
      const validStatus = getText(partNode, 'validStatus');
      if (validStatus === 'revoked') {
        continue;
      }

      const cellName = getText(partNode, 'mappingCell cellName');
      if (cellName == '') {
        continue;
      }

      const approvalType = getText(partNode, 'approvalType');
      if (this.isAgreeType(approvalType)) {
        agreePartNodes.push(partNode);
      } else {
        if (!cellName.startsWith(Cell.SIGN)) {
          continue;
        }
        signPartNodes.push(partNode);
      }
    }

    // 결재 목록 설정
    signPartNodes.forEach((partNode, i) => {
      const approvalType = getText(partNode, 'approvalType');
      const cellName = getText(partNode, 'mappingCell cellName');
      const cellNumber = cellName.split('.')[1];
      const first = i === 0;
      const last = i === signPartNodes.length - 1;
      const order = last ? 'final' : i + 1;
      //
      let approvalTypeDisplay;
      if (approvalType == USER_DAEKYUL_STR) {
        approvalTypeDisplay = '대결';
      } else if (approvalType == USER_JEONKYUL_STR || approvalType == USER_JEONHOO_STR) {
        approvalTypeDisplay = '전결';
      } else {
        if (last) {
          approvalTypeDisplay = '결재';
        } else if (first) {
          approvalTypeDisplay = '기안';
        } else {
          approvalTypeDisplay = '검토';
        }
      }

      const position = this.feEditor.getFieldText(Cell.POS + '.' + cellNumber);
      const signStyle = getAttr(partNode, null, 'signStyle');

      let name;
      if (approvalType == USER_NOAPPROVAL_STR) {
        name = getAttr(partNode, 'signelessCode', 'name'); // 결재방법이 [결재안함]인 경우 결재자 이름 대신 부재사유를 넣어준다.
      } else if (approvalType == USER_JEONHOO_STR) {
        name = ''; // 결재방법이 [전결/후열]인 경우 빈 문자열로 처리
      } else {
        const absent = getAttr(partNode, null, 'absent') == 'true';
        const delegatorName = getText(partNode, 'delegator name');
        if (absent && StringUtils.isNotBlank(delegatorName)) {
          name = delegatorName;
        } else {
          name = getText(partNode, 'name');
        }
      }

      let [date, time] = ['', ''];
      if (!(approvalType == USER_NOAPPROVAL_STR || approvalType == USER_JEONHOO_STR)) {
        const datetime = getText(partNode, 'date').split('T');
        if (datetime.length == 2) {
          date = datetime[0];
          time = datetime[1];
        }
      }

      const approvalinfo = getNode(this.domPub, 'pubdoc foot approvalinfo');
      const approval = addNode(approvalinfo, 'approvalinfo');
      setAttr(approval, null, 'order', order);

      addNode(approval, 'signposition', position);
      addNode(approval, 'type', approvalTypeDisplay);

      if (signStyle === 'image') {
        const node = addNode(approval, 'signimage', '');
        node.setAttribute('cellName', cellName);

        this.getNodeByField(this.wordID, cellName, 'tempsign.xml', '//img'); // FIXME
        /*
          <signimage>
				    <img alt="" height="" src="" width=""/>
				  </signimage>
        */
      } else {
        addNode(approval, 'name', name);
      }

      addNode(approval, 'date', date);
      if (time.length > 0) {
        addNode(approval, 'time', time);
      }
    });

    // 협조 목록 설정
    agreePartNodes.forEach((partNode, i) => {
      const approvalType = getText(partNode, 'approvalType');
      const cellName = getText(partNode, 'mappingCell cellName');
      const cellNumber = cellName.split('.')[1];
      const first = i === 0;
      const last = i === signPartNodes.length - 1;
      const order = last ? 'final' : i + 1;

      const approvalTypeDisplay = '협조';

      const position = this.feEditor.getFieldText(Cell.AGREE_POS + '.' + cellNumber);
      const signStyle = getAttr(partNode, null, 'signStyle');

      const name = getText(partNode, 'name');

      let [date, time] = ['', ''];
      const datetime = getText(partNode, 'date').split('T');
      if (datetime.length == 2) {
        date = datetime[0];
        time = datetime[1];
      }

      const approvalinfo = getNode(this.domPub, 'pubdoc foot approvalinfo');
      const assist = addNode(approvalinfo, 'assist');
      setAttr(assist, null, 'order', order);

      addNode(assist, 'signposition', position);
      addNode(assist, 'type', approvalTypeDisplay);

      if (signStyle == 'image') {
        const node = addNode(assist, 'signimage', '');
        node.setAttribute('cellName', cellName);

        this.getNodeByField(this.wordID, cellName, 'tempsign.xml', '//img');
      } else {
        addNode(assist, 'name', name);
      }

      addNode(assist, 'date', date);
      if (time.length > 0) {
        addNode(assist, 'time', time);
      }
    });
  }

  isAgreeType(approvalType) {
    return ['user_agree_s', 'user_skip_agree_s', 'user_agree_p', 'user_skip_agree_p', 'dept_agree_s', 'dept_skip_agree_s', 'dept_agree_p', 'dept_skip_agree_p', 'user_simsa', 'user_skip_simsa'].includes(approvalType);
  }

  /**
   * foot/sendinfo
   */
  setSendInfo() {
    setText(this.domPub, 'pubdoc foot sendinfo zipcode', this.getFindCellData(doccfg.pubdocZipcode));
    setText(this.domPub, 'pubdoc foot sendinfo address', this.getFindCellData(doccfg.pubdocAddress));
    setText(this.domPub, 'pubdoc foot sendinfo homeurl', this.getFindCellData(doccfg.pubdocHomeurl));
    setText(this.domPub, 'pubdoc foot sendinfo telephone', this.getFindCellData(doccfg.pubdocTelephone));
    setText(this.domPub, 'pubdoc foot sendinfo fax', this.getFindCellData(doccfg.pubdocFax));
    setText(this.domPub, 'pubdoc foot sendinfo email', this.getFindCellData(doccfg.pubdocEmail));
  }

  getFindCellData(strCells) {
    var data = '';
    var cells = [];
    if (strCells) {
      cells = strCells.split(',');
    }
    for (var i = 0; i < cells.length; i++) {
      data = this.feEditor.getFieldText(cells[i]);
      if (data != '') {
        break;
      }
    }
    return data;
  }

  setPublicationCode() {
    // foot/sendinfo/publication, 공개여부
    // <publication code="1NNNNNNNN">공개</publication></sendinfo>
    setText(this.domPub, 'pubdoc foot sendinfo publication', this.feEditor.getFieldText(Cell.DOC_PUBLIC));

    // foot/sendinfo/publication@code
    var publication = getNode(this.hox, 'docInfo publication');
    var type = getAttr(publication, null, 'type');
    var code = '0';
    if (type == 'pubtype_not') {
      code = '3';
    } else if (type == 'pubtype_open') {
      code = '1';
    } else if (type == 'pubtype_partial') {
      code = '2';
    }

    var publicationFlag = getText(this.hox, 'docInfo/publication/publicationFlag');
    //'NNNNNNNN';
    var arrFlag = publicationFlag.split(' ');
    for (var i = 1; i <= 8; i++) {
      var flag = 'N';
      for (var j = 0; j < arrFlag.length; j++) {
        if (i == arrFlag[j]) {
          flag = 'Y';
          break;
        }
      }
      code += flag;
    }

    setAttr(this.domPub, 'pubdoc foot sendinfo publication', 'code', code);
  }

  /**
   * /pubdoc/attach
   */
  makeAttach() {
    console.log('makeAttach START');
    // attach
    const attach = getNode(this.domPub, 'pubdoc attach');
    attach.textContent = null; // 기존첨부 정보 클리어

    getNodes(this.hox, 'docInfo objectIDList objectID')
      .filter((objectID) => {
        return objectID.getAttribute('type') === 'objectidtype_attach' && objectID.getAttribute('dirty') !== 'deleted';
      })
      .forEach((objectID) => {
        addNode(attach, 'title', getText(objectID, 'name')); // 진짜 파일명이 들어가게
      });

    console.log('makeAttach END');
  }

  upload() {
    //
    // seal
    const sealNode = getNode(this.domPub, 'pubdoc foot seal img');
    let fnameOfSeal = '';
    let tridOfSeal = '';
    if (sealNode) {
      const imgUrl = getAttr(sealNode, 'src');
      if (imgUrl.indexOf('http') > -1) {
        var idx = imgUrl.lastIndexOf('/');
        if (idx > -1) {
          fnameOfSeal = imgUrl.substring(idx + 1);
        }
        const obj = Capi.getFileFromURL(imgUrl);
        if (obj && obj.TRID) {
          tridOfSeal = obj.TRID;
        }
        setAttr(sealNode, null, 'src', fnameOfSeal); // URL을 다시 파일이름으로 변경
      } else {
        fnameOfSeal = imgUrl;
      }
    }

    // sign
    const signImageNodes = getNodes(this.domPub, 'pubdoc foot approvalinfo img');
    let fnamesOfSign = '';
    let tridsOfSign = '';
    if (signImageNodes) {
      for (let i = 0, iEnd = signImageNodes.length; i < iEnd; i++) {
        const signImageNode = signImageNodes[i];
        const url = getAttr(signImageNode, null, 'src');
        if (tridsOfSign.length > 0) {
          tridsOfSign += ',';
        }
        const obj = Capi.getFileFromURL(url);
        if (obj && obj.TRID) {
          tridsOfSign += obj.TRID;
        }
        const idx = url.lastIndexOf('/');
        let fnameOfSign;
        if (idx > -1) {
          fnameOfSign = url.substring(idx + 1);
          console.log('fnameOfSign filename :' + fnameOfSign);
          setText(signImageNode, null, 'src', fnameOfSign); // URL을 다시 파일이름으로 변경
        }
        if (fnamesOfSign.length > 0) {
          fnamesOfSign += ',';
        }
        fnamesOfSign += fnameOfSign;
      }
    }

    // symbol
    const symbolNode = getNode(this.domPub, 'pubdoc foot sendinfo symbol img');
    let fnameOfSymbol = '';
    let tridOfSymbol = '';
    if (symbolNode) {
      const imgUrl = getAttr(symbolNode, null, 'src');
      if (imgUrl.indexOf('http') > -1) {
        const idx = imgUrl.lastIndexOf('/');
        if (idx > -1) {
          fnameOfSymbol = imgUrl.substring(idx + 1);
        }
        const obj = Capi.getFileFromURL(imgUrl);
        if (obj && obj.TRID) {
          tridOfSymbol = obj.TRID;
        }
        setAttr(symbolNode, null, 'src', fnameOfSymbol); // URL을 다시 파일이름으로 변경
      }
    }

    // logo
    const logoNode = getNode(this.domPub, 'pubdoc foot sendinfo logo img');
    let fnameOflogo = '';
    let tridOflogo = '';
    if (logoNode) {
      const imgUrl = getAttr(logoNode, null, 'src');
      if (imgUrl.indexOf('http') > -1) {
        const idx = imgUrl.lastIndexOf('/');
        if (idx > -1) {
          fnameOflogo = imgUrl.substring(idx + 1);
        }
        const obj = Capi.getFileFromURL(imgUrl);
        if (obj && obj.TRID) {
          tridOflogo = obj.TRID;
        }
        setAttr(logoNode, null, 'src', fnameOflogo);
      }
    }

    //
    this.makePubDocTRID();

    //
    this.resetDocumentListUsingEnforceHox();

    //
    const senderName = encodeURIComponent(getText(this.domPub, 'pubdoc foot sendername'));

    let isMultiDraft = false;
    let contentIsLdapList = '';
    let contentCount = 1;
    if (pInfo.isMultiDraft() && rInfo.cltType != 'control') {
      isMultiDraft = true;

      const contentNodes = getNodes(this.hox, 'hox docInfo content');
      contentCount = contentNodes.length;

      for (var i = 0; i < contentCount; i++) {
        const curContent = contentNodes[i];
        var curRec = curContent.selectNodes('receiptInfo/recipient/rec[@type="rectype_ldap"]');
        var curRec2 = curContent.selectNodes('receiptInfo/recipient/rec/recSymbolItems/recSymbolItem[type="rectype_ldap"]');

        var curIsLdap = false;
        if ((curRec && curRec.length > 0) || (curRec2 && curRec2.length > 0)) {
          curIsLdap = true;
        }
        if (curIsLdap == false) {
          var curRec3 = curContent.selectNodes('receiptInfo/recipient/rec[@type="rectype_unifiedgroup"]');
          if (curRec3 && curRec3.length > 0) {
            curIsLdap = this.isLdapMember(curRec3);
          }
        }

        if (contentIsLdapList == '') {
          contentIsLdapList = curIsLdap + '';
        } else {
          contentIsLdapList += ',' + curIsLdap; // ex. true,false,false,true...
        }
      }
    }

    //utf8형태의 헤더없는 포맷
    var url = PROJECT_CODE + '/com/hs/gwweb/appr/uploadPubDoc.act';
    var params =
      'APPRID=' +
      this.sendApprID +
      '&TRIDOFPUBDOC=' +
      this.pubdocTRID +
      '&FNAMEOFPUBDOC=pubdoc.xml' +
      '&TRIDOFSEAL=' +
      tridOfSeal +
      '&FNAMEOFSEAL=' +
      fnameOfSeal +
      '&TRIDSOFSIGN=' +
      tridsOfSign +
      '&FNAMESOFSIGN=' +
      fnamesOfSign +
      '&TRIDOFSYMBOL=' +
      tridOfSymbol +
      '&FNAMEOFSYMBOL=' +
      fnameOfSymbol +
      '&TRIDOFLOGO=' +
      tridOflogo +
      '&FNAMEOFLOGO=' +
      fnameOflogo +
      '&DID=' +
      rInfo.user.deptID +
      '&UID=' +
      rInfo.user.ID +
      '&SENDERNAME=' +
      senderName +
      '&ISMULTIDRAFT=' +
      isMultiDraft +
      '&CONTENTCOUNT=' +
      contentCount;

    if (this.documentIDList) {
      params += '&DOCUMENTIDLIST=' + this.documentIDList + '&DOCUMENTNAMELIST=' + this.documentNameList;
    }

    if (pInfo.isMultiDraft() && rInfo.cltType != 'control') {
      params += '&DOCUMENTCONTENTNUMLIST=' + this.documentContentNumList + '&CONTENTISLDAPLIST=' + contentIsLdapList;
    }

    const ret = Capi.callObject(url, params);

    console.log('uploadPubDoc END. url' + url, 'params', params, 'ret', ret);
  }

  makePubDocTRID() {
    //
    const pubdocXmlHeader = `<?xml version="1.0" encoding="euc-kr"?>
    <?xml-stylesheet type="text/xsl" href="siheng.xsl"?>
    <!DOCTYPE pubdoc SYSTEM "pubdoc.dtd">
    `;
    // HOX에서 추출한 유통본문파일 정보를 XML 서버에 임시로 저장한다.
    let xmlText = pubdocXmlHeader + serializeXmlToString(this.domPub);
    xmlText = xmlText.replace(/\xA0/g, ' ');
    const xmlPubdoc = Capi.putXMLFile(xmlText, '', 'euc-kr');
    this.pubdocTRID = xmlPubdoc.TRID;
  }

  resetDocumentListUsingEnforceHox() {
    //
    this.documentIDList = false;
    this.documentNameList = false;
    const elms = getNodes(this.hox, ' docInfo objectIDList objectID');
    for (let i = 0; i < elms.length; i++) {
      const elm = elms[i];
      const id = getText(elm, 'ID');
      const nm = getText(elm, 'name');
      const type = getAttr(elm, null, 'type');
      const dirty = getAttr(elm, null, 'dirty');

      if (dirty === 'deleted') continue;
      if (type === 'objectidtype_attach') {
        if (!this.documentIDList) {
          this.documentIDList = id;
          this.documentNameList = encodeURIComponent(nm);
        } else {
          this.documentIDList += ',' + id;
          this.documentNameList += encodeURIComponent('|') + encodeURIComponent(nm);
        }
      }
    }

    console.log('[resetDocumentListUsingEnforceHox] documentIDList', this.documentIDList, 'documentNameList', this.documentNameList);
  }
}
