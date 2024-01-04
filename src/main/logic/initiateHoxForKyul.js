import { getNodes, getText, setAttr } from '../../utils/hoxUtils';

export default (hox) => {
  //
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

    if (['partapprstatus_draft', 'partapprstatus_now', 'partapprstatus_will'].includes(approvalStatus) && (id === rInfo.user.ID || chargerID === rInfo.user.ID)) {
      console.log('이게 현재 사용자의 participant이다');
      setAttr(participant, null, 'current', 'true');
    } else {
      setAttr(participant, null, 'current', 'false');
    }
  }
};
