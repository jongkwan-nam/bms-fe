import IDUtils from '../../../utils/IDUtils';
import { getText, serializeXmlToString } from '../../../utils/xmlUtils';
import { dialogSign } from '../dialog/sign';
import { doFinishDoc } from '../do/docInfo';
import { doSetReceiptNumber } from '../do/docNumber';
import { doDoneParticipant, doNewParticipantID } from '../do/participant';
import { isDocCompleted } from '../is/complete';

/**
 * 접수 처리
 */
export default async () => {
  /*
  발송회수 상태 조회
  /bms/com/hs/gwweb/appr/retrieveWithDrawalStatus.act
  - SENDIDLIST: JHOMS240510000214099
  > {"ok":true,"status":0}
  
  신규 접수번호 채번
  /bms/com/hs/gwweb/appr/retrieveNewRceptNo.act
  - UID: 001000001
  - DID: 000010100
  - BASEDID: 000010100
  - sendID: JHOMS240510000214099
  - flag: 3
  > {"rc":0,"msgid":"JHOMS240510000377000","ok":true,"receiptNumber":89}

  /bms/com/hs/gwweb/appr/retrieveNewDocId.act
  - UID: 001000001
  > {"msgid":"JHOMS240510000378000","ok":true}

  /bms/com/hs/gwweb/appr/manageDocRceptDrft.act
  */
  const hox = feMain.hox;
  const feEditor1 = feMain.feEditor1;
  const feAttachBox = feMain.feAttachBox;

  // validation
  const res = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveWithDrawalStatus.act?SENDIDLIST=${rInfo.sendID}`).then((res) => res.json());
  if (res.status === 1) {
    alert(GWWEBMessage.cmsg_975);
    return false;
  }

  // make sign
  const signResult = await dialogSign(hox);
  if (!signResult.ok) {
    // 서명 취소
    return false;
  }

  doSetReceiptNumber(hox, feEditor1);
  doNewParticipantID(hox);
  doDoneParticipant(hox);
  if (isDocCompleted(hox)) {
    doFinishDoc(hox, feEditor1);
  }

  const apprID = getText(hox, 'apprID');
  const orgApprID = getText(hox, 'orgApprID');
  const saveRet = await feEditor1.saveServer(apprID);
  const bodyFileInfo = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/getFileFromURL.act?url=${saveRet.downloadURL}`).then((res) => res.json());
  if (!bodyFileInfo.ok) {
    console.error('downloadURL=%d, bodyFileInfo=%d', saveRet.downloadURL, bodyFileInfo);
    throw new Error('웹한글 파일 저장 오류.');
  }
  const bodyTRID = bodyFileInfo.TRID;

  const formData = new FormData();
  formData.append('UID', rInfo.user.ID);
  formData.append('DID', rInfo.user.deptID);
  formData.append('apprID', apprID);
  formData.append('orgApprID', orgApprID);
  formData.append('ref_' + IDUtils.getObjectID(apprID, 1), bodyTRID); // 본문
  formData.append('block_' + IDUtils.getObjectID(apprID, 2), serializeXmlToString(hox)); // hox

  const ret = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageDocRceptDrft.act`, { method: 'POST', body: formData }).then((res) => res.text());
  //  {RESULT:OK}
  console.log('ret', ret);

  if ('{RESULT:OK}' === ret.trim()) {
    alert('완료되었습니다.');
    return true;
  } else {
    throw new Error('접수에 실패하였습니다.');
  }
};
