import { getAttr, getNodes, getText, setAttr } from './xmlUtils';

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

/**
 * 현재 결재자의 participant 노드
 *
 * @param {XMLDocument} hox
 * @returns
 */
export const getCurrentParticipant = (hox) => {
  let participantList = getNodes(hox, 'approvalFlow participant').filter((participant) => getAttr(participant, null, 'current') === 'true');
  if (participantList.length === 0) {
    // current=true 가 없으면, 설정하려고 시도
    setParticipantCurrent(hox);
  }

  participantList = getNodes(hox, 'approvalFlow participant').filter((participant) => getAttr(participant, null, 'current') === 'true');
  if (participantList.length === 0) {
    // 그래도 없으면 에러!
    throw new Error('현재 결재자를 알수 없다');
  }
  return participantList[0];
};

/**
 * 현재 결재자를 결정해 current 속성을 true 로 설정한다.
 *
 * @param {XMLDocument} hox
 */
export const setParticipantCurrent = (hox) => {
  for (const participant of getNodes(hox, 'approvalFlow participant')) {
    const participantID = getText(participant, 'participantID');
    const id = getText(participant, 'ID');
    const name = getText(participant, 'name');
    const type = getText(participant, 'type');
    const approvalType = getText(participant, 'approvalType');
    const approvalStatus = getText(participant, 'approvalStatus');
    const validStatus = getText(participant, 'validStatus');
    const chargerID = getText(participant, 'charger ID');
    console.log(`participant: ${participantID} ${name} id=${id}, type=${type}, approvalType=${approvalType}, approvalStatus=${approvalStatus}, validStatus=${validStatus}, chargerID=${chargerID}`);
    if (validStatus !== 'valid') {
      continue;
    }
    if (type !== 'user') {
      continue;
    }

    if (['partapprstatus_draft', 'partapprstatus_now', 'partapprstatus_will', 'partapprstatus_postpone'].includes(approvalStatus) && (id === rInfo.user.ID || chargerID === rInfo.user.ID)) {
      console.log('이게 현재 사용자의 participant이다');
      setAttr(participant, null, 'current', 'true');
    } else {
      setAttr(participant, null, 'current', 'false');
    }
  }
};
