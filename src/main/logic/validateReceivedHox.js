import { getText } from '../../utils/hoxUtils';
import * as StringUtils from '../../utils/stringUtils';

/**
 * validateReceivedHox
 *
 * 결재정보에서 받은 hox 내용 검증
 * - 결재선이 서명cell을 초과하였는지
 *
 * @param {XMLDocument} hox
 * @param {FeEditor} editor
 */
export default (hox, editor) => {
  let ok = true;
  let msg = '';

  // 결재선이 서명cell을 초과하였는지
  const missingParticipants = [];
  const cellNameNodeList = hox.querySelectorAll('approvalFlow participant mappingCell cellName');
  Array.from(cellNameNodeList)
    .filter((cellName) => StringUtils.isNotBlank(cellName.textContent))
    .forEach((cellName) => {
      if (!editor.existField(cellName.textContent)) {
        missingParticipants.push(cellName.closest('participant'));
      }
    });

  if (missingParticipants.length > 0) {
    ok = false;
    msg += `결재자가 서명칸보다 많습니다.
    ▶ 초과된 결재자: ${missingParticipants
      .map((participant) => {
        return `${getText(participant, 'name')}(${getText(participant, 'cellName')})`;
      })
      .join(', ')}
    `;
  }

  // 본문의 서명 갯수

  // 본문의 협조 갯수

  return {
    ok: ok,
    message: msg,
  };
};
