import DateUtils from '../../../utils/DateUtils';
import IDUtils from '../../../utils/IDUtils';
import { getNodes, getText, setText } from '../../../utils/xmlUtils';

/**
 * participantID 채번
 * - NullID인것만 채번한다
 */
export const doNewParticipantID = (hox) => {
  //
  const nullParticipantID = getNodes(hox, 'approvalFlow participant participantID').filter((pID) => IDUtils.isNullID(pID.textContent));
  if (nullParticipantID.length > 0) {
    const idList = IDUtils.getParticipantIDs(nullParticipantID.length);
    nullParticipantID.forEach((pID, i) => (pID.textContent = idList[i]));
  }
};

/**
 * 현재 결재자를 완료로 설정
 *
 * @param {XMLDocument} hox
 */
export const doDoneParticipant = (hox) => {
  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
  //
  const participant = getNodes(hox, 'approvalFlow participant')
    .filter((participant) => 'valid' === getText(participant, 'validStatus'))
    .filter((participant) => 'true' === participant.getAttribute('current'))[0];
  setText(participant, 'date', todayNow);
  setText(participant, 'approvalStatus', 'partapprstatus_done');
};
