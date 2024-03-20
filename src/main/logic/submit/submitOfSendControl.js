import Capi from '../../../utils/Capi';
import DateUtils from '../../../utils/DateUtils';
import IDUtils from '../../../utils/IDUtils';
import { addNode, existsNode, getAttr, getNode, getNodes, getText, serializeXmlToString, setAttr, setText } from '../../../utils/xmlUtils';
import Cell from '../../CellNames';
import PubDocSave from '../../PubDocSave';
import { makeEnforceHox4MultiDoc } from '../makeEnforceHox';

/**
 * 발송처리
 */
export default async () => {
  //
  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
  const nodeFormInfo = getNode(feMain.hox, 'docInfo formInfo');
  const enforceDocInfos = [];

  // 원문서 hox 처리
  setAttr(feMain.hox, 'docInfo', 'modification', 'no');
  setText(feMain.hox, 'docInfo enforceDate', todayNow);
  getNodes(feMain.hox, 'objectIDList objectID').forEach((objectID) => objectID.setAttribute('dirty', '')); // objectID dirty=''
  getNodes(feMain.hox, 'approvalFlow participant').forEach((participant) => participant.setAttribute('current', 'false'));

  setText(feMain.hox, 'examRequest exam examDate', todayNow);
  setText(feMain.hox, 'examRequest exam examStatus', 'apprstatus_finish');

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
  setText(feMain.hox, 'examRequest exam examiner status', 'partapprstatus_done');
  setText(feMain.hox, 'examRequest exam examiner examType', 'examinertype_send');
  setAttr(feMain.hox, 'examRequest exam examiner reportEtcType', 'typeID', '0');
  setAttr(feMain.hox, 'examRequest exam examiner examNum', 'sequence', '0');

  const hoxType = getAttr(feMain.hox, 'hox', 'type'); // draft or multiDraft
  const isMultiDraft = 'multiDraft' === hoxType;
  if (isMultiDraft) {
    // content 처리
    getNodes(feMain.hox, 'docInfo content').forEach((content, i) => {
      //
      const enforceType = getText(content, 'enforceType');
      const contentNumber = i + 1;

      if ('enforcetype_not' === enforceType) {
        console.log('content', contentNumber, 'enforceType = enforcetype_not');
        return;
      }

      // 발송 완료된 안 제외
      if ('apprstatus_finish' === getText(content, 'enforce sendStatus')) {
        console.log('content', contentNumber, 'enforce sendStatus = apprstatus_finish');
        return;
      }

      if (!existsNode(content, 'enforceMethod')) {
        addNode(content, 'enforceMethod');
      }
      setText(content, 'enforceMethod', 'enforcemethod_direct');

      // enforce 노드가 없다면 초기값으로 추가
      if (!existsNode(content, 'enforce')) {
        const enforceNode = addNode(content, 'enforce');
        addNode(enforceNode, 'docID', IDUtils.NULL_APPRID);
        addNode(enforceNode, 'sendStatus', 'apprstatus_ing');
        enforceNode.append(nodeFormInfo.cloneNode(true));
      }

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
    });
  } else {
    // 단일안 발송
    setText(feMain.hox, 'docInfo content receiptInfo senderID', rInfo.user.ID);
    setText(feMain.hox, 'docInfo content receiptInfo senderDeptID', rInfo.dept.ID);
  }

  // submit

  const apprID = getText(feMain.hox, 'apprID');

  const formData = new FormData();
  formData.append('apprID', apprID);
  formData.append('UID', rInfo.user.ID);
  formData.append('DID', rInfo.user.deptID);

  const pubDocSave = new PubDocSave(feMain.hox, feMain.feEditor2);

  let url;

  if (isMultiDraft) {
    url = `${PROJECT_CODE}/com/hs/gwweb/appr/manageDocSndngEnfoce.act`;

    formData.append('block_' + IDUtils.getObjectID(apprID, 2), serializeXmlToString(feMain.hox));

    const sendApprIDs = [];

    for (const enforceDocInfo of enforceDocInfos) {
      //
      const splitedExamDoc = feMain.splitedExamDocMap.get('content' + enforceDocInfo.contentNumber);
      await feMain.feEditor2.openByJSON(splitedExamDoc.hwpJson);

      // submit전에 문서에 표시할 내용들
      feMain.feEditor2.putFieldText(Cell.DOC_NUM, getText(enforceDocInfo.hox, 'docInfo docNumber displayDocNumber')); // 문서번호
      feMain.feEditor2.putFieldText(Cell.ENFORCE_DATE, getText(enforceDocInfo.hox, 'docInfo enforceDate').substring(0, 10)); // 시행일자

      const saveRet = await feMain.feEditor2.saveServer(enforceDocInfo.apprID);
      const bodyFileInfo = Capi.getFileFromURL(saveRet.downloadURL);

      formData.append('ref_' + IDUtils.getObjectID(enforceDocInfo.apprID, 1), bodyFileInfo.TRID);
      formData.append('block_' + IDUtils.getObjectID(enforceDocInfo.apprID, 2), serializeXmlToString(enforceDocInfo.hox));

      sendApprIDs.push(enforceDocInfo.apprID);

      await pubDocSave.processPubDoc(enforceDocInfo.hox); // 시행문별로 LDAP 여부 검사하여, 공문서 처리
    }
    if (sendApprIDs.length > 0) {
      formData.append('sendApprID', sendApprIDs.join(','));
    }
  } else {
    url = `${PROJECT_CODE}/com/hs/gwweb/appr/manageDocSndng.act`;

    // 단일안
    feMain.feEditor2.putFieldText(Cell.DOC_NUM, getText(feMain.hox, 'docInfo docNumber displayDocNumber')); // 문서번호
    feMain.feEditor2.putFieldText(Cell.ENFORCE_DATE, getText(feMain.hox, 'docInfo enforceDate').substring(0, 10)); // 시행일자

    const saveRet = await feMain.feEditor2.saveServer(apprID);
    const bodyFileInfo = Capi.getFileFromURL(saveRet.downloadURL);

    // 원문 hox
    formData.append('ref_' + IDUtils.getObjectID(apprID, 1), bodyFileInfo.TRID);
    formData.append('block_' + IDUtils.getObjectID(apprID, 2), serializeXmlToString(feMain.hox));
    formData.append('sendApprID', apprID);

    await pubDocSave.processPubDoc(feMain.hox); // 단일안 LDAP 여부 검사하여, 공문서 처리
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
    throw new Error('발송처리에 실패하였습니다.');
  }
};
