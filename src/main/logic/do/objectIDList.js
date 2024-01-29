import IDUtils from '../../../utils/IDUtils';
import { getNodes, getText, setText, toggleFlag } from '../../../utils/xmlUtils';

/**
 * 첨부 objectID의 ID, participantID를 설정
 * - ID가 null인것만 대상
 *
 * @param {XMLDocument} hox
 * @param {Element} participant 첨부를 추가한 사용자
 */
export const doNewObjectIDofAttach = (hox, participant) => {
  const apprID = getText(hox, 'docInfo apprID');
  //
  const objectIDList = getNodes(hox, 'docInfo objectIDList objectID').filter((objectID) => 'objectidtype_attach' === objectID.getAttribute('type'));

  toggleFlag(hox, 'approvalFlag', 'apprflag_attach', objectIDList.length > 0);

  let maxAttachNumber = Math.max(
    ...objectIDList.map((objectID) => {
      const id = getText(objectID, 'ID');
      return IDUtils.isNullID(id) ? 100 : parseInt(id.substring(17));
    })
  );
  console.debug('doNewObjectIDofAttach maxAttachNumber', maxAttachNumber);

  objectIDList
    .filter((objectID) => IDUtils.isNullID(getText(objectID, 'ID')))
    .forEach((objectID, i) => {
      setText(objectID, 'ID', IDUtils.getObjectID(apprID, maxAttachNumber++));
      setText(objectID, 'participantID', getText(participant, 'participantID'));
    });
};

/**
 * 요약전 objectID의 ID, participantID 설정
 *
 * @param {XMLDocument} hox
 * @param {Element} participant 요약전을 추가한 사용자
 */
export const doNewObjectIDofSummary = (hox, participant) => {
  const apprID = getText(hox, 'docInfo apprID');
  //
  getNodes(hox, 'docInfo objectIDList objectID')
    .filter((objectID) => 'objectidtype_summary' === objectID.getAttribute('type'))
    .forEach((objectID) => {
      setText(objectID, 'ID', IDUtils.getObjectID(apprID, 3));
      setText(objectID, 'participantID', getText(participant, 'participantID'));
    });
};
