import { getText } from '../../utils/hoxUtils';

export default class FeApprovalType extends HTMLElement {
  constructor() {
    super();
    console.debug('FeApprovalType init');
  }

  connectedCallback() {
    console.debug('FeApprovalType connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-approvaltype');
    this.shadowRoot.append(LINK, wrapper);

    this.label = wrapper.appendChild(document.createElement('label'));
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    let approvalTypeCode = getText(hox, 'docInfo approvalType');
    let approvalTypeText = getTextByCode(approvalTypeCode);
    this.label.innerHTML = approvalTypeText;
  }
}

// Define the new element
customElements.define('fe-approvaltype', FeApprovalType);

const ApprConst = {
  HS_SANCTION_AGREE_STR: 'apprtype_agree',
  HS_SANCTION_ALLTYPE_STR: 'apprtype_all',
  HS_SANCTION_AUDIT_STR: 'apprtype_audit',
  HS_SANCTION_COMPLIANCE_STR: 'apprtype_compliance',
  HS_SANCTION_CONTROL_STR: 'apprtype_control',
  HS_SANCTION_DELIBERATE_STR: 'apprtype_deliberate',
  HS_SANCTION_DOC_STR: 'apprtype_receipt',
  HS_SANCTION_GRM_STR: 'apprtype_pubshow',
  HS_SANCTION_ICHEOP_STR: 'apprtype_transmit',
  HS_SANCTION_MSG_STR: 'apprtype_normal',
  HS_SANCTION_PASSDOC_STR: 'apprtype_pass',
  HS_SANCTION_REF_STR: 'apprtype_refer',
  HS_SANCTION_REPORT_STR: 'apprtype_report',
  HS_SANCTION_SEND_STR: 'apprtype_send',
};

function getTextByCode(code) {
  var szApprType = '';
  switch (code) {
    case ApprConst.HS_SANCTION_MSG_STR:
      szApprType = GWWEBMessage.at_sanction_msg; // 일반
      break;
    case ApprConst.HS_SANCTION_SEND_STR:
      szApprType = GWWEBMessage.at_sanction_send; // 발신
      break;
    case ApprConst.HS_SANCTION_DOC_STR:
      szApprType = GWWEBMessage.at_sanction_doc; // 수신
      break;
    case ApprConst.HS_SANCTION_AGREE_STR:
      szApprType = GWWEBMessage.at_sanction_agree; // 협조
      break;
    case ApprConst.HS_SANCTION_COMPLIANCE_STR:
      szApprType = GWWEBMessage.at_sanction_compliance; // 준법감시
      break;
    case ApprConst.HS_SANCTION_AUDIT_STR:
      szApprType = GWWEBMessage.at_sanction_audit; // 감사
      break;
    case ApprConst.HS_SANCTION_REF_STR:
      szApprType = GWWEBMessage.at_sanction_ref; // 참조
      break;
    case ApprConst.HS_SANCTION_REPORT_STR:
      szApprType = GWWEBMessage.at_sanction_report; // 보고
      break;
    case ApprConst.HS_SANCTION_CONTROL_STR:
      szApprType = GWWEBMessage.at_sanction_control; // 심사
      break;
    case ApprConst.HS_SANCTION_GRM_STR:
      szApprType = GWWEBMessage.at_sanction_grm; // 공람
      break;
    case ApprConst.HS_SANCTION_ICHEOP_STR:
      szApprType = GWWEBMessage.at_sanction_icheop; // 이첩
      break;
    case ApprConst.HS_SANCTION_PASSDOC_STR:
      szApprType = GWWEBMessage.at_sanction_passdoc; // 경유
      break;
    case ApprConst.HS_SANCTION_ALLTYPE_STR:
      szApprType = GWWEBMessage.at_sanction_alltype; // 전체
      break;
    case ApprConst.HS_SANCTION_DELIBERATE_STR:
      szApprType = GWWEBMessage.at_sanction_deliberate; // 심의
      break;
  }
  return szApprType;
}
