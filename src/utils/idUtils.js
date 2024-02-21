import syncFetch from 'sync-fetch';
import StringUtils from './StringUtils';

export default class IDUtils {
  static NULL_APPRID = '00000000000000000000';
  static NULL_ORGID = '000000000';

  /**
   *
   * @param {string} id
   * @returns
   */
  static isNullID(id = null) {
    return id === null || id.trim().replace(/0/g, '') === '';
  }

  /**
   *
   * @param {string} id
   * @returns
   */
  static isNotNullID(id) {
    return !this.isNullID(id);
  }

  /**
   *
   * @param {string} apprid
   * @param {number} index
   */
  static getObjectID(apprid, index) {
    return apprid.substring(0, 17) + StringUtils.unshift(index, 3, '0');
  }

  /**
   *
   * @returns {string} 새 apprid
   */
  static getSancMsgID() {
    const ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveNewDocId.act?UID=${rInfo.user.ID}`).json();
    if (ret.ok) {
      return ret.msgid;
    }
    throw new Error('fail getSancMsgID');
  }

  /**
   *
   * @param {number} n 구할 ID 갯수
   * @returns {string[]} 새 participant id 배열
   */
  static getParticipantIDs(n) {
    const ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrievePrtcpntIdList.act?count=${n}`).json();
    if (ret.ok) {
      return ret.ids;
    }
    throw new Error('getParticipantIDs: n=' + n);
  }

  /**
   * 문서번호 채번
   *
   * @param {string} repDeptId 채번 기준부서
   * @param {*} apprId
   * @returns {number} 문서번호
   */
  static getDocNumber(repDeptId, apprId) {
    const ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveNewDocNo.act?numtype=${1}&msgtype=${0}&UID=${rInfo.user.ID}&DID=${repDeptId}&apprID=${apprId}&orgApprID=${this.NULL_APPRID}`).json();
    if (ret.ok) {
      return ret.number;
    }
    throw new Error('getDocNumber: repDeptId=' + repDeptId + ' apprId=' + apprId);
  }

  /**
   * 접수번호 및 apprid 채번
   *
   * @param {string} repDeptId 채번 기준부서
   * @param {string} sendId
   * @param {number} flag 0: apprId + 접수번호, 1: apprId, 2: 접수번호, 3: apprId + 접수번호, 4: manual?
   * @returns
   */
  static getReceiptNumber(repDeptId, sendId, flag) {
    const ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveNewRceptNo.act?UID=${rInfo.user.ID}&DID=${rInfo.dept.ID}&BASEDID=${repDeptId}&sendID=${sendId}&flag=${flag}`).json();
    // {"rc":0,"msgid":"JHOMS240510000377000","ok":true,"receiptNumber":89}
    if (ret.ok) {
      return { apprId: ret.msgid, receiptNumber: ret.receiptNumber };
    }
    throw new Error('getReceiptNumber: repDeptId=' + repDeptId + ' sendId=' + sendId + ' flag=' + flag);
  }
}
