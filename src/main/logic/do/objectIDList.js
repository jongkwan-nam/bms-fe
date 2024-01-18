import { getNodeArray, getText, setText } from '../../../utils/hoxUtils';
import IDUtils from '../../../utils/IDUtils';

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
  const objectIDList = getNodeArray(hox, 'docInfo objectIDList objectID').filter((objectID) => 'objectidtype_attach' === objectID.getAttribute('type'));
  const maxAttachNumber = Math.max(
    objectIDList.map((objectID) => {
      const id = getText(objectID, 'ID');
      return IDUtils.isNullID(id) ? 0 : parseInt(id.substring(17));
    })
  );

  objectIDList
    .filter((objectID) => IDUtils.isNullID(getText(objectID, 'ID')))
    .forEach((objectID, i) => {
      setText(objectID, 'ID', IDUtils.getObjectID(apprID, maxAttachNumber + i));
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
  getNodeArray(hox, 'docInfo objectIDList objectID')
    .filter((objectID) => 'objectidtype_summary' === objectID.getAttribute('type'))
    .forEach((objectID) => {
      setText(objectID, 'ID', IDUtils.getObjectID(apprID, 3));
      setText(objectID, 'participantID', getText(participant, 'participantID'));
    });
};
