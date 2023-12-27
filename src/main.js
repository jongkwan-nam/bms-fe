/*
  feElement간의 상호 작용은 hoxEvent를 통한다. 서로를 찾을 필요가 없도록 할것
  [logic].js에선 feElement의 함수 호출 가능
  hox는 FeMain.js에만 존재. feElement는 window로 노출시킨 FeMain.js의 hox로 접근

  feElement 들은 document에 붙을때(connectedCallback 호출)부터 작동
 */
import FeConfig from './config/FeConfig';
import './main.scss';
import FeAttachBox from './main/FeAttachBox';
import FeContent from './main/FeContent';
import FeEditor from './main/FeEditor';
import { FeMode, getFeMode } from './main/FeMode';
import ButtonController from './main/button/ButtonController';
import checkMissingNodeAndFillNode from './main/logic/checkMissingNodeAndFillNode';
import initiateBodyByHox from './main/logic/initiateBodyByHox';
import reflectHoxInBody from './main/logic/reflectHoxInBody';
import validateReceivedHox from './main/logic/validateReceivedHox';
import FeStorage from './utils/FeStorage';
import { loadHox } from './utils/hoxUtils';
import { getObjectID } from './utils/idUtils';
import popupSizeRestorer from './utils/popupSizeRestorer';

popupSizeRestorer('feMain.window.size', 1270, 900);

class FeMain {
  hox = null;
  feEditor1 = null;
  feEditor2 = null;
  feContent = null;
  feAttachBox = null;
  buttonController = null;
  summary = { filePath: null, TRID: null };

  constructor() {
    //
  }

  async start() {
    console.time('main');

    const hoxTRID = rInfo.hoxFileTRID;
    const hoxURL = `${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSancLineXmlInfoByTrid.act?TRID=${hoxTRID}`;
    // hox 로딩
    this.hox = await loadHox(hoxURL);

    this.feEditor1 = document.querySelector('.editor-wrap').appendChild(new FeEditor('editor1'));

    let docURL = null;
    let feMode = getFeMode();
    switch (feMode) {
      case FeMode.DRAFT: {
        document.title = 'FE 기안기';
        docURL = `${location.origin}${PROJECT_CODE}/com/hs/gwweb/appr/downloadFormFile.act?K=${szKEY}&formID=${rInfo.objForm1.formID}&USERID=${rInfo.user.ID}&WORDTYPE=${rInfo.objForm1.wordType}&_NOARG=${Date.now()}`;
        break;
      }
      case FeMode.KYUL: {
        document.title = 'FE 결재기';
        docURL = `${location.origin}${PROJECT_CODE}/com/hs/gwweb/appr/retrieveOpenApiDocFile.act?UID=${rInfo.user.ID}&DID=${rInfo.user.deptID}&apprID=${getObjectID(rInfo.apprMsgID, 1)}&sancApprID=${rInfo.apprMsgID}&APPLID=${rInfo.applID}&WORDTYPE=${rInfo.objForm1.wordType}&_NOARG=${Date.now()}&K=${szKEY}`;
        break;
      }
      case FeMode.VIEW: {
        break;
      }
      case FeMode.ACCEPT: {
        break;
      }
      case FeMode.REQUEST: {
        break;
      }
      case FeMode.CONTROL: {
        break;
      }
      default:
        throw new Error('undefiend FeMode: ' + feMode);
    }

    // 에디터 로딩
    await this.feEditor1.init();
    // 보기 모드 설정
    this.feEditor1.setViewZoom(doccfg.docViewRatio);
    // 리본메뉴 보이기
    this.feEditor1.foldRibbon(false);
    // 문서 열기
    await this.feEditor1.open(docURL);

    // 기안시 할 것들
    if (feMode === FeMode.DRAFT) {
      // 서버에서 받은 기본 hox에 누락된 부분이 있는지 검사해서 채운다
      checkMissingNodeAndFillNode(this.hox);
      // hox 정보를 기반으로 초기 서식의 내용 채우기
      initiateBodyByHox(this.hox, this.feEditor1);
    }

    // 양식모드 설정
    this.feEditor1.setEditMode(2);
    // 첫 페이지 이동
    this.feEditor1.selectContent(1);

    // 첨부박스 생성, 초기화
    this.feAttachBox = document.querySelector('.attach-wrap').appendChild(new FeAttachBox());

    // 버튼 컨트롤러
    this.buttonController = new ButtonController('.menu-wrap');
    this.buttonController.start();

    this.feContent = document.querySelector('main').appendChild(new FeContent());

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
      // TODO this.hox가 재할당되므로, 이전에 this.hox를 받은 class들은 hox 갱신이 되지 않는다!!!
      window.feMain.hox = receivedHox;
    }

    return reflectResult;
  }
}

window.feMain = new FeMain();
window.feMain.start();

window.onerror = (error) => {
  alert(error.toString());
};

resizableGrid();

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
