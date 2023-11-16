import './main.scss';
import loadHox from './main/loadHox';
import reflectHoxInBody from './main/reflectHoxInBody';
import './main/FeEditor';

let trid = rInfo.hoxFileTRID;
let docUrl = `https://fe.handysoft.co.kr/bms/com/hs/gwweb/appr/downloadFormFile.act?K=${szKEY}&formID=${rInfo.objForm1.formID}&USERID=${rInfo.user.ID}&WORDTYPE=${rInfo.objForm1.wordType}&_NOARG=${Date.now()}`;

let hox;

let feEditor1 = document.querySelector('fe-editor#editor1');
let feEditor2 = document.querySelector('fe-editor#editor2');

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
  hox = await loadHox(trid);

  await feEditor1.init();
  await feEditor1.open(docUrl);

  reflectHoxInBody(hox, feEditor1);
})().catch((error) => {
  console.error(error);
  alert(JSON.stringify(error));
});

window.hox = () => {
  return hox;
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

  hox.querySelector('docInfo title').textContent = feEditor1.title;

  window.open('./approvalBox.html', 'approvalBox', 'width=1020px,height=720px');
});
