import { doInitClientInfo } from '../do/clientInfo';
import { doInitDocNumber } from '../do/docNumber';

/**
 * @param {XMLDocument} hox
 */
export default (hox) => {
  // 문서번호 오드 초기화
  doInitDocNumber(hox);
  // clientInfo cellInfo 초기화
  doInitClientInfo(hox, feMain.feEditor1.fieldList);
};
