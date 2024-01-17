import * as DateUtils from '../../../utils/dateUtils';
import { getNode, getText, setText } from '../../../utils/hoxUtils';
import { NULL_APPRID, getParticipantIDs, getSancMsgID } from '../../../utils/idUtils';

/**
 * examRequest 노드 설정
 * - enforceType에 따라 결정
 *
 * @param {XMLDocument} hox
 */
export const doInitExamRequest = (hox) => {
  //
  const enforceType = getText(hox, 'docInfo enforceType');

  if (enforceType === 'enforcetype_not') {
    getNode(hox, 'examRequest').textContent = null;
    return;
  }

  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');

  setText(hox, 'examRequest conversionDate', todayNow);
  setText(hox, 'examRequest requestDate', todayNow);
  setText(hox, 'examRequest exam examiner participantID', NULL_APPRID);
  setText(hox, 'examRequest exam examiner status', 'partapprstatus_will');
  setText(hox, 'examRequest exam examStatus', 'apprstatus_ing');
  setText(hox, 'examRequest exam examID', NULL_APPRID);
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
  setText(hox, 'examRequest exam examiner participantID', getParticipantIDs(1)[0]);
  setText(hox, 'examRequest exam examiner position', rInfo.user.positionName);
  setText(hox, 'examRequest exam examiner ID', rInfo.user.ID);
  setText(hox, 'examRequest exam examiner name', rInfo.user.name);
  setText(hox, 'examRequest exam examiner department ID', rInfo.user.deptID);
  setText(hox, 'examRequest exam examiner department name', rInfo.user.deptName);
  setText(hox, 'examRequest exam examiner status', 'partapprstatus_now');
  setText(hox, 'examRequest exam examStatus', 'apprstatus_request');
  setText(hox, 'examRequest exam examID', getSancMsgID());
};

/**
 * examRequest를 최종 완료로 설정
 *
 * @param {XMLDocument} hox
 */
export const doCompleteStatusExamRequest = (hox) => {
  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
  //
  setText(hox, 'examRequest exam examiner date', todayNow);
  setText(hox, 'examRequest exam examiner status', 'partapprstatus_done');
  setText(hox, 'examRequest exam examDate', todayNow);
  setText(hox, 'examRequest exam examStatus', 'apprstatus_finish');
};
