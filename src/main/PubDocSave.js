import syncFetch from 'sync-fetch';
import Capi from '../utils/Capi';
import StringUtils from '../utils/StringUtils';
import { addNode, getAttr, getNode, getNodes, getText, loadXml, serializeXmlToString, setAttr, setText } from '../utils/xmlUtils';
import Cell from './CellNames';
import { USER_DAEKYUL_STR, USER_JEONHOO_STR, USER_JEONKYUL_STR, USER_NOAPPROVAL_STR } from './const/CommonConst';

/**
 * 공문서 서버 저장
 */
export default class PubDocSave {
  hox;
  feEditor;

  /**
   * 공문서 서버 저장
   * @param {XMLDocument} hox
   */
  constructor(hox) {
    this.hox = hox;
  }

  /**
   * 문서 전체 수신자 중에 LDAP이 있는지
   * @returns 수신처에 LDAP 이 있는지 여부
   */
  isLdap() {
    if (pInfo.formType !== 'formtype_uniform') {
      console.log('통합서식이 아니면 유통파일 생성 필요없음');
      return false;
    }

    this.#isLdapByContent(this.hox);
  }

  /**
   * 해당 안에 LDAP이 있는지
   * @param {Element} contentNode
   * @returns
   */
  #isLdapByContent(contentNode) {
    const recNodes = getNodes(contentNode, 'receiptInfo recipient rec');

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

  /**
   * 공문서 처리 메인 함수
   *
   * @param {*} enforceDocInfos 시행문의 hox 모음
   */
  async processPubDocList(enforceDocInfos) {
    const contentNodes = getNodes(this.hox, 'docInfo content');
    for (let i = 0; i < contentNodes.length; i++) {
      const contentNode = contentNodes[i];
      const enforceDocInfo = enforceDocInfos[i];

      // ladp 수신처가 있나?
      if (!this.#isLdapByContent(contentNode)) {
        continue;
      }

      // 있으면, 안 별로 로딩
      const splitedExamDoc = feMain.splitedExamDocMap.get('content' + (i + 1));
      this.feEditor = await feMain.getEditor4Extra();
      await this.feEditor.openByJSON(splitedExamDoc.hwpJson);

      await this.makePubDoc(enforceDocInfo.hox);
    }

    // 서버로 업로드
    await this.upload();
  }

