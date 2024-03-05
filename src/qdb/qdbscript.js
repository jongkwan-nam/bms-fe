import syncFetch from 'sync-fetch';
import { WORDTYPE_HWPWEB } from '../main/const/CommonConst';
import { FD_APPLID_APPRING } from '../main/const/FldrConst';
import { getObjectIDOfAuditComment } from '../utils/HoxUtils';
import { getText, setText } from '../utils/xmlUtils';
import { sanc0_ini } from './sanc0_ini';
import { isNowStatusDeptAgreeP } from './sanc0_support';

const sanc0 = window.sanc0;

//기안초기화
export function QDBTimingInitializeLogic() {
  const domHox1 = feMain.hox;
  return new Promise(function (resolve, reject) {
    if (window.console) console.log('[QDBTimingInitializeLogic] START.');
    var param = {};
    try {
      if (sanc0_ini.IsSancDocument(domHox1)) {
        if (!sanc0_ini.ExistSancServer()) {
          resolve(param);
          return;
        }

        if (rInfo.cltType == 'draft' || rInfo.cltType == 'att-draft' || rInfo.cltType == 'pc-draft') {
          var qdbLinkageId = '';
          var obj = Capi.getQdbLinkageID(rInfo.user.ID);
          if (obj && obj.ok) {
            qdbLinkageId = obj.msgid;
          } else {
            alert('qdbLinkageId 채번시 오류');
            reject();
            return;
          }
          hoxutil.setQdbLinkageId(domHox1, qdbLinkageId);
        } else {
          qdbLinkageId = hoxutil.getQdbLinkageId(domHox1);
        }

        if (window.console) {
          console.log('[QDBTimingInitializeLogic] status:0 qdbLinkageId = ' + qdbLinkageId);
        }

        param = {
          qdbLinkageId: qdbLinkageId,
          domHox: domHox1,
          employNo: rInfo.user.empCode,
          deptCode: rInfo.dept.deptCode,
          sanction: sanc0.getSanction({
            status: Sanc0Const.SACTION_TIMING_INITIALIZE, // INITIALIZE
            rInfo: rInfo,
          }), // SANC_GIANINITIALIZE, SANC_REGIANINITIALIZE
        };
        if (window.console) console.log('[QDBTimingInitializeLogic] END.', param);

        Promise.resolve(param)
          .catch(function (e) {
            if (window.console) {
              console.log('getQDBInitialParam error', e);
            }
          })
          .then(sanc0.SanctionAPIPromise.bind(sanc0))
          .then(function () {
            if (window.console) {
              console.log('sanc0.SanctionAPIPromise 이후.');
            }

            /* TODO qdb의 고정수신처 반영 */
            // Doc.addFixedRecpDept(domHox1);
            // drawRecpInfo(true, 1);
            /* QDB/MINWON 문서 load 후에 "결재제목" 설정 */
            var sancTitle = feMain.feEditor1.title;
            if (window.console) {
              console.log('sancTitle=' + sancTitle);
            }
            if (sancTitle) {
              setText(domHox1, 'docInfo title', sancTitle);
              // $('#Sj').val(sancTitle);
              // if (!qdbDraftSanctitleAllowModify) {
              //   $('#Sj').attr('readonly', true);
              // }
            }
            resolve(param);
          })
          .catch(function (e) {
            console.log('sanc0.SanctionAPIPromise error', e);
          });
      } else {
        if (window.console) console.log('[QDBTimingInitializeLogic] END.');
        resolve(param);
      }
    } catch (e) {
      if (window.console) console.log('[QDBTimingInitializeLogic] END. error', e);
      reject(e);
    }
  });
}

export function QDBTimingLoadLogic() {
  const domHox1 = feMain.hox;
  const draftHox = feMain.orgHox;

  if (typeof sanc0_ini != 'undefined' && sanc0_ini.IsSancDocument(domHox1)) {
    if (!sanc0_ini.ExistSancServer()) return false;
    var param = {
      domHox: domHox1,
      employNo: rInfo.user.empCode,
      qdbLinkageId: hoxutil.getQdbLinkageId(domHox1),
      isDeptAgreeP: isNowStatusDeptAgreeP(draftHox, rInfo.dept.ID),
      deptCode: rInfo.dept.deptCode,
      sanction: sanc0.getSanction({
        status: 0, // INITIALIZE
        rInfo: rInfo,
      }),
      // SANC_KYULINITIALIZE
    };
    if (!sanc0.SanctionAPI(param)) return false;
  }
}

