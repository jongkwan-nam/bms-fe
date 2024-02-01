import FeEditor from '../FeEditor';
import { HoxToBody } from './HoxToBody';

/**
 * 결재정보에서 수신한 hox 정보를 본문에 반영
 * - 결재제목
 * - 발신명의
 * - 수신, 수신처, 수신처캡션
 * - 문서번호
 * - 공개여부
 * - 결재선
 * - 시행일자
 *
 * @param {XMLDocument} hox
 * @param {FeEditor} editor
 */
export default (hox, editor) => {
  const hoxToBody = new HoxToBody(hox, editor);

  const result = { ok: true, message: '' };
  try {
    hoxToBody.setTitle(); // 결재제목
    hoxToBody.setSenderName(); // 발신명의
    hoxToBody.setReceive(); // 수신
    hoxToBody.setDocNumber(); // 문서번호
    hoxToBody.setPublication(); // 공개여부
    // hoxToBody.setApprovalFlow(); // 결재선에 따른 사인(직위, 이름 미리보기) 처리
    // hoxToBody.setSignOfFlow();
    hoxToBody.setEnforceDate(); // 시행일자
  } catch (error) {
    result.ok = false;
    result.message = error.toString();
    console.error(error);
  }
  return result;
};
