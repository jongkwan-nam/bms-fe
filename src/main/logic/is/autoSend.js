/*
 * 자돌발송 대상인지
 */

/**
 * 자동발송 대상 문서인지
 *
 * @param {XMLDocument} hox
 * @param {string} enforceType
 * @returns
 */
export const isAutoSendDoc = (hox, enforceType) => {
  return doccfg.autoInternalSend && enforceType === 'enforcetype_internal';
};
