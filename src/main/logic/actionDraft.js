import * as DateUtils from '../../utils/dateUtils';
import { addNodes, getAttr, getNode, getNodeArray, getNodes, getNumber, getText, serializeHoxToString, setText } from '../../utils/hoxUtils';
import { getObjectID, isNullID } from '../../utils/idUtils';
import * as StringUtils from '../../utils/stringUtils';
import Cell from '../CellNames';
import FeSignDialog from '../FeSignDialog';

/**
 * 기안전 정합성 체크
 * - 결재제목
 * - 기록물철
 * - 쪽수
 * - 발송종류별 수신자 검증
 * @param {XMLDocument} hox
 */
export const validate = (hox) => {
  let ok = true;
  let msg = '';

  // 제목
  if (StringUtils.isBlank(getText(hox, 'docInfo title'))) {
    ok = false;
    msg += `결재제목이 설정되지 않았습니다.\n`;
  }
  getNodes(hox, 'docInfo content').forEach((content, i) => {
    if (StringUtils.isBlank(getText(content, 'title'))) {
      ok = false;
      msg += `${i + 1}안의 결재제목이 설정되지 않았습니다.\n`;
    }
  });

  // 기록물철
  if (isNullID(getText(hox, 'docInfo folderInfo ID'))) {
    ok = false;
    msg += `기록물철이 선택되지 않았습니다.\n`;
  }

  // 쪽수
  // TODO 단순이 0보다 크다가 아니고, 본문과 첨북 갯수로 체크해야 한다
  if (getNumber(hox, 'docInfo > pageCnt') < 1) {
    ok = false;
    msg += `쪽수가 잘못 되었습니다.\n`;
  }
  getNodes(hox, 'docInfo content').forEach((content, i) => {
    if (getNumber(content, 'pageCnt') < 1) {
      ok = false;
      msg += `${i + 1}안의 쪽수가 잘못 되었습니다.\n`;
    }
  });

  return {
    ok: ok,
    message: msg,
  };
};

/**
 * 서명 다이얼로그
 *
 * @param {XMLDocument} hox
 * @returns
 */