  /**
   * 안별 공문서 처리
   * @param {XMLDocument} hox 시행문 hox
   */
  async makePubDoc(hox) {
    this.pubdocXml = await loadXml(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSanctnTmplPubDocXmlInfo.act`);

    this.#makeHead(hox);
    await this.#makeBody(hox);
    await this.#makeFoot(hox);
    this.#makeAttach(hox);
  }

  /**
   * pubdoc head 내용 채우기
   * @param {XMLDocument} hox
   */
  #makeHead(hox) {
    console.log('makeHead START');
    // head/organ, 기관명
    setText(this.pubdocXml, 'pubdoc head organ', this.feEditor.getFieldText(Cell.ORGAN));

    // head/receiptinfo/recipient/rec, 수신자 및 참조
    // head/receiptinfo/recipient@refer
    // 1개 refer="false", 2개 이상 true
    const recNodes = getNodes(hox, 'docInfo content receiptInfo recipient rec');
    if (recNodes) {
      const recipientNodeDomPub = getNode(this.pubdocXml, 'pubdoc head receiptinfo recipient');

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
      setText(this.pubdocXml, 'pubdoc head receiptinfo recipient rec', rec);
    }

    // head/receiptinfo/via, 경유
    setText(this.pubdocXml, 'pubdoc head receiptinfo via', this.feEditor.getFieldText(Cell.VIA));

    console.log('makeHead END', this.pubdocXml);
  }

  /**
   * pubdoc body 내용 채우기
   * @param {XMLDocument} hox
   */
  async #makeBody(hox) {
    console.log('makeBody START');

    // body/title
    setText(this.pubdocXml, 'pubdoc body title', this.feEditor.getFieldText(Cell.DOC_TITLE));

    // body/content
    if (this.feEditor.isFieldEmpty(Cell.CBODY)) {
      throw new Error('makeBody error BODY CELL is EMPTY');
    } else {
      await this.#setBodyContent();
      // await this.getNodeByField(Cell.CBODY, 'tempbody.xml', 'pubdoc body content');
    }
    //TODO: filterBodyValue 		pubdocBodySize 구해야함.
    //if(window.console) console.log('[PubDoc.makeBody] filterBodyValue 		pubdocBodySize 구해야함.')
    console.log('makeBody END', this.pubdocXml);
  }

  /**
   * pubdoc foot 내용 채우기
   * @param {XMLDocument} hox
   */
  async #makeFoot(hox) {
    console.log('makeFoot START');
    // foot/sendername, 발신명의
    setText(this.pubdocXml, 'pubdoc foot sendername', this.feEditor.getFieldText(Cell.SENDERNAME));

    // foot/seal, 관인
    // foot/seal@omit
    // 본문에서 관인정보를 추출하여 pubdoc에 추가.
    if (!this.feEditor.isFieldEmpty(Cell.SEAL_STAMP)) {
      await this.#setFootSeal();
      // await this.getNodeByField(Cell.SEAL_STAMP, 'tempseal.xml', 'img');
    }

    // foot/approvalinfo
    this.processApproval(hox); // FIXME

    // foot/processinfo/regnumber, 문서번호
    // <regnumber regnumbercode="4545456000039">회신3팀:2010-39</regnumber>
    setText(this.pubdocXml, 'pubdoc foot processinfo regnumber', this.feEditor.getFieldText(Cell.DOC_NUM));

    // foot/processinfo/regnumber@regnumbercode, 문서등록번호
    // 기관코드 7자리 + 일련번호 6자리
    const regno = getText(hox, 'docInfo docNumber regNumber');
    setAttr(this.pubdocXml, 'pubdoc foot processinfo regnumber', 'regnumbercode', rInfo.dept.deptCode + this.getRegNumberFromRegNo(regno));

    // foot/processinfo/enforcedate, 시행일자
    var enforceDate = this.feEditor.getFieldText(Cell.ENFORCE_DATE);
    setText(this.pubdocXml, 'pubdoc foot processinfo enforcedate', this.#convertEnforceDateToPubDocFormat(enforceDate));

    if (getText(this.pubdocXml, 'pubdoc foot processinfo enforcedate') == '') {
      console.error('enforcedate is empty');
      throw new Error('enforcedate is empty');
    }

    // foot/sendinfo

    // foot/sendinfo/zipcode, ...
    this.setSendInfo(hox);

    // foot/sendinfo/publication
    this.setPublicationCode(hox);

    // foot/sendinfo/symbol
    if (!this.feEditor.isFieldEmpty(Cell.SYMBOL)) {
      await this.#setFootSymbol();
    }

    // get logo node
    if (!this.feEditor.isFieldEmpty(Cell.LOGO)) {
      await this.#setFootLogo();
    }

    // foot/campaign
    setText(this.pubdocXml, 'pubdoc foot campaign headcampaign', this.feEditor.getFieldText(Cell.HEAD_CAMPAIGN));
    setText(this.pubdocXml, 'pubdoc foot campaign footcampaign', this.feEditor.getFieldText(Cell.FOOT_CAMPAIGN));

    console.log('makeFoot END', this.pubdocXml);
  }

  /**
   * pubdoc attach 내용 채우기
   * @param {XMLDocument} hox
   */
  #makeAttach(hox) {
    console.log('makeAttach START');
    // attach
    const attach = getNode(this.pubdocXml, 'pubdoc attach');
    attach.textContent = null; // 기존첨부 정보 클리어

    getNodes(hox, 'docInfo objectIDList objectID')
      .filter((objectID) => {
        return objectID.getAttribute('type') === 'objectidtype_attach' && objectID.getAttribute('dirty') !== 'deleted';
      })
      .forEach((objectID) => {
        addNode(attach, 'title', getText(objectID, 'name')); // 진짜 파일명이 들어가게
      });

    console.log('makeAttach END');
  }

  getRegNumberFromRegNo(regNo) {
    if (!regNo) return 0;
    if (regNo.length <= 6) return 0;

    return regNo.substring(regNo.length - 6); // 뒤에서부터 6자리를 잘라서 반환한다.
  }

  #convertEnforceDateToPubDocFormat(enforceDate) {
    if (enforceDate.indexOf('.') >= 0) {
      return enforceDate
        .split('.')
        .filter((t) => StringUtils.isNotBlank(t))
        .map((t) => t.trim())
        .map((t, i) => {
          if (i > 0 && t.length === 1) {
            return '0' + t;
          }
          return t;
        })
        .join('-');
    } else {
      return enforceDate;
    }
  }

  /**
   * foot/approvalinfo
   * @param {XMLDocument} hox
   */
  async processApproval(hox) {
    // 기존결재 정보 클리어
    getNode(this.pubdocXml, 'pubdoc foot approvalinfo').textContent = null;

    const signPartNodes = new Array(); // 결재 모음
    const agreePartNodes = new Array(); // 협조 모음

    const partNodes = getNodes(hox, 'hox approvalFlow participant');
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
    for (let i = 0; i < signPartNodes.length; i++) {
      const partNode = signPartNodes[i];

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

      const approvalinfo = getNode(this.pubdocXml, 'pubdoc foot approvalinfo');
      const approval = addNode(approvalinfo, 'approvalinfo');
      setAttr(approval, null, 'order', order);

      addNode(approval, 'signposition', position);
      addNode(approval, 'type', approvalTypeDisplay);

      if (signStyle === 'image') {
        const node = addNode(approval, 'signimage', '');
        node.setAttribute('cellName', cellName);

        await this.#setFootSign(node);
      } else {
        addNode(approval, 'name', name);
      }

      addNode(approval, 'date', date);
      if (time.length > 0) {
        addNode(approval, 'time', time);
      }
    }

    // 협조 목록 설정
    for (let i = 0; i < agreePartNodes.length; i++) {
      const partNode = agreePartNodes[i];

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

      const approvalinfo = getNode(this.pubdocXml, 'pubdoc foot approvalinfo');
      const assist = addNode(approvalinfo, 'assist');
      setAttr(assist, null, 'order', order);

      addNode(assist, 'signposition', position);
      addNode(assist, 'type', approvalTypeDisplay);

      if (signStyle == 'image') {
        const node = addNode(assist, 'signimage', '');
        node.setAttribute('cellName', cellName);

        await this.#setFootSign(cellName);
        // await this.getNodeByField(cellName, 'tempsign.xml', 'img');
      } else {
        addNode(assist, 'name', name);
      }

      addNode(assist, 'date', date);
      if (time.length > 0) {
        addNode(assist, 'time', time);
      }
    }
  }

  isAgreeType(approvalType) {
    return ['user_agree_s', 'user_skip_agree_s', 'user_agree_p', 'user_skip_agree_p', 'dept_agree_s', 'dept_skip_agree_s', 'dept_agree_p', 'dept_skip_agree_p', 'user_simsa', 'user_skip_simsa'].includes(approvalType);
  }

  /**
   * foot/sendinfo
   */
  setSendInfo() {
    setText(this.pubdocXml, 'pubdoc foot sendinfo zipcode', this.getFindCellData(doccfg.pubdocZipcode));
    setText(this.pubdocXml, 'pubdoc foot sendinfo address', this.getFindCellData(doccfg.pubdocAddress));
    setText(this.pubdocXml, 'pubdoc foot sendinfo homeurl', this.getFindCellData(doccfg.pubdocHomeurl));
    setText(this.pubdocXml, 'pubdoc foot sendinfo telephone', this.getFindCellData(doccfg.pubdocTelephone));
    setText(this.pubdocXml, 'pubdoc foot sendinfo fax', this.getFindCellData(doccfg.pubdocFax));
    setText(this.pubdocXml, 'pubdoc foot sendinfo email', this.getFindCellData(doccfg.pubdocEmail));
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

  /**
   * foot/sendinfo/publication
   * @param {XMLDocument} hox
   */
  setPublicationCode(hox) {
    // foot/sendinfo/publication, 공개여부
    // <publication code="1NNNNNNNN">공개</publication></sendinfo>
    setText(this.pubdocXml, 'pubdoc foot sendinfo publication', this.feEditor.getFieldText(Cell.DOC_PUBLIC));

    // foot/sendinfo/publication@code
    var publication = getNode(hox, 'docInfo publication');
    var type = getAttr(publication, null, 'type');
    var code = '0';
    if (type == 'pubtype_not') {
      code = '3';
    } else if (type == 'pubtype_open') {
      code = '1';
    } else if (type == 'pubtype_partial') {
      code = '2';
    }

    var publicationFlag = getText(hox, 'docInfo publication publicationFlag');
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

    setAttr(this.pubdocXml, 'pubdoc foot sendinfo publication', 'code', code);
  }

  /**
   * 서버로 업로드
   */
  async upload() {
    const apprID = getText(this.hox, 'docInfo apprID');

    // seal
    const sealNode = getNode(this.pubdocXml, 'pubdoc foot seal img');
    let fnameOfSeal = '';
    let tridOfSeal = '';
    if (sealNode) {
      const imgUrl = getAttr(sealNode, null, 'src');
      if (imgUrl.indexOf('http') > -1) {
        const obj = Capi.getFileFromURL(imgUrl);
        if (obj && obj.TRID) {
          tridOfSeal = obj.TRID;
        }
        fnameOfSeal = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
        setAttr(sealNode, null, 'src', fnameOfSeal); // URL을 다시 파일이름으로 변경
      } else {
        fnameOfSeal = imgUrl;
      }
    }

    // symbol
    const symbolNode = getNode(this.pubdocXml, 'pubdoc foot sendinfo symbol img');
    let fnameOfSymbol = '';
    let tridOfSymbol = '';
    if (symbolNode) {
      const imgUrl = getAttr(symbolNode, null, 'src');
      if (imgUrl.indexOf('http') > -1) {
        const obj = Capi.getFileFromURL(imgUrl);
        if (obj && obj.TRID) {
          tridOfSymbol = obj.TRID;
        }
        fnameOfSymbol = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
        setAttr(symbolNode, null, 'src', fnameOfSymbol); // URL을 다시 파일이름으로 변경
      }
    }

    // logo
    const logoNode = getNode(this.pubdocXml, 'pubdoc foot sendinfo logo img');
    let fnameOflogo = '';
    let tridOflogo = '';
    if (logoNode) {
      const imgUrl = getAttr(logoNode, null, 'src');
      if (imgUrl.indexOf('http') > -1) {
        const obj = Capi.getFileFromURL(imgUrl);
        if (obj && obj.TRID) {
          tridOflogo = obj.TRID;
        }
        fnameOflogo = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
        setAttr(logoNode, null, 'src', fnameOflogo);
      }
    }

    // sign
    const signImageNodes = getNodes(this.pubdocXml, 'pubdoc foot approvalinfo img');
    const fnamesOfSign = [];
    const tridsOfSign = [];
    if (signImageNodes) {
      for (let i = 0, iEnd = signImageNodes.length; i < iEnd; i++) {
        const signImageNode = signImageNodes[i];
        const url = getAttr(signImageNode, null, 'src');
        const obj = Capi.getFileFromURL(url);
        if (obj && obj.TRID) {
          tridsOfSign.push(obj.TRID);
        }
        const signImageName = url.substring(url.lastIndexOf('/') + 1);
        fnamesOfSign.push(signImageName);
        setText(signImageNode, null, 'src', signImageName); // URL을 다시 파일이름으로 변경
      }
    }

    // this.makePubDocTRID();
    const pubdocXmlHeader = `<?xml version="1.0" encoding="euc-kr"?>\r\n<?xml-stylesheet type="text/xsl" href="siheng.xsl"?>\r\n<!DOCTYPE pubdoc SYSTEM "pubdoc.dtd">\r\n`;
    let xmlText = pubdocXmlHeader + serializeXmlToString(this.pubdocXml);
    xmlText = xmlText.replace(/\xA0/g, ' '); // &nbsp;를 공백으로
    const xmlPubdoc = Capi.putXMLFile(xmlText, '', 'euc-kr');
    const pubdocTRID = xmlPubdoc.TRID;

    // this.resetDocumentListUsingEnforceHox();
    const documentIDList = [];
    const documentNameList = [];
    const documentContentNumList = [];
    getNodes(this.hox, ' docInfo objectIDList objectID')
      .filter((obj) => 'deleted' !== obj.getAttribute('dirty'))
      .filter((obj) => 'objectidtype_attach' === obj.getAttribute('type'))
      .forEach((obj) => {
        documentIDList.push(getText(obj, 'ID'));
        documentNameList.push(encodeURIComponent(getText(obj, 'name')));
        documentContentNumList.push(getText(obj, 'contentNumber'));
      });

    const senderName = encodeURIComponent(getText(this.pubdocXml, 'pubdoc foot sendername'));

    let isMultiDraft = false;
    let contentCount = 1;

    const contentIsLdapList = []; // false,true,true
    if (pInfo.isMultiDraft() && rInfo.cltType !== 'control') {
      isMultiDraft = true;

      const contentNodes = getNodes(this.hox, 'hox docInfo content');
      contentCount = contentNodes.length;
      contentNodes.forEach((content) => contentIsLdapList.push(this.#isLdapByContent(content)));
    }

    const url = PROJECT_CODE + '/com/hs/gwweb/appr/uploadPubDoc.act';
    const formData = new FormData();
    formData.append('UID', rInfo.user.ID);
    formData.append('DID', rInfo.user.deptID);
    formData.append('APPRID', apprID);
    formData.append('TRIDOFPUBDOC', pubdocTRID);
    formData.append('FNAMEOFPUBDOC', 'pubdoc.xml');
    formData.append('TRIDOFSEAL', tridOfSeal); // 관인 TRID
    formData.append('FNAMEOFSEAL', fnameOfSeal); // 관인 파일명
    formData.append('TRIDSOFSIGN', tridsOfSign.join(',')); // 서명 TRID
    formData.append('FNAMESOFSIGN', fnamesOfSign.join(',')); // 서명 파일명
    formData.append('TRIDOFSYMBOL', tridOfSymbol); // 심볼 TRID
    formData.append('FNAMEOFSYMBOL', fnameOfSymbol); // 심볼 파일명
    formData.append('TRIDOFLOGO', tridOflogo); // 로고 TRID
    formData.append('FNAMEOFLOGO', fnameOflogo); // 로고 파일명
    formData.append('SENDERNAME', senderName);
    formData.append('ISMULTIDRAFT', isMultiDraft); // 일괄기안 여부
    formData.append('CONTENTCOUNT', contentCount); // 안 갯수

    if (documentIDList.length > 0) {
      formData.append('DOCUMENTIDLIST', documentIDList.join(','));
      formData.append('DOCUMENTNAMELIST', documentNameList.join('|'));
    }

    if (pInfo.isMultiDraft() && rInfo.cltType !== 'control') {
      formData.append('DOCUMENTCONTENTNUMLIST', documentContentNumList.join(','));
      formData.append('CONTENTISLDAPLIST', contentIsLdapList.join(',')); // 안별 LDAP 수신처가 있는지 여부
    }

    const ret = await fetch(url, { method: 'POST', body: formData }).then((res) => res.json());

    console.log('uploadPubDoc END', ret);
  }

  async getNodeByField(field, tempFileName, nodePath) {
    let arg = 'fieldtype:cell;fieldname:' + field;
    if (field === Cell.CBODY) arg = 'fieldtype:clickhere;fieldname:' + field;
    //
    this.feEditor.moveToField(field, true, true, false);
    const saveRet = await this.feEditor.saveServer(tempFileName, 'PUBDOCBODY', arg);
    const fileInfo = Capi.getFileFromURL(saveRet.downloadURL);

    const fieldXmlPubDoc = await loadXml(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveXmlFromWasByTrid.act?TRID=${fileInfo.TRID}&encoding=utf-8`);
    console.log('getNodeByField', field, fieldXmlPubDoc);

    const node = getNode(fieldXmlPubDoc, nodePath);
    const oldNode = getNode(this.pubdocXml, nodePath);
    getNode(this.pubdocXml, 'body').replaceChild(node, oldNode);
  }

