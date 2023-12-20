// import './main/FeAttachBox';
// import './main/FeContent';
// import './main/FeEditor';
import './main.scss';

import FeAttachBox from './main/FeAttachBox';
import FeContent from './main/FeContent';
import FeEditor from './main/FeEditor';

import actionDraft from './main/logic/actionDraft';
import checkMissingNodeAndFillNode from './main/logic/checkMissingNodeAndFillNode';
import initiateBodyByHox from './main/logic/initiateBodyByHox';
import reflectHoxInBody from './main/logic/reflectHoxInBody';
import validateReceivedHox from './main/logic/validateReceivedHox';

import SVG from './svg/SVG';

import { loadHox } from './utils/hoxUtils';

let trid = rInfo.hoxFileTRID;
let docUrl = `https://fe.handysoft.co.kr/bms/com/hs/gwweb/appr/downloadFormFile.act?K=${szKEY}&formID=${rInfo.objForm1.formID}&USERID=${rInfo.user.ID}&WORDTYPE=${rInfo.objForm1.wordType}&_NOARG=${Date.now()}`;

let hox;
let feEditor1;
let feAttachBox; // 첨부박스
let feContent; // 안 선택기

feEditor1 = document.querySelector('.editor-wrap').appendChild(new FeEditor());
feEditor1.id = 'editor1';

console.log(rInfo.appType, rInfo.cltType, rInfo.applID);
/*
 *            rInfo.appType   rInfo.cltType   rInfo.applID
 * 기안       sancgian        draft
 * 결재       sanckyul        kyul
 * 보기       sancview        view
 * 접수       sancgian        accept
 * 발송의뢰   ctrlmana        request
 * 발송처리   ctrlmana        control
 */
if (rInfo.appType === 'sancgian' && rInfo.cltType === 'draft') {
  // 기안
} else if (rInfo.appType === 'sancgian' && rInfo.cltType === 'accept') {
  // 접수
} else if (rInfo.appType === 'sanckyul' && rInfo.cltType === 'kyul') {
  // 결재
} else if (rInfo.appType === 'sancview' && rInfo.cltType === 'view') {
  // 보기
} else if (rInfo.appType === 'ctrlmana' && rInfo.cltType === 'request') {
  // 발송의뢰
} else if (rInfo.appType === 'ctrlmana' && rInfo.cltType === 'control') {
  // 발송처리
}

(async () => {
  // 에디터 로딩
  await feEditor1.init();
  // 보기 모드 설정
  feEditor1.setViewZoom(doccfg.docViewRatio);
  // 리본메뉴 보이기
  feEditor1.foldRibbon(false);
  // 문서 열기
  await feEditor1.open(docUrl);

  // hox 로딩
  hox = await loadHox(trid);
  // hox 설정
  feEditor1.set(hox);
  // 기안시 할 것들
  if (rInfo.cltType === 'draft') {
    // 서버에서 받은 기본 hox에 누락된 부분이 있는지 검사해서 채운다
    checkMissingNodeAndFillNode(hox);
    // hox 정보를 기반으로 초기 서식의 내용 채우기
    initiateBodyByHox(hox, feEditor1);
  }

  // 양식모드 설정
  feEditor1.setEditMode(2);
  // 첫 페이지 이동
  feEditor1.selectContent(1);

  // 첨부박스 생성, 초기화
  feAttachBox = document.querySelector('.attach-wrap').appendChild(new FeAttachBox());
  feAttachBox.set(hox);
  //
})().catch((error) => {
  console.error(error);
  alert(JSON.stringify(error));
});

window.hox = () => {
  return hox;
};

window.hwpCtrl = () => {
  return document.querySelector('fe-editor').hwpCtrl;
};

/**
 * 결재정보에서 수정된 hox 수신
 *
 * - 본문과 비교하여 검증. ex) 셀 갯수 대비 결재선이 초과인진 등.
 * - 본문에 반영. 제목, 결재선, 발신기관명, 발신명의, 수신처 등
 * @param {XMLDocument} receivedHox
 * @returns
 */
window.receiveHox = (receivedHox) => {
  // receivedHox 검증
  const validationResult = validateReceivedHox(receivedHox, feEditor1);
  if (!validationResult.ok) {
    return validationResult;
  }

  hox = receivedHox;
  // 결재정보에서 설정한 내용을 본문에 반영
  reflectHoxInBody(receivedHox, feEditor1);

  return { ok: true };
};

window.getCurrentContentNumber = () => {
  if (feContent) {
    // 안바로가기가 설정되어 있으면(즉, 일괄기안이면)
    return feContent.currentContentNumber;
  } else {
    // 1안
    return 1;
  }
};

window.hoxToText = () => {
  return new XMLSerializer().serializeToString(hox);
};

/* 상단 메뉴 버튼 --------------------------------------------------------- */

/* 결재올림 click */
document.getElementById('btnDraft').addEventListener('click', () => {
  actionDraft(hox).then(() => {
    // 기안 처리 후 할것들
  });
});

/* 결재정보 팝업 호출 */
document.getElementById('btnApprovalBox').addEventListener('click', (e) => {
  window.open('./approvalBox.html', 'approvalBox', 'width=1020px,height=720px');
});

/* 안 추가 click */
document.querySelector('#btnContentAdd').addEventListener('click', (e) => {
  if (!feContent) {
    feContent = document.querySelector('main').appendChild(new FeContent());
    feContent.set(hox);
  }
  feContent.classList.add('show');
  feContent.addContent();
});

/* 환경설정 */
document.getElementById('btnConfig').innerHTML = SVG.option;
document.getElementById('btnConfig').addEventListener('click', (e) => {
  document.querySelector('#config').classList.toggle('open');
});
document.querySelector('#fontSize').addEventListener('change', (e) => {
  let size = e.target.value;
  document.querySelector('html').style.fontSize = size + 'px';
});
