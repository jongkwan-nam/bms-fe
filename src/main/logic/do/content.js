import { addNode, getNode, getNodes, getNumber, getText } from '../../../utils/xmlUtils';

/**
 * 첨부 objectID 정보를 content의 attachInfo에 설정
 *
 * @param {XMLDocument} hox
 */
export const doSetContentAttachID = (hox) => {
  // 초기화
  getNodes(hox, 'docInfo content attachInfo attach').forEach((attach) => (attach.textContent = null));

  getNodes(hox, 'docInfo objectIDList objectID')
    .filter((objectID) => 'objectidtype_attach' === objectID.getAttribute('type'))
    .forEach((objectID) => {
      //
      const id = getText(objectID, 'ID');
      const contentNumber = getNumber(objectID, 'contentNumber', 0);
      if (contentNumber === 0) {
        // 공통 첨부라면 모든 content attach에 붙인다
        getNodes(hox, 'content attachInfo attach').forEach((attach) => addNode(attach, 'ID', id));
      } else {
        const attach = getNode(hox, 'content attachInfo attach', contentNumber - 1);
        addNode(attach, 'ID', id);
      }
    });
};
