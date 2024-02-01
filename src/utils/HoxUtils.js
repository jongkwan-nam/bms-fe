import { getNodes, getText } from './xmlUtils';

/**
 * 안번호에 맞는 셀명 반환
 * @param {string} cellName 셀명
 * @param {*} contentNumber 안 번호
 * @returns 1안은 셀명 그대로, 2안부터 셀명_안번호
 */
export const getContentCellName = (cellName, contentNumber) => {
  return contentNumber > 1 ? `${cellName}_${contentNumber}` : cellName;
};

/**
 * 서명셀이 있는지 여부
 * @param {XMLDocument} hox
 * @returns
 */
export const existSignCell = (hox) => {
  //
  const cellNodes = getNodes(hox, 'clientInfo cellInfo cell');
  for (const cell of cellNodes) {
    //
  }
  return false;
};

/**
 * 최종결재자 participant 반환
 * @param {XMLDocument} hox
 */
export const getLastSignParticipant = (hox) => {
  for (const participant of getNodes(hox, 'approvalFlow participant').reverse()) {
    const validStatus = getText(participant, 'validStatus');
    const approvalType = getText(participant, 'approvalType');

    if (validStatus !== 'valid') {
      continue;
    }
    if (['user_approval', 'user_draft', 'user_jeonkyul', 'user_daekyul'].includes(approvalType)) {
      return participant;
    }
  }
  throw new Error('최종결재자를 찾을수 없음');
};
