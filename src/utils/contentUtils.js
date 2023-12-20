/**
 * 안번호에 맞는 셀명 반환
 * @param {string} cellName 셀명
 * @param {*} contentNumber 안 번호
 * @returns 1안은 셀명 그대로, 2안부터 셀명_안번호
 */
export const getContentCellName = (cellName, contentNumber) => {
  return contentNumber > 1 ? `${cellName}_${contentNumber}` : cellName;
};
