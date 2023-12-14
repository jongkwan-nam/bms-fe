import './main.scss';
// import './main/FeAttachBox';
// import './main/FeContent';
// import './main/FeEditor';
import SVG from './svg/SVG';
import { loadHox } from './utils/hoxUtils';

import FeAttachBox from './main/FeAttachBox';
import FeContent from './main/FeContent';
import FeEditor from './main/FeEditor';
import FeSignDialog from './main/FeSignDialog';
import checkMissingNodeAndFillNode from './main/logic/checkMissingNodeAndFillNode';
import reflectHoxInBody from './main/logic/reflectHoxInBody';

let trid = rInfo.hoxFileTRID;
let docUrl = `https://fe.handysoft.co.kr/bms/com/hs/gwweb/appr/downloadFormFile.act?K=${szKEY}&formID=${rInfo.objForm1.formID}&USERID=${rInfo.user.ID}&WORDTYPE=${rInfo.objForm1.wordType}&_NOARG=${Date.now()}`;

let hox;

// let feEditor1 = document.querySelector('fe-editor#editor1');
// let feEditor2 = document.querySelector('fe-editor#editor2');

let feEditor1 = document.querySelector('.editor-wrap').appendChild(new FeEditor());
feEditor1.id = 'editor1';

// let feAttachBox = document.querySelector('fe-attachbox');
let feAttachBox;

let feContent;

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

(async () => {
  //
  await feEditor1.init();

  hox = await loadHox(trid);

  feEditor1.setViewZoom(doccfg.docViewRatio);
  feEditor1.foldRibbon(false);

  await feEditor1.open(docUrl);

  if (rInfo.cltType === 'draft') {
    // 서버에서 받은 기본 hox에 누락된 부분이 있는지 검사해서 채운다
    checkMissingNodeAndFillNode(hox);
  }

  feEditor1.set(hox);

  reflectHoxInBody(hox, feEditor1);

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

window.receiveHox = (modifiedHox) => {
  // modifiedHox 검증

  hox = modifiedHox;

  reflectHoxInBody(hox, feEditor1);

  return {
    ok: true,
  };
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
document.getElementById('btnDraft').addEventListener('click', (e) => {
  console.log('btnDraft click');
  // 서명선택
  document.querySelector('#approvalBox').classList.add('open');
  const feSignDialog = document.querySelector('#approvalBox .modal-body').appendChild(new FeSignDialog());
  feSignDialog.open();

  // appr id 채번
  // participant id 채번
  // 웹한글 본문 저장
  // bms로 submit
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
document.getElementById('btnConfig').innerHTML = SVG.config;
document.getElementById('btnConfig').addEventListener('click', (e) => {
  document.querySelector('#config').classList.toggle('open');
});
document.querySelector('#fontSize').addEventListener('change', (e) => {
  let size = e.target.value;
  document.querySelector('html').style.fontSize = size + 'px';
});
