export const FeMode = {
  DRAFT: 'draft',
  KYUL: 'kyul',
  VIEW: 'view',
  ACCEPT: 'accept',
  REQUEST: 'request',
  CONTROL: 'control',
};

let feMode = FeMode.DRAFT;
/*
 *            rInfo.appType   rInfo.cltType   rInfo.applID
 * 기안       sancgian        draft
 * 결재       sanckyul        kyul
 * 보기       sancview        view
 * 접수       sancgian        accept
 * 발송의뢰   ctrlmana        request
 * 발송처리   ctrlmana        control
 */
if (rInfo.appType === 'sancgian' && ['draft', 'att-draft', 'pc-draft'].includes(rInfo.cltType)) {
  // 기안
  feMode = FeMode.DRAFT;
} else if (rInfo.appType === 'sancgian' && rInfo.cltType === 'accept') {
  // 접수
  feMode = FeMode.ACCEPT;
} else if (rInfo.appType === 'sanckyul' && rInfo.cltType === 'kyul') {
  // 결재
  feMode = FeMode.KYUL;
} else if (rInfo.appType === 'sancview' && rInfo.cltType === 'view') {
  // 보기
  feMode = FeMode.VIEW;
} else if (rInfo.appType === 'ctrlmana' && rInfo.cltType === 'request') {
  // 발송의뢰
  feMode = FeMode.REQUEST;
} else if (rInfo.appType === 'ctrlmana' && rInfo.cltType === 'control') {
  // 발송처리
  feMode = FeMode.CONTROL;
} else {
  alert('Error unknown mode');
}

console.log(`rInfo appType: ${rInfo.appType}, cltType: ${rInfo.cltType}, applID: ${rInfo.applID} = ${feMode}`);

export const getFeMode = () => {
  return feMode;
};
