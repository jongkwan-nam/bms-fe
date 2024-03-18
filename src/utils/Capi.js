import syncFetch from 'sync-fetch';

const Capi = {
  callObject: (url, param) => {
    // return syncFetch(PROJECT_CODE + url, { method: 'POST', body: new URLSearchParams(param).toString() }).json();
    return syncFetch(PROJECT_CODE + url + '?' + new URLSearchParams(param).toString()).json();
  },
  /**
   * 입력 url을 서버로 다운받은 후 TRID를 반환한다.
   * - size는 항상 0이 온다. BMS_FIX
   * @param {string} url
   * @returns {object} TRID: '...', location: '...', ok: true, size: 0
   */
  getFileFromURL: (url) => {
    return Capi.callObject('/com/hs/gwweb/appr/getFileFromURL.act', {
      K: szKEY,
      url: url,
    });
  },
  putXMLFile: (xmlText, sharedStore, encoding) => {
    const param = { xmlText: xmlText };
    if (sharedStore) param['sharedStore'] = sharedStore;
    if (encoding) param['encoding'] = encoding;
    return Capi.callObject('/com/hs/gwweb/appr/manageFileUploadXMLFile.act', param);
  },
};

export default Capi;
