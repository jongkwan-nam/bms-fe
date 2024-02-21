import StringUtils from '../../../utils/StringUtils';
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

/**
 * docInfo content 초기화
 * - title
 * - recipient
 * - sendOrgName
 * - pageCnt
 * @param {XMLDocument} hox
 */
export const doInitContent = (hox) => {
  hox.querySelectorAll('docInfo content').forEach((content) => {
    // title
    let title = content.querySelector('title');
    if (title === null) {
      title = hox.createElement('title');
      content.insertAdjacentElement('afterbegin', title);
    }

    // receiptInfo / recipient
    let receiptInfo = content.querySelector('receiptInfo');
    let recipient = receiptInfo.querySelector('recipient');
    if (recipient === null) {
      recipient = hox.createElement('recipient');
      receiptInfo.insertAdjacentElement('afterbegin', recipient);
    }

    // receiptInfo / sendOrgName 발신기관명 초기값 설정
    let sendOrgName = receiptInfo.querySelector('sendOrgName');
    if (StringUtils.isBlank(sendOrgName.textContent)) sendOrgName.textContent = rInfo.repDept.name;

    // pageCnt
    let pageCnt = content.querySelector('pageCnt');
    if (pageCnt === null) {
      pageCnt = hox.createElement('pageCnt');
      pageCnt.textContent = '1';
      content.insertAdjacentElement('beforeend', pageCnt);
    }
  });
};
