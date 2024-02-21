/*
  feElement간의 상호 작용은 hoxEvent를 통한다. 서로를 찾을 필요가 없도록 할것
  logic/*.js에선 feElement의 함수 호출 가능
  hox는 FeMain.js에만 존재. feElement는 window로 노출시킨 FeMain.js의 hox로 접근

  feElement 들은 document에 붙을때(connectedCallback 호출)부터 작동
 */

import FeConfig from './config/FeConfig';
import './main.scss';
import FeAttachBox from './main/FeAttachBox';
import FeContent from './main/FeContent';
import FeContentNavigator from './main/FeContentNavigator';
import FeContentSplitter from './main/FeContentSplitter';
import FeEditor from './main/FeEditor';
import { FeMode, getFeMode } from './main/FeMode';
import ButtonController from './main/button/ButtonController';
import checkMissingNodeAndFillNode from './main/logic/checkMissingNodeAndFillNode';
import initiateBodyByHox from './main/logic/initiateBodyByHox';
import initiateHoxForAccept from './main/logic/initiateHoxForAccept';
import initiateHoxForControl from './main/logic/initiateHoxForControl';
import initiateHoxForDraft from './main/logic/initiateHoxForDraft';
import initiateHoxForKyul from './main/logic/initiateHoxForKyul';
import initiateHoxForRequest from './main/logic/initiateHoxForRequest';
import initiateHoxForView from './main/logic/initiateHoxForView';
import reflectHoxInBody from './main/logic/reflectHoxInBody';
import validateReceivedHox from './main/logic/validateReceivedHox';
import FeStorage from './utils/FeStorage';
import { getCurrentParticipant } from './utils/HoxUtils';
import IDUtils from './utils/IDUtils';
import popupSizeRestorer from './utils/popupSizeRestorer';
import { HoxEventType, dispatchHoxEvent, getNodes, loadXml } from './utils/xmlUtils';

class FeMain {
  hox = null; // Handy Office Xml
  draftHox = null;
  feEditor1 = null;
  feEditor2 = null;
  feEditor4Extra = null;
  feContent = null;
  feAttachBox = null;
  summary = { filePath: null, TRID: null };
  feMode = null;
  splitedExamDocMap = null;

  constructor() {
    //
  }

