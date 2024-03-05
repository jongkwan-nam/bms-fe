/***************************************
 * 6.5 Folder Application CODE/ID/TYPE
 ***************************************/
// FOLDER.OWNERTYPE
export const FD_OWNER_GLOBAL = '1';
export const FD_OWNER_DEPT = '2';
export const FD_OWNER_USER = '3';
export const FD_OWNER_GROUP = '4';

/*--- FOLDER.ulApplType ---*/
export const FD_APPLTP_NONE = '0';
export const FD_APPLTP_ALL = '1';
export const FD_APPLTP_APPROVAL = '2'; // '결재' 메뉴
export const FD_APPLTP_LEDGER = '3'; // '대장' 메뉴

export const FD_APPLID_NONE = '0';
export const FD_APPLID_ROOT = '1';
export const FD_APPLID_BOOKMARKROOT = '2'; // bookmark root
export const FD_APPLID_BOOKMARK = '3'; // bookmark only folder

// Dept 2
export const FD_APPLID_D2DRAFT = '1000'; // 기안
export const FD_APPLID_D2APPROVAL = '2000'; // 결재
export const FD_APPLID_D2PUBLIC = '3000'; // 공람
export const FD_APPLID_D2SEND = '4000'; // 발송
export const FD_APPLID_D2RECEIVE = '5000'; // 접수
export const FD_APPLID_D2USERFLDR = '6000'; // 개인문서함
export const FD_APPLID_D2CABINET = '7000'; // 편철함
export const FD_APPLID_D2CABINET_INFORMAL = '7100'; // 기록물철(비공식)
export const FD_APPLID_D2DEPTCABINET = '7200'; // 부서문서함
export const FD_APPLID_D2LEDGER = '8000'; // 대장
export const FD_APPLID_ROOTHANDOVER = '8500'; // 인계함
export const FD_APPLID_ROOTHANDOVERED = '8600'; // 인수함
export const FD_APPLID_D2BIZUNIT = '9000'; // 단위업무코드

export const FD_APPLID_OFFLINE = '9001'; // OFFLINE등록
export const FD_APPLID_LOG = '9002'; // LOG
export const FD_APPLID_D2OLDDOCS = '11000'; // 구기록물
export const FD_APPLID_D2BIZUNITUSER = '9004'; // 단위업무설정

// Dept 3
export const FD_APPLID_FORMRECENT = '1010'; // 양식함(최근)
export const FD_APPLID_FORMBOOKMARK = '1011'; // 양식함(즐겨찾기)
export const FD_APPLID_FORMDEPT = '1020'; // 양식함(부서)
export const FD_APPLID_FORMALL = '1030'; // 양식함(전체)
export const FD_APPLID_FORMSANC = '1040'; // 양식함(결재방)
export const FD_APPLID_FORMSITEDEFINE = '1050'; // 양식함(전체)
export const FD_APPLID_DRAFTWAIT = '1060'; // 연계기안
export const FD_APPLID_FORM_CLASSFICATION = '1091'; //서식분류
export const FD_APPLID_FORMBPMROOT = '1120'; // 업무넷 루트(글로벌), 2018-05-15
export const FD_APPLID_FORMBPMAPPLY = '1121'; // 신청업무 서식(글로벌), 2018-05-15
export const FD_APPLID_FORMBPMGATHER = '1122'; // 취합업무 서식(글로벌), 2018-05-15
export const FD_APPLID_FORMBPM = '1123'; // 업무넷 카테고리 서식(계열사관리자 생성), 2018-05-15

export const FD_APPLID_APPRWAIT = '2010'; // 결재대기
export const FD_APPLID_APPRING = '2020'; // 결재진행관리기
export const FD_APPLID_REJECT = '2030'; // 반려문서관리기
export const FD_APPLID_INPROGRESS = '2040'; // 미완료함

export const FD_APPLID_PUBLICPROC = '3010'; // 공람완료
export const FD_APPLID_PUBLICWAIT = '3020'; // 공람대기, 2004-08-20,
export const FD_APPLID_SENDPUBLIC = '3030'; // 보낸공람

