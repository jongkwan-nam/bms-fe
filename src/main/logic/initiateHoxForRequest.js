import { addNode, existsNode, getNode } from '../../utils/hoxUtils';

export default (hox) => {
  //
  if (!existsNode(hox, 'docInfo enforceDate')) {
    const nodeOfDocInfo = getNode(hox, 'docInfo');
    addNode(nodeOfDocInfo, 'enforceDate');
  }
};