  /**
   * 본문을 PUBDOCBODY 변환하여, pubdoc body content에 삽입
   */
  async #setBodyContent() {
    this.feEditor.moveToField(Cell.CBODY, true, true, false);
    // 본문(누름틀)만 옵션을 fieldtype:clickhere 으로 한다
    const saveRet = await this.feEditor.saveServer('tempbody.xml', 'PUBDOCBODY', 'fieldtype:clickhere;fieldname:' + Cell.CBODY);
    const tempBodyXml = await loadXml(saveRet.downloadURL);

    const oriNode = getNode(this.pubdocXml, 'pubdoc body content');
    const newNode = getNode(tempBodyXml, 'pubdoc body content');
    getNode(this.pubdocXml, 'body').replaceChild(newNode, oriNode);
  }

  /**
   * 관인을 PUBDOCBODY 변환하여, pubdoc foot seal img에 삽입
   */
  async #setFootSeal() {
    this.feEditor.moveToField(Cell.SEAL_STAMP, true, true, false);
    const saveRet = await this.feEditor.saveServer('tempseal.xml', 'PUBDOCBODY', 'fieldtype:cell;fieldname:' + Cell.SEAL_STAMP);
    const tempSealXml = await loadXml(saveRet.downloadURL);

    const sealNode = getNode(this.pubdocXml, 'pubdoc foot seal');
    sealNode.setAttribute('omit', false);
    const sealImgNode = getNode(this.pubdocXml, 'pubdoc foot seal img');

    const imgNode = getNode(tempSealXml, 'img');
    const src = imgNode.getAttribute('src');
    // src: ./PIC55ECA293.png
    // saveRet.downloadURL: https://fewebhwp.handysoft.co.kr/webhwpctrl/get/5517D706-5381-41A8-AA46-3CEBB320BDF1/8eae6082-e473-47db-a1f1-d9f517cbc675.pubdocbody
    // fullyURL:            https://fewebhwp.handysoft.co.kr/webhwpctrl/get/5517D706-5381-41A8-AA46-3CEBB320BDF1/PIC55ECA293.png
    const fullyURL = saveRet.downloadURL.substring(0, saveRet.downloadURL.lastIndexOf('/') + 1) + src.substring(src.indexOf('/') + 1);
    imgNode.setAttribute('src', fullyURL);

    sealNode.replaceChild(imgNode, sealImgNode);
  }

  /**
   * 심볼을 PUBDOCBODY 변환하여, foot/sendinfo/symbol에 삽입
   */
  async #setFootSymbol() {
    this.feEditor.moveToField(Cell.SYMBOL, true, true, false);
    const saveRet = await this.feEditor.saveServer('tempsymbol.xml', 'PUBDOCBODY', 'fieldtype:cell;fieldname:' + Cell.SYMBOL);
    const tempSymbolXml = await loadXml(saveRet.downloadURL);

    const imgNode = getNode(tempSymbolXml, 'img');
    const src = imgNode.getAttribute('src');
    const fullyURL = saveRet.downloadURL.substring(0, saveRet.downloadURL.lastIndexOf('/') + 1) + src.substring(src.indexOf('/') + 1);
    imgNode.setAttribute('src', fullyURL);

    const symbolNode = getNode(this.pubdocXml, 'pubdoc foot sendinfo symbol');
    const symbolImgNode = getNode(this.pubdocXml, 'pubdoc foot sendinfo symbol img');
    symbolNode.replaceChild(imgNode, symbolImgNode);
  }

  /**
   * 로고를 PUBDOCBODY 변환하여, foot/sendinfo/logo에 삽입
   */
  async #setFootLogo() {
    this.feEditor.moveToField(Cell.LOGO, true, true, false);
    const saveRet = await this.feEditor.saveServer('templogo.xml', 'PUBDOCBODY', 'fieldtype:cell;fieldname:' + Cell.LOGO);
    const tempLogolXml = await loadXml(saveRet.downloadURL);

    const imgNode = getNode(tempLogolXml, 'img');
    const src = imgNode.getAttribute('src');
    const fullyURL = saveRet.downloadURL.substring(0, saveRet.downloadURL.lastIndexOf('/') + 1) + src.substring(src.indexOf('/') + 1);
    imgNode.setAttribute('src', fullyURL);

    const logoNode = getNode(this.pubdocXml, 'pubdoc foot sendinfo logo');
    const logoImgNode = getNode(this.pubdocXml, 'pubdoc foot sendinfo logo img');
    logoNode.replaceChild(imgNode, logoImgNode);
  }

  /**
   * 사인이미지를 PUBDOCBODY 변환하여, 해당하는 foot approvalinfo approval signimage에 삽입
   * @param {Element} signImageNode
   */
  async #setFootSign(signImageNode) {
    const cellName = signImageNode.getAttribute('cellName');

    this.feEditor.moveToField(cellName, true, true, false);
    const saveRet = await this.feEditor.saveServer('tempsign.xml', 'PUBDOCBODY', 'fieldtype:cell;fieldname:' + cellName);
    const tempSignXml = await loadXml(saveRet.downloadURL);

    const imgNode = getNode(tempSignXml, 'img');
    const src = imgNode.getAttribute('src');
    const fullyURL = saveRet.downloadURL.substring(0, saveRet.downloadURL.lastIndexOf('/') + 1) + src.substring(src.indexOf('/') + 1);
    imgNode.setAttribute('src', fullyURL);

    signImageNode.append(imgNode);
  }
}
