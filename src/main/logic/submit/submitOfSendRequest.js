import DateUtils from '../../../utils/DateUtils';
import IDUtils from '../../../utils/IDUtils';
import { addNode, existsNode, getAttr, getNode, getNodes, getText, serializeXmlToString, setAttr, setText } from '../../../utils/xmlUtils';
import Cell from '../../CellNames';
import { makeEnforceHox4MultiDoc } from '../makeEnforceHox';

const FD_APPLID_SENDING = 4020;
const HCLTAPP_RESIMSA = 7;

/**
 * 발송의뢰
 */
export default async () => {
  /*
  발송대기에서 의뢰 처리가 필요한 경우
  1. 기안서식: 시행문 변환이 필요하므로
  2. 통합서식: 일괄기안일때.
  */

  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');

  const isMultiDraft = 'multiDraft' === getAttr(feMain.hox, 'hox', 'type');
  const nodeFormInfo = getNode(feMain.hox, 'docInfo formInfo');
  const enforceDocInfos = [];

  // 원문서 hox 처리
  setAttr(feMain.hox, 'docInfo', 'modification', 'no');
  setText(feMain.hox, 'docInfo enforceDate', todayNow);
  getNodes(feMain.hox, 'objectIDList objectID').forEach((objectID) => objectID.setAttribute('dirty', '')); // objectID dirty=''
  getNodes(feMain.hox, 'approvalFlow participant').forEach((participant) => participant.setAttribute('current', 'false'));

  setText(feMain.hox, 'examRequest exam examDate', todayNow);
  if (rInfo.applID === FD_APPLID_SENDING && rInfo.cltApp === HCLTAPP_RESIMSA) {
    setText(feMain.hox, 'examRequest exam examStatus', 'apprstatus_rerequest');
  } else {
    setText(feMain.hox, 'examRequest exam examStatus', 'apprstatus_request');
  }
  if (IDUtils.isNullID(getText(feMain.hox, 'examRequest exam examID'))) {
    setText(feMain.hox, 'examRequest exam examID', IDUtils.getSancMsgID());
  }
  if (IDUtils.isNullID(getText(feMain.hox, 'examRequest exam examiner participantID'))) {
    setText(feMain.hox, 'examRequest exam examiner participantID', IDUtils.getParticipantIDs(1)[0]);
  }
  setText(feMain.hox, 'examRequest exam examiner position', rInfo.user.positionName);
  setText(feMain.hox, 'examRequest exam examiner dutyName', rInfo.user.dutyName);
  setText(feMain.hox, 'examRequest exam examiner ID', rInfo.user.ID);
  setText(feMain.hox, 'examRequest exam examiner name', rInfo.user.name);
  setText(feMain.hox, 'examRequest exam examiner type', 'user');
  setText(feMain.hox, 'examRequest exam examiner department ID', rInfo.dept.ID);
  setText(feMain.hox, 'examRequest exam examiner department name', rInfo.dept.name);
  setText(feMain.hox, 'examRequest exam examiner date', '1970-01-01T09:00:00');
  setText(feMain.hox, 'examRequest exam examiner status', 'partapprstatus_now');
  setText(feMain.hox, 'examRequest exam examiner examType', 'examinertype_send');
  setAttr(feMain.hox, 'examRequest exam examiner reportEtcType', 'typeID', '0');
  setAttr(feMain.hox, 'examRequest exam examiner examNum', 'sequence', '0');

  // content 처리
  getNodes(feMain.hox, 'docInfo content').forEach((content, i) => {
    /*
      enforceType과 doccfg.autoInternalSend에 따라 
      - 내부: nothing
      - 대내, 대외: 
        enforce 추가 
        sendStatus = apprstatus_ing
      - 대내 + doccfg.autoInternalSend == true
        enforce docID 채번 
        enforce docNumber 채번
        시행문 hox 만들기
    */
    const enforceType = getText(content, 'enforceType');
    const contentNumber = i + 1;

    if ('enforcetype_not' === enforceType) {
      return;
    }

    setText(content, 'enforceMethod', 'enforcemethod_direct');

    // enforce 노드가 없다면 초기값으로 추가
    if (!existsNode(content, 'enforce')) {
      const enforceNode = addNode(content, 'enforce');
      addNode(enforceNode, 'docID', IDUtils.NULL_APPRID);
      addNode(enforceNode, 'sendStatus', 'apprstatus_ing');
      enforceNode.append(nodeFormInfo.cloneNode(true));
    }

    if (doccfg.autoInternalSend && 'enforcetype_internal' === enforceType) {
      const enforceHox = makeEnforceHox4MultiDoc(feMain.hox, contentNumber);
      const enforceApprID = getText(enforceHox, 'docInfo apprID');

      // 시행문 apprID를 content enforce docID에 설정
      setText(content, 'enforce docID', enforceApprID);
      setText(content, 'enforce sendStatus', 'apprstatus_finish');
      // 시행문의 docNumber를 enforce노드에 추가
      const nodeOfEngforceDocNumber = getNode(enforceHox, 'docNumber');
      getNode(content, 'enforce').append(nodeOfEngforceDocNumber.cloneNode(true));

      enforceDocInfos.push({
        apprID: enforceApprID,
        contentNumber: contentNumber,
        hox: enforceHox,
      });
    }
  });

  // submit

  const apprID = getText(feMain.hox, 'apprID');

  // /bms/com/hs/gwweb/appr/manageDocSndng.act
  const formData = new FormData();
  formData.append('apprID', apprID);
  formData.append('UID', rInfo.user.ID);
  formData.append('DID', rInfo.user.deptID);

  // 원문 hox
  formData.append('block_' + IDUtils.getObjectID(apprID, 2), serializeXmlToString(feMain.hox));

  const sendApprIDs = [];

  for (const enforceDocInfo of enforceDocInfos) {
    //
    const splitedExamDoc = feMain.splitedExamDocMap.get('content' + enforceDocInfo.contentNumber);
    await feMain.feEditor2.openByJSON(splitedExamDoc.hwpJson);

    // submit전에 문서에 표시할 내용들
    feMain.feEditor2.putFieldText(Cell.DOC_NUM, getText(enforceDocInfo.hox, 'docInfo docNumber displayDocNumber')); // 문서번호
    feMain.feEditor2.putFieldText(Cell.ENFORCE_DATE, getText(enforceDocInfo.hox, 'docInfo enforceDate')); // 시행일자

    const downloadURL = await feMain.feEditor2.saveServer(enforceDocInfo.apprID);
    const bodyFileInfo = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/getFileFromURL.act?url=${downloadURL}`).then((res) => res.json());
    if (!bodyFileInfo.ok) {
      console.error('downloadURL=%s, bodyFileInfo=%s', downloadURL, bodyFileInfo);
      throw new Error('웹한글 파일 저장 오류.');
    }

    formData.append('ref_' + IDUtils.getObjectID(enforceDocInfo.apprID, 1), bodyFileInfo.TRID);
    formData.append('block_' + IDUtils.getObjectID(enforceDocInfo.apprID, 2), serializeXmlToString(enforceDocInfo.hox));

    sendApprIDs.push(enforceDocInfo.apprID);
  }
  if (sendApprIDs.length > 0) {
    formData.append('sendApprID', sendApprIDs.join(','));
  }

  let url = `${PROJECT_CODE}/com/hs/gwweb/appr/manageDocSndng.act`;
  if (doccfg.autoInternalSend) {
    url = `${PROJECT_CODE}/com/hs/gwweb/appr/manageDocSndngEnfoce.act`;
  }

  const ret = await fetch(url, {
    method: 'POST',
    body: formData,
  }).then((res) => res.text());
  //  {RESULT:OK}
  console.log('ret', ret);

  if ('{RESULT:OK}' === ret.trim()) {
    alert('완료되었습니다.');
  } else {
    throw new Error('발송의뢰에 실패하였습니다.');
  }
};
