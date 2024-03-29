import Capi from '../../utils/Capi';
import DateUtils from '../../utils/DateUtils';
import IDUtils from '../../utils/IDUtils';
import StringUtils from '../../utils/StringUtils';
import { addNodes, getAttr, getNode, getNodes, getNumber, getText, serializeXmlToString, setAttr, setText } from '../../utils/xmlUtils';
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
  if (IDUtils.isNullID(getText(hox, 'docInfo folderInfo ID'))) {
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

  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');

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
  const count = getNodes(hox, 'approvalFlow participant participantID').filter((pID) => IDUtils.isNullID(pID.textContent)).length;
  const newParticipantIDs = IDUtils.getParticipantIDs(count);
  getNodes(hox, 'approvalFlow participant participantID')
    .filter((pID) => IDUtils.isNullID(pID.textContent))
    .forEach((pID, i) => {
      pID.textContent = newParticipantIDs[i];
    });

  // 첨부ID처리: 채번된 apprid와 participantid로 이용
  const drafterParticipantID = getText(hox, 'approvalFlow participant participantID');
  getNodes(hox, 'docInfo objectIDList objectID')
    .filter((objectID) => getAttr(objectID, null, 'type') === 'objectidtype_attach')
    .forEach((objectID, i) => {
      const newObjectId = IDUtils.getObjectID(newDocId, 100 + i);
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
  getNodes(hox, 'docInfo objectIDList objectID')
    .filter((objectID) => getAttr(objectID, null, 'type') === 'objectidtype_summary')
    .forEach((objectID) => {
      const newObjectId = IDUtils.getObjectID(newDocId, 3);
      setText(objectID, 'ID', newObjectId);
      setText(objectID, 'participantID', drafterParticipantID);
    });

  // enforceType
  const enforceTypes = getNodes(hox, 'docInfo content').map((content) => getText(content, 'enforceType'));
  console.log('enforceTypes', enforceTypes);
  let enforceType = 'enforcetype_not';
  if (enforceTypes.includes('enforcetype_external')) {
    enforceType = 'enforcetype_external';
  } else if (enforceTypes.includes('enforcetype_internal')) {
    enforceType = 'enforcetype_internal';
  }
  setText(hox, 'docInfo enforceType', enforceType);

  if (enforceType === 'enforcetype_not') {
    // 내부결재면, examRequest 내용 지우기
    getNode(hox, 'examRequest').textContent = null;
  }

  // 완료여부 체크.
  // 기안자 완료처리
  const currentParticipant = feMain.getCurrentParticipant();
  setText(currentParticipant, 'approvalStatus', 'partapprstatus_done');
  setText(currentParticipant, 'date', todayNow);
  setAttr(currentParticipant, null, 'IPAddress', window.myIpAddr);

  // 앞으로 결재할 사용자들
  const leftParticiants = getNodes(hox, 'approvalFlow participant')
    .filter((participant) => 'valid' === getText(participant, 'validStatus'))
    .filter((participant) => {
      // 진행, 대기, 보류, 기안 상태
      const approvalStatus = getText(participant, 'approvalStatus');
      return ['partapprstatus_draft', 'partapprstatus_now', 'partapprstatus_will', 'partapprstatus_postpone'].includes(approvalStatus);
    })
    .filter((participant) => {
      // 결재하는 타입
      const approvalType = getText(participant, 'approvalType');
      const approvalSubType = getText(participant, 'approvalSubTye');
      if (['user_nosign', 'user_refer', 'user_noapproval'].includes(approvalType)) {
        return false;
      }
      return true;
    });
  console.log('leftParticiants', leftParticiants);
  if (leftParticiants.length === 0) {
    // 남은 결재자가 없으므로, 완료처리한다
    setText(hox, 'docInfo approvalStatus', 'apprstatus_finish');
    setText(hox, 'docInfo approvalDate', todayNow);

    if (enforceType !== 'enforcetype_not') {
      // 대내, 대외이면, examRequest 내용 채우기
      setText(hox, 'examRequest conversionDate', todayNow);
      setText(hox, 'examRequest requestDate', todayNow);
      setText(hox, 'examRequest exam examID', IDUtils.getSancMsgID());
      setText(hox, 'examRequest exam examiner participantID', IDUtils.getParticipantIDs(1)[0]);
    }
  }

  // 웹한글 본문 저장
  const saveRet = await feEditor1.saveServer(newDocId);
  const bodyFileInfo = Capi.getFileFromURL(saveRet.downloadURL);

  // bms로 submit
  /**
   * /bms/com/hs/gwweb/appr/manageDocDrft.act
   */
  const formData = new FormData();
  formData.append('apprID', newDocId);
  formData.append('UID', rInfo.user.ID);
  formData.append('DID', rInfo.user.deptID);
  // 본문
  formData.append('ref_' + IDUtils.getObjectID(newDocId, 1), bodyFileInfo.TRID);
  // 첨부
  feAttachBox.listFileIDs().forEach((trid, i) => {
    formData.append('ref_' + IDUtils.getObjectID(newDocId, 100 + i), trid);
  });
  // 요약전
  if (feMain.summary.TRID !== null) {
    formData.append('ref_' + IDUtils.getObjectID(newDocId, 3), feMain.summary.TRID);
  }
  // hox
  formData.append('block_' + IDUtils.getObjectID(newDocId, 2), serializeXmlToString(hox));

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
