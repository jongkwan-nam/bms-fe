import { getNodes } from './xmlUtils';

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
