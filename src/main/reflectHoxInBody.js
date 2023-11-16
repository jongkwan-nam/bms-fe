import * as DateUtils from '../utils/dateUtils';
import { getAttr, getNodes, getText } from '../utils/hoxUtils';
import Cell from './CellNames';
import FeEditor from './FeEditor';

/*
 * hox 정보를 본문에 반영
 */

/**
 * @param {Document} hox
 * @param {FeEditor} editor
 */
export default (hox, editor) => {
  //
  console.log('reflectHoxInBody', hox, editor);

  if (rInfo.appType === 'sancgian' && rInfo.cltType === 'draft') {
    // 기안
  } else if (rInfo.appType === 'sancgian' && rInfo.cltType === 'accept') {
    // 접수
  } else if (rInfo.appType === 'sanckyul' && rInfo.cltType === 'kyul') {
    // 결재
  } else if (rInfo.appType === 'sancview' && rInfo.cltType === 'view') {
    // 보기
  } else if (rInfo.appType === 'ctrlmana' && rInfo.cltType === 'request') {
    // 발송의뢰
  } else if (rInfo.appType === 'ctrlmana' && rInfo.cltType === 'control') {
    // 발송처리
  }

  console.log('기안자 exist?', editor.hwpCtrl.FieldExist('기안자'));
  console.log('결재제목 exist?', editor.hwpCtrl.FieldExist('결재제목'));

  console.log('GetFieldList 0 1', editor.hwpCtrl.GetFieldList(0, 1).split(String.fromCharCode(2)));
  console.log('GetFieldList 0 2', editor.hwpCtrl.GetFieldList(0, 2));
  console.log('GetFieldList 0 4', editor.hwpCtrl.GetFieldList(0, 4));

  // 기안자
  editor.putFieldText(Cell.DRAFTER, rInfo.user.name);
  // 기안일자
  editor.putFieldText('기안일자', DateUtils.format(getText(hox, 'draftDate'), 'yyyy.mm.dd'));
  // 머리표어
  // 로고
  // 발신기관명
  // 심볼
  // 수신
  // 경유
  // 결재제목
  editor.putFieldText(Cell.DOC_TITLE, getText(hox, 'docInfo title'));
  // 발신명의
  // 관인생략
  // 수신처캡션
  // 수신처
  // 직위.1 ~ .n
  // 서명.1 ~ .n
  let signCellIndex = 0;
  getNodes(hox, 'approvalFlow participant').forEach((paricipant) => {
    //
    let approvalType = getText(paricipant, 'approvalType');
    let position = getText(paricipant, 'position');
    let name = getText(paricipant, 'name');

    if (approvalType === 'user_approval') {
      ++signCellIndex;
      editor.putFieldText(`${Cell.POS}.${signCellIndex}`, position);
      editor.putFieldText(`${Cell.SIGN}.${signCellIndex}`, name);
    }
  });
  // 협조직위.1 ~ .n
  // 협조.1 ~ .n
  // 문서번호
  // 시행일자
  editor.putFieldText('시행일자', DateUtils.format(new Date(), 'yyyy.mm.dd'));
  // 접수번호
  // 접수일자
  // 우편번호
  // 주소
  // 홈페이지
  // 전화
  // 전송
  // 이메일
  // 공개여부
  editor.putFieldText(Cell.DOC_PUBLIC, getAttr(hox, 'publication', 'type'));
  // 관인
};
