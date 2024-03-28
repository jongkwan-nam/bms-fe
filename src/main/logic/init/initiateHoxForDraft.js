import { doInitViewRange } from '../do/View';
import { doInitClientInfo } from '../do/clientInfo';
import { doInitContent } from '../do/content';
import { doInitDocNumber } from '../do/docNumber';
import { doInitOpenStartDate } from '../do/openStartDate';

/**
 * @param {XMLDocument} hox
 */
export default (hox) => {
  doInitOpenStartDate(hox); // OpenStartDate 초기화

  doInitContent(hox); // content 초기화

  doInitDocNumber(hox); // 문서번호 초기화

  doInitClientInfo(hox, feMain.feEditor1.fieldList); // clientInfo cellInfo 초기화

  doInitViewRange(hox); //열람범위 초기화
};
