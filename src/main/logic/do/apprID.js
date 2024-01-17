import { getText, setText } from '../../../utils/hoxUtils';
import { NULL_APPRID, getSancMsgID, isNotNullID } from '../../../utils/idUtils';

/**
 * apprID 채번
 * - 기존 값이 있으면, Error
 *
 * @param {XMLDocument} hox
 */
export const doNewApprID = (hox) => {
  const currApprId = getText(hox, 'docInfo apprID');
  if (isNotNullID(currApprId)) {
    throw new Error('docInfo apprID is not null. ' + currApprId);
  }
  const newApprId = getSancMsgID();
  console.debug('new apprID', newApprId);
  setText(hox, 'docInfo apprID', newApprId);
};

/**
 * apprID를 nullID로 바꾼다
 * @param {XMLDocument} hox
 */
export const doDeleteApprID = (hox) => {
  setText(hox, 'docInfo apprID', NULL_APPRID);
};
