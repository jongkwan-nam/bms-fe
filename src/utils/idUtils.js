import syncFetch from 'sync-fetch';
import { unshift } from './stringUtils';

/**
 *
 * @param {string} id
 * @returns
 */
export const isNullID = (id = null) => id === null || id.trim().replace(/0/g, '') === '';

/**
 *
 * @param {string} id
 * @returns
 */
export const isNotNullID = (id) => !isNullID(id);

/**
 *
 * @param {string} apprid
 * @param {number} index
 */
export const getObjectID = (apprid, index) => {
  return apprid.substring(0, 17) + unshift(index, 3, '0');
};

/**
 *
 * @returns {string} 새 apprid
 */
export const getSancMsgID = () => {
  const ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveNewDocId.act?UID=${rInfo.user.ID}`).json();
  if (ret.ok) {
    return ret.msgid;
  }
  throw new Error('fail getSancMsgID');
};

/**
 *
 * @param {number} n 구할 ID 갯수
 * @returns {string[]} 새 participant id 배열
 */
export const getParticipantIDs = (n) => {
  const ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrievePrtcpntIdList.act?count=${n}`).json();
  if (ret.ok) {
    return ret.ids;
  }
  throw new Error('getParticipantIDs: n=' + n);
};

export const getDocNumber = (repDeptId, apprId) => {
  const ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveNewDocNo.act?numtype=${1}&msgtype=${0}&UID=${rInfo.user.ID}&DID=${repDeptId}&apprID=${apprId}&orgApprID=${NULL_APPRID}`).json();
  if (ret.ok) {
    return ret.number;
  }
  throw new Error('getDocNumber: repDeptId=' + repDeptId + ' apprId=' + apprId);
};

export const NULL_APPRID = '00000000000000000000';
