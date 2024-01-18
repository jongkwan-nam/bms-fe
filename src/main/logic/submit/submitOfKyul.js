import { getText, serializeHoxToString } from '../../../utils/hoxUtils';
import { getObjectID } from '../../../utils/idUtils';
import { dialogSign } from '../dialog/sign';
import { doSetContentAttachID } from '../do/content';
import { doFinishDoc } from '../do/docInfo';
import { doSetDocNumber } from '../do/docNumber';
import { doSetEnforceType } from '../do/enforceType';
import { doInitExamRequest, doRequestStatusExamRequest } from '../do/examRequest';
import { doNewObjectIDofAttach } from '../do/objectIDList';
import { doDoneParticipant, doNewParticipantID } from '../do/participant';
import { isAutoSendDoc } from '../is/autoSend';
import { isDocCompleted } from '../is/complete';
import { validateForKyul } from '../validator/forKyul';

export default async () => {
  // validation check
  // 서명 선택 UI 및 선택 적용
  // hox: apprID 채번
  // hox: participantID 채번
  // hox: objectID 中 첨부 설정. 채번 및 participantID 등 설정
  // hox: objectID 中 요약전 설정.
  // hox: content attach 설정
  // hox: content/enforceType 값들로 docInfo/enforceType 설정
  // hox: docInfo/enforceType 애 따라 examRequest 설정
  // hox: 현재 결재자 participant 완료 처리
  // if 완료되는 문서라면
  //   > hox: 문서번호 채번
  //   > hox: 완료로 설정
  //   > if 자동발송 문서라면
  //       > hox: 시행문 hox 생성
  // submit

  const hox = feMain.hox;
  const feEditor1 = feMain.feEditor1;
  const feAttachBox = feMain.feAttachBox;

  const validationResult = validateForKyul(hox);
  if (!validationResult.ok) {
    alert(validationResult.message);
    return;
  }

  const signResult = await dialogSign(hox);
  if (!signResult.ok) {
    // 서명 취소
    return;
  }

  const currentParticipant = feMain.getCurrentParticipant();

  // doNewApprID(hox);
  doNewParticipantID(hox);
  doNewObjectIDofAttach(hox, currentParticipant);
  // doNewObjectIDofSummary(hox, currentParticipant);
  doSetContentAttachID(hox);
  doSetEnforceType(hox);
  doInitExamRequest(hox);
  doDoneParticipant(hox);
  if (isDocCompleted(hox)) {
    doSetDocNumber(hox);
    doFinishDoc(hox);
    if (isAutoSendDoc(hox)) {
      doRequestStatusExamRequest(hox);
    }
  }

  const apprID = getText(hox, 'apprID');
  const downloadURL = await feEditor1.saveServer(apprID);
  const bodyFileInfo = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/getFileFromURL.act?url=${downloadURL}`).then((res) => res.json());
  if (!bodyFileInfo.ok) {
    console.error('downloadURL=%d, bodyFileInfo=%d', downloadURL, bodyFileInfo);
    throw new Error('웹한글 파일 저장 오류.');
  }
  const bodyTRID = bodyFileInfo.TRID;

  // bms로 submit
  /**
   * /bms/com/hs/gwweb/appr/manageDocProgrs.act
   */
  const formData = new FormData();
  formData.append('apprID', apprID);
  formData.append('UID', rInfo.user.ID);
  formData.append('DID', rInfo.user.deptID);
  formData.append('WORDTYPE', rInfo.WORDTYPE);
  // 본문
  formData.append('ref_' + getObjectID(apprID, 1), bodyTRID);
  // 첨부
  feAttachBox.listFileIDs().forEach((trid, i) => {
    formData.append('ref_' + getObjectID(apprID, 100 + i), trid);
  });
  // 요약전
  if (feMain.summary.TRID !== null) {
    formData.append('ref_' + getObjectID(apprID, 3), feMain.summary.TRID);
  }
  // hox
  formData.append('block_' + getObjectID(apprID, 2), serializeHoxToString(hox));

  const ret = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageDocProgrs.act`, {
    method: 'POST',
    body: formData,
  }).then((res) => res.text());
  //  {RESULT:OK}
  console.log('ret', ret);

  if ('{RESULT:OK}' === ret.trim()) {
    alert('완료되었습니다.');
  } else {
    throw new Error('기안에 실패하였습니다. ' + ret.trim());
  }
};