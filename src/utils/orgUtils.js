import syncFetch from 'sync-fetch';

const userMap = new Map();
const deptMap = new Map();

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
