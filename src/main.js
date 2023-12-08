import './main.scss';
// import './main/FeAttachBox';
// import './main/FeContent';
// import './main/FeEditor';
import { loadHox, setTextCDATA } from './utils/hoxUtils';

import FeAttachBox from './main/FeAttachBox';
import FeContent from './main/FeContent';
import FeEditor from './main/FeEditor';
import reflectHoxInBody from './main/reflectHoxInBody';

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

window.hoxToText = () => {
  return new XMLSerializer().serializeToString(hox);
};

/* 상단 메뉴 버튼 --------------------------------------------------------- */

// 결재정보 팝업 호출
document.getElementById('btnApprovalBox').addEventListener('click', (e) => {
  console.log('approvalBox show');

  setTextCDATA(hox, 'docInfo title', feEditor1.title);

  window.open('./approvalBox.html', 'approvalBox', 'width=1020px,height=720px');
});

// 결재올림 클릭
document.getElementById('btnDraft').addEventListener('click', (e) => {
  console.log('btnDraft click');
  // appr id 채번
  // participant id 채번
  // 웹한글 본문 저장
  // bms로 submit
});

document.querySelector('#btnContentAdd').addEventListener('click', (e) => {
  //
  // feAttachBox.addContent();
  // feContent
  if (!feContent) {
    feContent = document.querySelector('main').appendChild(new FeContent());
    feContent.set(hox);
  }
  feContent.classList.add('show');
  feContent.addContent();
});
document.querySelector('#btnContentDel').addEventListener('click', (e) => {
  //
  feAttachBox.removeContent(2);
});
