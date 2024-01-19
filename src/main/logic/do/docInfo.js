import DateUtils from '../../../utils/DateUtils';
import { setText } from '../../../utils/xmlUtils';
/*
 * 문서 상태 관리
 * - 주로 docInfo
 */

/**
 * 결재문서를 완료상태로 설정
 *
 * @param {XMLDocument} hox
 */
export const doFinishDoc = (hox) => {
  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
  //
  setText(hox, 'docInfo approvalDate', todayNow);
  setText(hox, 'docInfo approvalStatus', 'apprstatus_finish');
};