export const FD_APPLID_SENDPROC = '4010'; // 발송처리
export const FD_APPLID_WRITTEN_SENDPROC = '4011'; // 서면발송
export const FD_APPLID_SENDING = '4020'; // 발송진행
export const FD_APPLID_EXAMING = FD_APPLID_SENDING;
export const FD_APPLID_SENDWAIT = '4030'; // 발송대기
export const FD_APPLID_EXAMPROC2 = '4040';
export const FD_APPLID_SENDSTTUS = '4050'; // 발송현황
export const FD_APPLID_EXAM_KOTRA = '4060'; // 수기수신처문서 KOTRA

export const FD_APPLID_RECVWAIT = '5010'; // 접수대기
export const FD_APPLID_RECVING = '5020'; // 수신반송
export const FD_APPLID_RECVUSER = '5110'; // 개인접수
export const FD_APPLID_PREVIEWWAIT = '5120'; // 선람대기
export const FD_APPLID_RECVWAIT_DELETE = '5030'; // 접수폐기 : 2004.11.14
export const FD_APPLID_UNASSIGNED_TASK = '5040'; // 과제미지정함

export const FD_APPLID_REPLYING = '5060'; // 회신진행
export const FD_APPLID_REPLYWAIT = '5070'; // 회신대기
export const FD_APPLID_REPLYCOMPLETE = '5080'; // 회신문서

export const FD_APPLID_REQUEST_MODIFYLINE = '5090'; // 재지정요청대기

// Depth 3 Folders ('개인문서함')
export const FD_APPLID_USERTEMP = '6010'; // 임시보관
export const FD_APPLID_USERDONE = '6020'; // 결재완료
export const FD_APPLID_USERDRAFTED = '6021'; // 기안한문서
export const FD_APPLID_USERPROCESSED = '6022'; // 결재한문서
export const FD_APPLID_USERDRAFTEDEXCHANGE = '6023'; // 연계기안한 문서

export const FD_APPLID_USERNORMAL = '6030'; // 기타 개인문서
export const FD_APPLID_RECEIVEDONE = '6050'; // 접수완료문서
export const FD_APPLID_RECYCLEBIN = '6060'; // 휴지통
export const FD_APPLID_RESERVEDDRAFT = '6070'; // 예약상신
export const FD_APPLID_PREVIEWDONE = '6080'; // 선람한문서

// 편철함
export const FD_APPLID_CABINET = '7010'; // 편철함
export const FD_APPLID_BUCABINET = '7020'; // 단위업무편철함
export const FD_APPLID_CABINETMOVEROOT = '7030'; // 정리할 편철함
export const FD_APPLID_CABINET_TO_MOVE = '7040'; // 인수된 편철함(이동전)
export const FD_APPLID_BUCABINET_TO_MOVE = '7060'; // 단위업무편철함(삭제전)
export const FD_APPLID_BUCLASS = '7070'; // 단위업무분류
export const FD_APPLID_CABINET_INFORMAL = '7110'; // 비공식문서 편철함
export const FD_APPLID_DEPTCABINET = '7210'; // 부서문서 편철함(문서함속성, 편철가능)
export const FD_APPLID_DEPTCABINET_FLDR = '7220'; // 부서문서 편철함(폴더속성,  편철불가)

export const FD_APPLID_LEDGERENROL = '8010'; // 기록물 등록대장
export const FD_APPLID_LEDGERBROAD = '8020'; // 배부대장
export const FD_APPLID_LEDGERBROAD2 = '8022'; // 배부대장2
export const FD_APPLID_LEDGERCABINET = '8030'; // 기록물철 등록부

export const FD_APPLID_LEDGERENROL_INFORMAL = '8040'; // 비공식 등록문서

export const FD_APPLID_LEDGERAGREE = '8050'; // 합의함
export const FD_APPLID_LEDGERAUDIT = '8060'; // 감사함
export const FD_APPLID_DELIBERATIONAUDIT = '8061'; // 내규심의 등록대장
export const FD_APPLID_LEDGERCOMPLIANCEAUDIT = '8062'; // 준법감시함
export const FD_APPLID_AUDITHISTORY = '8063'; // 감사이력함

export const FD_APPLID_LEDGER_APPRCEASE = '8080'; //중단함
export const FD_APPLID_TAKEOVER_MANAGER = '8090'; //관리자문서함
export const FD_APPLID_WASTEAPPROVAL = '8590'; // 폐기함

