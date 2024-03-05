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
