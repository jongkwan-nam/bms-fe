import * as DateUtils from '../../utils/dateUtils';
import { createNode, getAttr, getNode, getNodeArray, getNodes, getNumber, getText, setAttr, setText, toggleFlag } from '../../utils/hoxUtils';
import { getParticipantIDs, getSancMsgID } from '../../utils/idUtils';
import { takeDocNumber } from './docNumber';

/**
 * 통합서식 일괄기안 hox로 시행문 hox를 만든다
 *
 * @param {XMLDocument} multiDraftHox
 * @param {number} contentNumber
 * @returns {XMLDocument} 시행문 hox
 */
export const makeEnforceHox4MultiDoc = (multiDraftHox, contentNumber) => {
  const contentIndex = parseInt(contentNumber) - 1;
  const orgApprID = getText(multiDraftHox, 'docInfo apprID');
  //
  const enforceHox = multiDraftHox.cloneNode(true);

  // 다른 content 노드 제거
  const contentLength = getNodes(enforceHox, 'docInfo content').length;
  for (let i = 0; i < contentLength; i++) {
    const nodeOfContent = getNode(enforceHox, 'docInfo content', i);
    if (i !== contentIndex) {
      nodeOfContent.remove();
    } else {
      // 맞는 안일때, enforce 노드가 있다면 제거
      getNode(nodeOfContent, 'enforce')?.remove();
    }
  }

  // 다른 안의 첨부 objectID 제거
  const nodesOfObjectID = getNodeArray(enforceHox, 'docInfo objectIDList objectID');
  for (let objectID of nodesOfObjectID) {
    const type = getAttr(objectID, null, 'type');
    const number = getNumber(objectID, 'contentNumber');

    if (type !== 'objectidtype_attach') {
      // 첨부가 아니면 남기고
      continue;
    }
    if (number === 0) {
      // 공통첩부 남기고
      continue;
    }
    if (number === contentNumber) {
      // 맞는 안이면, 남기고 contentNumber만 0으로 설정
      setText(objectID, 'contentNumber', 0);
    } else {
      // 다른 안의 첨부 노드 삭제
      objectID.remove();
    }
  }

  // hox type 속성
  setAttr(enforceHox, 'hox', 'type', 'enforce');

  // apprID
  const enforceApprID = getSancMsgID(); // 시행문의 apprID 채번
  setText(enforceHox, 'docInfo apprID', enforceApprID);

  // draftApprID
  getNode(enforceHox, 'docInfo').prepend(createNode(`<draftApprID>${orgApprID}</draftApprID>`));

  // title, enforceType
  const contentTitle = getText(enforceHox, 'docInfo content title');
  const contentEnforceType = getText(enforceHox, 'docInfo content enforceType');
  setText(enforceHox, 'docInfo title', contentTitle);
  setText(enforceHox, 'docInfo enforceType', contentEnforceType);

  // examRequest exam examStatus
  setText(enforceHox, 'examRequest exam examStatus', 'apprstatus_finish');

  // docNumber 채번
  takeDocNumber(enforceHox);

  // participantID 채번
  const participantLength = getNodes(enforceHox, 'approvalFlow participant').length;
  getParticipantIDs(participantLength).forEach((id, i) => {
    getNode(enforceHox, 'approvalFlow participant participantID', i).textContent = id;
  });

  return enforceHox;
};

/**
 * 기안서식에서 시행문 hox 만들기
 * @param {XMLDocument} draftFormHox
 */
export const makeEnforceHox4DraftForm = (draftFormHox) => {
  //
  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
  const orgApprID = getText(draftFormHox, 'docInfo apprID');
  //
  const enforceHox = draftFormHox.cloneNode(true);

  // hox type 속성
  setAttr(enforceHox, 'hox', 'type', 'enforce');

  // apprID
  const enforceApprID = getSancMsgID(); // 시행문의 apprID 채번
  setText(enforceHox, 'docInfo apprID', enforceApprID);

  // draftApprID
  getNode(enforceHox, 'docInfo').prepend(createNode(`<draftApprID>${orgApprID}</draftApprID>`));

  // enforceDate
  setText(enforceHox, 'docInfo enforceDate', todayNow);

  // examRequest exam
  setText(enforceHox, 'docInfo examRequest exam examiner position', rInfo.user.positionName);
  setText(enforceHox, 'docInfo examRequest exam examiner ID', rInfo.user.ID);
  setText(enforceHox, 'docInfo examRequest exam examiner name', rInfo.user.name);
  setText(enforceHox, 'docInfo examRequest exam examiner date', todayNow);
  setText(enforceHox, 'docInfo examRequest exam examiner status', 'partapprstatus_done');
  setText(enforceHox, 'docInfo examRequest exam examDate', todayNow);
  setText(enforceHox, 'docInfo examRequest exam examStatus', 'apprstatus_finish');

  // participantID 채번
  const participantLength = getNodes(enforceHox, 'approvalFlow participant').length;
  getParticipantIDs(participantLength).forEach((id, i) => {
    getNode(enforceHox, 'approvalFlow participant participantID', i).textContent = id;
  });

  // content enforce formInfo를 docInfo formInfo로 교체
  const nodeOfFormInfo = getNode(draftFormHox, 'content enforce formInfo').cloneNode(true);
  getNode(enforceHox, 'docInfo content enforce').remove();
  getNode(enforceHox, 'docInfo').append(nodeOfFormInfo);

  // 공람 제거
  toggleFlag(enforceHox, 'docInfo approvalFlag', 'apprflag_pubshow', false);
  getNode(enforceHox, 'pubShowInfo').textContent = null;
};
