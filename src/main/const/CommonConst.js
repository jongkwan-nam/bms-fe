/************
 * client application 구분 값 정의
 ****************************************************************/

export const HCLTAPP_VIEW = 1; /* 문서보기 */
export const HCLTAPP_GIAN = 2; /* 기안기 */
export const HCLTAPP_KYUL = 3; /* 결재기 */
export const HCLTAPP_REGIAN = 4; /* 재기안 */
export const HCLTAPP_CONTROL = 5; /* 심사기 */
export const HCLTAPP_SIMSA = 6; /* 심사의뢰 */
export const HCLTAPP_RESIMSA = 7; /* 심사재의뢰 */
export const HCLTAPP_HYUPJO = 8; /* 협조처리 */
export const HCLTAPP_ACCEPT = 9; /* 접수 */
export const HCLTAPP_SIHAENG = 10; /* 시행문변환 */
export const HCLTAPP_OPTVIEW = 11; /* 광파일 문서 보기 */
export const HCLTAPP_PRINT = 12; /* 문서 print */
export const HCLTAPP_FILESAVE = 13; /* 문서 저장 */
export const HCLTAPP_EXTVIEW = 14; /* 외부문서보기 */
export const HCLTAPP_SENDFILE = 15; /* 파일전송 */
export const HCLTAPP_ATTACHDRAFT = 16; /* 첨부기안 */
export const HCLTAPP_REGREJECT = 17; /* 반송문서등록 */
export const HCLTAPP_ACCEPT_BY_REJECT = 18; /* 접수 (회송도착) */
export const HCLTAPP_RETURNGIAN = 19; /* 회신기안 */
export const HCLTAPP_ALLINONEGIAN = 20; /* 학교기안 */
export const HCLTAPP_SEND_FOREIGN = 21; /* 21.대외발송, 2007-04-11 */
export const HCLTAPP_REQUEST_RESENDING = 22; // 22. 재발송의뢰, 2009-07-21
export const HCLTAPP_CONTROL_MODE_VIEWING = 23; // 23.발송진행, 심사함에서 문서확인, 2009-08-17
export const HCLTAPP_FORMMANAGE = 24; // 24.서식관리
export const HCLTAPP_CHANGEFLOW = 28; /* 결재경로변경 */
export const HCLTAPP_MODIFY = 29; /* 문서수정 HSO-11147 */
export const HCLTAPP_CMDEXEC = 1000; /* Command Execute */
export const HCLTAPP_PROGEXE = 2000; /* Program Execute */
export const HCLTAPP_REQRESEND = 3000; /* 재발송요청 */

export const WORDTYPE_HWN = 0; // 아래아 한글
export const WORDTYPE_AWP = 1; // 아리랑 (Not used)
export const WORDTYPE_BFF = 2; // BizFlow Form
export const WORDTYPE_HWP2002 = 3; // 한글 2002
export const WORDTYPE_HUN = 4; // 훈민정음
export const WORDTYPE_HWPWEB = 5; // HWP WEB
export const WORDTYPE_TWE = 6; // TagFree Active Designer
export const WORDTYPE_HTML32 = 7; // HTML Editor
export const FORMTYPE_ONLY_ATTACH = 8;

/*****************************************************************************/
/* 기안소스(DraftSrc) INDEX : 0 ~ 6 */
/*****************************************************************************/
export const DRAFTSRC_GENERAL = 0;
export const DRAFTSRC_GENERAL_RECEIPT = 1;
export const DRAFTSRC_LDAP = 2; // 전자문서유통
export const DRAFTSRC_EXCHANGE = 3; // 행정정보시스템(연계)
export const DRAFTSRC_APPR_IMG = 4; // 결재방
export const DRAFTSRC_OFFICE = 5; // 그룹간문서유통
export const DRAFTSRC_WORKMNG = 6; // 업무관리시스템(연계)

export const ET_FLAG_NORMAL = 0; // 일반문서
export const ET_FLAG_WITHBODY = 1; // 본문있음(외부문서)
export const ET_FLAG_ONLYTITLE = 2; // 제목만 등록(외부문서)

/*****************************************************************************/
/* HWP API */
/*****************************************************************************/
// GetFieldList number용
export const HWPFIELDPLAIN = 0; //아무 기호 없이 순서대로 필드 이름이 나열된다.
export const HWPFIELDNUMBER = 1; //필드 이름 뒤에 일련번호가 {{#}}와 같은 형식으로 붙는다.
export const HWPFIELDCOUNT = 2; //필드 이름뒤에 그 이름의 필드가 몇 개 있는지 {{#}}와 같은 형식으로 붙는다.

// GetFieldList option용
export const HWPFIELDCELL = 1; //셀에 부여된 필드 리스트만을 구한다. hwpFieldClickHere와는 함께 지정할 수 없다.
export const HWPFIELDCLICKHERE = 2; //누름틀에 부여된 필드 리스트만을 구한다. hwpFieldCell과는 함께 지정할 수 없다.
export const HWPFIELDSELECTION = 4; //셀렉션 내에 존재하는 필드 리스트를 구한다.
export const HWPFIELDALL = 8; //셀, 누름틀 포함.

