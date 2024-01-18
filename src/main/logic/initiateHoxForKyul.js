import { getNodes, getText, setAttr, setText } from '../../utils/hoxUtils';
import StringUtils from '../../utils/StringUtils';

export default (hox) => {
  // 현재 결재자 결정
  for (const participant of getNodes(hox, 'approvalFlow participant')) {
    const participantID = getText(participant, 'participantID');
    const id = getText(participant, 'ID');
    const type = getText(participant, 'type');
    const approvalType = getText(participant, 'approvalType');
    const approvalStatus = getText(participant, 'approvalStatus');
    const validStatus = getText(participant, 'validStatus');
    const chargerID = getText(participant, 'charger ID');
    console.log(`participant: ${participantID} id=${id}, type=${type}, approvalType=${approvalType}, approvalStatus=${approvalStatus}, validStatus=${validStatus}, chargerID=${chargerID}`);
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

  // 단일안 일때 content/pageCnt가 이전 기안기에서 설정 안됬을수도 있어 검사
  const contentLength = getNodes(hox, 'docInfo content').length;
  if (contentLength === 1) {
    const pageCnt = getText(hox, 'docInfo content pageCnt');
    if (StringUtils.isBlank(pageCnt) || pageCnt === '0') {
      setText(hox, 'docInfo content pageCnt', getText(hox, 'docInfo pageCnt'));
    }
  }
};
