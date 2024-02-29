import $ from 'jquery';
import { CELL_CBODY, Capi, DATATYPE_HTML, DATATYPE_TEXT, EDITMODE_NORMAL, IMPL_GetCellInfo, IMPL_GetFieldTextEx, IMPL_MoveToField, IMPL_PutFieldText, IMPL_PutFieldText4Speed, IMPL_RenameField, IMPL_SetCellFieldName, IMPL_SetFieldFormControlType, WORDTYPE_HWPWEB, editor, one_by_one, transfile_url } from './sanc0_support';

var QDB_CONTEXT_NAME = '/qdb';

var sanc0Const = {
  sancserverURL: QDB_CONTEXT_NAME + '/sancserver.do',
  DEBUG: false,

  DocInfoDelimiter: ' ',
  CheckFormName: null,
  SancFormName: null,
  NotSancEvent: null,

  /*****************************************************************************/
  /* Signer Status */
  /*****************************************************************************/
  HS_DRAFT: 'partapprstatus_draft',
  HS_DONE: 'partapprstatus_done',
  HS_NOW: 'partapprstatus_now',
  HS_WILL: 'partapprstatus_will',
  HS_REJECT: 'partapprstatus_reject',
  //	HS_REJECT_HOF			: 0x00000020,
  //	HS_REJECT_USER			: 0x00000040,		/* 95/11/15 by jaylee */
  HS_SKIP: 'partapprstatus_skip',
  HS_ALL: 'partapprstatus_all',
  HS_POSTPONE: 'partapprstatus_postpone' /* 보류*/,
  //	HS_CANCEL				: 0x00000400,		// 회수
  //	HS_SIGNER_ALL			: 0xFFFFFFFF,		/* Filter */
  // new from GW 8.0
  //	HS_CEASE				: "partapprstatus_cease", // 중단
  //	HS_REQ_MODIFYLINE		: "partapprstatus_req_modifyline",

  /*****************************************************************************/
  /* Signer Type */
  /* V3.1 : (hsSignerHeader.uwSignerType) */
  /* V3.5 : (hsSignerHeader.ulSignerType) */
  /*****************************************************************************/
  //	HS_USER					: 0x00001000,
  //	HS_DEPT					: 0x00002000,
  HS_USER_SANCTION: 'user_approval', // 결재
  HS_USER_NO_SANC: 'user_noapproval', // 결재안함
  HS_USER_DRAFT: 'user_draft', // 상신
  HS_USER_DAEKYUL: 'user_daekyul', // 대결
  //	HS_USER_DELEGATE		: 0x00001005,			// 권한대행(대결)
  HS_USER_HOOYUL: 'user_hooyul', // 후열
  HS_USER_REFER: 'user_refer', // 참조
  //	HS_USER_MERGE			: 0x00001020,			// 부서협조확인
  HS_USER_MERGE_D: 'dept_merge', // 부서협조확인
  HS_USER_MERGE_P: 'user_merge', // 개인협조확인
  HS_USER_JUNKYUL: 'user_jeonkyul', // 전결
  HS_USER_INJIDAE: 'user_injidae' /* CHEONGSA : 2000.06.14 */,
  HS_USER_NO_SIGN: 'user_nosign', // 확인
  //	HS_USER_HYUBJO			: 0x00001100,			// 개인협조
  HS_USER_HYUBJO_S: 'user_agree_s', // 개인순차협조
  HS_USER_JOJEONG: 'user_jojeong' /* CHEONGSA : 2000.06.14 */,
  HS_USER_HYUBJO_P: 'user_agree_p', // 개인병렬협조 : 20001. 4. 23
  //	HS_USER_CONFIRM			: "user_confirm",		// 서명날인

  HS_USER_SKIP: 'user_skip',
  HS_USER_DAEREE: 'user_agency',
  HS_USER_AUDIT: 'user_audit',
  HS_USER_AUDIT_HAM: 'user_auditbox',
  HS_USER_JUN_HOO: 'user_jeonhoo' /* HS_USER_JUNKYUL | HS_USER_HOOYUL */,
  HS_USER_SKIP_HYUBJO: 'user_skip_agree_s' /* HS_USER_SKIP    | HS_USER_HYUBJO */,
  HS_USER_SKIP_HYUBJO_P: 'user_skip_agree_p' /* HS_USER_SKIP    | HS_USER_HYUBJO_P */,
  //	HS_USER_SKIP_CONFIRM	: "user_skip_confirm",	/* HS_USER_SKIP    | HS_USER_CONFIRM */
  HS_USER_SKIP_AUDIT: 'user_skip_audit' /* HS_USER_SKIP    | HS_USER_AUDIT  */,
  HS_USER_GONGRAM: 'user_pubshow',

  /* HANDY50 */
  //	HS_USER_PASS			: 0x00001c00,			/* 경유결재자 : unused */
  //	HS_USER_VIEW			: 0x00001d00,			/* 개인공람 : unused */

  HS_DEPT_AUDIT: 'dept_audit',
  HS_DEPT_AGREE_P: 'dept_agree_p',
  HS_DEPT_AGREE_S: 'dept_agree_s',
  HS_DEPT_REF: 'dept_ref',
  HS_DEPT_SKIP: 'dept_skip',
  HS_DEPT_SKIP_AUDIT: 'dept_skip_audit' /* HS_DEPT_SKIP | HS_DEPT_AUDIT   */,
  HS_DEPT_SKIP_AGREE_P: 'dept_skip_agree_p' /* HS_DEPT_SKIP | HS_DEPT_AGREE_P */,
  HS_DEPT_SKIP_AGREE_S: 'dept_skip_agree_s' /* HS_DEPT_SKIP | HS_DEPT_AGREE_S */,
  HS_DEPT_AUDIT_HAM: 'dept_auditbox',
  HS_DEPT_GONGRAM: 'dept_pubshow',

  //	HS_DEPT_DELIBERATION	: "dept_deliberation",
  //	HS_DEPT_SKIP_DELIBERATION	: "dept_skip_deliberation", /* HS_DEPT_SKIP | HS_DEPT_DELIBERATION */

  // E4 하나은행: 준법감시
  //	HS_USER_COMPLIANCE		: "user_compliance",	// 준법감시
  //	HS_USER_SKIP_COMPLIANCE	: "user_skip_compliance",	// 준법감시 통과	HS_USER_COMPLIANCE | HS_USER_SKIP
  //	HS_DEPT_COMPLIANCE		: "dept_compliance",	// 준법감시부
  //	HS_DEPT_SKIP_COMPLIANCE	: "dept_skip_compliance",	// 준법감시부 통과. HS_DEPT_COMPLIANCE | HS_DEPT_SKIP

  // V6.0 : 심사타입 추가 - vect3
  // CExaminer.uwType
  //	HS_EXAMTYPE_SEND		: 0x00003001,	// 발송(서명)
  //	HS_EXAMTYPE_EXAMSEND	: 0x00003002,	// 심사발송(겸직)
  //	HS_EXAMTYPE_EXAM		: 0x00003003,	// 심사
  //	HS_EXAMTYPE_REPORT		: 0x00003004,	// 보고심사
  //	HS_EXAMTYPE_REPORTSKIP	: 0x00003005,	// 보고심사통과
  //	HS_EXAMTYPE_ETC			: 0x00003006,	// 기타(법규)심사
  //	HS_EXAMTYPE_ETCSKIP		: 0x00003007,	// 기타(법규)심사통과
  //	HS_EXAMTYPE_REPORTNOT	: 0x00003008,	// 보고심사제외
  //	HS_EXAMTYPE_ETCNOT		: 0x00003009,	// 기타(법규)심사제외

  //
  // hox/docInfo/approvalType
  //
  //	APPRTYPE_NORMAL_STR		: "apprtype_normal",		// 일반
  //	APPRTYPE_SEND_STR		: "apprtype_send",			// 발신
  APPRTYPE_RECEIPT_STR: 'apprtype_receipt', // 수신
  APPRTYPE_AGREE_STR: 'apprtype_agree', // 협조
  APPRTYPE_AUDIT_STR: 'apprtype_audit', // 감사
  APPRTYPE_REFER_STR: 'apprtype_refer', // 참조
  //	APPRTYPE_REPORT_STR		: "apprtype_report",		// 보고
  //	APPRTYPE_CONTROL_STR	: "apprtype_control",		// 심사
  APPRTYPE_PUBSHOW_STR: 'apprtype_pubshow', // 공람
  //	APPRTYPE_TRANSMIT_STR	: "apprtype_transmit",		// 이첩
  //	APPRTYPE_PASS_STR		: "apprtype_pass",			// 경유
  APPRTYPE_DELIBERATE_STR: 'apprtype_deliberate', // 심의
  APPRTYPE_COMPLIANCE_STR: 'apprtype_compliance', // 준법감시
  //	APPRTYPE_ALL_STR		: "apprtype_all",			// 전체

  //
  // sancType(DOCUMENT TYPE)
  //
  // 일반부서, 발신부서, 수신부서, 합의부서, 검사부서, 배포부서, 참조부서
  SANC_NORMAL: 0x0000, // 일반부서
  SANC_SENDER: 0x0001, // 발신부서
  SANC_RECEIVER: 0x0002, // 수신부서
  SANC_AGREE: 0x0003, // 합의부서
  SANC_AUDIT: 0x0004, // 검사부서
  // Added by jaylee 97.3.25
  // 97년 3월 30일 버젼에서는 아래의 두 경우 연동모듈을 호출
  // 하지 않는다. 이 후 버젼(연동모듈에서 아래의 경우를 처리
  // 하는 경우)부터 아래의 두 경우도 연동모듈을 호출 한다.
  //	SANC_FORWARD		: 0x0005,	// 배포문서
  SANC_REFER: 0x0006, // 참조부서
  SANC_GONGRAM: 0x0007, // 공람부서
  // Added by jaylee 97.3.25

  SANC_DELIBERATE: 0x0008, // 심의부서
  //	SANC_AGREE_S		: 0x0010,	// 순차협조 부서
  SANC_COMPLIANCE: 0x0011, // 준법감시 부서
  SANC_AGREE_P: 0x0012, // 병렬합의부서
  SANC_BUTTON_CLICK: 0xf000, // TODO 사용자 정의 Button Click

  //
  // SANCTION STATUS
  //
  // wSanction을 결정한다. 이는 현재의 행위 시점을 알려 준다.
  // 초기화시, 기안자 기안시, 최종 결재시, 반송시, 중간 결재시
  // 위에서 초기화시를 제외한 나머지는 사용자가 결재/반송을 선택하는 순간
  // 결재 행위 서명 날인 전, 서명날인 직후 서버의 결재처리전, 서버의 결재 처리후
  // 각각 호출된다.
  SANC_GIANINITIALIZE: 0x1000, // 기안기 초기화시
  SANC_KYULINITIALIZE: 0x2000, // 결재기 초기화시
  SANC_REGIANINITIALIZE: 0x3000, // 회수/반송문서 재기안시 초기화.

  SANC_GIANBEFORE: 0x0001, // 기안시 직후
  SANC_GIANAFTER: 0x0002, // 기안시 서버 처리 전
  SANC_GIANSUCCESS: 0x0003, // 기안시 서버 처리 완료
  SANC_GIANFAIL: 0x0004, // 기안시 서버 처리 실패

  //	SANC_GIAN_OK_CLOSE		: 0x0010, // 기안기에서 결재완료 후 문서를 닫을 때
  //	SANC_GIAN_CANCEL_CLOSE	: 0x0011, // 기안기에서 결재안하고 문서를 받을 때

  //	SANC_LOADAFTER			: 0x0100, // 저장
  //	SANC_SAVEAFTER			: 0x0200, // 저장

  SANC_FINALBEFORE: 0x1010, // 최종 결재 직후
  SANC_FINALAFTER: 0x1020, // 최종 결재 서버 처리 전
  SANC_FINALSUCCESS: 0x1030, // 최종 결재 서버 처리 완료
  SANC_FINALFAIL: 0x1040, // 최종 결재 서버 처리 실패

  SANC_SANCTIONBEFORE: 0x2001, // 중간 결재 직후
  SANC_SANCTIONAFTER: 0x2002, // 중간 결재 서버 처리 전
  SANC_SANCTIONSUCCESS: 0x2003, // 중간 결재 서버 처리 완료
  SANC_SANCTIONFAIL: 0x2004, // 중간 결재 서버 처리 실패

  // (반송된 문서는 현재 기안자에게 보내진다.)
  SANC_REJECTBEFORE: 0x3001, // 반송 전
  SANC_REJECTAFTER: 0x3002, // 반송 서버 처리 전
  SANC_REJECTSUCCESS: 0x3003, // 반송 서버 처리 완료
  SANC_REJECTFAIL: 0x3004, // 반송 서버 처리 실패

  //	SANC_ENDEDBEFORE		: 0x9010, // 최종 결재 후 진행 직후
  //	SANC_ENDEDAFTER			: 0x9020, // 최종 결재 후 진행 서버 처리 전
  //	SANC_ENDEDSUCCESS		: 0x9030, // 최종 결재 후 진행 서버 처리 완료
  //	SANC_ENDEDFAIL			: 0x9040, // 최종 결재 후 진행 서버 처리 실패

  // (기안 + 최종결재를 표시한다.)
  SANC_GIANFINALBEFORE: 0x4001, // 기안자 전결 전
  SANC_GIANFINALAFTER: 0x4002, // 기안자 전결 서버 처리 전
  SANC_GIANFINALSUCCESS: 0x4003, // 기안자 전결 서버 처리 완료
  SANC_GIANFINALFAIL: 0x4004, // 기안자 전결 서버 처리 실패

  // (반송된 문서는 원 기안자에게 보내진다.)
  SANC_REJECT_RECEIVE_BEFORE: 0x5001, // 수신부서 접수기 반송 전
  SANC_REJECT_RECEIVE_AFTER: 0x5002, // 수신부서 접수기 반송 서버 처리 전
  SANC_REJECT_RECEIVE_SUCCESS: 0x5003, // 수신부서 접수기 반송 서버 처리 완료
  SANC_REJECT_RECEIVE_FAIL: 0x5004, // 수신부서 접수기 반송 서버 처리 실패

  // (반송된 문서는 합의 확인자에게 보내진다.)
  SANC_REJECT_AGREE_BEFORE: 0x6001, // 24577 합의부서 접수기 반송 전
  SANC_REJECT_AGREE_AFTER: 0x6002, // 24578 합의부서 접수기 반송 서버 처리 전
  SANC_REJECT_AGREE_SUCCESS: 0x6003, // 24579 합의부서 접수기 반송 서버 처리 완료
  SANC_REJECT_AGREE_FAIL: 0x6004, // 24580 합의부서 접수기 반송 서버 처리 실패

  // (반송된 문서는 원 기안자에게 보내진다.)
  SANC_REJECT_AUDIT_BEFORE: 0x7001, // 감사부서 접수기 반송 전
  SANC_REJECT_AUDIT_AFTER: 0x7002, // 감사부서 접수기 반송 서버 처리 전
  SANC_REJECT_AUDIT_SUCCESS: 0x7003, // 감사부서 접수기 반송 서버 처리 완료
  SANC_REJECT_AUDIT_FAIL: 0x7004, // 감사부서 접수기 반송 서버 처리 실패

  //	SANC_REJECT_DELIBERATE_BEFORE	: 0x7005, // 심의부서 접수기에서 반송
  //	SANC_REJECT_DELIBERATE_AFTER	: 0x7006,
  //	SANC_REJECT_DELIBERATE_SUCCESS	: 0x7007,
  //	SANC_REJECT_DELIBERATE_FAIL		: 0x7008,

  SANC_REJECT_COMPLIANCE_BEFORE: 0x7009, // 준법감시부서 접수기에서 반송
  SANC_REJECT_COMPLIANCE_AFTER: 0x700a, // 준법감시부서 접수기 반송 서명 후
  SANC_REJECT_COMPLIANCE_SUCCESS: 0x700b, // 준법감시부서 접수기 반송 서버 처리 완료
  SANC_REJECT_COMPLIANCE_FAIL: 0x700c, // 준법감시부서 접수기 반송 서버 처리 실패

  // Added by jaylee 97.3.25
  // 아래의 경우 연동모듈의 리턴값을 검사하지 않는다.
  //	SANC_ATTACH_BEFORE				: 0x8001, // 첨부대화상자 기동 전
  //	SANC_ATTACH_AFTER				: 0x8002, // 첨주대화상자 종료 후
  //	SANC_LINESETUP_BEFORE			: 0x8003, // 결재선지정 대화상자 	기동 전
  //	SANC_LINESETUP_AFTER			: 0x8004, // 결재선지정 대화상자 	종류 후
  // Added by jaylee 97.3.25

  // 연동 모듈의 결과를 검사하지 않는다.
  //	SANC_DOCNUM_AFTER					: 0xA001, // 문서번호를 채번한 다음에 호출.
  //	SANC_AGREECONFIRM_REJECTAFTER		: 0xA002, // 협조확인자 반송
  //	SANC_AGREECONFIRM_SANCTIONAFTER		: 0xA003, // 협조확인자 결재
  //	SANC_AGREECONFIRM_REJECTSUCCESS		: 0xA004, // 협조확인자 반송 완료
  //	SANC_AGREECONFIRM_REJECTFAIL		: 0xA005, // 협조확인자 반송 실패
  //	SANC_AGREECONFIRM_SANCTIONSUCCESS	: 0xA006, // 협조확인자 결재 완료
  //	SANC_AGREECONFIRM_SANCTIONFAIL		: 0xA007, // 협조확인자 결재 실패

  SANC_CANCELBEFORE: 0xb001, // 결재취소 직후//45057
  SANC_CANCELAFTER: 0xb002, // 결재취소 서버 처리 전// 45058
  SANC_CANCELSUCCESS: 0xb003, // 결재취소 서버 처리 완료//45059
  SANC_CANCELFAIL: 0xb004, // 결재취소 서버 처리 실패

  SANC_DELETEBEFORE: 0xb005, // 결재삭제버튼 클릭 직후
  SANC_DELETEAFFER: 0xb006, // 결재삭제 서버 처리 전
  SANC_DELETESUCCESS: 0xb007, // 결재삭제 서버 처리 완료
  SANC_DELETEFAIL: 0xb008, // 결재삭제 서버 처리 실패

  //	SANC_RETURNADMINBEFORE	: 0xC001, // 행정정보시스템 반송 직후
  //	SANC_RETURNADMINAFTER	: 0xC002, // 행정정보시스템 반송 서버 처리 전
  //	SANC_RETURNADMINSUCCESS	: 0xC003, // 행정정보시스템 반송 서버 처리 완료
  //	SANC_RETURNADMINFAIL	: 0xC004, // 행정정보시스템 반송 서버 처리 실패

  //	SANC_APPRINFO_BEFORE	: 0xD001, // 결재정보선태 전
  //	SANC_APPRINFO_AFTER		: 0xD002, // 결재정보선택 후

  //	SANC_GIANLOAD_COMPLETED	: 0xE000, // 기안기가 다 띄워지고 난 후 (결재정보 대화 상자 뜨기 직전)
  //	SANC_KYULLOAD_COMPLETED	: 0xE001, // 결재기가 다 띄워지고 난 후

  //	SANC_INIT_ENFORCETYPE	: 0xF000, // 결재정보 대화 상자에서 INI 읽기 전
  //	SANC_FINAL_ENFORCETYPE	: 0xF001, // 결재정보 대화 상자에서 INI 읽은 후

  // 업무관리시스템
  //	SANC_SENDSUCCESS	: 0xF100, //발송성공

  //
  // Script 처리 오류 메세지
  //
  HDCSTR_INVALIDEXCUTEACTION: '연동 스크립트가 잘못 되었습니다. 스크립트를 확인하여 주십시오.',
  HDCSTR_SAVEACTIONFAIL: '자료에 대한 외부 저장 기능을 수행하던 중 오류가 발생하였습니다.자료저장서술을 확인하여 주십시오.',
  HDCSTR_LOADACTIONFAIL: '외부자료에 대한 양식 저장 기능을 수행하던 중 오류가 발생하였습니다.자료읽기서술을 확인하여 주십시오.',
  HDCSTR_DOCINFOFAIL: '문서정보 저장기능 수행시 오류가 발생하였습니다. 자료저장서술을 확인하여 주십시요.',

  HDCSTR_CALL_TIMEOVER: 'MIS 프로그램이 지정한 연동처리 시간을 초과하였습니다.',
  HDCSTR_CALL_NOT_CONFIRM: 'MIS 프로그램이 연동처리를 완결하지 않았습니다.',
  HDCSTR_CALL_NOT_NORMAL: 'Sanction 모듈과 MIS 연동 프로그램이 비 정상적으로 수행하였습니다.',

  //
  // Script 기능 상수
  //
  HDCTAG_NoneAction: 0x0000,
  HDCTAG_Save: 0x0101,
  HDCTAG_DocInfo: 0x0103,
  HDCTAG_Load: 0x0201,
  HDCTAG_RepeatLoad: 0x0202,
  HDCTAG_Call: 0x0301,
  HDCTAG_AddPage: 0x0a02,

  SANC_SEND_WITHDRAWAFTER: 0xa102, // 발신부서 회수 서버 처리 전
  SANC_SEND_WITHDRAWSUCCESS: 0xa103, // 발신부서 회수 서버 처리 완료
  SANC_SEND_WITHDRAWFAIL: 0xa104, // 발신부서 회수 서버 처리 실패

  SANC_SAVETEMP_BEFORE: 0xb018, // 임시저장 서버 처리 전
  SANC_SAVETEMP_SUCCESS: 0xb019, // 임시저장 서버 처리 완료
  SANC_SAVETEMP_FAIL: 0xb020, // 임시저장 서버 처리 실패
};