export const preProcessSign = async (hox) => {
  const result = { ok: true, message: '' };
  //
  const feEditor1 = feMain.feEditor1;

  // 서명선택
  let feSignDialog = new FeSignDialog();
  const modalContainer = document.querySelector('.modal-container');
  modalContainer.textContent = null;
  modalContainer.append(feSignDialog);
  modalContainer.classList.add('open');
  feSignDialog.open();

  const signImageURL = await feSignDialog.getSignImageURL();
  console.log('signImageURL', signImageURL);
  if (signImageURL === null) {
    // 서명 취소 => 결재 취소
    modalContainer.classList.remove('open');
    result.ok = false;
    return result;
  }

  let signExtraText = '';
  if (doccfg.signShowSignerDate) {
    // 서명칸에 날짜 표시(서명일자) 여부 설정
    // true : 기안자/검토자/협조자/결재권자/협조부서 서명칸에 날짜 표시
    // false : 결재권자(최종결재자) 서명칸에만 날짜 표시 (default)
    // 서버시간 구하기
    /**
     * /bms/com/hs/gwweb/appr/getServerTime.act K: 00G392eYq
     * > {"currentDate":1702859639184,"ok":true}
     */
    const serverTimeInfo = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/getServerTime.act`).then((res) => res.json());
    const serverTime = new Date(serverTimeInfo.currentDate);
    console.log('serverTime', serverTime);
    // doccfg.signDateFormat
    const mmdd = DateUtils.format(serverTime, doccfg.signDateFormat);

    signExtraText = mmdd;
  }
  // TODO doccfg.signShowSignerDataAlign: 서명칸에 날짜 표시(서명일자) 위치 설정. [ top : 서명 위 (default) ,  bottom : 서명 아래 ]
  // TODO 다안 처리
  await feEditor1.doSign(Cell.SIGN + '.1', signExtraText, signImageURL);
  console.log('feEditor1.setSign', Cell.SIGN + '.1');

  // 서명창 닫기
  modalContainer.classList.remove('open');

  return result;
};

/**
 * 기안처리
 *
 * @param {XMLDocument} hox
 */
export const process = async (hox) => {
  const result = { ok: true, message: '' };
  //
  const feEditor1 = feMain.feEditor1;
  const feAttachBox = feMain.feAttachBox;

  // appr id 채번
  /**
   * /bms/com/hs/gwweb/appr/retrieveNewDocId.act K: 00G392eYq, UID: 001000001
   * > {"msgid":"JHOMS233520000091000","ok":true}
   */
  const newDocIdInfo = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveNewDocId.act`).then((res) => res.json());
  const newDocId = newDocIdInfo.msgid;
  console.log('newDocId', newDocId);
  setText(hox, 'docInfo apprID', newDocId);

  // participant id 채번
  // 필요한 갯수 구하기
  const count = Array.from(getNodes(hox, 'approvalFlow participant participantID')).filter((pID) => isNullID(pID.textContent)).length;
  /**
   * /bms/com/hs/gwweb/appr/retrievePrtcpntIdList.act K: 00G392eYq, count: 2
   * > {"ids":["JHOMS233520000212000","JHOMS233520000213000"],"ok":true}
   */
  const newParticipantIDListInfo = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrievePrtcpntIdList.act?count=${count}`).then((res) => res.json());
  const newParticipantIDs = newParticipantIDListInfo.ids;
  console.log('newParticipantIDs', newParticipantIDs);
  Array.from(getNodes(hox, 'approvalFlow participant participantID'))
    .filter((pID) => isNullID(pID.textContent))
    .forEach((pID, i) => {
      pID.textContent = newParticipantIDs[i];
    });

  // 첨부ID처리: 채번된 apprid와 participantid로 이용
  const drafterParticipantID = getText(hox, 'approvalFlow participant participantID');
  getNodeArray(hox, 'docInfo objectIDList objectID')
    .filter((objectID) => getAttr(objectID, null, 'type') === 'objectidtype_attach')
    .forEach((objectID, i) => {
      const newObjectId = getObjectID(newDocId, 100 + i);
      setText(objectID, 'ID', newObjectId);
      setText(objectID, 'participantID', drafterParticipantID);

      // content attachInfo attach ID 추가
      let contentNumber = getNumber(objectID, 'contentNumber', 0);
      if (contentNumber === 0) {
        // 공통 첨부라면 1안 content에 붙인다
        contentNumber = 1;
      }
      const contentNode = getNode(hox, 'content', contentNumber - 1);
      addNodes(contentNode, 'attachInfo attach', 'ID')[0].textContent = newObjectId;
    });

  // 요약전
  getNodeArray(hox, 'docInfo objectIDList objectID')
    .filter((objectID) => getAttr(objectID, null, 'type') === 'objectidtype_summary')
    .forEach((objectID) => {
      const newObjectId = getObjectID(newDocId, 3);
      setText(objectID, 'ID', newObjectId);
      setText(objectID, 'participantID', drafterParticipantID);
    });

  // 웹한글 본문 저장
  const downloadURL = await feEditor1.saveServer(newDocId);
  console.log('downloadURL', downloadURL);
  /**
   * /bms/com/hs/gwweb/appr/getFileFromURL.act  K: 00G392eYq, url: https://fewebhwp.handysoft.co.kr/webhwpctrl/get/6e6cb75c-a921-4f66-b6ab-793a54affc9a/a9203aef-8f20-4e44-98ac-82ab27d895b7.hwp
   * > {"size":0,"location":"com/hs/gwweb/appr/manageFileDwld.act?TRID=2f3...", "ok":true, "TRID":"2f323..."}
   */
  const bodyFileInfo = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/getFileFromURL.act?url=${downloadURL}`).then((res) => res.json());
  console.log('bodyFileInfo', bodyFileInfo);
  if (!bodyFileInfo.ok) {
    throw new Error('웹한글 본문 파일 정보 구하기 실패');
  }
  const bodyTRID = bodyFileInfo.TRID;

  // bms로 submit
  /**
   * /bms/com/hs/gwweb/appr/manageDocDrft.act
   */
  const formData = new FormData();
  formData.append('apprID', newDocId);
  formData.append('UID', rInfo.user.ID);
  formData.append('DID', rInfo.user.deptID);
  // 본문
  formData.append('ref_' + getObjectID(newDocId, 1), bodyTRID);
  // 첨부
  feAttachBox.listFileIDs().forEach((trid, i) => {
    formData.append('ref_' + getObjectID(newDocId, 100 + i), trid);
  });
  // 요약전
  if (feMain.summary.TRID !== null) {
    formData.append('ref_' + getObjectID(newDocId, 3), feMain.summary.TRID);
  }
  // hox
  formData.append('block_' + getObjectID(newDocId, 2), serializeHoxToString(hox));

  const ret = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageDocDrft.act`, {
    method: 'POST',
    body: formData,
  }).then((res) => res.text());
  //  {RESULT:OK}
  console.log('ret', ret);

  result.ok = '{RESULT:OK}' === ret.trim();
  result.message = ret.trim();

  return result;
};
