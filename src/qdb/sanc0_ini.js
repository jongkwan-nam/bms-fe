import syncFetch from 'sync-fetch';

/**
 * HANDY QDB
 * QDB서버가 없을 경우, QDB연동 양식은 결재가 진행되지 않아야 한다.
 * ex)	if (sanc0_ini.IsSancDocument(domHox1))
 * 			if (!sanc0_ini.ExistSancServer()) return false;
 * 2015.11.24 연동양식 설정은 제외하고, db에서 조회하여 체크한다.
 *
 */
export const sanc0_ini = {
  MSG_NOTEXIST: '연동서버가 존재하지 않습니다(QDB).',
  cacheFormInfo: null,
  getFormName: function (domHox) {
    var formName = domHox.querySelector('hox>docInfo>formInfo>formName').textContent?.trim(); // 연동 양식 이름
    if (formName.indexOf('@') > -1) {
      formName = formName.substring(formName.indexOf('@') + 1);
    }
    return formName;
  },
  getFormID: function (domHox) {
    var formID = domHox.querySelector('hox>docInfo>formInfo>formID').textContent?.trim(); // 양식 ID
    return formID;
  },
  IsSancDocument: function (domHox) {
    try {
      var formID = this.getFormID(domHox);
      if (formID === '') {
        //ex) 비전자문서
        return false;
      }

      if (this.cacheFormInfo) {
        if (this.cacheFormInfo.formID === formID) {
          //캐시된 form정보가 있으면
          return this.cacheFormInfo.systemType == 49 ? true : false;
        }
      }

      var formObj = syncFetch(PROJECT_CODE + '/com/hs/gwweb/appr/retrieveFormatInfo.act?formID=' + formID).json();
      if (formObj && formObj.dbFormInfo && formObj.dbFormInfo.systemType) {
        this.cacheFormInfo = formObj.dbFormInfo;
        return this.cacheFormInfo.systemType == 49 ? true : false;
      }
    } catch (e) {
      console.error('IsSancDocument', e);
    }
    return false;
  },
  ExistSancServer: function () {
    if (typeof sanc0 === 'undefined') {
      alert(this.MSG_NOTEXIST);
      return false;
    }
    return true;
  },
};