//문서처리 서명처리전
export function QDBTimingBeforeLogic() {
  const domHox1 = feMain.hox;
  var that = this;
  return new Promise(function (resolve, reject) {
    if (window.console) console.log('[QDBGianBeforeGianLogic] START.');
    //try {
    if (typeof sanc0_ini != 'undefined' && sanc0_ini.IsSancDocument(domHox1)) {
      if (!sanc0_ini.ExistSancServer() || pInfo.myApprType == 'user_refer') {
        resolve(param);
        return;
      }

      let qdbLinkageId = hoxutil.getQdbLinkageId(domHox1);
      if (window.console) {
        console.log('[QDBGianBeforeGianLogic] status:' + Sanc0Const.SACTION_TIMING_BEFORE + ', qdbLinkageId = ' + qdbLinkageId);
      }

      var param = {
        qdbLinkageId: qdbLinkageId,
        domHox: that.finalDeptApprComplete == 'true' ? that.domOrg1 : domHox1,
        employNo: rInfo.user.empCode,
        deptCode: rInfo.dept.deptCode,
        sanction: sanc0.getSanction({
          status: Sanc0Const.SACTION_TIMING_BEFORE, // BEFORE
          cmd: feMain.cmd,
          finished: feMain.finished,
        }),
        finalDeptApprComplete: that.finalDeptApprComplete,
      };
      if (window.console) {
        console.log('[QDBGianBeforeGianLogic] param.', param);
      }
      Promise.resolve(param)
        .then(sanc0.SanctionAPIPromise.bind(sanc0))
        .then(function () {
          if (window.console) {
            console.log('sanc0.SanctionAPIPromise 이후.');
          }
          if (window.console) console.log('[QDBGianBeforeGianLogic] END.');
          resolve();
        })
        .catch(function (e) {
          if (window.console) {
            console.log('sanc0.SanctionAPIPromise error', e);
          }
          if (!pInfo.isAccept()) {
            if ('draftDoc' == feMain.cmd) {
              rInfo.QDBError = true;
              alert(GWWEBMessage.cmsg_2689); //'기안서명전 QDB연동시 오류가 발생하였습니다.'
            }
          }
          reject(e);
        });
    } else {
      resolve();
    }
    //} catch(e) {
    //	if(window.console) console.log('[QDBGianBeforeGianLogic] END.');
    //	reject(e);
    //}
  });
}

//문서처리 서명처리후
export function QDBTimingAfterLogic() {
  const domHox1 = feMain.hox;
  var that = this;
  return new Promise(function (resolve, reject) {
    if (window.console) console.log('[QDBTimingAfterLogic] START.');
    try {
      if (typeof sanc0_ini != 'undefined' && sanc0_ini.IsSancDocument(domHox1)) {
        if (!sanc0_ini.ExistSancServer() || pInfo.myApprType == 'user_refer') {
          resolve();
          return;
        }

        let qdbLinkageId = hoxutil.getQdbLinkageId(domHox1);
        if (window.console) {
          console.log('[getQDBParamPromiseBefore] status:' + Sanc0Const.SACTION_TIMING_AFTER + ', qdbLinkageId = ' + qdbLinkageId);
        }

        var param = {
          qdbLinkageId: qdbLinkageId,
          domHox: that.finalDeptApprComplete == 'true' ? that.domOrg1 : domHox1,
          employNo: rInfo.user.empCode,
          deptCode: rInfo.dept.deptCode,
          sanction: sanc0.getSanction({
            status: Sanc0Const.SACTION_TIMING_AFTER, // 2 AFTER
            cmd: feMain.cmd,
            finished: feMain.finished,
          }),
          finalDeptApprComplete: that.finalDeptApprComplete,
        };
        if (window.console) {
          console.log('[QDBTimingAfterLogic] param.', param);
        }
        Promise.resolve(param)
          .then(sanc0.SanctionAPIPromise.bind(sanc0))
          .then(function () {
            if (window.console) {
              console.log('sanc0.SanctionAPIPromise 이후.');
            }
            if (window.console) console.log('[QDBTimingAfterLogic] END.');
            resolve();
          })
          .catch(function (e) {
            if (window.console) {
              console.log('sanc0.SanctionAPIPromise error', e);
            }
            reject(e);
          });
      } else {
        resolve();
      }
    } catch (e) {
      if (window.console) console.log('[QDBTimingAfterLogic] END.');
      reject(e);
    }
  });
}

