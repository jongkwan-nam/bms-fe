import '../components/FeApprovalType';
import '../components/FeDocNumber';
import '../components/FeEnforceType';
import '../components/FeFlag';
import '../components/FeFolder';
import '../components/FeKeepPeriod';
import '../components/FePageCnt';
import '../components/FePublication';
import '../components/FeSecurityLevel';
import '../components/FeSpecialDoc';
import '../components/FeSpecialList';
import '../components/FeTitle';
import '../components/FeViewRange';
import '../components/FeViewRestriction';

import '../components/FeFlow';
import '../components/FeRecipient';
import '../components/FeSender';

let workingHox;

let feEditor1 = document.querySelector('fe-editor#editor1');

let feEnforceType = document.querySelector('fe-enforcetype');
let feTitle = document.querySelector('fe-title');
let feFlag = document.querySelector('fe-flag');
let feDocNumber = document.querySelector('fe-docnumber');
let feApprovalType = document.querySelector('fe-approvaltype');
let feFolder = document.querySelector('fe-folder');
let feKeepPeriod = document.querySelector('fe-keepperiod');
let feViewRange = document.querySelector('fe-viewrange');
let feViewRestriction = document.querySelector('fe-viewrestriction');
let feSecurityLevel = document.querySelector('fe-securitylevel');
let fePublication = document.querySelector('fe-publication');
let feSpecialDoc = document.querySelector('fe-specialdoc');
let fePageCnt = document.querySelector('fe-pagecnt');
let feSpecialList = document.querySelector('fe-speciallist');

let feFlow = document.querySelector('fe-flow');
let feRecipient = document.querySelector('fe-recipient');
let feSender = document.querySelector('fe-sender');

export const show = (hox) => {
  //
  workingHox = hox;

  feEnforceType.set(workingHox);
  feTitle.set(workingHox);
  feTitle.title = feEditor1.title;

  feFlag.set(workingHox);
  feDocNumber.set(workingHox);
  feApprovalType.set(workingHox);
  feFolder.set(workingHox);
  feKeepPeriod.set(workingHox);
  feViewRange.set(workingHox);
  feViewRestriction.set(workingHox);
  feSecurityLevel.set(workingHox);
  feSpecialDoc.set(workingHox); // fePublication 보다 먼저 설정되어야 한다. 이벤트를 전달받은후 정상동작 하려면
  fePublication.set(workingHox);
  fePageCnt.set(workingHox);
  feSpecialList.set(workingHox);

  feFlow.set(hox);
  feRecipient.set(hox);
  feSender.set(hox);

  document.querySelector('#approvalBox').classList.add('open');
};

/*
 * 각 컴포넌트간 이벤트 전파
 */

// 공개여부 변경 이벤트 리스터
fePublication.addEventListener('change', (e) => {
  // 특수기록물로 공개여부 전파
  feSpecialDoc.dataset.pubtype = e.detail.pubtype;
});

/*
 * 결재정보창 확인, 취소
 */
document.getElementById('btnVerify').addEventListener('click', (e) => {
  console.log('approvalBox verify');
  // 적용 로직
  hox = workingHox;
  feEditor1.title = hox.querySelector('docInfo title').textContent;

  // 닫기
  document.querySelector('#approvalBox').classList.remove('open');
});

document.getElementById('btnCancel').addEventListener('click', (e) => {
  console.log('approvalBox cancel');
  // 닫기
  document.querySelector('#approvalBox').classList.remove('open');
});