/**
 * @param domHox		: HOX's DOM
 * @param employNo		: 현재 처리자의 사번
 * @param deptCode		: 현재 처리자의 부서코드
 * @param sanction		: 결재 시점
 */
function SanctionContext(param) {
  this.domHox = param.domHox;

  this.formName = sancapi.getFormName(this.domHox);
  this.employNo = param.employNo;
  this.deptCode = param.deptCode;
  this.qdbLinkageId = param.qdbLinkageId;
  this.sancType = sancapi.getDocumentType(this.domHox);
  this.sanction = param.sanction;
  this.sancInfo = sancapi.createSancInfo(this.domHox); // HDSancInfo
  this.finalDeptApprComplete = typeof param.finalDeptApprComplete == 'undefined' ? false : param.finalDeptApprComplete == true || param.finalDeptApprComplete == 'true';
  this.wordType = sancapi.getWordType(this.domHox);

  if (sanc0Const.DEBUG) {
    alert('SanctionContext : formName[' + this.formName + '], employNo[' + this.employNo + '], deptCode[' + this.deptCode + '], qdbLinkageId[' + this.qdbLinkageId + '], ' + 'sancType[' + this.sancType + '], sanction[' + this.sanction + '], finalDeptApprComplete[' + this.finalDeptApprComplete + ']');
  }
}

function HsID(szID, nType) {
  this.szID = szID;
  this.nType = nType;
}

function OrgID(szID, nType) {
  this.szID = szID;
  this.nType = nType;
}

/**
 * from HDSIGNINFO in SANCHDR.h
 */
function HDSIGNINFO(param) {
  this.hsUserID = param.hsUserID; // 결재선에 Assing된 사용자의 ID
  this.strPosi = param.strPosi; // 사용자의 직위
  this.strName = param.strName; // 사용자의 이름
  this.lSignerStatus = param.lSignerStatus; // 현재 상태.. DONE, NOW, WILL ETC..
  this.lSignerType = param.lSignerType; // 결재 방법 (일반결재/전결/후결/대결)
  this.tSignDate = param.tSignDate;
  if (sanc0Const.DEBUG) {
    alert('HDSIGNINFO : hsUserID[' + this.hsUserID.szID + ',' + this.hsUserID.nType + '], ' + 'strPosi[' + this.strPosi + '], strName[' + this.strName + '], ' + 'lSignerStatus[' + this.lSignerStatus + '], ' + 'lSignerType[' + this.lSignerType + '], ' + 'tSignDate[' + this.tSignDate + ']');
  }
}

/**
 * from HDSancInfo in Sdrvapi.h
 */