// export function checkServerResultPromise(ret) {
//   return new Promise(function (resolve, reject) {
//     if (window.console) console.log('[checkServerResultPromise] START.');
//     ApprProcess.checkServerResult(ret);
//     resolve(ret);
//   });
// }

// export function processSubmitLogic() {
//   var that = this;
//   return new Promise(function (resolve, reject) {
//     if (window.console) console.log('[processSubmitLogic] START.');
//     try {
//       var ret = false;
//       var params = Form.serialize(D$('frmClient'));
//       new Ajax.Request(hsattach.action, {
//         asynchronous: false,
//         parameters: params,
//         onSuccess: function (xmlHttp, xjson) {
//           //alert("xmlHttp.responseText");
//           ret = xmlHttp.responseText;
//           if (window.console) console.log('[processSubmitLogic] END.', ret);
//           resolve(ret);
//           //apprProcess.checkServerResult(ret);
//         },
//         onFailure: function () {
//           alert(GWWEBMessage.cmsg_err_common_msg);
//           rInfo.hasError = true;
//           if (that.cmd == 'batchDraftDoc') {
//             if (rInfo.WORDTYPE == WORDTYPE_HWPWEB || rInfo.WORDTYPE == WORDTYPE_HWP2002) {
//               //TODO:메시지 처리
//               that.checkServerResult('{RESULT:ERROR,MSG:일괄접수오류}');
//             }
//           }
//           if (window.console) console.log('[processSubmitLogic] END.');
//           reject('{RESULT:ERROR}');
//         },
//       });
//     } catch (e) {
//       if (window.console) {
//         console.log('[processSubmitLogic] ERROR.', e);
//         console.log('[processSubmitLogic] END.');
//       }

//       reject('{RESULT:ERROR}');
//     }
//   });
// }

export function QDBTimingSuccessOrFailLogic(ret) {
  const domHox1 = feMain.hox;
  const draftHox = feMain.orgHox;

  var that = this;
  return new Promise(function (resolve, reject) {
    if (window.console) console.log('[QDBTimingSuccessOrFailLogic] START. ret=' + ret);
    try {
      if (typeof sanc0_ini != 'undefined' && sanc0_ini.IsSancDocument(domHox1)) {
        if (!sanc0_ini.ExistSancServer() || pInfo.myApprType == 'user_refer') {
          resolve(ret);
          return;
        }

        let qdbLinkageId = hoxutil.getQdbLinkageId(domHox1);
        var status = ret.indexOf('{RESULT:OK}') != -1 ? Sanc0Const.SACTION_TIMING_SUCCESS : Sanc0Const.SACTION_TIMING_FAIL;
        if (window.console) {
          console.log('[QDBTimingSuccessOrFailLogic] status:' + status + ', qdbLinkageId = ' + qdbLinkageId);
        }

        var param = {
          qdbLinkageId: qdbLinkageId,
          domHox: that.finalDeptApprComplete == 'true' ? that.domOrg1 : domHox1,
          employNo: rInfo.user.empCode,
          deptCode: rInfo.dept.deptCode,
          isDeptAgreeP: isNowStatusDeptAgreeP(draftHox, rInfo.dept.ID),
          sanction: sanc0.getSanction({
            status: status, // SUCCESS or FAIL
            cmd: that.cmd,
            finished: that.finished,
          }),
          finalDeptApprComplete: that.finalDeptApprComplete,
        };
        if (window.console) {
          console.log('[QDBTimingSuccessOrFailLogic] param.', param);
        }
        Promise.resolve(param)
          .then(sanc0.SanctionAPIPromise.bind(sanc0))
          .then(function () {
            if (window.console) {
              console.log('sanc0.SanctionAPIPromise 이후.');
            }
            if (window.console) console.log('[QDBTimingSuccessOrFailLogic] END.');
            resolve(ret);
          })
          .catch(function (e) {
            if (window.console) {
              console.log('sanc0.SanctionAPIPromise error', e);
            }
            alert('QDB Error');
            reject(e);
          });
      } else {
        if (window.console) console.log('[QDBTimingSuccessOrFailLogic] END.');
        resolve(ret);
      }
    } catch (e) {
      if (window.console) console.log('[QDBTimingSuccessOrFailLogic] END.');
      alert('QDB Error');
      reject(e);
    }
  });
}

