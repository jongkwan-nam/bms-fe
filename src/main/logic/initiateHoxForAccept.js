import StringUtils from '../../utils/StringUtils';
import { addNode, addNodes, existsNode, getNode, getNodes, getText, setAttr, setText } from '../../utils/xmlUtils';
import { doInitDocNumber } from './do/docNumber';

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

  // 단일안 일때 content 내용 채우기
  const contentLength = getNodes(hox, 'docInfo content').length;
  if (contentLength === 1) {
    // pageCnt
    if (!existsNode(hox, 'docInfo content pageCnt')) {
      addNode(getNode(hox, 'docInfo content'), 'pageCnt');
    }
    const pageCnt = getText(hox, 'docInfo content pageCnt');
    if (StringUtils.isBlank(pageCnt) || pageCnt.trim() === '0') {
      setText(hox, 'docInfo content pageCnt', getText(hox, 'docInfo pageCnt'));
    }
    // title
    if (!existsNode(hox, 'docInfo content title')) {
      addNodes(hox, 'docInfo content', 'title');
    }
    const title = getText(hox, 'docInfo content title');
    if (StringUtils.isBlank(title) || title.trim() === '') {
      setText(hox, 'docInfo content title', getText(hox, 'docInfo title'));
    }
  }

  // 문서번호(접수번호) 초기 설정
  doInitDocNumber(hox);
};
