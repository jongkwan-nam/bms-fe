import './main.scss';
import FeAttachBox from './main/FeAttachBox';
import FeContent from './main/FeContent';
import FeEditor from './main/FeEditor';
import * as actionDraft from './main/logic/actionDraft';
import checkMissingNodeAndFillNode from './main/logic/checkMissingNodeAndFillNode';
import initiateBodyByHox from './main/logic/initiateBodyByHox';
import reflectHoxInBody from './main/logic/reflectHoxInBody';
import validateReceivedHox from './main/logic/validateReceivedHox';
import SVG from './svg/SVG';
import { loadHox } from './utils/hoxUtils';
import { getObjectID } from './utils/idUtils';

import ButtonController from './main/button/ButtonController';

import { FeMode, getFeMode } from './main/FeMode';

window.onerror = (e) => {
  console.error(e);
  alert(e.message);
};

const hoxTRID = rInfo.hoxFileTRID;
const hoxURL = `${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSancLineXmlInfoByTrid.act?TRID=${hoxTRID}`;

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

class FeMain {
  hox = null;
  feEditor1 = null;
  feEditor2 = null;
  feAttachBox = null; // 첨부박스
  feContent = null; // 안 선택기

  constructor() {
    //
    this.feEditor1 = document.querySelector('.editor-wrap').appendChild(new FeEditor('editor1'));
  }

  /**
   * 이벤트 추가
   * - 결재올림
   * - 결재정보 popup
   * - 안추가 click
   * - 환경설정 toggle
   * - 글자크기 변경
   */
  appendEventListener() {
    /* 결재올림 click */
    document.getElementById('btnDraft').addEventListener('click', async () => {
      // 기안전, validation check
      const validationResult = actionDraft.validate(this.hox);
      if (!validationResult.ok) {
        alert(validationResult.message);
        return;
      }
      // 기안 처리
      console.time('actionDraft.process');
      const processResult = await actionDraft.process(this.hox);
      console.timeEnd('actionDraft.process');
      if (processResult.ok) {
        // 기안 성공 후처리
        alert('완료되었습니다.');
      } else {
        // 기안 실패 후처리
        alert('실패하였습니다. code: ' + processResult.message);
      }
    });

    /* 결재정보 팝업 호출 */
    document.getElementById('btnApprovalBox').addEventListener('click', (e) => {
      window.open('./approvalBox.html', 'approvalBox', 'width=1020px,height=720px');
    });

    /* 안 추가 click */
    document.querySelector('#btnContentAdd').addEventListener('click', (e) => {
      if (!this.feContent) {
        this.feContent = document.querySelector('main').appendChild(new FeContent());
        this.feContent.set(this.hox);
      }
      this.feContent.classList.add('show');
      this.feContent.addContent();
    });

    /* 환경설정 toggle */
    document.getElementById('btnConfig').innerHTML = SVG.option;
    document.getElementById('btnConfig').addEventListener('click', (e) => {
      document.querySelector('#config').classList.toggle('open');
    });
    /* 글자크기 변경 */
    document.querySelector('#fontSize').addEventListener('change', (e) => {
      let size = e.target.value;
      document.querySelector('html').style.fontSize = size + 'px';
    });
  }

  /**
   * 결재정보에서 수정된 hox 수신
   *
   * - 본문과 비교하여 검증. ex) 셀 갯수 대비 결재선이 초과인진 등.
   * - 본문에 반영. 제목, 결재선, 발신기관명, 발신명의, 수신처 등
   * @param {XMLDocument} receivedHox
   * @returns
   */
  receiveHox(receivedHox) {
    // receivedHox 검증
    const validationResult = validateReceivedHox(receivedHox, this.feEditor1);
    if (!validationResult.ok) {
      return validationResult;
    }

    // TODO this.hox가 재할당되므로, 이전에 this.hox를 받은 class들은 hox 갱신이 되지 않는다!!!
    this.hox = receivedHox;
    // 결재정보에서 설정한 내용을 본문에 반영
    reflectHoxInBody(receivedHox, this.feEditor1);

    return { ok: true };
  }

  /**
   * 현재 안 번호
   */
  getCurrentContentNumber() {
    if (this.feContent) {
      // 안바로가기가 설정되어 있으면(즉, 일괄기안이면)
      return this.feContent.currentContentNumber;
    } else {
      // 1안
      return 1;
    }
  }

  async start() {
    // 에디터 로딩
    await this.feEditor1.init();
    // 보기 모드 설정
    this.feEditor1.setViewZoom(doccfg.docViewRatio);
    // 리본메뉴 보이기
    this.feEditor1.foldRibbon(false);
    // 문서 열기
    await this.feEditor1.open(docURL);

    // hox 로딩
    this.hox = await loadHox(hoxURL);
    // hox 설정
    this.feEditor1.set(this.hox);
    // 기안시 할 것들
    if (rInfo.cltType === 'draft') {
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
    this.feAttachBox.set(this.hox);

    //
    const buttonController = new ButtonController('.menu-wrap');
    buttonController.start();
  }
}

(async () => {
  console.time('main');

  const feMain = new FeMain();
  feMain.appendEventListener();
  await feMain.start();

  console.timeEnd('main');

  window.feMain = feMain;
})();
