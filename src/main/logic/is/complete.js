/*
 * 완료 조건
 */

import { getNodeArray, getText } from '../../../utils/xmlUtils';

/**
 * 문서가 최종완료 상태인가
 * - participant를 조사하여, 결재자가 남아 있는지 여부로 판단
 *
 * @param {XMLDocument} hox
 */
export const isDocCompleted = (hox) => {
  //
  const leftParticiants = getNodeArray(hox, 'approvalFlow participant')
    .filter((participant) => 'valid' === getText(participant, 'validStatus'))
    .filter((participant) => {
      // 진행, 대기, 보류, 기안 상태
      const approvalStatus = getText(participant, 'approvalStatus');
      return ['partapprstatus_draft', 'partapprstatus_now', 'partapprstatus_will', 'partapprstatus_postpone'].includes(approvalStatus);
    })
    .filter((participant) => {
      // 결재하는 타입
      const approvalType = getText(participant, 'approvalType');
      const approvalSubType = getText(participant, 'approvalSubTye');
      if (['user_nosign', 'user_refer', 'user_noapproval'].includes(approvalType)) {
        return false;
      }
      return true;
    });
  console.debug('leftParticiants', leftParticiants);

  return leftParticiants.length === 0;
};