/** 일반 최종 결재 일 경우 사용 */
export const stamp_method_finish_approval_hwp = [
  {
    itemType: 'text',
    color: 'black',
    height: 800, //8pt
    text: '_date_',
    fontName: 'serif',
    bold: false,
  },
  {
    itemType: 'text',
    color: 'black',
    height: 1000, //10pt
    width: 53,
    text: '_altstart_' + '_value_',
    fontName: 'serif',
    bold: true,
  },
];

/** 전결 최종 결재일 경우 사용 */
export const stamp_method_jeonkyul_hwp = [
  {
    itemType: 'text',
    color: 'black',
    height: 800, //8pt
    text: '_method_ _date_',
    fontName: 'serif',
    bold: false,
  },
  {
    itemType: 'text',
    color: 'black',
    height: 1000, //10pt
    text: '_altstart_' + '_value_',
    fontName: 'serif',
    bold: true,
  },
];

/** 대결 최종 결재일 경우 사용 */
export const stamp_method_daekyul_hwp = [
  {
    itemType: 'text',
    color: 'black',
    height: 800, //8pt
    text: '_method_ _date_',
    fontName: 'serif',
    bold: false,
  },
  {
    itemType: 'text',
    color: 'black',
    height: 1000, //10pt
    text: '_altstart_' + '_value_',
    fontName: 'serif',
    bold: true,
  },
];

/** 일반 결재의 경우 */
export const stamp_method_approval_hwp = [
  {
    itemType: 'text',
    color: 'black',
    height: 1000, //10pt
    text: '_altstart_' + '_value_',
    fontName: 'serif',
    bold: true,
  },
];

//HWP
export const EDITMODE_READONLY = 0; // ReadOnly 모드
export const EDITMODE_NORMAL = 1; // 일반편집 모드 (서식 작성기)
export const EDITMODE_USEFORM = 2; // 양식편집모드 (기안/결재기)
export const EDITMODE_DISTRIBUTE = 16; // 배포용 문서

//hox/approvalFlow/participant/approvalType
export const USER_DRAFT_STR = 'user_draft';
export const USER_APPROVAL_STR = 'user_approval';
export const USER_NOAPPROVAL_STR = 'user_noapproval';
export const USER_DAEKYUL_STR = 'user_daekyul';
export const USER_HOOYUL_STR = 'user_hooyul';
export const USER_REFER_STR = 'user_refer';
export const DEPT_MERGE_STR = 'dept_merge';
export const USER_MERGE_STR = 'user_merge';
export const USER_JEONKYUL_STR = 'user_jeonkyul';
export const USER_INJIDAE_STR = 'user_injidae';
export const USER_NOSIGN_STR = 'user_nosign';
export const USER_AGREE_S_STR = 'user_agree_s';
export const USER_JOJEONG_STR = 'user_jojeong';
export const USER_AGREE_P_STR = 'user_agree_p';
export const USER_SKIP_STR = 'user_skip';
export const USER_AGENCY_STR = 'user_agency';
export const USER_AUDIT_STR = 'user_audit';
export const USER_AUDITBOX_STR = 'user_auditbox';
export const USER_JEONHOO_STR = 'user_jeonhoo';
export const USER_PUBSHOW_STR = 'user_pubshow';
export const USER_SKIP_AGREE_S_STR = 'user_skip_agree_s';
export const USER_SKIP_AGREE_P_STR = 'user_skip_agree_p';
export const USER_SKIP_AUDIT_STR = 'user_skip_audit';
export const USER_VIEW_STR = 'user_view';
export const USER_PASS_STR = 'user_pass';
export const DEPT_AUDIT_STR = 'dept_audit';
export const DEPT_AGREE_P_STR = 'dept_agree_p';
export const DEPT_AGREE_S_STR = 'dept_agree_s';
export const DEPT_REF_STR = 'dept_ref';
export const DEPT_SKIP_STR = 'dept_skip';
export const DEPT_SKIP_AUDIT_STR = 'dept_skip_audit';
export const DEPT_SKIP_AGREE_P_STR = 'dept_skip_agree_p';
export const DEPT_SKIP_AGREE_S_STR = 'dept_skip_agree_s';
export const DEPT_AUDITBOX_STR = 'dept_auditbox';
export const DEPT_PUBSHOW_STR = 'dept_pubshow';
export const DEPT_DELIBERATION_STR = 'dept_deliberation';
export const DEPT_SKIP_DELIBERATION_STR = 'dept_skip_deliberation';
export const USER_CONFIRM_STR = 'user_confirm';
export const USER_SKIP_CONFIRM_STR = 'user_skip_confirm';
export const USER_COMPLIANCE_STR = 'user_compliance';
export const USER_SKIP_COMPLIANCE_STR = 'user_skip_compliance';
export const DEPT_COMPLIANCE_STR = 'dept_compliance';
export const DEPT_SKIP_COMPLIANCE_STR = 'dept_skip_compliance';
