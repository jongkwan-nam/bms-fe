import { addNodes, existsNode } from '../../../utils/xmlUtils';

/**
 * docInfo publication openStartDate 없으면 추가
 * @param {XMLDocument} hox
 */
export const doInitOpenStartDate = (hox) => {
  if (!existsNode(hox, 'docInfo publication openStartDate')) {
    addNodes(hox, 'docInfo publication', 'openStartDate');
  }
};
