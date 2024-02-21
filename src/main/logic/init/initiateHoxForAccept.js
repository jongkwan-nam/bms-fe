import { setParticipantCurrent } from '../../../utils/HoxUtils';
import StringUtils from '../../../utils/StringUtils';
import { addNode, addNodes, existsNode, getNode, getNodes, getText, setText } from '../../../utils/xmlUtils';
import { doInitDocNumber } from '../do/docNumber';

export default (hox) => {
  // 현재 결재자 결정
  setParticipantCurrent(hox);

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

  // approvalStatus
  setText(hox, 'docInfo approvalStatus', 'apprstatus_ing');

  // 문서번호(접수번호) 초기 설정
  doInitDocNumber(hox);
};
