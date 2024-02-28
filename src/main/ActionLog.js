/** 열람 */
export const ACT_CODE_ON_VIEW = 'S7';
/** 저장 */
export const ACT_CODE_ON_SAVE = 'S8';
/** 인쇄 */
export const ACT_CODE_ON_PRINT = 'S9';

/**
 * 액션로그 기록
 * @param {string} apprID
 * @param {string} title
 * @param {string} actionCode
 */
export const addActionLog = (apprID, title, actionCode) => {
  const formData = new FormData();
  formData.append('DOCID', apprID);
  formData.append('TITLE', title);
  formData.append('ACTION', actionCode);
  fetch(`${PROJECT_CODE}/com/hs/gwweb/actionlog/addActionLog.act`, { method: 'POST', body: formData })
    .then((res) => res.json())
    .then((ret) => console.log('actionLog', apprID, title, actionCode, ret));
};

/**
 * 액션로그 기록: 보기
 * @param {string} apprID
 * @param {string} title
 */
export const addActionLogView = (apprID, title) => {
  addActionLog(apprID, title, ACT_CODE_ON_VIEW);
};

/**
 * 액션로그 기록. 저장
 * @param {string} apprID
 * @param {string} title
 */
export const addActionLogSave = (apprID, title) => {
  addActionLog(apprID, title, ACT_CODE_ON_SAVE);
};

/**
 * 액션로그 기록. 인쇄
 * @param {string} apprID
 * @param {string} title
 */
export const addActionLogPrint = (apprID, title) => {
  addActionLog(apprID, title, ACT_CODE_ON_PRINT);
};