  async start() {
    console.time('main');

    const hoxTRID = rInfo.hoxFileTRID;
    let wordType = rInfo.WORDTYPE;
    let hoxURL;
    let draftHoxURL;
    let docURL = null;

    this.feMode = getFeMode();
    switch (this.feMode) {
      case FeMode.DRAFT: {
        document.title = 'FE 기안';

        hoxURL = `${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSancLineXmlInfoByTrid.act?TRID=${hoxTRID}`;
        docURL = `${location.origin}${PROJECT_CODE}/com/hs/gwweb/appr/downloadFormFile.act?K=${szKEY}&formID=${rInfo.objForm1.formID}&USERID=${rInfo.user.ID}&WORDTYPE=${wordType}&_NOARG=${Date.now()}`;
        break;
      }
      case FeMode.KYUL: {
        document.title = 'FE 결재';

        hoxURL = `${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSancLineXmlInfoByTrid.act?TRID=${hoxTRID}`;
        docURL = `${location.origin}${PROJECT_CODE}/com/hs/gwweb/appr/retrieveOpenApiDocFile.act?UID=${rInfo.user.ID}&DID=${rInfo.user.deptID}&apprID=${IDUtils.getObjectID(rInfo.apprMsgID, 1)}&sancApprID=${rInfo.apprMsgID}&APPLID=${rInfo.applID}&WORDTYPE=${wordType}&K=${szKEY}&_NOARG=${Date.now()}`;
        break;
      }
      case FeMode.VIEW: {
        document.title = 'FE 조회';

        hoxURL = `${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSancLineXmlInfoByTrid.act?TRID=${hoxTRID}`;
        docURL = `${location.origin}${PROJECT_CODE}/com/hs/gwweb/appr/retrieveOpenApiDocFile.act?UID=${rInfo.user.ID}&DID=${rInfo.user.deptID}&apprID=${IDUtils.getObjectID(rInfo.apprMsgID, 1)}&sancApprID=${rInfo.apprMsgID}&APPLID=${rInfo.applID}&WORDTYPE=${wordType}&K=${szKEY}&_NOARG=${Date.now()}`;
        break;
      }
      case FeMode.ACCEPT: {
        document.title = 'FE 접수';

        hoxURL = `${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSancLineXmlInfoByTrid.act?TRID=${hoxTRID}`;
        draftHoxURL = `${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSanctnXmlInfo.act?appType=sanckyul&UID=${rInfo.user.ID}&DID=${rInfo.user.deptID}&apprID=${rInfo.apprMsgID}&applID=${rInfo.applID}&APPRDEPTID=${rInfo.apprDeptID}&_NOARG=${Date.now()}`;
        docURL = `${location.origin}${PROJECT_CODE}/com/hs/gwweb/appr/retrieveOpenApiDocFile.act?UID=${rInfo.user.ID}&DID=${rInfo.user.deptID}&apprID=${IDUtils.getObjectID(rInfo.apprMsgID, 1)}&sancApprID=${rInfo.apprMsgID}&APPLID=${rInfo.applID}&WORDTYPE=${wordType}&K=${szKEY}&_NOARG=${Date.now()}`;
        break;
      }
      case FeMode.REQUEST: {
        document.title = 'FE 발송의뢰';

        hoxURL = `${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSanctnXmlInfo.act?appType=ctrlmana&UID=${rInfo.user.ID}&DID=${rInfo.user.deptID}&apprID=${rInfo.apprMsgID}&applID=${rInfo.applID}&APPRDEPTID=${rInfo.apprDeptID}`;
        docURL = `${location.origin}${PROJECT_CODE}/com/hs/gwweb/appr/retrieveOpenApiDocFile.act?UID=${rInfo.user.ID}&DID=${rInfo.user.deptID}&apprID=${IDUtils.getObjectID(rInfo.apprMsgID, 1)}&sancApprID=${rInfo.apprMsgID}&APPLID=${rInfo.applID}&WORDTYPE=${wordType}&K=${szKEY}&_NOARG=${Date.now()}`;
        break;
      }
      case FeMode.CONTROL: {
        document.title = 'FE 발송처리';

        hoxURL = `${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSanctnXmlInfo.act?appType=ctrlmana&UID=${rInfo.user.ID}&DID=${rInfo.user.deptID}&apprID=${rInfo.apprMsgID}&applID=${rInfo.applID}&APPRDEPTID=${rInfo.apprDeptID}`;
        docURL = `${location.origin}${PROJECT_CODE}/com/hs/gwweb/appr/retrieveOpenApiDocFile.act?UID=${rInfo.user.ID}&DID=${rInfo.user.deptID}&apprID=${IDUtils.getObjectID(rInfo.apprMsgID, 1)}&sancApprID=${rInfo.apprMsgID}&APPLID=${rInfo.applID}&WORDTYPE=${wordType}&K=${szKEY}&_NOARG=${Date.now()}`;
        break;
      }
      default:
        throw new Error('undefiend FeMode: ' + this.feMode);
    }

    /* ************************************************************************
      hox 로딩
     */
    this.hox = await loadXml(hoxURL);

    /* ************************************************************************
      editor 로딩, 문서 open
     */
    this.feEditor1 = document.querySelector('.editor-wrap').appendChild(new FeEditor('editor1'));
    this.feEditor1.show();
    await this.feEditor1.init(); // 에디터 로딩
    this.feEditor1.setViewZoom(doccfg.docViewRatio); // 보기 모드 설정
    await this.feEditor1.open(docURL); // 문서 열기

    /* ************************************************************************
      문서 오픈 후 할 것들
     */
    switch (this.feMode) {
      case FeMode.DRAFT: {
        this.feEditor1.foldRibbon(false); // 리본메뉴
        this.feEditor1.setReadMode(false);

        checkMissingNodeAndFillNode(this.hox); // 서버에서 받은 기본 hox에 누락된 부분이 있는지 검사해서 채운다
        initiateHoxForDraft(this.hox);
        initiateBodyByHox(this.hox, this.feEditor1); // hox 정보를 기반으로 초기 서식의 내용 채우기
        break;
      }
      case FeMode.KYUL: {
        this.feEditor1.foldRibbon(true);

        checkMissingNodeAndFillNode(this.hox); // 서버에서 받은 기본 hox에 누락된 부분이 있는지 검사해서 채운다
        initiateHoxForKyul(this.hox);
        // TODO 현재 participant의 수정권한 여부로 readmode 설정
        break;
      }
      case FeMode.VIEW: {
        this.feEditor1.setReadMode(true); // 읽기 전용

        initiateHoxForView(this.hox);
        break;
      }
      case FeMode.ACCEPT: {
        this.feEditor1.foldRibbon(true);
        this.feEditor1.setReadMode(true);

        initiateHoxForAccept(this.hox);
        break;
      }
      case FeMode.REQUEST: {
        initiateHoxForRequest(this.hox);
        break;
      }
      case FeMode.CONTROL: {
        initiateHoxForControl(this.hox);
        break;
      }
      default:
        throw new Error('undefiend FeMode: ' + this.feMode);
    }

    this.feEditor1.setEditMode(2); // 편집모드 0: 읽기, 1: 편집, 2: 양식
    this.feEditor1.selectContent(1); // 첫 페이지 이동
    this.feEditor1.start(); // 에디터의 이벤트 시작. 제목변경, hox 이벤트(안 관련)

    /* ************************************************************************
      첨부박스 생성, 초기화
     */
    this.feAttachBox = document.querySelector('.attach-wrap').appendChild(new FeAttachBox());

    /* ************************************************************************
      버튼 컨트롤러
     */
    const buttonController = new ButtonController('.menu-wrap');
    buttonController.start();

    /* ************************************************************************
      결재, 보기: 안 바로가기
     */
    this.feContent = document.querySelector('main').appendChild(new FeContent());
    if ([FeMode.KYUL, FeMode.VIEW].includes(this.feMode)) {
      if (getNodes(this.hox, 'docInfo content').length > 1) {
        this.feContent.classList.add('show');
      }
    }

    /* ************************************************************************
      발송의뢰: 안 분리기, editor2 로딩
     */
    if (this.feMode === FeMode.REQUEST) {
      // 발송대기: 안 분리기 표시
      this.feContentSplitter = document.querySelector('main').appendChild(new FeContentSplitter());
      this.feContentSplitter.classList.add('show');

      // 1st 에디터
      this.feEditor1.setReadMode(true);
      // 2nd 에티터
      this.feEditor2 = document.querySelector('.editor-wrap').appendChild(new FeEditor('editor2'));
      await this.feEditor2.init(); // 에디터 로딩
      this.feEditor2.setViewZoom(doccfg.docViewRatio); // 보기 모드 설정
    }

    /* ************************************************************************
      발송처리: 안 분리기, editor2 로딩
     */
    if (this.feMode === FeMode.CONTROL) {
      // 1st 에디터
      this.feEditor1.setReadMode(true);
      // 2nd 에티터
      this.feEditor2 = document.querySelector('.editor-wrap').appendChild(new FeEditor('editor2'));
      await this.feEditor2.init(); // 에디터 로딩
      this.feEditor2.setViewZoom(doccfg.docViewRatio); // 보기 모드 설정
      await this.feEditor2.loadStampTable();

      // 발송처리: 안 선택기 표시
      this.feContentNavigator = document.querySelector('main').appendChild(new FeContentNavigator());
      this.feContentNavigator.classList.add('show');
    }

    /* ************************************************************************
      설정 UI
     */
    document.querySelector('main').appendChild(new FeConfig());

    console.timeEnd('main');
  }

