import { addNode, getNode, getNodeArray, getNodes, getNumber, getText } from '../../../utils/hoxUtils';

/**
 * 첨부 objectID 정보를 content의 attachInfo에 설정
 *
 * @param {XMLDocument} hox
 */
export const doSetContentAttachID = (hox) => {
  // 초기화
  getNodes(hox, 'docInfo content attachInfo attach').forEach((attach) => (attach.textContent = null));

  getNodeArray(hox, 'docInfo objectIDList objectID')
    .filter((objectID) => 'objectidtype_attach' === objectID.getAttribute('type'))
    .forEach((objectID) => {
      //
      let contentNumber = getNumber(objectID, 'contentNumber', 0);
      if (contentNumber === 0) {
        // 공통 첨부라면 1안 content에 붙인다
        contentNumber = 1;
      }
      const nodeOfAttach = getNode(hox, 'content attachInfo attach', contentNumber - 1);
      addNode(nodeOfAttach, 'ID', getText(objectID, 'ID'));
    });
};
