import { HANDYDEF } from '../../../ini/handydefini';
import { setText } from '../../../utils/xmlUtils';

/**
 * 열람범위 초기화
 * - handydef.ini.js에 설정 되어있는 값으로 초기화
 * - all이나 org가 아닌 값일 경우 dept로 초기화
 *
 * @param {XMLDocument} hox
 */

export const doInitViewRange = (hox) => {
  let ViewRangeDefault = HANDYDEF.Sanction['ViewRangeDefault'];
  if (ViewRangeDefault !== 'all' || ViewRangeDefault !== 'org') {
    ViewRangeDefault = 'dept';
  }
  setText(hox, 'docInfo viewRange', ViewRangeDefault);
};
