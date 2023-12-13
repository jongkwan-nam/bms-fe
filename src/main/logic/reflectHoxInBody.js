import * as DateUtils from '../../utils/dateUtils';
import { getAttr, getNodes, getText } from '../../utils/hoxUtils';
import Cell from '../CellNames';
import FeEditor from '../FeEditor';

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
  // 머리표어 HEAD_CAMPAIGN
  // 로고 LOGO
  // 발신기관명 ORGAN
  // 심볼 SYMBOL
  // 수신, 수신처캡션, 수신처
  let enforceType = getText(hox, 'docInfo enforceType');
  if (enforceType === 'enforcetype_not') {
    editor.putFieldText(Cell.RECEIVE, GWWEBMessage[enforceType]);
    editor.putFieldText(Cell.RECV_CAPTION, '');
    editor.putFieldText(Cell.RECLIST, '');
  } else {
    // docInfo content receiptInfo recipient 갯수로 수신, 수신처캡션, 수신처 설정
    if (getNodes(hox, 'docInfo content receiptInfo recipient').length > 1) {
      // 복수의 수신처 일때
      editor.putFieldText(Cell.RECEIVE, GWWEBMessage.cmsg_1080); // 수신 => 수신자참조
      editor.putFieldText(Cell.RECV_CAPTION, GWWEBMessage.cmsg_2718); // 수신처캡션 => 수신자
      editor.putFieldText(Cell.RECLIST, getText(hox, 'docInfo content receiptInfo displayString')); // 수신처
    } else {
      // 단일 수신처
      editor.putFieldText(Cell.RECEIVE, getText(hox, 'docInfo content receiptInfo displayString'));
      editor.putFieldText(Cell.RECV_CAPTION, '');
      editor.putFieldText(Cell.RECLIST, '');
    }
  }
  // 경유 VIA or PASS
  // 결재제목
  editor.putFieldText(Cell.DOC_TITLE, getText(hox, 'docInfo title'));
  // 발신명의
  editor.putFieldText(Cell.SENDERNAME, getText(hox, 'docInfo content receiptInfo senderName'));
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
  // 협조직위.1 ~ .n AGREE_POS
  // 협조.1 ~ .n AGREE_SIGN
  // 문서번호 DOC_NUM
  // 시행일자
  editor.putFieldText(Cell.ENFORCE_DATE, DateUtils.format(new Date(), 'yyyy.mm.dd'));
  // 접수번호 ACCEPT_NUM
  // 접수일자 ACCEPT_DATE
  // 우편번호
  // 주소 USER_ADDR
  // 홈페이지; DEPT_INFO4: '부서홈페이지', USER_HOMEURL: '개인홈페이지'
  // 전화; USER_PHONE: '개인전화', DEPT_INFO2: '부서전화'
  // 전송
  // 이메일; USER_EMAIL: '개인이메일',
  // 공개여부
  editor.putFieldText(Cell.DOC_PUBLIC, getAttr(hox, 'publication', 'type'));
  // 관인 SEAL_STAMP
  // 관인생략 SEAL_OMISSION
};
