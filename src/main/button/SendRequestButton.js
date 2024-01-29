import DateUtils from '../../utils/DateUtils';
import IDUtils from '../../utils/IDUtils';
import { addNode, existsNode, getAttr, getNode, getNodes, getText, setAttr, setText } from '../../utils/xmlUtils';
import { makeEnforceHox4MultiDoc } from '../logic/makeEnforceHox';
import submitOfSendRequest from '../logic/submit/submitOfSendRequest';

const FD_APPLID_SENDING = 4020;
const HCLTAPP_RESIMSA = 7;

/**
 * 발송의뢰
 */
export default class SendRequestButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.W4125;
    this.classList.add('btn', 'btn-primary');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    await submitOfSendRequest();
  }
}

customElements.define('sendrequest-button', SendRequestButton, { extends: 'button' });

function dummy() {
  /*
      copyDocAsXmlPromise
        IMPL_CopyDocAsXml
          HWP__CopyDocAsXml 에디터2의 내용을 HWPML2X 형식의 xml 로 읽기
      SendDoc.updateContentPromise 안별로 contentIndex, bodyHwpXml, title, enforceHox(docInfo content를 분리해 각각 가진)
      isMulti: Doc.setExamDraftDocCommon  hox의 content 내용 수정
      SendDoc.setExamEnforceDocPromise
        if(pInfo.isMultiDraft()) {
          SendDoc.setExamEnforceDoc();
        } else {
          Doc.setExamDraftDoc();
        }
      SendDoc.setPostExamEnforceDocPromise
      real_SendRequest

      발송의뢰: 통합서식=일괄기안. 기안서식 --> 시행문 변환 필요
        대내시행 -> 새 apprid로 문서 분리
        대외시행 -> 시행문으로 만듬
    */

  // copyDocAsXmlPromise
  // -> editor2 내용 전체를 HWPML2X 형식으로 읽기
  // SendDoc.updateContentPromise
  // -> 현재 안의 데이터 저장
  // ==> FeContentSplitter에서 각 안의 문서 데이터 저장했음. 여기선 필요 없음
  const isMultiDraft = 'multiDraft' === getAttr(feMain.hox, 'hox', 'type');
  const isDraftForm = 'formtype_draft' === getText(feMain.hox, 'formInfo formType');

  const todayNow = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');

  const nodeFormInfo = getNode(feMain.hox, 'docInfo formInfo');
  const enforceType = getText(feMain.hox, 'docInfo enforceType');

  const enforceHoxList = [];

  console.log('SendRequestButton', isMultiDraft, isDraftForm, todayNow);

  // 원문서 hox 처리
  setAttr(feMain.hox, 'docInfo', 'modification', 'no');

  // objectID dirty=''
  getNodes(feMain.hox, 'objectIDList objectID').forEach((objectID) => {
    setAttr(objectID, null, 'dirty', '');
  });

  // Doc.setExamDraftDocCommon
  getNodes(feMain.hox, 'docInfo content').forEach((content, i) => {
    const enforceType = getText(content, 'enforceType');
    const sendStatus = getText(content, 'enforce sendStatus');
    const contentNumber = i + 1;

    console.log(contentNumber, enforceType, sendStatus, 'doccfg.autoInternalSend' + doccfg.autoInternalSend);

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

    if (isMultiDraft || (doccfg.autoInternalSend && enforceType === 'enforcetype_internal')) {
      const enforceHox = makeEnforceHox4MultiDoc(feMain.hox, contentNumber);
      const enforceApprID = getText(enforceHox, 'docInfo apprID');

      // 시행문 apprID를 content enforce docID에 설정
      setText(content, 'enforce docID', enforceApprID);
      setText(content, 'enforce sendStatus', 'apprstatus_finish');
      // 시행문의 docNumber를 enforce노드에 추가
      const nodeOfDocNumber = getNode(enforceHox, 'docNumber');
      getNode(content, 'enforce').append(nodeOfDocNumber.cloneNode(true));

      enforceHoxList.push(enforceHox);
    }
  });

  if (isDraftForm) {
    setText(feMain.hox, 'examRequest conversionDate', todayNow);
  }

  // hox
  setText(feMain.hox, 'docInfo enforceDate', todayNow);

  // participant: current = false
  getNodes(feMain.hox, 'approvalFlow participant').forEach((participant) => setAttr(participant, null, 'current', 'false'));

  // examRequest
  if (isMultiDraft) {
    // 일괄기안이면, examID 채번. 기안서식은 결재시 채번
    setText(feMain.hox, 'examRequest exam examID', IDUtils.getSancMsgID());
  }
  setText(feMain.hox, 'examRequest exam examDate', todayNow);

  // examRequest exam examStatus
  if (enforceType == 'enforcetype_not' || (doccfg.autoInternalSend && enforceType === 'enforcetype_internal')) {
    setText(feMain.hox, 'examRequest exam examStatus', 'apprstatus_finish');
  } else {
    if (rInfo.applID === FD_APPLID_SENDING && rInfo.cltApp === HCLTAPP_RESIMSA) {
      setText(feMain.hox, 'examRequest exam examStatus', 'apprstatus_rerequest');
    } else {
      setText(feMain.hox, 'examRequest exam examStatus', 'apprstatus_request');
    }
  }

  // examiner participant ID 채번
  let participantID = IDUtils.getParticipantIDs(1)[0];
  setText(feMain.hox, 'examRequest exam examiner participantID', participantID);
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

  console.log(feMain.hox);
  enforceHoxList.forEach((enforceHox) => console.log(enforceHox));

  // editor
  // 심사정보
  // IMPL_PutFieldText('editor2', CELL_EXAM_DATE, util_mkdisplaydate(rInfo.currentDate));
  // IMPL_PutFieldText('editor2', CELL_EXAM_SIGNER, rInfo.user.name);

  // feMain.splitedExamDocMap.forEach((examDoc, contentName) => {
  //   console.log(contentName, examDoc);
  //   feMain.feEditor2.insertContent(examDoc.hwp);
  // });
}