  /**
   * 현재 안 번호
   */
  getCurrentContentNumber() {
    return this.feContent.currentContentNumber;
  }

  /**
   * 결재정보에서 수정된 hox 수신
   *
   * - 본문과 비교하여 검증. ex) 셀 갯수 대비 결재선이 초과인진 등.
   * - 본문에 반영. 제목, 결재선, 발신기관명, 발신명의, 수신처 등
   */
  receiveHox(receivedHox) {
    //
    // receivedHox 검증
    const validationResult = validateReceivedHox(receivedHox, this.feEditor1);
    console.log('validationResult', validationResult, receivedHox);
    if (!validationResult.ok) {
      return validationResult;
    }

    // 결재정보에서 설정한 내용을 본문에 반영
    const reflectResult = reflectHoxInBody(receivedHox, this.feEditor1);
    console.log('reflectResult', reflectResult);
    if (reflectResult.ok) {
      // NOTICE! this.hox가 재할당되므로, 이전에 this.hox를 받은 class들은 hox 갱신이 되지 않는다!!!
      // this.hox = receivedHox;

      // Node.replaceChild(newChild, oldChild);

      this.hox.querySelector('hox').remove();
      this.hox.appendChild(receivedHox.querySelector('hox'));

      dispatchHoxEvent(this.hox, 'docInfo', HoxEventType.TITLE, 'change', null);
    }

    return reflectResult;
  }