// 2004.08.31 품열발합 추가
export const FD_APPLID_CORP_DRAFT = '8510'; // 품의함
export const FD_APPLID_CORP_RECEIPT = '8520'; // 수신함
//export const FD_APPLID_CORP_BROAD	   	= '8530';	// 수발함
export const FD_APPLID_CORP_SEND = '8540'; // 발신함
export const FD_APPLID_CORP_AGREE = '8550'; // 합의함
//export const FD_APPLID_CORP_AUDIT	   	= '8580';	// 감사함
export const FD_APPLID_CORP_EXAM = '8560'; // 발송처리함

export const FD_APPLID_DOCUMENTAUTHAPPROVAL = '8900'; // 공유문서함

export const FD_APPLID_PUBLICCANINET = '8070'; // 공개(공유)문서함
export const FD_APPLID_NONPUBLICCANINET = '8071'; // 비공개(공유)문서함

export const FD_APPLID_EXCHANGE = '10010';

// Depth 3 Folders ('구 문서대장')
export const FD_APPLID_OLD_ENROL = '11010'; // 구_등록
export const FD_APPLID_OLD_SEND = '11020'; // 구_발송
export const FD_APPLID_OLD_RECV = '11030'; // 구_수신
export const FD_APPLID_OLD_TOSS = '11040'; // 구_수발
export const FD_APPLID_OLD_AGREE = '11050'; // 구_협조
export const FD_APPLID_OLD_EXAM = '11060'; // 구_심사
export const FD_APPLID_OLD_AUDIT = '11070'; // 구_감사
export const FD_APPLID_OLD_LEDGERENROL = '11080'; // 구_등록대장
export const FD_APPLID_OLD_LEDGERBROAD = '11090'; // 구_배부대장
export const FD_APPLID_OLD_LEDGERRECV = '11100'; // 구_접수대장
export const FD_APPLID_OLD_CABINET_ROOT = '11220'; // 구_편철함_ROOT
export const FD_APPLID_OLD_BUCABINET = '11200'; // 구_편철함_단위업무
export const FD_APPLID_OLD_CABINET = '11210'; // 구_편철함

export const FD_APPLID_OLD_LEDGERPLAN1 = '11350'; // 구_방침 대장 (시장)
export const FD_APPLID_LEDGERPLAN1 = '14000'; // 방침 대장 (시장)
// 2005.12.31 : 서울시청 고시/공고대장
export const FD_APPLID_LEDGERNOTICE = '14100'; // 고시대장
export const FD_APPLID_LEDGERPUBLIC = '14200'; // 공고대장
export const FD_APPLID_LEDGERALL = '14400'; //전체문서(관리자)
export const FD_APPLID_LEDGEROTHERDEPT = '14500'; //타부서 문서 열람
export const FD_APPLID_LEDGERDIST = '15000'; // 배부 대장
export const FD_APPLID_RELAYHISTORY = '99999'; // 발송문서이력이나 수신문서이력에서 원문보기시 mwf를 통해 클라이언트에 전달

export const APPLID_PROD_REPORT = '25001';
export const APPLID_PROD_STAT = '25002';
export const APPLID_PROD_STAT_SUM = '25003';
export const APPLID_PROD_LOG = '25004';
export const APPLID_PROD_OFFLINE = '25005';

export const APPLID_TRANS_REPORT = '26001';
export const APPLID_TRANS_EFILE = '26002';
export const APPLID_TRANS_LOG = '26003';
export const APPLID_TRANS_REPORT_LOG = '26004';
export const APPLID_TRANS_STAT = '26005';

export const APPLID_ARCH_REPORT = '27001';

export const FD_APPLID_BPM_ROOT = '30000'; // 업무넷 루트
export const FD_APPLID_BPM_APPLY_ING = '31010'; // 나의 신청(진행)
export const FD_APPLID_BPM_APPLY_DONE = '31050'; // 나의 신청(완료)
export const FD_APPLID_BPM_RECV_ING = '32010'; // 나의 접수(진행)
export const FD_APPLID_BPM_RECV_DONE = '32050'; // 나의 접수(완료)
export const FD_APPLID_BPM_GATHER_ING = '33010'; // 나의 취합(진행)
export const FD_APPLID_BPM_GATHER_DONE = '33050'; // 나의 취합(완료)
export const FD_APPLID_BPM_REPLY_ING = '34010'; // 나의 회신(진행)
export const FD_APPLID_BPM_REPLY_DONE = '34050'; // 나의 회신(완료)
