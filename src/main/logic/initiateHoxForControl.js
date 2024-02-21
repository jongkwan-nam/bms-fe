import StringUtils from '../../utils/StringUtils';
import { addNode, addNodes, existsNode, getNode, getNodes, getText, setText } from '../../utils/xmlUtils';

export default (hox) => {
  // docInfo enforceDate
  if (!existsNode(hox, 'docInfo enforceDate')) {
    const nodeOfDocInfo = getNode(hox, 'docInfo');
    addNode(nodeOfDocInfo, 'enforceDate');
  }
  // examRequest exam examDate
  if (!existsNode(hox, 'examRequest exam examDate')) {
    const node = getNode(hox, 'examRequest exam');
    addNode(node, 'examDate');
  }
  // examRequest exam examiner dutyName
  if (!existsNode(hox, 'examRequest exam examiner dutyName')) {
    const node = getNode(hox, 'examRequest exam examiner');
    addNode(node, 'dutyName');
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
};
