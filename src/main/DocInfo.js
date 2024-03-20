import { getAttr, getNodes, getText } from '../utils/xmlUtils';

export default class DocInfo {
  myApprType;
  apprStatus;
  formType;
  isAbsentOrgUser;
  auditCommentID;
  auditCommentFilePath; // TODO 담겨있으면 submit시 포함되어야 한다
  isDirtyDoc;
  currentParticipant;

  constructor() {
    this.docApprType = getText(feMain.hox, 'docInfo approvalType');
    this.apprStatus = getText(feMain.hox, 'docInfo approvalStatus');
    this.formType = getText(feMain.hox, 'docInfo formInfo formType');
    this.hoxType = getAttr(feMain.hox, 'hox', 'type');

    // set current participant
    const participantNodes = getNodes(feMain.hox, 'approvalFlow participant');
    for (let i = 0; i < participantNodes.length; i++) {
      const participant = participantNodes[i];
      if (getText(participant, 'validStatus') === 'revoked') {
        continue;
      }
      const approvalStatus = getText(participant, 'approvalStatus');
      const isAbsent = getAttr(participant, null, 'absent') === 'true';
      const id = getText(participant, 'ID');
      const delegatorId = getText(participant, 'delegator ID');
      if (['partapprstatus_done', 'partapprstatus_draft'].includes(approvalStatus)) {
        if (this.apprStatus === 'apprstatus_finish' && isAbsent && id === rInfo.user.ID) {
          this.isAbsentOrgUser = true;
        }
      } else if (['partapprstatus_now', 'partapprstatus_postpone', 'partapprstatus_cease', 'partapprstatus_will'].includes(approvalStatus)) {
        if (id === rInfo.user.ID) {
          //
        } else if (isAbsent && delegatorId === rInfo.user.ID) {
          this.absentOrgUser = { nodeName: getText(participant, 'name'), ID: id };
        } else {
          continue;
        }

        this.currentParticipant = participant;
        this.myPos = i;
        this.myApprType = getText(participant, 'approvalType');
        this.myApprSubType = getText(participant, 'approvalSubType');
        // this.grantedAction = toHash(getText(participant, 'grantedAction')); // defaultaction_setupflow | defaultaction_editdoc | defaultaction_addattach
        this.participantID = getText(participant, 'participantID');
        this.majorVersion = getText(participant, 'bodyFileVersion major');
        this.minorVersion = getText(participant, 'bodyFileVersion minor');
        var pf = getText(participant, 'participantFlag');
        if (approvalStatus === 'partapprstatus_postpone' && pf.indexOf('modified_body') != -1) {
          feMain.feEditor1.setDocumentUpdated(true);
          // IMPL_SetDocumentUpdated('editor1', true);
          this.isDirtyDoc = true;
        }
        break;
      }
    }
  }

  isAccept() {
    return ['apprtype_agree', 'apprtype_audit', 'apprtype_receipt', 'apprtype_refer', 'apprtype_compliance', 'apprtype_pubshow'].includes(this.docApprType);
  }

  isAgreeDoc() {
    return ['apprtype_agree'.includes(this.docApprType)];
  }

  isAuditDoc() {
    return ['apprtype_audit'.includes(this.docApprType)];
  }

  isComplianceDoc() {
    return ['apprtype_compliance'.includes(this.docApprType)];
  }

  isMultiDraft() {
    return this.hoxType === 'multiDraft';
  }
}
