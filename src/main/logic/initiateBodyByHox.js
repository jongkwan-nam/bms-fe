import FeEditor from '../FeEditor';
import { HoxToBody } from './HoxToBody';

/**
 * 기안시 문서 로딩 후 hox 초기 정보를 본문에 반영
 * - 기안자, 기안부서 정보 반영
 * - 기안일자
 * - 사인셀 초기화 및 기본 결재선 반영
 * @param {XMLDocument} hox
 * @param {FeEditor} editor
 */
export default (hox, editor) => {
  const hoxToBody = new HoxToBody(hox, editor);

  hoxToBody.setDrafter(); // 기안자
  hoxToBody.setDraftDate(); // 기안일자
  hoxToBody.setOrgEx(); // 사용자/부서 정보
  hoxToBody.setCampaign(); // 표어
  hoxToBody.setReceive(); // 수신, 수신처캡션, 수신처
  hoxToBody.setSendOrgName(); // 발신기관명
  hoxToBody.setSenderName(); // 발신명의
  hoxToBody.setApprovalFlowInit(); // 결재선
  hoxToBody.setDocNumber(); // 문서번호
  hoxToBody.setEnforceDate(); // 시행일자
  hoxToBody.setPublication(); // 공개여부

  // 접수번호 ACCEPT_NUM
  // 접수일자 ACCEPT_DATE
  // 로고 LOGO
  // 심볼 SYMBOL
  // 관인 SEAL_STAMP
  // 관인생략 SEAL_OMISSION
};
