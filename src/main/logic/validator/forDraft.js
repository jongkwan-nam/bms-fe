import { getNodes, getNumber, getText } from '../../../utils/hoxUtils';
import IDUtils from '../../../utils/IDUtils';
import StringUtils from '../../../utils/StringUtils';

/**
 * 기안전 validation
 *
 * @param {XMLDocument} hox
 * @returns
 */
export const validateForDraft = (hox) => {
  let ok = true;
  let msg = '';

  // 제목
  if (StringUtils.isBlank(getText(hox, 'docInfo title'))) {
    ok = false;
    msg += `결재제목이 설정되지 않았습니다.\n`;
  }
  getNodes(hox, 'docInfo content').forEach((content, i) => {
    if (StringUtils.isBlank(getText(content, 'title'))) {
      ok = false;
      msg += `${i + 1}안의 결재제목이 설정되지 않았습니다.\n`;
    }
  });

  // 기록물철
  if (IDUtils.isNullID(getText(hox, 'docInfo folderInfo ID'))) {
    ok = false;
    msg += `기록물철이 선택되지 않았습니다.\n`;
  }

  // 쪽수
  // TODO 단순이 0보다 크다가 아니고, 본문과 첨북 갯수로 체크해야 한다
  if (getNumber(hox, 'docInfo > pageCnt') < 1) {
    ok = false;
    msg += `쪽수가 잘못 되었습니다.\n`;
  }
  getNodes(hox, 'docInfo content').forEach((content, i) => {
    if (getNumber(content, 'pageCnt') < 1) {
      ok = false;
      msg += `${i + 1}안의 쪽수가 잘못 되었습니다.\n`;
    }
  });

  return {
    ok: ok,
    message: msg,
  };
};
