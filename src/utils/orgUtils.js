import syncFetch from 'sync-fetch';

export default class OrgUtils {
  static userMap = new Map();
  static deptMap = new Map();
  static repDeptMap = new Map();

  static getUser(id) {
    if (this.userMap.has(id)) {
      return this.userMap.get(id);
    }
    let ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveUserInfo.act?UID=${id}`).json();
    if (!ret.ok) {
      throw new Error('notfound user: ' + id);
    }
    this.userMap.set(id, ret.user);
    return ret.user;
  }

  static getDept(deptId) {
    if (this.deptMap.has(deptId)) {
      return this.deptMap.get(deptId);
    }
    let ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveDeptInfo.act?DID=${deptId}`).json();
    if (!ret.ok) {
      throw new Error('notfound dept: ' + deptId);
    }
    this.deptMap.set(deptId, ret.dept);
    return ret.dept;
  }

  static getRepDept(deptId) {
    if (this.repDeptMap.has(deptId)) {
      return this.repDeptMap.get(deptId);
    }
    let ret = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveRepDeptInfo.act?DID=${deptId}`).json();
    if (!ret.ok) {
      throw new Error('notfound repDept: ' + deptId);
    }
    this.repDeptMap.set(deptId, ret.dept);
    return ret.dept;
  }
}