  /**
   * 현재 참여자
   * @returns {participant}
   */
  getCurrentParticipant() {
    return getCurrentParticipant(this.hox);
  }

  /**
   *
   * @returns PC저장용 에디터
   */
  async getEditor4Extra() {
    //
    if (this.feEditor4Extra === null) {
      this.feEditor4Extra = document.querySelector('.editor-wrap').appendChild(new FeEditor('editor4extra'));
      await this.feEditor4Extra.init(); // 에디터 로딩
    }
    return this.feEditor4Extra;
  }
}

window.onerror = (error) => {
  alert(error.toString());
};

popupSizeRestorer('feMain.window.size', 1270, 900);

window.feMain = new FeMain();
window.feMain.start();

resizableGrid();

/**
 * 본문과 첨부박스 크기 조정
 */
function resizableGrid() {
  const TOP_HEIGHT = 300;
  const BOTTOM_HEIGHT = 150;
  const WINDOW_HEIGHT = window.innerHeight;
  let attachBoxHeight = FeStorage.local.getNumber('FeMain.attachBoxHeight', 250);

  const main = document.querySelector('main');
  main.insertAdjacentHTML(
    'afterend',
    ` <div class="divider-layer">
        <div class="divider-top"></div>
        <div class="divider-middle"></div>
        <div class="divider-bottom"></div>
      </div>`
  );
  main.style.gridTemplateRows = `60px 1fr 4px ${attachBoxHeight}px`;
  const dividerLayer = document.querySelector('.divider-layer');
  dividerLayer.style.gridTemplateRows = `${TOP_HEIGHT}px 1fr ${BOTTOM_HEIGHT}px`;
  const divider = document.querySelector('.divider');
  divider.onmousedown = startResize;

  function startResize(e) {
    e.preventDefault();
    if (main.classList.contains('fold-attachbox')) {
      return;
    }
    document.onmouseup = stopResize;
    document.onmousemove = doResize;
    main.classList.add('resize');
  }

  function doResize(e) {
    e.preventDefault();

    let y = e.clientY;
    y = Math.max(y, TOP_HEIGHT);
    y = Math.min(y, WINDOW_HEIGHT - BOTTOM_HEIGHT);

    attachBoxHeight = WINDOW_HEIGHT - y;

    document.querySelector('main').style.gridTemplateRows = `60px 1fr 4px ${attachBoxHeight}px`;
    // console.log(`e.clientY: ${e.clientY} y: ${y} h: ${attachBoxHeight}`);
  }

  function stopResize(e) {
    e.preventDefault();
    document.onmouseup = null;
    document.onmousemove = null;
    main.classList.remove('resize');
    FeStorage.local.set('FeMain.attachBoxHeight', attachBoxHeight);
  }
}
