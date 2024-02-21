import { addNode, existsNode, getNode } from '../../../utils/xmlUtils';

export default (hox) => {
  //
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
};
