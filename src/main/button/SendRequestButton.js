import * as DateUtils from '../../utils/dateUtils';
import { addNode, existsNode, getAttr, getNode, getNodeArray, getNodes, getText, setAttr, setText } from '../../utils/hoxUtils';
import * as IdUtils from '../../utils/idUtils';

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
    const isMultiDraft = getAttr(feMain.hox, 'hox', 'type') === 'multiDraft';
    if (isMultiDraft) {
      const nodeFormInfo = getNode(feMain.hox, 'docInfo formInfo');
      const enforceType = getText(feMain.hox, 'docInfo enforceType');

      // Doc.setExamDraftDocCommon
      getNodeArray(feMain.hox, 'docInfo content')
        .filter((content) => getText(content, 'enforceType') !== 'enforcetype_not')
        .forEach((content) => {
          //
          setText(content, 'enforceMethod', 'enforcemethod_direct');
          // enforce 노드가 없다면 초기값으로 추가
          if (!existsNode(content, 'enforce')) {
            const enforceNode = addNode(content, 'enforce');
            addNode(enforceNode, 'docID', '00000000000000000000');
            addNode(enforceNode, 'sendStatus', 'apprstatus_ing');
            enforceNode.append(nodeFormInfo.cloneNode(true));
          }
        });

      // SendDoc.setExamEnforceDoc();
      const formType = getText(nodeFormInfo, 'formType');
      if (formType === 'formtype_draft') {
        // TODO 기안서식일때. apprSendCommon_hwp.js 48line
      } else if (formType === 'formtype_uniform') {
        // hox
        setAttr(feMain.hox, 'docInfo', 'modification', 'no');
        setText(feMain.hox, 'docInfo enforceDate', DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS'));
        // participant
        getNodes(feMain.hox, 'approvalFlow participant').forEach((participant) => setAttr(participant, null, 'current', 'false'));
        // examRequest
        let examID = getText(feMain.hox, 'examRequest exam examID');
        if (IdUtils.isNullID(examID)) {
          // TODO msg ID 채번
          examID = IdUtils.getSancMsgID();
          setText(feMain.hox, 'examRequest exam examID', examID);
        }
        setText(feMain.hox, 'examRequest exam examDate', DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS'));
        if (enforceType == 'enforcetype_not' || (doccfg.autoInternalSend && enforceType === 'enforcetype_internal')) {
          setText(feMain.hox, 'examRequest exam examStatus', 'apprstatus_finish');
        } else {
          if (rInfo.applID === FD_APPLID_SENDING && rInfo.cltApp === HCLTAPP_RESIMSA) {
            setText(feMain.hox, 'examRequest exam examStatus', 'apprstatus_rerequest');
          } else {
            setText(feMain.hox, 'examRequest exam examStatus', 'apprstatus_request');
          }
          // TODO participant ID 채번
          let participantID = IdUtils.getParticipantIDs(1)[0];
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

          //
        }

        // editor
        // 심사정보
        // IMPL_PutFieldText('editor2', CELL_EXAM_DATE, util_mkdisplaydate(rInfo.currentDate));
        // IMPL_PutFieldText('editor2', CELL_EXAM_SIGNER, rInfo.user.name);
      }

      // SendDoc.setPostExamEnforceDocPromise
      feMain.splitedExamDocMap.forEach((examDoc, contentName) => {
        console.log(contentName, examDoc);

        // SendDoc.setPreEnforceHoxPromise
        const enforceType = getText(examDoc.hox, 'docInfo enforceType');
        // 대내 자동발송이면 ID 채번
        if (doccfg.autoInternalSend && enforceType === 'enforcetype_internal') {
          // 시행문의 ID 채번
          getText(examDoc.hox, 'docInfo apprID', IdUtils.getSancMsgID());
          // TODO 문서번호 설정

          // 원문서에 완료 표시
          getNode(feMain.hox, 'docInfo content enforce sendStatus', examDoc.contentNumber).textContent = 'apprstatus_finish';

          // 본문 저장 -> TRID
        }
        // participantID 새로 채번
        const l = getNodes(examDoc.hox, 'approvalFlow participant').length;
        IdUtils.getParticipantIDs(l).forEach((id, i) => {
          getNode(examDoc.hox, 'approvalFlow participant participantID', i).textContent = id;
        });

        // SendDoc.loadEnforceDocToEditorPromise
        feMain.feEditor2.insertContent(examDoc.hwp);

        // SendDoc.setEnforceDocFormUploadPromise
      });
    } else {
      // Doc.setExamDraftDoc();
      // SendDoc.setPostExamEnforceDocPromise
    }
  }
}

customElements.define('sendrequest-button', SendRequestButton, { extends: 'button' });