//문서처리 후 QDB연동후 나머지 로직 처리
export function LastLogic(ret) {
  const domHox1 = feMain.hox;
  var that = this;
  return new Promise(function (resolve, reject) {
    if (window.console) console.log('[LastLogic] START. ret=' + ret);
    // jhoms.approval.emove_userdocument_after_draft=true인 경우 임시보관함에서 상신 후 임시저장문서 삭제
    try {
      if (ret.indexOf('{RESULT:OK}') != -1) {
        if (doccfg.removeUserdocumentAfterDraft || (typeof sanc0_ini != 'undefined' && sanc0_ini.IsSancDocument(domHox1) && doccfg.qdbTemporarySaveFormId.indexOf(sanc0_ini.getFormID(domHox1)) != -1)) {
          let userDocumentApprID; // TODO 어디에선 저장되어야 하는데
          if (!pInfo.isAccept()) {
            if (userDocumentApprID == '' && !(document.getElementById('tempdocid').value == '' || document.getElementById('tempdocid').value == '00000000000000000000')) {
              userDocumentApprID = document.getElementById('tempdocid').value;
            }
            if (rInfo.applID == '6010' && rInfo.apprMsgID != '') {
              userDocumentApprID = rInfo.apprMsgID;
            }
            if ('draftDoc' == that.cmd && userDocumentApprID != '') {
              var ret = Capi.deleteUserDocument(userDocumentApprID);
              if (ret.ok) {
                // refresh_opener();
              } else {
                alert(GWWEBMessage.W1602 + ' ERROR CODE:' + ret.rc);
              }
            }
          }
        }
      }
    } catch (e) {
      if (window.console) console.log('deleteUserDocument Error.');
    }
    if (that.cmd == 'saveTemp') {
      if (rInfo.cltType == 're-draft' && rInfo.applID == FD_APPLID_APPRING) {
        //결재진행 재작성 중 임시저장시 임시저장한 감사의견서의 감사인은 제거하지만
        //원래 반송 재작성중인 문서의 감사의견서는 유지하기 위해
        const nodeObjectIDOfAuditComment = getObjectIDOfAuditComment(domHox1);
        if (nodeObjectIDOfAuditComment) {
          pInfo.auditCommentID = getText(nodeObjectIDOfAuditComment, 'ID');

          var obj2 = Capi.getSancFileClone(rInfo.user.ID, rInfo.user.deptID, pInfo.auditCommentID);
          if (obj2 && obj2.ok) {
            var fileName = rInfo.WORDTYPE == WORDTYPE_HWPWEB ? 'auditComment.hwp' : 'auditComment.mht';
            var convertHTM = rInfo.WORDTYPE == WORDTYPE_HWPWEB ? false : true;
            var auditCommentUrl = transfile_url(obj2.TRID, fileName, convertHTM);
            pInfo.auditCommentFilePath = auditCommentUrl;
          }
        }
      }
      // setTimeout('fncEditMode();', 500);
    } else if (that.cmd == 'modifyFlowOnRevoke') {
      if (ret.indexOf('{RESULT:OK}') != -1) {
        alert(GWWEBMessage.cmsg_89 + '\n' + GWWEBMessage.W1835); // '처리되었습니다.\n현재창을 닫습니다.'

        var sleepPromise = new Promise(function (resolve) {
          setTimeout(function () {
            resolve(true);
          }, 1000 * 3);
        });
        sleepPromise.then(function () {
          window.close();
        });
      }
    }
    //결재완료된 문서를 담는다.
    feMain.apprComptList.push(that.msgID);

    if (window.console) console.log('LastLogic END.');
    resolve(ret);
  });
}