function HDSancInfo(param) {
  this.hsOrgMsgID = param.hsOrgMsgID; // 원 결재문서의 ID
  this.hsMsgID = param.hsMsgID; // 현 결재문서의 ID

  this.hsGianID = param.hsGianID; // 현 기안자 ID
  //	this.hsOrgGianID = param.hsOrgGianID;		// 원 기안자 ID

  //	this.hsSaveDeptID = param.hsSaveDeptID;		// 저장부서의 ID
  this.hsGianDeptID = param.hsGianDeptID; // 기안부서의 ID

  this.hsKyulID = param.hsKyulID; // 현 결재자 ID

  this.nSignerCount = param.nSignerCount; // 현 결재선의 결재자 수
  //this.lphsSignerList = param.lphsSignerList;	// 결재자 List
  //this.lpwSignerType = param.lpwSignerType;	// 결재자 결재형태
  this.nCurSignerIdx = param.nCurSignerIdx; // 현 결재자 Index

  //	this.szSubject = param.szSubject;			// 결재문서의 제목

  //	this.wPaperSecurity = param.wPaperSecurity;	// 결재문서의 보안등급
  this.tDate = param.tDate; // 기안/결재일시
  //	this.ulPaperKeepYear = param.ulPaperKeepYear;// 보존년한
  //	this.bExistComment = param.bExistComment;	// 의견정보 존재여부
  //	this.bExistMemo = param.bExistMemo;			// 메모

  //	this.nRecDeptCount = param.nRecDeptCount;	// 수신처의 Count
  //	this.hRecDept = param.hRecDept;				// 수신처의 Handle

  //	this.nAttachCnt = param.nAttachCnt; 		// 첨부문서의 Count
  //	this.hAttachInfo = param.hAttachInfo;		// 첨부문서의 Handle

  //	this.szSaveFileName = param.szSaveFileName;	// HGN 저장문서의 정보.

  //	this.bReGian = param.bReGian;				// 재기안을 하는가?

  this.lpSignList = param.lpSignList; // 결재자 list

  //	this.hsFormID = param.hsFormID;				//양식id
  //	this.ulFormFlag = param.ulFormFlag;			//연동 flag
  //	this.szApprovalFlag = param.szApprovalFlag;	//

  //	this.szReserved = param.szReserved;
  if (sanc0Const.DEBUG) {
    alert(
      'HDSancInfo : hsMsgID[' +
        this.hsMsgID.szID +
        ',' +
        this.hsMsgID.nType +
        '], ' +
        'hsOrgMsgID[' +
        this.hsOrgMsgID.szID +
        ',' +
        this.hsOrgMsgID.nType +
        '], ' +
        'hsGianDeptID[' +
        this.hsGianDeptID.szID +
        ',' +
        this.hsGianDeptID.nType +
        '], ' +
        'hsGianID[' +
        this.hsGianID.szID +
        ',' +
        this.hsGianID.nType +
        '], ' +
        'hsKyulID[' +
        (this.hsKyulID ? this.hsKyulID.szID + ',' + this.hsKyulID.nType : 'null') +
        '], ' +
        'tDate[' +
        this.tDate +
        '], nCurSignerIdx[' +
        this.nCurSignerIdx +
        ']'
    );
  }
}

function HDUserInfo(param) {
  this.szPosition = param.szPosition;
  this.szName = param.szName;
  this.szEmployeeNo = param.szEmployeeNo;
}

