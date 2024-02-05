import DateUtils from '../../../utils/DateUtils';
import { getText, setText } from '../../../utils/xmlUtils';
import Cell from '../../CellNames';
import FeEditor from '../../FeEditor';
/*
 * 문서 상태 관리
 * - 주로 docInfo
 */

/**
 * 결재문서를 완료상태로 설정
 *
 * @param {XMLDocument} hox
 * @param {FeEditor} feEditor
 */
export const doFinishDoc = (hox, feEditor) => {
  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
  //
  setText(hox, 'docInfo approvalDate', todayNow);
  setText(hox, 'docInfo approvalStatus', 'apprstatus_finish');

  const approvalType = getText(hox, 'docInfo approvalType');
  if ('apprtype_receipt' === approvalType) {
    feEditor.putFieldText(Cell.ACCEPT_DATE, todayNow.substring(0, 10).replace(/-/g, '.')); // 접수일자
  } else {
    feEditor.putFieldText(Cell.ENFORCE_DATE, todayNow.substring(0, 10).replace(/-/g, '.')); // 시행일자
  }
};
