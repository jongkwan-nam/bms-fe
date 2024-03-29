import DateUtils from '../../../utils/DateUtils';
import IDUtils from '../../../utils/IDUtils';
import { getNode, getNodes, getText, setText } from '../../../utils/xmlUtils';

/*
  ref) sanc\sacomm32\Commutil.cpp COMM_SetExamID

 */

/**
 * 완료상태인 문서에 대해서 examID 채번
 * @param {XMLDocument} hox
 * @returns
 */
export const doExamRequest = (hox) => {
  const enforceType = getText(hox, 'docInfo enforceType');
  const formType = getText(hox, 'docInfo formInfo formType');
  const approvalType = getText(hox, 'docInfo approvalType');
  const contentCount = getNodes(hox, 'docInfo content').length;
  //
  if (approvalType !== 'apprtype_normal' || formType !== 'formtype_uniform' || contentCount !== 1) {
    return;
  }
  if (enforceType === 'enforcetype_not') {
    getNode(hox, 'examRequest').textContent = null;
    return;
  }
  if (enforceType === 'enforcetype_internal') {
    if (formType === 'formtype_draft' && doccfg.isDirectInternalEnforce) {
      //
      setText(feMain.hox, 'docInfo enforceDate', todayNow);
      return;
    }
    if (formType === 'formtype_uniform' && doccfg.autoInternalSend) {
      // 심사하지 않고 바로 발송
      setText(feMain.hox, 'docInfo enforceDate', todayNow);
      return;
    }
  }

  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
  setText(hox, 'examRequest conversionDate', todayNow);
  setText(hox, 'examRequest requestDate', todayNow);
  setText(hox, 'examRequest exam examiner participantID', IDUtils.getParticipantIDs(1)[0]);
  setText(hox, 'examRequest exam examStatus', 'apprstatus_ing');
  setText(hox, 'examRequest exam examID', IDUtils.getSancMsgID());
};

/**
 * examRequest 초기 상태 설정
 * - enforceType에 따라 결정
 *
 * @param {XMLDocument} hox
 */
export const doInitExamRequest = (hox) => {
  const enforceType = getText(hox, 'docInfo enforceType');
  //

  if (enforceType === 'enforcetype_not') {
    getNode(hox, 'examRequest').textContent = null;
    return;
  }

  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');

  setText(hox, 'examRequest conversionDate', todayNow);
  setText(hox, 'examRequest requestDate', todayNow);
  setText(hox, 'examRequest exam examiner participantID', IDUtils.NULL_APPRID);
  setText(hox, 'examRequest exam examiner status', 'partapprstatus_will');
  setText(hox, 'examRequest exam examStatus', 'apprstatus_ing');
  setText(hox, 'examRequest exam examID', IDUtils.NULL_APPRID);
};

/**
 * examRequest를 요청 상태로 변경
 * @param {XMLDocument} hox
 */
export const doRequestStatusExamRequest = (hox) => {
  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
  //

  setText(hox, 'examRequest conversionDate', todayNow);
  setText(hox, 'examRequest requestDate', todayNow);
  if (IDUtils.isNullID(getText(hox, 'examRequest exam examiner participantID'))) {
    setText(hox, 'examRequest exam examiner participantID', IDUtils.getParticipantIDs(1)[0]);
  }
  setText(hox, 'examRequest exam examiner status', 'partapprstatus_now');
  setText(hox, 'examRequest exam examStatus', 'apprstatus_request');
  if (IDUtils.isNullID(getText(hox, 'examRequest exam examID'))) {
    setText(hox, 'examRequest exam examID', IDUtils.getSancMsgID());
  }
};

/**
 * examRequest를 발송 완료로 설정
 *
 * @param {XMLDocument} hox
 */
export const doCompleteStatusExamRequest = (hox) => {
  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
  //
  setText(hox, 'examRequest exam examiner position', rInfo.user.positionName);
  setText(hox, 'examRequest exam examiner ID', rInfo.user.ID);
  setText(hox, 'examRequest exam examiner name', rInfo.user.name);
  setText(hox, 'examRequest exam examiner department ID', rInfo.user.deptID);
  setText(hox, 'examRequest exam examiner department name', rInfo.user.deptName);
  setText(hox, 'examRequest exam examiner date', todayNow);
  setText(hox, 'examRequest exam examiner status', 'partapprstatus_done');
  setText(hox, 'examRequest exam examDate', todayNow);
  setText(hox, 'examRequest exam examStatus', 'apprstatus_finish');
};