//문서회수
export function QDBCancelLogic() {
  const domHox1 = feMain.hox;
  return new Promise(function (resolve, reject) {
    if (window.console) console.log('[QDBGianBeforeGianLogic] START.');
    //try {
    if (typeof sanc0_ini != 'undefined' && sanc0_ini.IsSancDocument(domHox1)) {
      if (!sanc0_ini.ExistSancServer()) {
        resolve(param);
        return;
      }

      let qdbLinkageId = hoxutil.getQdbLinkageId(domHox1);
      if (window.console) {
        console.log('[QDBGianBeforeGianLogic] status:' + Sanc0Const.SACTION_TIMING_BEFORE + ', qdbLinkageId = ' + qdbLinkageId);
      }

      var param = {
        qdbLinkageId: qdbLinkageId,
        domHox: domHox1,
        employNo: rInfo.user.empCode,
        deptCode: rInfo.dept.deptCode,
        sanction: sanc0.getSanction({
          status: Sanc0Const.SACTION_TIMING_BEFORE, // BEFORE
          cmd: feMain.cmd,
          finished: feMain.finished,
        }),
      };
      if (window.console) {
        console.log('[QDBGianBeforeGianLogic] param.', param);
      }
      Promise.resolve(param)
        .then(sanc0.SanctionAPIPromise.bind(sanc0))
        .then(function () {
          if (window.console) {
            console.log('sanc0.SanctionAPIPromise 이후.');
          }
          if (window.console) console.log('[QDBGianBeforeGianLogic] END.');
          resolve();
        })
        .catch(function (e) {
          if (window.console) {
            console.log('sanc0.SanctionAPIPromise error', e);
          }
          if (!pInfo.isAccept()) {
            if ('draftDoc' == feMain.cmd) {
              rInfo.QDBError = true;
              alert(GWWEBMessage.cmsg_2689); //'기안서명전 QDB연동시 오류가 발생하였습니다.'
            }
          }
          reject(e);
        });
    } else {
      resolve();
    }
    //} catch(e) {
    //	if(window.console) console.log('[QDBGianBeforeGianLogic] END.');
    //	reject(e);
    //}
  });
}

export function isValidQDB() {
  const domHox1 = feMain.hox;
  var isQdb = false;
  if (typeof sanc0_ini != 'undefined' && sanc0_ini.IsSancDocument(domHox1)) {
    isQdb = true;
  }
  return isQdb;
}

export function executeQDB(deptCode, status, cmd, finished) {
  const domHox1 = feMain.hox;
  if (!sanc0_ini.ExistSancServer()) return false;
  var qdbLinkageId = hoxutil.getQdbLinkageId(domHox1);
  if (window.console) {
    console.log('status:1 qdbLinkageId=' + qdbLinkageId);
  }
  var param = {
    qdbLinkageId: qdbLinkageId,
    domHox: domHox1,
    employNo: rInfo.user.empCode,
    deptCode: deptCode,
    sanction: sanc0.getSanction({
      status: status,
      cmd: cmd,
      finished: finished,
    }),
  };
  if (!sanc0.SanctionAPI(param)) {
    return false;
  }
  return true;
}

export function getQdbCmdForAcceptRejectDoc() {
  if (pInfo.isAgreeDoc()) {
    return QDB_CMD_REJECTDOCFORAGREE;
  } else if (pInfo.isAuditDoc()) {
    return QDB_CMD_REJECTDOCFORAUDIT;
  } else if (pInfo.isComplianceDoc()) {
    return QDB_CMD_REJECTDOCFORCOMPLIANCE;
  } else {
    return QDB_CMD_REJECTDOCFORRECEIPT;
  }
}

