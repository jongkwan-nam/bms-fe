import syncFetch from 'sync-fetch';

const userMap = new Map();
const deptMap = new Map();
const repDeptMap = new Map();

export function getUser(id) {
  if (userMap.has(id)) {
    return userMap.get(id);
  }
  let ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveUserInfo.act?UID=${id}`).json();
  if (!ret.ok) {
    throw new Error('notfound user: ' + id);
  }
  userMap.set(id, ret.user);
  return ret.user;
}

export function getDept(deptId) {
  if (deptMap.has(deptId)) {
    return deptMap.get(deptId);
  }
  let ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveDeptInfo.act?DID=${deptId}`).json();
  if (!ret.ok) {
    throw new Error('notfound dept: ' + deptId);
  }
  deptMap.set(deptId, ret.dept);
  return ret.dept;
}

export function getRepDept(deptId) {
  if (repDeptMap.has(deptId)) {
    return repDeptMap.get(deptId);
  }
  let ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveRepDeptInfo.act?DID=${deptId}`).json();
  if (!ret.ok) {
    throw new Error('notfound repDept: ' + deptId);
  }
  repDeptMap.set(deptId, ret.dept);
  return ret.dept;
}
