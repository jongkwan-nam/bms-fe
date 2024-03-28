import syncFetch from 'sync-fetch';

/**
 * bms와 jhoms의 설정 제공
 */
export default class ServerConfig {
  static jhomsMap = new Map();
  static bmsMap = new Map();

  /**
   * [jhoms] jhomscfg.xml의 설정값 구하기
   *
   * @param {string} app
   * @param {string} key
   * @param {string} def
   * @returns
   */
  static getJhomsConfig(app, key, def = '') {
    if (this.jhomsMap.has(app + key)) {
      return this.jhomsMap.get(app + key);
    }
    let val = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveJhomscfg.act?app=${app}&key=${key}&def=${def}`).text();
    this.jhomsMap.set(app + key, val);
    return val;
  }

  /**
   * [bms] globals.properties 설정값 구하기
   * @param {string} key
   * @param {string} def
   * @returns
   */
  static getBmsConfig(key, def = '') {
    if (this.bmsMap.has(key)) {
      return this.bmsMap.get(key);
    }
    let val = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveGlobalsConfig.act?key=${key}&def=${def}`).text();
    this.bmsMap.set(key, val);
    return val;
  }
}
