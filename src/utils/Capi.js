import syncFetch from 'sync-fetch';

export default {
  callObject: (url, param) => {
    return syncFetch(PROJECT_CODE + url, { method: 'POST', body: new URLSearchParams(param).toString() }).json();
  },
  getFileFromURL: (url) => {
    return this.callObject('/com/hs/gwweb/appr/getFileFromURL.act', {
      K: szKEY,
      url: url,
    });
  },
  putXMLFile: (xmlText, sharedStore, encoding) => {
    const param = { xmlText: xmlText };
    if (sharedStore) param['sharedStore'] = sharedStore;
    if (encoding) param['encoding'] = encoding;
    return this.callObject('/com/hs/gwweb/appr/manageFileUploadXMLFile.act', param);
  },
};