var sanc0 = {
  context: null,
  properties: null,
  isSetAction: true,
  isQdbInfo: false, // qdbinfo 사용여부 조회
  initailize: function (param) {
    this.context = new SanctionContext(param);

    if (!this.properties) {
      var that = this;
      $.ajax({
        url: sanc0Const.sancserverURL,
        type: 'post',
        async: false,
        dataType: 'json',
        data: { acton: 'ini' },
        success: function (result, status) {
          that.properties = result;
        },
      });

      if (this.properties && this.properties.SancClient) {
        sanc0Const.CheckFormName = this.properties.SancClient.CheckFormName;
        sanc0Const.SancFormName = this.properties.SancClient.SancFormName;
        sanc0Const.NotSancEvent = this.properties.SancClient.NotSancEvent;
        if (this.properties.SancClient.DocInfoDelimiter) sanc0Const.DocInfoDelimiter = this.properties.SancClient.DocInfoDelimiter;
      }
    }

    window.addEventListener('unhandledrejection', function (event) {
      sanc0._closeDialog();
    });
  },
  IsNotSancEvent: function (wSancType, wSanction) {
    if (wSancType == sanc0Const.SANC_BUTTON_CLICK)
      // 버튼 클릭 시점은 제외
      return false;
    if (wSanction >= 49152)
      // 폼 연동 지원하지 않는 시점 0xC000
      return true;
    if (wSanction < 1)
      // 유효하지 않은 시점 - 처리 안 함.
      return true;

    var NotSancEvents = sanc0Const.NotSancEvent ? sanc0Const.NotSancEvent.split(';') : [];
    for (var i = 0; i < NotSancEvents.length; i++) {
      if (wSanction == NotSancEvents[i]) return true;
    }
    return false;
  },
  IsSancDocument: function (strFormName) {
    if (sanc0Const.CheckFormName != '1') return true;

    var SancFormNames = sanc0Const.SancFormName ? sanc0Const.SancFormName.split(';') : [];
    for (var i = 0; i < SancFormNames.length; i++) {
      if (strFormName == SancFormNames[i]) return true;
    }
    return false;
  },
  /**
   * 연동서버를 이용한 Script 처리를 시작한다. Promise버전
   */
  SanctionAPIPromise: function (param) {
    var that = this;
    return new Promise(function (resolve, reject) {
      console.log('SanctionAPIPromise START.', param);
      try {
        //this.SanctionAPI 안됨.
        that.SanctionAPI(param, function (ret) {
          if (ret) {
            console.log('SanctionAPIPromise END. success');
            resolve(true);
          } else {
            console.log('SanctionAPIPromise END. fail');
            reject(new Error('SanctionAPI error'));
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  /**
   * 연동서버를 이용한 Script 처리를 시작한다.
   *
   * @param domHox		: HOX's DOM
   * @param employNo		: 현재 처리자의 사번
   * @param deptCode		: 현재 처리자의 부서코드
   * @param sanction		: 결재 시점
   */
  SanctionAPI: function (param, callbackFn) {
    if (typeof callbackFn == 'undefined') {
      console.log('SanctionAPI callbackFn is undefined');
      //return;
    }
    var result = true;
    var that = this;
    this.initailize(param); // initailize : this.context, this.properties
    this.isSetAction = true;

    //console.log('this.context.wordType = '+this.context.wordType);
    //if (this.context.wordType != "html") {
    $.ajax({
      url: QDB_CONTEXT_NAME + '/isQdbInfoUse.do',
      type: 'post',
      async: false,
      dataType: 'json',
      success: function (result, status) {
        sanc0.isQdbInfo = result.isQdbInfo;
        console.log('sanc0.isQdbInfo=' + sanc0.isQdbInfo);
      },
    });
    //}

    if (this.context.wordType == 'html' || this.context.wordType == 'hwpweb' || sanc0.isQdbInfo) {
      if (
        this.IsNotSancEvent(this.context.sancType, this.context.sanction) || // 폼 연동할 시점이 아님.
        !this.IsSancDocument(this.context.formName)
      ) {
        // 폼 연동할 양식이 아님.

        const msg = '폼 연동할 시점(' + this.context.sancType + ', ' + this.context.sanction + ')' + ' 또는 양식(' + this.context.formName + ')이 아닙니다.';
        if (sanc0Const.DEBUG) {
          alert(msg);
        }

        console.log(msg);

        //return true;
        if (callbackFn) {
          callbackFn.apply(null, [true]);
        }
        return;
      }

      try {
        that._openDialog('타 시스템과 연계 처리중입니다.');
        this._SanctionAPI(function (result) {
          that._closeDialog();
          if (callbackFn) {
            callbackFn.apply(null, [result]);
          }
        });
      } catch (e) {
        alert(e.message);
        this._closeDialog();
        throw e;
      } finally {
        //this._closeDialog();
      }
    } else {
      //return true;
      if (callbackFn) {
        callbackFn.apply(null, true);
      }
    }
  },
  SanctionSinglePromise: function (arr) {
    var that = this;
    var bRet = true;
    var isBreak = false;

    return new Promise(function (resolve, reject) {
      console.log('SanctionSinglePromise START.', arr);
      try {
        if (arr.length != 3) {
          reject(new Error('파라메터 오류.'));
        }
        var message = arr[0];
        var totalActionCount = arr[1];
        var currentActionCount = arr[2];

        if (currentActionCount <= totalActionCount) {
          if (sanc0Const.DEBUG) {
            alert('currentActionCount=' + currentActionCount + ' totalActionCount=' + totalActionCount);
          }

          console.log('SanctionSinglePromise currentActionCount=' + currentActionCount);

          message.currentActionCount = currentActionCount;
          $.ajax({
            url: sanc0Const.sancserverURL,
            type: 'post',
            async: false,
            dataType: 'json',
            data: message,
            success: function (result, status) {
              if (!result.MessageHead) {
                const msg = '연동서버와 통신중 헤더를 수신할 수 없습니다.';
                alert(msg);
                bRet = false;
                reject(new Error(msg));
                return;
              } else if (result.MessageHead.returnValue == '2') {
                const msg = '연동서버 문제로 연동을 진행할 수 없습니다(' + result.MessageHead.returnValue + ').';
                alert(msg);
                bRet = false;
                reject(msg);
                return;
              } else if (result.MessageHead.actionId == sanc0Const.HDCTAG_NoneAction) {
                //해당 시점에 처리할 이벤트가 없는 경우

                const msg = 'actionId : ' + result.MessageHead.actionId;

                console.log('해당 시점에 처리할 이벤트가 없는 경우');

                if (sanc0Const.DEBUG) {
                  alert(msg);
                }
                that.isSetAction = false;
                bRet = true;
                isBreak = true;
                resolve(true);
                return;
              } else if (!result.MessageBody) {
                const msg = '연동서버와 통신중 본문을 수신할 수 없습니다.';
                alert(msg);
                bRet = false;
                reject(msg);
                return;
              } else {
                console.log('result.MessageHead.actionId=' + result.MessageHead.actionId);

                var action = that._getAction(result.MessageHead.actionId);
                if (!action) {
                  const msg = '알 수 없는 action id(' + result.MessageHead.actionId + ') 입니다.';
                  alert(msg);
                  bRet = false;
                  reject(msg);
                  return;
                } else {
                  totalActionCount = result.MessageHead.totalActionCount;
                  currentActionCount = result.MessageHead.currentActionCount;

                  console.log('totalActionCount=' + totalActionCount + ', currentActionCount=' + currentActionCount);

                  bRet = action
                    .feedbackPromise(that.context, result.MessageHead, result.MessageBody)
                    .then(function (obj) {
                      console.log('after feedbackPromise currentActionCount=' + currentActionCount + ' totalActionCount=' + totalActionCount, obj);

                      //남은 연동이 있는지 체크 후 다시 SanctionSinglePromise 호출
                      if (currentActionCount <= totalActionCount) {
                        currentActionCount++;
                        Promise.resolve([message, totalActionCount, currentActionCount])
                          .then(that.SanctionSinglePromise.bind(that))
                          .then(function () {
                            resolve(true);
                          });
                      } else {
                        resolve(true);
                      }
                    })
                    .catch(function () {
                      console.log('feedbackPromise Error');
                      //창 닫을까?

                      const msg = '연동서버 문제로 연동을 진행할 수 없습니다';
                      reject(new Error(msg));
                    });
                }
              }
            },
            error: function (result, status) {
              const msg = '연동서버 문제로 연동을 진행할 수 없습니다(' + status + ').';
              alert(msg);
              bRet = false;
              reject(new Error(msg));
              return;
            },
          });
        } else {
          resolve(true);
        }
      } catch (e) {
        reject(e);
      }
    });
  },
  _SanctionAPI: function (callbackFn) {
    if (!this.properties) {
      alert('sanc0.ini에서 연동 정보를 가져올 수 없습니다.');
      return false;
    } else if (!this.context.employNo) {
      alert('현재 사용자의 사번을 얻는데 실패하였거나\n사번이 등록되지 않았습니다.');
      return false;
    } else if (!this.context.deptCode) {
      alert('현재 사용자의 부서코드를 얻는데 실패하였거나\n부서코드가 등록되지 않았습니다.');
      return false;
    }

    console.log('this.context.sancType=' + this.context.sancType + '\nthis.context.sanction=' + this.context.sanction);

    var that = this;
    var message = {
      acton: 'call',
      formName: encodeURIComponent(this.context.formName),
      employNo: encodeURIComponent(this.context.employNo),
      deptCode: encodeURIComponent(this.context.deptCode),
      qdbLinkageId: encodeURIComponent(this.context.qdbLinkageId),
      sancType: this.context.sancType,
      sanction: this.context.sanction,
    };
    var totalActionCount = 1;
    var currentActionCount = 1;
    var bRet = true;
    var isBreak = false;

    //call은 무조건 실행

    that
      .SanctionSinglePromise([message, totalActionCount, currentActionCount])
      .then(callbackFn)
      .catch(function (e) {
        console.log('SanctionSinglePromise error', e);

        if (e && e.message) {
          alert(e.message);
        } else {
          alert('QDB연동 에러가 발생했습니다.');
        }
        sanc0._closeDialog();
        if (sanc0Const.DEBUG) {
          //창 닫을까?
          if (confirm('창 닫을까요?')) {
            window.close();
          }
        } else {
          //if(confirm('창 닫을까요?')) {
          window.close();
          //}
        }
      });

    return true;
  },
  _openDialog: function (message) {
    if ($('#modal-dialog').length == 0) {
      $("<div id='modal-dialog' style='display:none;'></div>")
        .append("<div class='header'><span>HANDY QDB</span></div>")
        .append("<div class='message'></div>")
        //.append("<div class='buttons'><div class='no simplemodal-close'>확인</div></div>")
        .appendTo(document.body);
    }
    this._closeDialog();
    $('#modal-dialog').modal({
      position: ['20%'],
      overlayId: 'confirm-overlay',
      containerId: 'confirm-container',
      onShow: function (dialog) {
        $('.message', dialog.data[0]).append(message);
      },
    });
  },
  _closeDialog: function () {
    $.modal.close();
  },
  _getAction: function (actionId) {
    console.log('_getAction actionId=' + actionId);

    switch (actionId) {
      case sanc0Const.HDCTAG_Save:
        return new SaveAction();
      case sanc0Const.HDCTAG_DocInfo:
        return new DocInfoAction();
      case sanc0Const.HDCTAG_Load:
        return new LoadAction();
      case sanc0Const.HDCTAG_RepeatLoad:
        return new RepeatLoadAction();
      case sanc0Const.HDCTAG_Call:
        return new CallAction();
      case sanc0Const.HDCTAG_AddPage:
        return new AddPageAction();
    }
  },

  /**
   * 시점(sanction)을 구한다.
   *
   * @param status	: required
   * @param rInfo		: optional - status가 INITIALIZE인 경우 사용함.
   * @param cmd		: optional - status가 INITIALIZE가 아닌 경우 사용함.
   * @param finished	: optional - status가 INITIALIZE가 아닌 경우 사용함.
   */
  getSanction: function (param) {
    var INITIALIZE = 0; // 초기화
    var BEFORE = 1; // 서명전
    var AFTER = 2; // 서명후
    var SUCCESS = 3; // 서버 처리 완료
    var FAIL = 4; // 서버 처리 실패

    if (INITIALIZE == param.status) {
      if (param.rInfo && 'sancgian' == param.rInfo.appType) {
        if ('draft' == param.rInfo.cltType)
          // 기안 'accept' 're-draft' 'att-draft' != rInfo.cltType ??
          return sanc0Const.SANC_GIANINITIALIZE;
        if ('re-draft' == param.rInfo.cltType)
          // 재기안
          return sanc0Const.SANC_REGIANINITIALIZE;
      } else if (param.rInfo && 'sanckyul' == param.rInfo.appType) {
        // 결재
        return sanc0Const.SANC_KYULINITIALIZE;
      }
    } else {
      // BEFORE || AFTER || SUCCESS || FAIL
      if ('draftDoc' == param.cmd || 'batchDraftDoc' == param.cmd) {
        if (param.finished) {
          // 기안자 전결
          switch (param.status) {
            case BEFORE:
              return sanc0Const.SANC_GIANFINALBEFORE;
            case AFTER:
              return sanc0Const.SANC_GIANFINALAFTER;
            case SUCCESS:
              return sanc0Const.SANC_GIANFINALSUCCESS;
            case FAIL:
              return sanc0Const.SANC_GIANFINALFAIL;
          }
        } else {
          // 기안
          switch (param.status) {
            case BEFORE:
              return sanc0Const.SANC_GIANBEFORE;
            case AFTER:
              return sanc0Const.SANC_GIANAFTER;
            case SUCCESS:
              return sanc0Const.SANC_GIANSUCCESS;
            case FAIL:
              return sanc0Const.SANC_GIANFAIL;
          }
        }
      } else if ('procDoc' == param.cmd || 'procBatchDoc' == param.cmd) {
        if (param.finished) {
          // 최종 결재
          switch (param.status) {
            case BEFORE:
              return sanc0Const.SANC_FINALBEFORE;
            case AFTER:
              return sanc0Const.SANC_FINALAFTER;
            case SUCCESS:
              return sanc0Const.SANC_FINALSUCCESS;
            case FAIL:
              return sanc0Const.SANC_FINALFAIL;
          }
        } else {
          // 중간 결재
          switch (param.status) {
            case BEFORE:
              return sanc0Const.SANC_SANCTIONBEFORE;
            case AFTER:
              return sanc0Const.SANC_SANCTIONAFTER;
            case SUCCESS:
              return sanc0Const.SANC_SANCTIONSUCCESS;
            case FAIL:
              return sanc0Const.SANC_SANCTIONFAIL;
          }
        }
      } else if ('rejectDoc' == param.cmd) {
        // 반송
        switch (param.status) {
          case BEFORE:
            return sanc0Const.SANC_REJECTBEFORE;
          case AFTER:
            return sanc0Const.SANC_REJECTAFTER;
          case SUCCESS:
            return sanc0Const.SANC_REJECTSUCCESS;
          case FAIL:
            return sanc0Const.SANC_REJECTFAIL;
        }
      } else if ('cancelDoc' == param.cmd) {
        // 결재취소 (회수)
        switch (param.status) {
          case BEFORE:
            return sanc0Const.SANC_CANCELBEFORE;
          case AFTER:
            return sanc0Const.SANC_CANCELAFTER;
          case SUCCESS:
            return sanc0Const.SANC_CANCELSUCCESS;
          case FAIL:
            return sanc0Const.SANC_CANCELFAIL;
        }
      } else if ('rejectDocForReceipt' == param.cmd) {
        // 수신문서 접수기 반송
        switch (param.status) {
          case BEFORE:
            return sanc0Const.SANC_REJECT_RECEIVE_BEFORE;
          case AFTER:
            return sanc0Const.SANC_REJECT_RECEIVE_AFTER;
          case SUCCESS:
            return sanc0Const.SANC_REJECT_RECEIVE_SUCCESS;
          case FAIL:
            return sanc0Const.SANC_REJECT_RECEIVE_FAIL;
        }
      } else if ('rejectDocForAgree' == param.cmd) {
        // 합의부서 접수기 반송
        switch (param.status) {
          case BEFORE:
            return sanc0Const.SANC_REJECT_AGREE_BEFORE;
          case AFTER:
            return sanc0Const.SANC_REJECT_AGREE_AFTER;
          case SUCCESS:
            return sanc0Const.SANC_REJECT_AGREE_SUCCESS;
          case FAIL:
            return sanc0Const.SANC_REJECT_AGREE_FAIL;
        }
      } else if ('rejectDocForAudit' == param.cmd) {
        // 감사부서 접수기 반송
        switch (param.status) {
          case BEFORE:
            return sanc0Const.SANC_REJECT_AUDIT_BEFORE;
          case AFTER:
            return sanc0Const.SANC_REJECT_AUDIT_AFTER;
          case SUCCESS:
            return sanc0Const.SANC_REJECT_AUDIT_SUCCESS;
          case FAIL:
            return sanc0Const.SANC_REJECT_AUDIT_FAIL;
        }
      } else if ('rejectDocForCompliance' == param.cmd) {
        // 준법감시부서 접수기 반송
        switch (param.status) {
          case BEFORE:
            return sanc0Const.SANC_REJECT_COMPLIANCE_BEFORE;
          case AFTER:
            return sanc0Const.SANC_REJECT_COMPLIANCE_AFTER;
          case SUCCESS:
            return sanc0Const.SANC_REJECT_COMPLIANCE_SUCCESS;
          case FAIL:
            return sanc0Const.SANC_REJECT_COMPLIANCE_FAIL;
        }
      } else if ('deleteDoc' == param.cmd) {
        // 반송,회수 문서 삭제
        switch (param.status) {
          case BEFORE:
            return sanc0Const.SANC_DELETEBEFORE;
          case AFTER:
            return sanc0Const.SANC_DELETEAFFER;
          case SUCCESS:
            return sanc0Const.SANC_DELETESUCCESS;
          case FAIL:
            return sanc0Const.SANC_DELETEFAIL;
        }
      } else if ('withdrawSendDoc' == param.cmd) {
        // 발신부서 회수
        switch (param.status) {
          case AFTER:
            return sanc0Const.SANC_SEND_WITHDRAWAFTER;
          case SUCCESS:
            return sanc0Const.SANC_SEND_WITHDRAWSUCCESS;
          case FAIL:
            return sanc0Const.SANC_SEND_WITHDRAWFAIL;
        }
      } else if ('saveTemp' == param.cmd) {
        // 임시저장
        switch (param.status) {
          case BEFORE:
            return sanc0Const.SANC_SAVETEMP_BEFORE;
          case SUCCESS:
            return sanc0Const.SANC_SAVETEMP_SUCCESS;
          case FAIL:
            return sanc0Const.SANC_SAVETEMP_FAIL;
        }
      }
    }
    return 0; // 처리 안 함.
  },
};

function Action() {
  this.call = function (head, body, onSuccess) {
    var bRet = true;
    var message = {
      acton: 'feedback',
      formName: encodeURIComponent(head.formName),
      employNo: encodeURIComponent(head.employNo),
      deptCode: encodeURIComponent(head.deptCode),
      qdbLinkageId: encodeURIComponent(head.qdbLinkageId),
      sancType: head.sancType,
      sanction: head.sanction,
      dataType: head.dataType,
      flag: head.flag,
      actionId: head.actionId,
      scriptLength: head.scriptLength,
      dataLength: head.dataLength,
      returnValue: head.returnValue,
      totalActionCount: head.totalActionCount,
      currentActionCount: head.currentActionCount,
      dataDelimiter: head.dataDelimiter,
      script: encodeURIComponent(body.script),
      data: encodeURIComponent(body.data),
    };

    console.log('Action.call', message);

    //alert("sanc0.js feedback="+encodeURIComponent(head.qdbLinkageId));
    $.ajax({
      url: sanc0Const.sancserverURL,
      type: 'post',
      async: false,
      dataType: 'json',
      data: message,
      success: function (result, status) {
        if (onSuccess) {
          bRet = onSuccess(result, status);
        } else if (result.MessageHead && result.MessageHead.returnValue == '2') {
          const msg = '연동서버 문제로 연동을 진행할 수 없습니다(' + status + ').';
          alert(msg);

          console.log(msg);

          bRet = false;
        }
      },
      error: function (result, status) {
        if (head.returnValue == '0' && status == 'parsererror') {
          // head.returnValue를 "0"으로 action의 feedback을 호출할 경우,
          // 서버에서 json data를 만들지 않기 때문에 "parsererror"는 오류가 아니다.
          onSuccess(result, status);
          return true;
        }
        const msg = '연동서버 문제로 연동을 진행할 수 없습니다(' + status + ').';
        alert(msg);

        console.log(msg);

        bRet = false;
      },
    });
    return bRet;
  };
}

function SaveAction() {
  var that = this;
  (this.feedbackPromise = function (context, head, body) {
    return new Promise(function (resolve, reject) {
      console.log('SaveAction.feedbackPromise START.');
      try {
        that.feedback(context, head, body, function (ret) {
          if (ret) {
            console.log('SaveAction.feedbackPromise END. success');
            resolve(true);
          } else {
            console.log('SaveAction.feedbackPromise END. fail');
            reject(new Error('SaveAction.feedbackPromise error'));
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }),
    (this.feedback = function (context, head, body, callbackFn) {
      if (sanc0Const.DEBUG) alert('SaveAction.feedback() ' + head.currentActionCount + '/' + head.totalActionCount);
      var bRet = true;
      // "Page번호;셀명1;...;셀명n;"
      var cells = body.script ? body.script.split(head.dataDelimiter) : [];
      if (cells.length >= 2) {
        body.data = this.loadData(cells, head.dataDelimiter);
        if (body.data == null) {
          alert(sanc0Const.HDCSTR_SAVEACTIONFAIL);
          bRet = false;
        }
      } else {
        alert(sanc0Const.HDCSTR_INVALIDEXCUTEACTION);
        bRet = false;
      }
      head.returnValue = bRet ? '1' : '0';
      if (bRet) {
        bRet = this.call(head, body, this.onSuccess);
      } else {
        this.call(head, body);
      }
      if (callbackFn) {
        callbackFn.apply(null, [true]);
      }
      return bRet;
    });
  this.loadData = function (cells, dataDelimiter) {
    var pageNo = cells[0];
    var data = '';
    var bIsExistBody = false;
    for (var i = 1; i < cells.length; i++) {
      if (cells[i] == '본문' || cells[i].toUpperCase() == 'BODY') {
        bIsExistBody = true;
      } else if (wordapi.searchCell(cells[i])) {
        var value = wordapi.getText(cells[i]);
        data += cells[i] + '=' + value + dataDelimiter;
      }
    }
    if (bIsExistBody) {
      data += '본문=' + wordapi.getBodyText() + dataDelimiter;
    }

    console.log('SaveAction.loadData END. data=' + data);
    return data;
  };
  this.onSuccess = function (result, status) {
    var bRet = false;
    var actionId = sanc0Const.HDCTAG_Save;
    if (!result.MessageHead) {
      alert('연동서버와 통신중 헤더를 수신할 수 없습니다(' + sancapi.actionIdToStr(actionId) + ').');
    } else if (result.MessageHead.actionId != actionId) {
      alert('연동서버와 통신중 잘못된 헤더를 수신하였습니다(' + sancapi.actionIdToStr(actionId) + ').');
    } else if (result.MessageHead.returnValue != '1') {
      alert('연동 서버에 연동 자료를 저장하는중 오류가 발생하였습니다.');
    } else {
      bRet = true; // 정상종료
    }
    return bRet;
  };
}

function DocInfoAction() {
  var that = this;
  (this.feedbackPromise = function (context, head, body) {
    return new Promise(function (resolve, reject) {
      console.log('DocInfoAction.feedbackPromise START.');
      try {
        that.feedback(context, head, body, function (ret) {
          if (ret) {
            console.log('DocInfoAction.feedbackPromise END. success');
            resolve(true);
          } else {
            console.log('DocInfoAction.feedbackPromise END. fail');
            reject(new Error('DocInfoAction.feedbackPromise error'));
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }),
    (this.feedback = function (context, head, body, callbackFn) {
      if (sanc0Const.DEBUG) alert('DocInfoAction.feedback() ' + head.currentActionCount + '/' + head.totalActionCount);
      var bRet = true;
      // "DOC_INFO_항목1;DOC_INFO_항목2;...;DOC_INFO_항목n;"
      var names = body.script ? body.script.split(head.dataDelimiter) : [];
      if (names.length >= 1) {
        body.data = this.loadDocInfo(context, names, head.dataDelimiter);
        if (body.data == null) {
          alert(sanc0Const.HDCSTR_DOCINFOFAIL);
          bRet = false;
        }
      } else {
        alert(sanc0Const.HDCSTR_INVALIDEXCUTEACTION);
        bRet = false;
      }
      head.returnValue = bRet ? '1' : '0';
      this.call(head, body);
      if (callbackFn) {
        callbackFn.apply(null, [true]);
      }
      return bRet;
    });
  this.loadDocInfo = function (context, names, dataDelimiter) {
    var bRet = true;
    var docinfoNames = [];
    var docinfoValues = [];
    var includeSancLine = false;
    for (var i = 0; i < names.length; i++) {
      var name = names[i].replace(/(^\s*)|(\s*$)/g, '');
      if (!name) continue;

      var value;
      if ('문서ID' == name) {
        value = context.sancInfo && context.sancInfo.hsMsgID ? context.sancInfo.hsMsgID.szID : '';
      } /* else if ("S문서ID" == name) {
				value = context.sancInfo && context.sancInfo.hsMsgID ? context.sancInfo.hsMsgID.nType : "";
			} else if ("U문서ID" == name) {
				value = context.sancInfo && context.sancInfo.hsMsgID ? context.sancInfo.hsMsgID.szID : "";
			} */ else if ('S부서ID' == name) {
        value = context.sancInfo && context.sancInfo.hsGianDeptID ? context.sancInfo.hsGianDeptID.nType : '';
      } else if ('U부서ID' == name) {
        value = context.sancInfo && context.sancInfo.hsGianDeptID ? context.sancInfo.hsGianDeptID.szID : '';
      } else if ('S기안자ID' == name) {
        value = context.sancInfo && context.sancInfo.hsGianID ? context.sancInfo.hsGianID.nType : '';
      } else if ('U기안자ID' == name) {
        value = context.sancInfo && context.sancInfo.hsGianID ? context.sancInfo.hsGianID.szID : '';
      } else if ('S결재자ID' == name) {
        value = context.sancInfo && context.sancInfo.hsKyulID ? context.sancInfo.hsKyulID.nType : '';
      } else if ('U결재자ID' == name) {
        value = context.sancInfo && context.sancInfo.hsKyulID ? context.sancInfo.hsKyulID.szID : '';
      } else if ('시간' == name || '결재일시' == name) {
        //결재일시 long값 cDocInfo.Format("%u", _stHDSancInfo.tDate);
        value = context.sancInfo && context.sancInfo.tDate ? context.sancInfo.tDate.getTime() : '';
      } else if ('결재일시2' == name) {
        //결재일시 yyyy/mm/dd hh:MM:ss
        value = context.sancInfo && context.sancInfo.tDate ? context.sancInfo.tDate.format('yyyy/MM/dd HH:mm:ss') : '';
      } else if ('결재순번' == name) {
        // 현재 결재자  ~ 최종결재자까지 결재안함/참조를 제외한 결재자수
        var nRealSignerIdx = 0;
        if (context.sancInfo && context.sancInfo.nSignerCount > 0 && context.sancInfo.nCurSignerIdx > -1) {
          for (var j = context.sancInfo.nSignerCount - 1; j >= context.sancInfo.nCurSignerIdx; j--) {
            if (context.sancInfo.lpSignList && context.sancInfo.lpSignList[j] && sanc0Const.HS_USER_NO_SANC != context.sancInfo.lpSignList[j].lSignerType && sanc0Const.HS_USER_REFER != context.sancInfo.lpSignList[j].lSignerType) {
              ++nRealSignerIdx;
            }
          }
        }
        value = nRealSignerIdx;
      } else if ('총결재단계' == name) {
        // 전체 결재자중 결재안함/참조를 제외한 모든 결재자수
        var nRealSignerCount = 0;
        if (context.sancInfo && context.sancInfo.nSignerCount > 0) {
          nRealSignerCount = context.sancInfo.nSignerCount;
          for (let j = 0; j < context.sancInfo.nSignerCount; j++) {
            if (context.sancInfo.lpSignList && context.sancInfo.lpSignList[j] && (sanc0Const.HS_USER_NO_SANC == context.sancInfo.lpSignList[j].lSignerType || sanc0Const.HS_USER_REFER == context.sancInfo.lpSignList[j].lSignerType)) {
              nRealSignerCount--;
            }
          }
        }
        value = nRealSignerCount;
      } else if ('현결재자_직위' == name) {
        value = context.sancInfo && context.sancInfo.lpSignList && context.sancInfo.nCurSignerIdx > -1 ? context.sancInfo.lpSignList[context.sancInfo.nCurSignerIdx].strPosi : '';
      } else if ('현결재자_이름' == name) {
        value = context.sancInfo && context.sancInfo.lpSignList && context.sancInfo.nCurSignerIdx > -1 ? context.sancInfo.lpSignList[context.sancInfo.nCurSignerIdx].strName : '';
      } else if ('현결재자' == name) {
        //현재결재자 의 직위<space>이름cDocInfo.Format("%s %s", stCurUserData.szPosition, stCurUserData.szName);
        value = context.sancInfo && context.sancInfo.lpSignList && context.sancInfo.nCurSignerIdx > -1 ? context.sancInfo.lpSignList[context.sancInfo.nCurSignerIdx].strPosi + ' ' + context.sancInfo.lpSignList[context.sancInfo.nCurSignerIdx].strName : '';
      } else if ('최종결재자' == name) {
        // _stHDSancInfo.lphsSignerList에 할당된 결재선 정보는 최종결재자[0],중간결재자[1],기안자[n-1] 순서
        value = context.sancInfo && context.sancInfo.lpSignList && context.sancInfo.lpSignList.length > 0 ? context.sancInfo.lpSignList[0].strPosi + ' ' + context.sancInfo.lpSignList[0].strName : '';
      } else if ('최종결재자_사번' == name) {
        // _stHDSancInfo.lphsSignerList에 할당된 결재선 정보는 최종결재자[0],중간결재자[1],기안자[n-1] 순서
        if (context.sancInfo && context.sancInfo.lpSignList && context.sancInfo.lpSignList.length > 0 && context.sancInfo.lpSignList[0].hsUserID) {
          var userInfo = orgapi.HDGetUserInfoAPI(context.sancInfo.lpSignList[0].hsUserID.szID);
          if (!userInfo) {
            bRet = false;
            break;
          }
          value = userInfo.szEmployeeNo;
        }
      } else if ('결재진행' == name) {
        includeSancLine = true;
      } else {
        bRet = false;
        break;
      }

      if (!includeSancLine) {
        docinfoNames.push(name);
        docinfoValues.push(value);
      }
    }

    if (includeSancLine && context.sancInfo.lpSignList) {
      for (let i = 0; i < context.sancInfo.lpSignList.length; i++) {
        var sancline = context.sancInfo.lpSignList[i];

        let value = '';
        var delim = sanc0Const.DocInfoDelimiter;

        //직위 이름 결재여부(결재종류)
        value = sancline.hsUserID.szID + delim;
        value += sancline.strPosi + delim;
        value += sancline.strName + delim;
        value += sancapi.SignerStatusToStr(sancline.lSignerStatus) + delim;
        value += '(' + sancapi.SignerTypeToStr(sancline.lSignerType) + ')';

        if (sancline.lSignerStatus == sanc0Const.HS_DRAFT || sancline.lSignerStatus == sanc0Const.HS_DONE || sancline.lSignerStatus == sanc0Const.HS_REJECT) {
          // 년/월/일 시:분:초
          value += delim;
          if (sancline.tSignDate) value += sancline.tSignDate.format('yyyy/MM/dd HH:mm:ss');
        }

        docinfoNames.push('결재진행' + i);
        docinfoValues.push(value);
      }
    }

    var buffer = '';
    for (let i = 0; i < docinfoNames.length; i++) {
      buffer += docinfoNames[i] + '=' + docinfoValues[i] + dataDelimiter;
    }
    //alert(buffer);
    return bRet ? buffer : null;
  };
}

function AddPageAction() {
  var that = this;
  (this.feedbackPromise = function (context, head, body) {
    return new Promise(function (resolve, reject) {
      console.log('AddPageAction.feedbackPromise START.');
      try {
        that.feedback(context, head, body, function (ret) {
          if (ret) {
            console.log('AddPageAction.feedbackPromise END. success');
            resolve(true);
          } else {
            console.log('AddPageAction.feedbackPromise END. fail');
            reject(new Error('AddPageAction.feedbackPromise error'));
          }
        });
      } catch (e) {
        console.log('AddPageAction.feedback error');
        reject(e);
      }
    });
  }),
    (this.feedback = function (context, head, body, callbackFn) {
      if (sanc0Const.DEBUG) alert('AddPageAction.feedback() ' + head.currentActionCount + '/' + head.totalActionCount);

      var downloadUrl = location.protocol + '//' + location.hostname;
      if (location.port) downloadUrl += ':' + location.port;
      downloadUrl += '/qdb/mng/downloadQdbFile.do?formId=' + head.formId + '&fileId=' + body.dataFileID;

      console.log('AddPageAction downloadUrl', downloadUrl);
      console.log('AddPageAction body', body);

      wordapi.insertDocument(downloadUrl, false, function () {
        head.returnValue = '1';
        Action.call(head, body);
        console.log('AddPageAction insertDocument END');
        if (callbackFn) {
          callbackFn.apply(null, [true]);
        }
      }); // add page
    });
  this.loadData = function (cells, values) {
    return true;
  };
}

function LoadAction() {
  var that = this;
  (this.feedbackPromise = function (context, head, body) {
    return new Promise(function (resolve, reject) {
      console.log('LoadAction.feedbackPromise START.');
      try {
        that.feedback(context, head, body, function (ret) {
          head.returnValue = ret ? '1' : '0';
          if (ret) {
            that.call(head, body, function (ret) {
              console.log('callback of LoadAction.call');

              if (ret) {
                console.log('LoadAction.feedbackPromise END. success');
                resolve(true);
              } else {
                console.log('LoadAction.feedbackPromise END. fail');
                reject(new Error('LoadAction.feedbackPromise error'));
              }
            });
          } else {
            console.log('LoadAction.feedback error ret=' + ret);
            reject();
          }
        });
      } catch (e) {
        console.log('LoadAction.feedback error');
        reject(e);
      }
    });
  }),
    (this.feedback = function (context, head, body, callbackFn) {
      if (sanc0Const.DEBUG) alert('LoadAction.feedback() ' + head.currentActionCount + '/' + head.totalActionCount);
      var bRet = true;
      // "Page번호;셀명1;...;셀명n;"
      var cells = body.script ? body.script.split(head.dataDelimiter) : [];
      if (cells.length >= 2) {
        var values = body.data ? body.data.split(head.dataDelimiter) : [];
        if (cells.length - 1 > values.length) {
          const msg = '연동할 자료가 부족하게 저장되었습니다.';
          alert(msg);

          console.log(msg);

          bRet = false;
          if (callbackFn) {
            callbackFn.apply(null, [bRet]);
            return;
          }
        } else {
          bRet = this.loadData(cells, values, function (bRet) {
            console.log('LoadAction.loadData callback');

            if (callbackFn) {
              callbackFn.apply(null, [bRet]);
              return;
            }
          });
        }
      } else {
        alert(sanc0Const.HDCSTR_INVALIDEXCUTEACTION);
        bRet = false;
        if (callbackFn) {
          callbackFn.apply(null, [bRet]);
          return;
        }
      }
      return bRet;
    });
  this.loadData = function (cells, values, callbackFn) {
    var arrCellInfos = [];

    for (var i = 1; i < cells.length; i++) {
      var info = [];
      if (
        cells[i] == '본문' ||
        cells[i].toUpperCase() == 'BODY'
        /*|| cells[i] == '본문_외부파일'*/
      ) {
        /*if(cells[i] == '본문_외부파일') {
					wordapi.setBodyText(getFileToString(values[i-1]);
				}*/
        //wordapi.setBodyText(values[i-1]);
      } else {
        //wordapi.setText(cells[i], values[i-1]);
      }
      $.extend(info, { cellName: cells[i], value: values[i - 1] });
      arrCellInfos.push(info);
    }
    wordapi.setTextPromise(arrCellInfos, function () {
      if (callbackFn) {
        callbackFn.apply(null, [true]);
        return;
      }
    });
  };
  /*this.loadDataOld = function(cells, values) {
		var pageNo = cells[0];
		for (var i = 1; i < cells.length; i++) {
			if (cells[i] == '본문' || cells[i].toUpperCase() == 'BODY') { 
				//|| cells[i] == '본문_외부파일') {
				//if(cells[i] == '본문_외부파일') {
				//	wordapi.setBodyText(getFileToString(values[i-1]);
				//}
				wordapi.setBodyText(values[i-1]);
			} else {
				wordapi.setText(cells[i], values[i-1]);
			}
		}
		return true;
	}*/
}

function RepeatLoadAction() {
  var that = this;
  (this.feedbackPromise = function (context, head, body) {
    return new Promise(function (resolve, reject) {
      console.log('RepeatLoadAction.feedbackPromise START.');
      try {
        that.feedback(context, head, body, function (ret) {
          head.returnValue = ret ? '1' : '0';
          if (ret) {
            that.call(head, body, function (ret) {
              console.log('callback of RepeatLoadAction.call');

              if (ret) {
                console.log('RepeatLoadAction.feedbackPromise END. success');
                resolve(true);
              } else {
                console.log('RepeatLoadAction.feedbackPromise END. fail');
                reject(new Error('RepeatLoadAction.feedbackPromise error'));
              }
            });
          } else {
            console.log('RepeatLoadAction.feedback ret=' + ret);
            reject();
          }
        });
      } catch (e) {
        console.log('RepeatLoadAction.feedback error');
        reject(e);
      }
    });
  }),
    (this.feedback = function (context, head, body, callbackFn) {
      if (sanc0Const.DEBUG) alert('RepeatLoadAction.feedback() ' + head.currentActionCount + '/' + head.totalActionCount);
      var bRet = true;
      // "추가Page파일명;반복수(페이지);최대인덱스값(셀 반복수);셀수(n);셀명1;...;셀명n;자료1;...;자료m;" (m = 최대인덱스값(셀 반복수) * 셀수(n))
      var cells = body.script ? body.script.split(head.dataDelimiter) : [];
      if (cells.length >= 6) {
        var lmCellCount = parseInt(cells[3], 10);
        if (cells[4 + lmCellCount]) {
          this.loadData(cells, head.formId, body.dataFileID, function (bRet) {
            console.log('RepeatLoadAction.loadData callback bRet=' + bRet);

            if (!bRet) {
              alert(sanc0Const.HDCSTR_LOADACTIONFAIL);
            }

            if (callbackFn) {
              callbackFn.apply(null, [bRet]);
              return;
            }
          });
        } else {
          if (callbackFn) {
            callbackFn.apply(null, [bRet]);
            return;
          }
        }
      } else {
        alert(sanc0Const.HDCSTR_INVALIDEXCUTEACTION);
        bRet = false;
      }
      return bRet;
    });
  this.loadData = function (cells, formID, dataFileID, callbackFn) {
    var pageFile = cells[0]; // 추가Page파일명
    var repeatPage = parseInt(cells[1], 10); // 반복수(페이지)
    if (repeatPage == 0) repeatPage = 100; // TODO : INT_MAX
    var maxIndex = parseInt(cells[2], 10); // 최대인덱스값(셀 반복수)
    var cellCount = parseInt(cells[3], 10); // 셀수

    var downloadUrl = location.protocol + '//' + location.hostname;
    if (location.port) downloadUrl += ':' + location.port;
    downloadUrl += '/qdb/mng/downloadQdbFile.do?formId=' + formID + '&fileId=' + dataFileID;
    console.log('RepeatLoadAction downloadUrl', downloadUrl);

    var infos = [];
    for (var pageNo = 1; pageNo <= repeatPage; pageNo++) {
      if (!cells[4 + cellCount + (pageNo - 1) * maxIndex * cellCount]) {
        break;
      }
      var info = [];
      info.push(pageNo);
      info.push(cells);
      info.push(downloadUrl);
      infos.push(info);
    }

    one_by_one(infos, wordapi.insertDocumentPromise, function (ret) {
      console.log('RepeatLoadAction.loadData ret=' + ret);
      if (callbackFn) {
        callbackFn.apply(null, [true]);
        return;
      }
    });
  };
}

function CallAction() {
  var that = this;
  (this.feedbackPromise = function (context, head, body) {
    return new Promise(function (resolve, reject) {
      console.log('CallAction.feedbackPromise START.');
      try {
        that.feedback(context, head, body, function (ret) {
          head.returnValue = ret ? '1' : '0';
          if (ret) {
            that.call(head, body, function (ret) {
              console.log('callback of CallAction.call');

              var sret = that.onSuccess(ret);
              if (sret) {
                console.log('CallAction.feedbackPromise END. success');
                resolve(true);
              } else {
                console.log('CallAction.feedbackPromise END. fail');
                reject(new Error('CallAction.feedbackPromise error'));
              }
            });
          } else {
            console.log('CallAction.feedback error ret=' + ret);
            reject();
          }
        });
      } catch (e) {
        console.log('CallAction.feedback error');
        reject(e);
      }
    });
  }),
    (this.feedback = function (context, head, body, callbackFn) {
      if (sanc0Const.DEBUG) alert('CallAction.feedback() ' + head.currentActionCount + '/' + head.totalActionCount);
      // "실행명령;대기시간;"
      body.data = this.parseCommand(context, head, body.script);
      head.returnValue = '1';
      if (callbackFn) {
        callbackFn.apply(null, [true]);
      }
    });
  this.parseCommand = function (context, head, oldcmd) {
    if (sanc0Const.DEBUG) alert('oldcmd = ' + oldcmd);
    var tokens = oldcmd.split('$');
    //		var tokens = oldcmd.split(" ");
    // miskey 명칭 조회
    var misKeyName = '$MISKEY$';

    $.ajax({
      url: QDB_CONTEXT_NAME + '/selectMisKeyName.do',
      type: 'post',
      async: false,
      dataType: 'json',
      success: function (result, status) {
        misKeyName = result.miskey;
      },
    });

    //miskey 변환이 이루어지지 않은 경우
    //misKeyName = misKeyName.replace(/(^\s*)|(\s*$)/g, "");
    console.log('misKeyName = ' + misKeyName);
    var aryMisKey = misKeyName.split(',');
    var newcmd = '';

    console.log('context.sanction= ' + context.sanction);
    var searchEditor = false;
    var noEditorSanction = ',45057,45058,45059,45060,45062,45063,45064,41218,41219,41220'; //회수, 삭제
    if ((context.wordType == 'html' || context.wordType == 'hwpweb') && noEditorSanction.indexOf(',' + context.sanction + ',') == -1) {
      searchEditor = true;
    }
    var _docnum = '문서번호';
    if (typeof lang_doc_num != 'undefined') {
      // eslint-disable-next-line no-undef
      _docnum = lang_doc_num;
    }
    console.log('_docnum = ' + _docnum);

    console.log('searchEditor= ' + searchEditor);
    for (var i = 0; i < tokens.length; i++) {
      console.log('tokens' + i + '=' + tokens[i]);
      //			var token = tokens[i];
      var token = tokens[i].replace(/(^\s*)|(\s*$)/g, '');
      if (token.lastIndexOf('=') != -1) token = token.substring(token.lastIndexOf('=') + 1);

      //			token = token.replace(/(^\s*)|(\s*$)/g, "");
      var value = token;
      switch (token.toUpperCase()) {
        case 'FORMNAME':
          value = context.formName;
          break;
        case 'EMPNO':
          value = context.employNo;
          break;
        case 'DEPTCODE':
          value = context.deptCode;
          break;
        case 'APPRID':
          value = context.sancInfo.hsMsgID.szID;
          break;
        case 'DOC_ID':
          value = context.sancInfo.hsMsgID.szID;
          break;
        case 'FORMID':
          value = head.formId;
          break;
        case 'ORGAPPROVAL_ID':
          value = context.sancInfo.hsOrgMsgID.szID;
          break;
        default:
          //				if (tokens[i] != null && tokens[i].indexOf("$") != -1) {
          if (tokens[i] != null) {
            console.log('searchEditor = ' + searchEditor);
            console.log(' token = ' + token);
            // 결재취소인 경우에는 문서안에 내용 찾는부분을 하지 않는다.str.split(searchStr).join(replaceStr);
            if (searchEditor) {
              if (token != '' && wordapi.searchCell(token, context.finalDeptApprComplete)) {
                value = wordapi.getText(token, context.finalDeptApprComplete);
              }
            }
            console.log('default.prev : ' + token + ' = ' + value);
            if (token == _docnum) {
              // 공백문자 치환
              value = value.replace(/ /gi, '=^-^=');
            }
            var isMisKey = false;
            for (var m = 0; m < aryMisKey.length; m++) {
              if (aryMisKey[m].toUpperCase() == '$' + token.toUpperCase() + '$') {
                isMisKey = true;
                break;
              }
            }

            if (!searchEditor && isMisKey && token != '' && token == value) {
              if (sanc0.isQdbInfo) {
                $.ajax({
                  url: QDB_CONTEXT_NAME + '/selectMisKey.do',
                  type: 'post',
                  async: false,
                  dataType: 'json',
                  data: { apprid: context.sancInfo.hsMsgID.szID },
                  success: function (result, status) {
                    //alert(result.miskey)
                    value = result.miskey;
                    console.log('miskey : ' + value);
                  },
                });
              } else {
                // eslint-disable-next-line no-undef
                if (typeof fromViewer != 'undefined' && fromViewer == 'Y') {
                  //문서열어 회수/삭제하는 경우 에디터가 있음
                  value = wordapi.getText(token, false);
                  if (value == null || value == '') {
                    //소문자로 한번 더 검색 (대소문자 섞인 경우는 고려안함)
                    value = wordapi.getText(token.toLowerCase(), false);
                  }
                  console.log('miskey : ' + value);
                }
              }
              if (value == '' || value == token) {
                //목록에서 회수시 MISKEY식으로 넘어옴(value와 token이 동일)
                alert('miskey를 본문에서 읽어들이지 못했습니다.');
              }
              //alert('miskey : '+value);
            }
          }
        //			console.log('default.after : '+token +' = '+value);
      }
      console.log('convert : ' + token + ' = ' + value);
      /*if (newcmd.length > 0) {
				newcmd += " ";
			}*/
      newcmd += tokens[i].replace(token, value);
    }
    console.log('newcmd = ' + newcmd);
    if (sanc0Const.DEBUG) alert('newcmd = ' + newcmd);
    return newcmd;
  };
  this.onSuccess = function (result, status) {
    var bRet = false;
    var actionId = sanc0Const.HDCTAG_Call;
    if (!result.MessageHead) {
      alert('연동서버와 통신중 헤더를 수신할 수 없습니다(' + sancapi.actionIdToStr(actionId) + ').');
    } else if (result.MessageHead.actionId != sanc0Const.HDCTAG_Call) {
      alert('연동서버와 통신중 잘못된 헤더를 수신하였습니다(' + sancapi.actionIdToStr(actionId) + ').');
    } else if (!result.MessageBody) {
      alert('연동서버와 통신중 본문을 수신할 수 없습니다(' + sancapi.actionIdToStr(actionId) + ').');
    } else {
      var values = result.MessageBody.data ? result.MessageBody.data.split(result.MessageHead.dataDelimiter) : [];
      if (values.length < 2) {
        alert('MIS 프로그램 수행후 결과 코드 및 메시지를 수신할 수 없습니다.');
      } else {
        switch (values[0]) {
          case '0': // 정상종료
            bRet = true;
            break;
          case '1': // 처리결과 미처리
            alert(sanc0Const.HDCSTR_CALL_NOT_CONFIRM + '\n(' + values[1] + ')');
            break;
          case '2': // 처리결과 시간초과
            alert(sanc0Const.HDCSTR_CALL_TIMEOVER + '\n(' + values[1] + ')');
            break;
          case '-1':
            alert(sanc0Const.HDCSTR_CALL_NOT_NORMAL + '\n(' + values[1] + ')');
            break;
          default: // 동기화 비정상 수행 // returncode값이 위의 경우와 틀린 경우.
            alert(sanc0Const.HDCSTR_CALL_NOT_CONFIRM + '\n(' + values[1] + ')');
            break;
        }
      }
    }
    return bRet;
  };
}

SaveAction.prototype = new Action();
DocInfoAction.prototype = new Action();
LoadAction.prototype = new Action();
RepeatLoadAction.prototype = new Action();
CallAction.prototype = new Action();

var wordapi = {
  isWord: true,
  insertDocument: function (url, option, callbackFn) {
    if (sanc0Const.DEBUG) {
      alert('wordapi.insertDocument(' + url + ', ' + option + ')');
    }
    if (wordapi.isWord) {
      var hwpCtrl = editor('editor1').GetControl();
      var oldEditMode = hwpCtrl.EditMode;
      hwpCtrl.EditMode = EDITMODE_NORMAL;

      //문서 끝으로 이동
      console.log('MoveDocEnd 문서 끝으로 이동');
      hwpCtrl.Run('MoveDocEnd');
      //페이지 분리
      console.log('BreakPage 페이지 분리');
      hwpCtrl.Run('BreakPage');

      //한글문서 append
      {
        console.log('hwpCtrl.Insert START url:' + url);
      }

      hwpCtrl.Insert(
        url,
        'HWP',
        '',
        function (res) {
          console.log('hwpCtrl.Insert END');
          console.log(res);

          hwpCtrl.EditMode = oldEditMode;
          if (callbackFn) {
            callbackFn.apply(null);
            return;
          }
        },
        {}
      );
    } else {
      alert('wordapi.insertDocument() - not supported');
    }
  },
  insertDocumentPromise: function (info) {
    console.log('[insertDocumentPromis] START');
    var pageNo = info[0];
    var cells = info[1];
    var url = info[2];
    var repeatPage = parseInt(cells[1], 10); // 반복수(페이지)
    if (repeatPage == 0) repeatPage = 100; // TODO : INT_MAX
    var maxIndex = parseInt(cells[2], 10); // 최대인덱스값(셀 반복수)
    var cellCount = parseInt(cells[3], 10); // 셀수

    return new Promise(function (resolve, reject) {
      if (wordapi.isWord) {
        var hwpCtrl = editor('editor1').GetControl();
        var oldEditMode = hwpCtrl.EditMode;
        hwpCtrl.EditMode = EDITMODE_NORMAL;

        //문서 끝으로 이동
        console.log('MoveDocEnd 문서 끝으로 이동');
        hwpCtrl.Run('MoveDocEnd');
        //페이지 분리
        console.log('BreakPage 페이지 분리');
        hwpCtrl.Run('BreakPage');

        //한글문서 append

        console.log('hwpCtrl.Insert START url:' + url);

        hwpCtrl.Insert(
          url,
          'HWP',
          '',
          function (res) {
            console.log('hwpCtrl.Insert END');
            console.log(res);

            var arrCellInfos = [];

            for (var i = 1; i <= maxIndex; i++) {
              for (var j = 0; j < cellCount; j++) {
                var cell = maxIndex > 1 ? cells[4 + j] + i + '.' + pageNo : cells[4 + j] + '.' + pageNo;
                if (!wordapi.searchCell(cell)) {
                  //셀이 없으면 예전포맷(!+셀명+index)  으로 다시 한번 검색
                  var oldCellName = '!' + cells[4 + j] + (maxIndex > 1 ? i : '');
                  console.log('oldCellName=' + oldCellName);
                  if (wordapi.searchCell(oldCellName)) {
                    //예전포맷의 셀명이 있으면 셀명을 신규포맷으로 변경
                    console.log('oldCellName ' + oldCellName + ' exist');
                    IMPL_RenameField('editor1', oldCellName, cell);
                    console.log('rename from ' + oldCellName + ' to' + cell);
                  }
                }
                var dataIndex = 4 + cellCount + cellCount * maxIndex * (pageNo - 1) + (i - 1) * cellCount + j;
                if (dataIndex > cells.length) {
                  break;
                }
                console.log('arrCellInfos.push cell ' + cell + ' data ' + cells[dataIndex]);

                arrCellInfos.push({ cellName: cell, value: cells[dataIndex] });
              }
            }

            wordapi.setTextPromise(arrCellInfos, function () {
              console.log('setTextPromise callback');
              hwpCtrl.EditMode = oldEditMode;
              resolve(true);
            });
          },
          {}
        );
      } else {
        alert('wordapi.insertDocument() - not supported');
        reject(false);
      }
    });
  },
  insertHtml: function (url, cellName, callbackFn) {
    if (sanc0Const.DEBUG) {
      alert('wordapi.insertHtml(' + url + ', ' + cellName + ')');
    }
    if (wordapi.isWord) {
      var hwpCtrl = editor('editor1').GetControl();
      var oldEditMode = hwpCtrl.EditMode;
      hwpCtrl.EditMode = EDITMODE_NORMAL;

      //한글문서 append

      IMPL_MoveToField('editor1', cellName);

      console.log('insertHtml cellName' + cellName + '로 이동');
      console.log('insertHtml hwpCtrl. Insert START url:' + url);

      hwpCtrl.Insert(
        url,
        'HTML',
        '',
        function (res) {
          console.log('insertHtml hwpCtrl.Insert END');
          console.log(res);

          hwpCtrl.EditMode = oldEditMode;
          if (callbackFn) {
            callbackFn.apply(null);
            return;
          }
        },
        {}
      );
    } else {
      alert('wordapi.insertHtml() - not supported');
    }
  },
  setTextSinglePromise: function (info) {
    return new Promise(function (resolve, reject) {
      try {
        var cellName = info.cellName;
        var cellValue = info.value;
        if (typeof cellValue == 'undefined') {
          resolve(true);
          return;
        }
        if (cellName == '') {
          resolve(true);
          return;
        }

        console.log('setTextSinglePromise START. cellName' + cellName + ' cellValue=' + cellValue);

        var isBody = cellName == '본문' || cellName.toUpperCase() == 'BODY';
        var isHtmlInsert = false; //데이타가 HTML형식으로 들어가는지 여부
        if (cellName.startsWith('HTML.') || cellValue.toUpperCase().indexOf('<HTML>') > -1) {
          isHtmlInsert = true;
        }

        if (wordapi.isWord) {
          if (isHtmlInsert || isBody) {
            if (rInfo.wordType == WORDTYPE_HWPWEB) {
              //웹한글
              if (!isHtmlInsert) {
                let addHeader = '<!DOCTYPE html><html>';
                addHeader += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
                cellValue = addHeader + '<body>' + cellValue + '</body></html>';
              }
              var obj = Capi.putBodyFile(cellValue, true, false, 'N', true);
              var url = transfile_url(obj.TRID, 'down.html');
              //한글깨짐 고려

              console.log('wordapi.insertHtml cellValue=' + cellValue);
              console.log('url=' + url);

              wordapi.insertHtml(url, cellName, function () {
                console.log('wordapi.insertHtml callback');

                console.log('setTextSinglePromise END.');

                resolve(true);
              });
            } else {
              cellValue = cellValue.replace(/\n/g, '\r\n');
              IMPL_PutFieldText('editor1', cellName, cellValue, DATATYPE_HTML);

              console.log('setTextSinglePromise END.');

              resolve(true);
            }
          } else {
            cellValue = cellValue.replace(/\n/g, '\r\n');
            IMPL_PutFieldText('editor1', cellName, cellValue, DATATYPE_TEXT);

            console.log('setTextSinglePromise END.');

            resolve(true);
          }
        } else {
          if (isBody) {
            $('#body').val(cellValue);
          } else {
            $('#' + cellName).val(cellValue);
            if (isHtmlInsert) {
              IMPL_PutFieldText4Speed('editor1', cellName, cellValue, DATATYPE_HTML);
            } else {
              IMPL_PutFieldText('editor1', cellName, cellValue);
            }
          }

          console.log('setTextSinglePromise END.');

          resolve(true);
        }
      } catch (e) {
        reject(e);
      }
    });
  },

  setTextPromise: function (infos, callbackFn) {
    one_by_one(infos, wordapi.setTextSinglePromise, function (a) {
      console.log('[wordapi.setTextSinglePromise] All setTextSinglePromise ended');
      console.log(a);

      if (callbackFn) {
        callbackFn.apply(null);
        return;
      }
    });
  },
  setBodyText: function (value) {
    console.log('setBodyText START.');

    if (wordapi.isWord) {
      if (value.toUpperCase().indexOf('<HTML>') > -1) {
        if (rInfo.wordType == WORDTYPE_HWPWEB) {
          //웹한글
          var obj = Capi.putBodyFile(value, true, false, 'N', true);
          var url = transfile_url(obj.TRID, 'down.html');
          this.insertHtml(url, CELL_CBODY);
        } else {
          value = value.replace(/\n/g, '\r\n');
          IMPL_PutFieldText('editor1', CELL_CBODY, value, DATATYPE_HTML);
        }
      } else {
        value = value.replace(/\n/g, '\r\n');
        IMPL_PutFieldText('editor1', CELL_CBODY, value, DATATYPE_TEXT);
      }
    } else {
      $('#body').val(value);
    }

    console.log('setBodyText END.');
  },
  getBodyText: function () {
    if (wordapi.isWord) {
      return IMPL_GetFieldTextEx('editor1', CELL_CBODY);
    } else {
      return $('#body').val();
    }
  },
  setText: function (cell, value) {
    if (!cell) {
      return;
    }
    if (wordapi.isWord) {
      if (typeof value == 'string') {
        value = value.replace(/\n/g, '\r\n');
      }
      if (cell.startsWith('HTML.')) {
        IMPL_PutFieldText4Speed('editor1', cell, value, DATATYPE_HTML);
      } else {
        IMPL_PutFieldText('editor1', cell, value);
      }
    } else {
      $('#' + cell).val(value);
    }
  },
  getText: function (cell, finalDeptApprComplete) {
    if (wordapi.isWord) {
      var editor = 'editor1';
      if (typeof finalDeptApprComplete == 'undefined') {
        // do nothing
      } else {
        if (finalDeptApprComplete == true) {
          editor = 'editor2';
        }
      }
      return IMPL_GetFieldTextEx(editor, cell);
    } else {
      return $('#' + cell).val();
    }
  },
  searchCell: function (cell, finalDeptApprComplete) {
    if (wordapi.isWord) {
      var editor = 'editor1';
      if (typeof finalDeptApprComplete == 'undefined') {
        // do nothing
      } else {
        if (finalDeptApprComplete == true) {
          editor = 'editor2';
        }
      }
      return IMPL_GetCellInfo(editor, cell);
    } else {
      return document.getElementById(cell);
    }
  },
  removeCellName: function (cell) {
    if (wordapi.isWord) {
      var editor = 'editor1';
      //필드로 이동한 담에 SetCurFieldName 인자값 빈값으로
      IMPL_SetFieldFormControlType(editor, cell, '');
      IMPL_SetCellFieldName(editor, '');
    }
  },
};

var orgapi = {
  HDGetUserInfoAPI: function (userID) {
    if (typeof Capi != 'undefined') {
      var user = Capi.getUser(userID).user;
      if (!user) {
        return null;
      }
      return new HDUserInfo({
        szID: userID,
        szPosition: user.positionName,
        szName: user.name,
        szEmployeeNo: user.empCode,
      });
    }
    return new HDUserInfo({
      szID: userID,
      szPosition: 'test직위',
      szName: 'test이름',
      szEmployeeNo: 'test사번',
    });
  },
};

var sancapi = {
  createHsID: function (szID, nType) {
    if (sanc0Const.DEBUG) {
      //alert('createHsID szID='+szID+' nType='+nType);
    }
    if (!szID) return null;
    if (!nType) nType = 1;

    return new HsID(szID, nType);
  },
  createOrgID: function (szID, strType) {
    if (sanc0Const.DEBUG) {
      //alert('createOrgID id='+id+' strType='+strType);
    }
    if (!szID) return null;
    var nType = 1; // OrgID.ORG_USER_SID = 1;
    if (strType == 'user') {
      nType = 1; // OrgID.ORG_USER_SID	= 1;	 // 사용자
    } else if (strType == 'dept') {
      nType = 65537; //OrgID.ORG_DEPT_SID 	= 65537; // 부서
    }

    return new OrgID(szID, nType);
  },
  createDate: function (str, format) {
    if (!str) return null;
    return Date.parse(str, format);
  },
  createSancLine: function (domHox) {
    if (!domHox) return null;
    var lpSignList = [];
    $('hox>approvalFlow>participant', domHox).each(function () {
      var hsUserID = sancapi.createOrgID($.trim($('>ID', this).text()), $.trim($('>type', this).text()));
      var strPosi = $.trim($('>position', this).text());
      var strName = $.trim($('>name', this).text());
      var lSignerStatus = $.trim($('>approvalStatus', this).text());
      var lSignerType = $.trim($('>approvalType', this).text());
      var tSignDate = sancapi.createDate($.trim($('>date', this).text()), 'yyyy-MM-ddTHH:mm:ss');

      var hdsigninfo = new HDSIGNINFO({
        hsUserID: hsUserID,
        strPosi: strPosi,
        strName: strName,
        lSignerStatus: lSignerStatus,
        lSignerType: lSignerType,
        tSignDate: tSignDate,
      });
      lpSignList.push(hdsigninfo);
    });
    // array 순서가 GW8.0 HOX 는 기안자,~,최종결재자이지만 QDB/기존결재 는 최종결재자,~,기안자 순이므로 reverse 한다.
    return lpSignList.reverse();
  },
  createSancInfo: function (domHox) {
    // 현재 처리자는 결재선에서 current="true"를 찾으면 된다.. by 박범진
    var hsMsgID = this.createHsID($.trim($('hox>docInfo>apprID', domHox).text()), 1);

    // HSO-6803 CLONE - [광동제약] QDB 예약어 확인요청 ORGAPPROVAL_ID, 2019.09.23
    var temp = $.trim($('hox>docInfo>orgApprID', domHox).text());
    if (temp == 'undefined' || temp == null || temp == '') temp = '00000000000000000000';
    var hsOrgMsgID = this.createHsID(temp, 1);

    var hsGianDeptID = this.createOrgID($.trim($('hox>docInfo>drafter>department>ID', domHox).text()), 'dept');
    var hsGianID = this.createOrgID($.trim($('hox>docInfo>drafter>ID', domHox).text()), 'user');
    var hsKyulID = this.createOrgID($.trim($("hox>approvalFlow>participant[current='true']>ID", domHox).text()), $.trim($("hox>approvalFlow>participant[current='true']>type", domHox).text()));
    // TODO 기안/결재일시.. 확인필요
    var tDate = new Date(this.createDate($.trim($('hox>docInfo>approvalDate', domHox).text()), 'yyyy-MM-ddTHH:mm:ss'));
    var nSignerCount = 0;
    var nCurSignerIdx = -1;
    var lpSignList = this.createSancLine(domHox);
    if (lpSignList && hsKyulID) {
      nSignerCount = lpSignList.length;
      for (var i = 0; i < lpSignList.length; i++) {
        if (lpSignList[i].hsUserID.szID == hsKyulID.szID) {
          nCurSignerIdx = i;
          break;
        }
      }
    }

    return new HDSancInfo({
      hsMsgID: hsMsgID,
      hsOrgMsgID: hsOrgMsgID,
      hsGianDeptID: hsGianDeptID,
      hsGianID: hsGianID,
      hsKyulID: hsKyulID,
      tDate: tDate,
      lpSignList: lpSignList,
      nSignerCount: nSignerCount,
      nCurSignerIdx: nCurSignerIdx,
    });
  },
  getFormName: function (domHox) {
    var formName = $.trim($('hox>docInfo>formInfo>formName', domHox).text()); // 연동 양식 이름
    if (formName.indexOf('@') > -1) {
      formName = formName.substring(formName.indexOf('@') + 1);
    }
    return formName;
  },
  getQDBFormName: function (domHox) {
    var formID = $.trim($('hox>docInfo>formInfo>formID', domHox).text()); // 양식 아이디
    var formName = $.trim($('hox>docInfo>formInfo>formName', domHox).text()); // 연동 양식 이름
    if (formName.indexOf('@') > -1) {
      formName = formName.substring(formName.indexOf('@') + 1);
    }
    return formName;
  },
  getWordType: function (domHox) {
    var wordType = $.trim($('hox>docInfo>formInfo>wordType', domHox).text()); // 서식유형
    return wordType;
  },
  getDocumentType: function (domHox) {
    var sancType = $.trim($('hox>docInfo>approvalType', domHox).text());
    switch (
      sancType // GetDocumentType
    ) {
      case sanc0Const.APPRTYPE_AGREE_STR:
        sancType = sanc0Const.SANC_AGREE;
        break;
      case sanc0Const.APPRTYPE_RECEIPT_STR:
        sancType = sanc0Const.SANC_RECEIVER;
        break; // 2중결재선일 경우
      case sanc0Const.APPRTYPE_AUDIT_STR:
        sancType = sanc0Const.SANC_AUDIT;
        break; // 부서결재의 경우
      case sanc0Const.APPRTYPE_REFER_STR:
        sancType = sanc0Const.SANC_REFER;
        break;
      case sanc0Const.APPRTYPE_PUBSHOW_STR:
        sancType = sanc0Const.SANC_GONGRAM;
        break;
      case sanc0Const.APPRTYPE_DELIBERATE_STR:
        sancType = sanc0Const.SANC_DELIBERATE;
        break; // 심의부서
      case sanc0Const.APPRTYPE_COMPLIANCE_STR:
        sancType = sanc0Const.SANC_COMPLIANCE;
        break;
      default:
        var formType = $.trim($('hox>docInfo>formInfo>formType', domHox).text());
        var enforceType = $.trim($('hox>docInfo>enforceType', domHox).text());
        sancType = sanc0Const.SANC_NORMAL;
        if (formType == 'formtype_uniform') {
          /* 통합양식 */
          if (enforceType == 'enforcetype_external' || enforceType == 'enforcetype_internal') {
            sancType = sanc0Const.SANC_SENDER;
          }
        } else if (formType == 'formtype_draft') {
          /* 기안양식 */
          if (enforceType == 'enforcetype_internal' || enforceType == 'enforcetype_external') {
            sancType = sanc0Const.SANC_SENDER;
          }
        } else if (formType == 'formtype_dupline') {
          /* 발수신양식 */
          sancType = sanc0Const.SANC_SENDER;
        }
      /*if ($("hox>docInfo>content>receiptInfo>recipient", domHox).length > 0) {
				sancType = sanc0Const.SANC_SENDER;
			} else {
				sancType = sanc0Const.SANC_NORMAL;
			}*/
    }
    return sancType;
  },
  SignerStatusToStr: function (lSignerStatus) {
    switch (lSignerStatus) {
      case sanc0Const.HS_DRAFT:
        return '상신';
      case sanc0Const.HS_DONE:
        return '완료';
      case sanc0Const.HS_NOW:
        return '진행';
      case sanc0Const.HS_WILL:
        return '대기';
      case sanc0Const.HS_POSTPONE:
        return '보류';
      case sanc0Const.HS_REJECT:
        return '반송';
      //		case sanc0Const.HS_REJECT_HOF:		return "내부반송";
      case sanc0Const.HS_SKIP:
        return '통과';
      case sanc0Const.HS_ALL:
        return '전체';
      default:
        return '대기';
    }
  },
  SignerTypeToStr: function (lSignerType) {
    switch (lSignerType) {
      case sanc0Const.HS_USER_DRAFT:
        return '상신';
      case sanc0Const.HS_USER_SANCTION:
        return '결재';
      case sanc0Const.HS_USER_NO_SANC:
        return '결재안함';
      case sanc0Const.HS_USER_DAEKYUL:
        return '대결';
      case sanc0Const.HS_USER_HOOYUL:
        return '후열';
      case sanc0Const.HS_USER_REFER:
        return '참조';
      case sanc0Const.HS_USER_MERGE_D:
        return '부서협조확인';
      case sanc0Const.HS_USER_MERGE_P:
        return '협조확인';
      case sanc0Const.HS_USER_JUNKYUL:
        return '전결';
      case sanc0Const.HS_USER_INJIDAE:
        return '인지대';
      case sanc0Const.HS_USER_NO_SIGN:
        return '확인';
      //		case sanc0Const.HS_USER_HYUBJO:			return "개인협조";
      case sanc0Const.HS_USER_HYUBJO_S:
        return '개인순차협조';
      case sanc0Const.HS_USER_JOJEONG:
        return '조정통제';
      case sanc0Const.HS_USER_HYUBJO_P:
        return '병렬협조';
      case sanc0Const.HS_USER_SKIP:
        return '통과';
      case sanc0Const.HS_USER_DAEREE:
        return '대리결재';
      case sanc0Const.HS_USER_AUDIT:
        return '감사';
      case sanc0Const.HS_USER_AUDIT_HAM:
        return '감사일지기록';
      case sanc0Const.HS_USER_JUN_HOO:
        return '전결후열자';
      case sanc0Const.HS_USER_SKIP_HYUBJO:
        return '협조통과';
      case sanc0Const.HS_USER_SKIP_HYUBJO_P:
        return '병렬협조통과';
      case sanc0Const.HS_USER_SKIP_AUDIT:
        return '감사통과';
      case sanc0Const.HS_USER_GONGRAM:
        return '개인공랑';
      //		case sanc0Const.HS_USER_PASS:			return "경유결재자";
      case sanc0Const.HS_USER_VIEW:
        return '개인공람';
      case sanc0Const.HS_DEPT_AUDIT:
        return '검사부';
      case sanc0Const.HS_DEPT_AGREE_P:
        return '부서병렬협조';
      case sanc0Const.HS_DEPT_AGREE_S:
        return '부서순차협조';
      case sanc0Const.HS_DEPT_REF:
        return '부서참조';
      case sanc0Const.HS_DEPT_SKIP:
        return '부서통과';
      case sanc0Const.HS_DEPT_SKIP_AUDIT:
        return '검사부통과';
      case sanc0Const.HS_DEPT_SKIP_AGREE_P:
        return '부서병렬협조통과';
      case sanc0Const.HS_DEPT_SKIP_AGREE_S:
        return '부서순차협조통과';
      case sanc0Const.HS_DEPT_AUDIT_HAM:
        return '검사부감사일지기록';
      case sanc0Const.HS_DEPT_GONGRAM:
        return '부서공람';
      default:
        return 'Unknwon';
    }
  },
  actionIdToStr: function (actionId) {
    switch (actionId) {
      case sanc0Const.HDCTAG_Save:
        return 'Save Action';
      case sanc0Const.HDCTAG_DocInfo:
        return 'DocInfo Action';
      case sanc0Const.HDCTAG_Load:
        return 'Load Action';
      case sanc0Const.HDCTAG_RepeatLoad:
        return 'RepeatLoad Action';
      case sanc0Const.HDCTAG_Call:
        return 'Call Action';
      case sanc0Const.HDCTAG_AddPage:
        return 'AddPage Action';
      default:
        return 'Unknwon';
    }
  },
};