export function executeQDBPromise(params) {
  const domHox1 = feMain.hox;
  var deptCode = params[0];
  var status = params[1];
  var cmd = params[2];
  var finished;
  if (params.length > 3) {
    finished = params[3];
  }

  var that = this;
  return new Promise(function (resolve, reject) {
    if (window.console) console.log('[executeQDBPromise] START. deptCode=' + deptCode + ' status=' + status + ' cmd=' + cmd + ' finished=' + finished);
    try {
      if (typeof sanc0_ini != 'undefined' && sanc0_ini.IsSancDocument(domHox1)) {
        if (!sanc0_ini.ExistSancServer()) {
          resolve();
          return;
        }

        var qdbLinkageId = hoxutil.getQdbLinkageId(domHox1);
        if (window.console) {
          console.log('[executeQDBPromise] qdbLinkageId = ' + qdbLinkageId);
        }

        var param = {
          qdbLinkageId: qdbLinkageId,
          domHox: domHox1,
          employNo: rInfo.user.empCode,
          deptCode: deptCode,
          sanction: sanc0.getSanction({
            status: status,
            cmd: cmd,
            finished: finished,
          }),
        };
        if (window.console) {
          console.log('[executeQDBPromise] param.', param);
        }
        Promise.resolve(param)
          .then(sanc0.SanctionAPIPromise.bind(sanc0))
          .then(function () {
            if (window.console) {
              console.log('sanc0.SanctionAPIPromise 이후.');
            }
            if (window.console) console.log('[executeQDBPromise] END.');
            resolve();
          })
          .catch(function (e) {
            if (window.console) {
              console.log('sanc0.SanctionAPIPromise error', e);
            }
            reject(e);
          });
      } else {
        if (window.console) console.log('[executeQDBPromise] END.');
        resolve();
      }
    } catch (e) {
      if (window.console) console.log('[executeQDBPromise] END. e', e);
      reject(e);
    }
  });
}

const Capi = {
  getQdbLinkageID: (userID) => {
    return syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveQdbLinkageId.act`, { method: 'POST', body: 'UID=' + userID }).json();
  },
  deleteUserDocument: (apprID) => {
    return syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/deleteDoc.act`, { method: 'POST', body: 'APPRIDLIST=' + apprID + '&APPLID=6010&APPLTYPE=2' }).json();
  },
  getSancFileClone: (userID, deptID, fileID) => {
    return syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveDocFileClone.act`, { method: 'POST', body: 'UID=' + userID + '&DID=' + deptID + '&FID=' + fileID }).json();
  },
};

const hoxutil = {
  setQdbLinkageId: (hox, qdbLinkageId) => {
    setText(hox, 'docInfo qdbLinkageID', qdbLinkageId);
  },
  getQdbLinkageId: (hox) => {
    return getText(hox, 'docInfo qdbLinkageID');
  },
};

//연동시점 /qdb/sanc0.js 중복정의
const Sanc0Const = {
  SACTION_TIMING_INITIALIZE: 0, // 초기화
  SACTION_TIMING_BEFORE: 0x0001, // 기안시 직후
  SACTION_TIMING_AFTER: 0x0002, // 기안시 서버 처리 전
  SACTION_TIMING_SUCCESS: 0x0003, // 기안시 서버 처리 완료
  SACTION_TIMING_FAIL: 0x0004, // 기안시 서버 처리 실패
};

const QDB_CMD_REJECTDOCFORRECEIPT = 'rejectDocForReceipt'; // 수신부서 접수기 반송
const QDB_CMD_REJECTDOCFORAGREE = 'rejectDocForAgree'; // 합의부서 접수기 반송
const QDB_CMD_REJECTDOCFORAUDIT = 'rejectDocForAudit'; // 감사부서 접수기 반송
const QDB_CMD_REJECTDOCFORCOMPLIANCE = 'rejectDocForCompliance'; // 준법감시부서 접수기 반송
const QDB_CMD_DELETEDOC = 'deleteDoc'; // 반송,회수 문서 삭제

function transfile_url(TRID, fileName, convertHtm, useWasDRM) {
  let url;
  if (convertHtm == true) {
    url = PROJECT_CODE + '/com/hs/gwweb/appr/retrieveTRIDFile.act?TRID=' + TRID + '&ConvertHTM=true';
    if (fileName) {
      url += '&fileName=' + encodeURIComponent(fileName);
    }
  } else {
    url = PROJECT_CODE + '/com/hs/gwweb/appr/manageFileDwld.act?TRID=' + TRID;
    if (fileName) {
      url += '&fileName=' + encodeURIComponent(fileName);
    }
  }
  if (szKEY) {
    url += '&K=' + szKEY;
  }
  if (useWasDRM) {
    url += '&useWasDRM=' + useWasDRM;
  }
  url += '&_NOARG=' + new Date().getTime();
  return url;
}
