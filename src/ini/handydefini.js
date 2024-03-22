/**
 * handydef.ini 전체 목록 및 기본값
 */
export const HANDYDEF = {
  System: {
    /** 클립보드 open 실패 시 재시도 회수 */
    'Clipboard.OpenRetryCount': 1,
    /** 기안기 복수개 실행 */
    UseMultipleDraft: '',
    DebugMode: '',
    LoggingMode: '',
    ExceptCompressExtensions: '',
    CheckDRMVersion: '',
    /** 결재문서가 마이그레이션된 구문서인지 검사 */
    CheckOldDocID: '',
    ShowCreateControlMsg: '',
    /** 행자부 유통 LDAP 수신처 사용 여부 */
    UseLDAP: '',
    /** 그룹간연동 수신처 사용 여부 */
    UseIOC: '',
    /** 서명 이미지를 다룰때 BMP로 다룰 것인지 WMF로 다룰 것인지 선택 */
    SignImgFormat: '',
    /** 그룹간연동2 수신처 사용 여부 */
    UseIOC2: '',
    /** 행자부 민원24 수신처 사용 여부 */
    UseDoc24: '',
    /** 수신자 기호 사용 여부 */
    UseRecSymbol: '',
    'MakeDiff.HWP10.Exception': '',
    UseServerDateFormat: '',
    'RecipientTabEnable.Internal': '',
    'RecipientTabEnable.External': '',
    'LocalCampaignMode.Use': '',
    'LocalResourceMode.Use': '',
    'LocalLogoSymbolMode.Use': '',
    'LocalDefaultfldrname.Use': '',
    'Dist.RecipientTabEnable.Internal': '',
    'Dist.RecipientTabEnable.External': '',
    UseProgressBar: '',
    UseRepInfo: '',
  },
  Sanction: {
    /*  */
    AddRejectCommentOnKyul: true, //
    AddPostponeCommentOnKyul: true,
    bUseLastSignerHyupjoType: true,
    UseDeptAgree: true,
    QueryCloseGian: true,
    QueryCloseKyul: true,
    SummarySize: '800,900',
    CheckOverSigner: false,
    DefaultEnforceType: 2,
    UseJunkyulSancMethod: true,
    UseDeakyulSancMethod: true,
    UseReference: true,
    UseNoSign: true,
    UsePersonParallelAssist: true,
    UseDeptParallelAssist: true,
    PersonHyupjoType: 1,
    DefaultDeptAgreeSancType: 2,
    EditOnAgreeSigner: false,
    publicflag_userinput: false,
    publicflag_receiptType: 0,
    ApprflowTabOrder: 'org,list,name,audit,compliance',
    PublicViewTabOrder: 'org,GongramGroup,Name',
    PersonRejectable: 0,
    DeptRejectable: 0,
    OnlyDrafterCanCancel: true,
    OnlyCancelNextSignerNow: true,
    PublicDepartmentEnroll: 1,
    ViewFinalMessage: true,
    NewDraftByAttachList: 0,
    DefaultPublicFlag: '공개',
    AutoLoadNext: false,
    ProcessReject: true,
    NotifyAlterInformation_use: true,
    NotifyAlterInformation_type: '%N(%D)',
    IncludeSealInBody: 1,
    QuerySummarySave: true,
    FinalSigner_Date: 1,
    DefaultUserSignMethod: 3,
    CellTitleType: '%d,%p',
    CellTitleTypeOfUserAgree: '%d,%p',
    CanModifySamakeRecp: false,
    CanModifySamnaRecp: false,
    RejectString: '반려',
    'AuditTab.Signer.Auto.Insert': true,
    CanDeleteGamsa: true,
    SecurityLevel_Use: false,
  },
  ControlInfo: {
    DefaultSendDeptID: '',
    'CtrlDept.SaveDept': '',
    'CtrlDept.Type': '',
    'DeptStamp.Type': '',
    'EnablePublicStamp.EnforceTypeInternal': '',
    'StampMode.MatchWithSenderName': '',
    DeptSealSize: '',
    PutDeptSealToCell: '',
    EditEnforceDocOnRequest: '',
    EditEnforceDocOnExam: '',
    'EditEnforceDocOnExam.Reject': '',
    QueryAutoConvert: '',
    'ViewEnforceDocFirst.MANA': '',
    CanDrafterSend: '',
    EnableSendWithNoStamp: '',
    'EnableSkipPublicStamp.EnforceTypeInternal': '',
    BatchStampMode: '',
    AutoRequestMultiDoc: '',
    'Fax.LinkageType': '',
    'Fax.url': '',
    'Fax.windowsize': '',
    'Email.url': '',
    'Email.windowsize': '',
    'Fax.allowedDeptList': '',
    'Email.allowedDeptList': '',
    TaxLinkage: '',
  },
  SealInfo: {
    /**
     * 관인/부서장인 image fitting 설정
     * [ 0: 실제 image 그대로(default), 1: 관인만 Fitting (부서장인 제외), 2: 부서장인, 관인 Fitting ]
     */
    SealFittingMode: 0,
    /**
     * Fitting을 적용할 기준 size 지정 (설정된 값보다 큰 image만 Fitting 처리) (단위 : mm)
     */
    SealFittingBaseSize: '30,30',
    /**
     * SealFittingBaseSize 보다 큰 경우, Fitting 할 Size 지정
     */
    SealFittingSize: '30,30',
    /**
     * 관인 날인 시, Y축 좌표를 보정할 수 있는 옵션 <GW-20088 인천국제공항공사>
     * - 서식에 "틀"을 사용하고 틀에 텍스트가 있는 경우 관인위치 보정용
     */
    StampRelPosY: 0,
  },
  LogoSymbol: {
    /**
     * 로고 이미지 크기조정 여부 설정 <GW-19656 국민연금공단, GW-20541 한국교육환경보호원>
     *  [ true : 설정한 사이즈로 크기조정,   false : 크기조정하지 않고 원본크기 사용 (default) ]
     */
    LogoFittingUse: false,
    /**
     * LogoFittingUse=true 시, 로고 사이즈 설정 (단위 : mm)
     * Ex) LogoFittingSize = 20,20
     */
    LogoFittingSize: '30,20',
    /**
     * 심볼 이미지 크기조정 여부 설정 <GW-19656 국민연금공단, GW-20541 한국교육환경보호원>
     * [ true : 설정한 사이즈로 크기조정,   false : 크기조정하지 않고 원본크기 사용 (default) ]
     */
    SymbolFittingUse: false,
    /**
     * SymbolFittingUse=true 시, 심볼 사이즈 설정 (단위 : mm)
     * Ex) SymbolFittingSize = 20,10
     */
    SymbolFittingSize: '30,20',
  },
  CustomString: {},
  CustomSignType: {},
  CustomUI: {
    /**
     * 검사부 결재방법 표시 설정 <금융감독원>
     *  [ true  : 기존과 동일, "검사부/검사부(기록)/감사안함" 모두 표시
     *    false : "검사부(기록)/감사안함"만 표시. "검사부" 표시 안함 ]
     *
     * ※ 관련 ini
     *     false 설정 시, Handydef.ini [Sanction] AuditHamPoint=1 로 설정되어있어야 함.
     */
    UseAuditHam: true,
    /**
     * 기안기 결재정보 Dlg 에서 발송종류 '일반기안' 스트링 설정 <금융결제원>
     * Ex) EnforceTypeExternal.Caption = 대외시행
     */
    'EnforceTypeExternal.Caption': '일반기안',
    /**
     * 기안기 결재정보 Dlg 에서 발송종류 '협조문' 스트링 설정 <금융결제원>
     * Ex) EnforceTypeInternal.Caption = 대내시행
     */
    'EnforceTypeInternal.Caption': '협조문',
    /**
     * 기안기 결재정보 Dlg 에서 발송종류 '내부결재' 스트링 설정 <금융결제원>
     */
    'EnforceTypeNot.Caption': '내부결재',
    /**
     * '발송종류 스트링 설정 <KRX>
     * Ex) EnforceType.Caption = 문서종류
     */
    'EnforceType.Caption': '발송종류',
    /**
     * 결재정보 - 결재선 - 감사Tab에서 감사방법 선택 라디오버튼 표시여부 설정
     * [ 0 : 감사방법 선택 라디오버튼 안나옴,  1 : 감사방법 선택 라디오 버튼 표시(default) ]
     */
    'AuditTab.Type': 1,
    /**
     * 부서문서함 선택 UI 사용 여부(enable/disable) 설정  <하나은행>
     */
    DisableCabinet: false,
    /**
     * 수신처지정 시 발신명의 선택 UI 사용 여부 설정 <하나은행>
     */
    DisableSenderName: false,
    /**
     * 수신처지정 시 "부서장결재필" 을 선택할 수 있는 UI 사용여부 설정 <하나은행>
     */
    ReceiveDecide: false,
    /**
     * 비공개 사유 설정 <한국은행>
     * [ 0 : 비공개 사유 1호, 2호, 3호 .. 등으로 표기 1 : 비공개 사유 1.법률금지 2.국가안보 등으로 표기]
     */
    PublicFlagType: 0,
    /**
     * 첨부 대화상자에서 "추가/삭제" 버튼의 이미지형식(+/-) 표시여부 설정
     */
    'AttachBox.UseAddRemoveImage': true,
    /**
     * 첨부 대화상자에서 "수정" 버튼 사용여부 설정
     */
    'AttachBox.UseModifyButton': true,
    /**
     * 첨부 대화상자에서 "저장" 버튼 사용여부 설정
     */
    'AttachBox.UseSaveButton': true,
    /**
     * 첨부 대화상자에서 "압축저장" 버튼 사용여부 설정
     */
    'AttachBox.UseSaveZipButton': true,
    /**
     * 첨부 대화상자에서 "별첨파일" UI 표시여부 설정 (첨부 시 "별첨" 문구 표시) <GW-18617 사회보장정보원>
     *  [ true : "별첨파일" 선택 UI 표시, check 하고 첨부 시 파일명에 "별첨" string 표시,
     *    false : "별첨파일" 표시하지 않음 (default) ]
     *
     *  - 별첨파일을 check 하고 첨부를 추가하면 첨부목록에는 "[별첨]파일명" 으로 표시되고,
     *    본문의 "첨부정보"셀에는 "파일명(별첨)" 으로 표시
     *  - 이미 추가된 붙임문서는 별첨파일 설정을 변경할 수 없음
     */
    'AttachBox.UseAnnexFileCheck': false,
    /**
     * [결재정보-수신자Tab-수신자그룹] 목록에서 그룹명의 폭을 조절할 수 있는 기능 <한국폴리텍대학>
     */
    'RecGroup.ColumnWidth.Name': 150,
    /**
     * [결재정보-수신자Tab-수신자그룹] 목록에서 설명 컬럼의 폭을 조절할 수 있는 기능 <한국폴리텍대학>
     * Ex) 수신자 그룹 설명을 안보이게 하려면 RecGroup.ColumnWidth.Name=300, RecGroup.ColumnWidth.Description=0 으로 설정
     *
     * * RecGroup.ColumnWidth.Name + RecGroup.ColumnWidth.Description의 합은 300이며, 300보다 크게 설정하는 경우 가로 스크롤이 생기고, 300보다 적게 설정하는 경우 해당 Size 만큼만 표시된다.
     * * [공람지정-공람그룹 Tab] 목록 에서도 동일한 폭으로 적용된다.
     */
    'RecGroup.ColumnWidth.Description': 150,
    /**
     * 발신명의 수기입력 지원 여부 설정
     * [ true : 발신명의 선택 콤보 박스에 사용자 입력 가능,
     *   false : 사용자 입력 불가능 (default) ]
     */
    'SelRecDlg.SenderName.Editable': false,
    /**
     * 일괄기안 시, 안 바로가기 창 사이즈 설정 기능 (단위 : 픽셀,  default = 190,165)  <금융감독원>
     * Ex) ContentsWnd.Size = 300,200
     */
    'ContentsWnd.Size': '190,165',
    /**
     * handydef.ini [Sanction] UsePublicPopup=true  일때,  공개일때 실행되는 메시지 커스터마이징
     */
    PublicPopupMsg1: '',
    /**
     * handydef.ini [Sanction] UsePublicPopup=true  일때,  부분공개/비공개일때 실행되는 메시지 커스터마이징
     */
    PublicPopupMsg2: '',
  },
  Authority: {
    /**
     * 재발송 권한 설정, 추가발송요청 권한 설정.  (여러 개 설정 시 ,로 구분)
     * - receivemanager: 접수담당자
     * - sendmanager: 발송담당자
     * - deptmanager: 부서관리자
     * - docmanager: 문서관리자
     * - deptchief: 부서장
     * - administrator: 전체관리자
     * - drafter: 기안자
     * - allusers: 모든 사용자
     */
    Resend: 'drafter,sendmanager',
    /**
     * 재배부 권한 설정   (여러 개 설정 시 ,로 구분)
     * - receivemanager: 접수담당자
     * - sendmanager: 발송담당자
     * - deptmanager: 부서관리자
     * - docmanager: 문서관리자
     * - deptchief: 부서장
     * - administrator: 전체관리자
     * - drafter: 기안자
     * - allusers: 모든 사용자
     */
    Rebroad: 'receivemanager',
  },
  User: {
    /**
     * 문서발송의뢰, 발송처리 시 암호검사 여부 설정
     * [ true  : 암호검사(default),  false : 암호검사 않음 ]
     */
    CtrlPassWord: true,
    /**
     * 조직도에 사원 표시 display 방법 설정
     * [ %P : 직위명, %C : 사원번호, %N : 사원명,  %D : 직책 ]
     */
    sUserFormat: '%N %P',
    /**
     * 조직도에 사원 표시 시, 직책없으면 직위표시 방법 설정 <HSO-13595 코트라>
     * - [ %P : 직위명, %C : 사원번호, %N : 사원명, %D : 직책, '@@' 구분자를 사용하여 표시 우선순위 지정 ]
     *
     * ※ '@@' 구분자 사이의 문자들은 ,로 구분되며 앞부터 해당 조건이 있는지 확인하고 없으면
     *     다음으로 구분된 조건을 읽어 표시
     *     우선순위는 '@@' 구분자로 열고 닫히는 구간에서만 체크함.
     *     '@@'를 열었다면 반드시 '@@'로 닫아주어야 함.
     *  - sUserFormat 으로 설정하고, 우선순위를 지정할때만 TreeUserFormat 지정한다.
     *  - sUserFormat 과 TreeUserFormat이 둘다 설정되어 있으면 TreeUserFormat 적용
     */
    TreeUserFormat: '',
  },
  ViewMode: {},
  Sancview: {
    /**
     * 결재문서 viewer에서 복사금지 기능  [KRX]
     * [ true : copy 불가능(default) , false : copy 가능 ]
     * - [Sancview] PreventCopy 는 서버문서 뷰어에 적용
     * - [XSViewer] PreventCopy 는 로컬문서 뷰어에 적용
     * * 단, false로 설정 시, 관인/서명도 복사 가능하므로 주의
     */
    PreventCopy: true,
  },
  XSViewer: {},
  BizUnitCode: {
    /**
     * 결재정보창에 기록물철/부서문서함 cache 개수 설정
     * (기록물철로 이용했던 정보를 ini개수만큼 남기고, 기안 시 결재정보창에서 콤보박스에서 저장된 기록물철을 선택할 수 있음)
     */
    SizeOfTempBizUnitCode: 5,
    /**
     * 기록물철 사용(jhoms.bizunitcode.use=true) 시, 비공식문서 편철함 사용(비공식문서 기안/결재 시 비공식문서편철함 설정)
     * license (ESN6) 기능
     */
    'InformalCabinet.Use': false,
    /**
     * 서식별 기본 편철함 설정 기능
     *  [ 서식ID = 기록물철명  ]
     *  ex) JHOMS131560012302000=도서및휴가관리
     *      JHOMS142740000001000=해외지사관리
     * * InformalCabinet.Use=true 시, 10.2.2부터 비공식서식도 기본 비공식문서 편철함 설정 지원 <HSO-17733 국립세계문자박물관>
     */
    서식ID: null,
    /**
     * 위의 서식ID 에 따른 기록물철이 별도로 정의되지 않은 서식의 기본 편철함 지정
     * 단, defaultfldrname 이 지정되지 않은 경우는 사용자가 기록물철을 지정해야 함.
     *  ex) Defaultfldrname=부서공통업무
     */
    Defaultfldrname: null,
    /**
     * 발송종류에 따른 기록물철 자동 선택 기능 <한국정보통신기술협회(TTA)>
     * DefaultFldrName.External=%USERDEPT% 기록물철/기록물철명
     */
    'DefaultFldrName.External': '',
    /**
     * 발송종류에 따른 기록물철 자동 선택 기능 <한국정보통신기술협회(TTA)>
     */
    'DefaultFldrName.Internal': '',
    /**
     * 발송종류에 따른 기록물철 자동 선택 기능 <한국정보통신기술협회(TTA)>
     */
    'DefaultFldrName.Not': '',
  },
  Attach: {
    /**
     * 기안 / 대장 수기문서등록 시 첨부파일을 특정 파일형식(확장자)만 등록할 수 있도록 제한. 설정없으면 모든파일 첨부 가능
     * ex) AllowedExtensions = hwp,hwx
     * ※ 관련설정 : Web의 문서등록/수정 시에는 globals.properties 의 attach.allowed_extensions 가 적용됨.
     */
    AllowedExtensions: '',
    /**
     * 기안 시 첨부파일 등록 시 특정 파일형식(확장자)을 등록할 수 없도록 제한. 설정없으면 모든파일 첨부 가능
     * ex) ProhibitedExtensions = avi,mov
     * ※ 관련설정 : Web의 문서등록/수정 시에는 globals.properties 의 attach.prohibited_extension 가 적용됨.
     */
    ProhibitedExtensions: '',
    /**
     * 첨부정보를 본문의 "첨부정보"(영문 셀은 "attach_info") 셀에 표시하는 포맷 설정 <대구은행>
     * - %NAME% - 첨부 파일명 (default),
     * - %SIZE% - 첨부 크기(KB 단위),
     * - %SEQ% - 첨부 순번(1번 부터 시작) ]
     * * ex) AttachInfo.Format=%SEQ%. %NAME% - %SIZE%    => "1. 테스트첨부.doc - 123,223 KB" 와 같이 표시됨.
     */
    'AttachInfo.Format': '',
    /**
     * ”첨부정보”셀에 붙임관련 문구표시 적용여부 설정 <사회보장정보원>
     * (행정 효율과 협업 촉진에 관한 규정 시행규칙 4조 의거)
     * - true : “첨부정보” 셀에 “붙임, 끝” 문구 표시 (8.3.12 h01 부터 첨부파일명에 확장자는 표시하지 않음),
     * - false : “첨부정보” 셀에 별도 문구없이 파일명만 표시 (default)
     *
     * * AttachInfo.UseStartEndString=true
     *   AttachInfo.Format=%SEQ%. %NAME%   으로 설정하면 됨
     */
    'AttachInfo.UseStartEndString': false,
    /**
     * "첨부정보"셀의 붙임파일명 앞에 순번 표시여부 설정 <GW-18617 사회보장정보원>
     * - true : 순번 표시(단, 첨부가 한개일때는 표시하지않음),
     * - false : 순번표시하지 않음(default)
     *
     * - 순번은 붙임파일 대화상자나 목록에는 표시되지 않고, 본문의 "첨부정보"셀에만 표시
     * - 붙임파일이 한개인 경우에는 순번 1 표시를 하지 않음
     * - AttachInfo.AutoSeq=true 옵션을 사용할때는 AttachInfo.Format 과 AttachInfo.UseStartEndString 옵션은 사용하지 않는다.
     */
    'AttachInfo.AutoSeq': false,
    /**
     * "2개 이상의 첨부에서 두번째 첨부 앞쪽에 공백 템플릿 <HSO-12387 한국건강가정진흥원>
     * [ 공통예약어 => ** : 탭 한칸, ~~ : 공백 한칸, ^^ : 줄바꿈 ]
     */
    'AttachInfo.SecondRowSpace.Template': '',
    /**
     * 문서함붙임(문서함첨부/완료문서첨부) 기능 사용
     * - HSO10 부서문서함/기록물철 사용에 관계없이 설정
     * - BoxAttachment.URL=bms/com/hs/gwweb/list/retrievePopDocMainList.act
     */
    'BoxAttachment.URL': '',
    /**
     * BoxAttachment.URLParam=APPLID=8010&applId=8010&APPLTYPE=3&USS=1&userId=%USU%&deptId=%DEPTID%&userDeptId=%DEPTID%&K=%KEY%&folderEndYear=%YEAR%&docAttach=Y
     *
     * 완료문서첨부 시, 전체부서 문서 선택 가능 <10.2.2 추가, HSO-15764 광주정보문화산업진흥원>
     * BoxAttachment.URLParam=APPLID=8010&applId=8010&APPLTYPE=3&USS=1&userId=%USU%&deptId=%DEPTID%&userDeptId=%DEPTID%&K=%KEY%&folderEndYear=%YEAR%&docAttach=Y&isAllDoc=Y
     *
     * 결재자가 완료문서첨부 시, 결재자부서 문서 추가 (기존, 결재자도 기안자부서 문서 추가)
     * <10.2.2 추가, GW-29920 대구경북첨단의료산업진흥재단>
     * BoxAttachment.URLParam=APPLID=8010&applId=8010&APPLTYPE=3&USS=1&userId=%USU%&deptId=%USERSAVEDEPTID%&userDeptId=%USERDEPTID%&K=%KEY%&folderEndYear=%YEAR%&docAttach=Y
     *   (deptId=%DEPTID% 대신 deptId=%USERSAVEDEPTID% 로 설정, %USERSAVEDEPTID% 에
     *    현재 결재자의 저장부서를 구해서 치환하도록 처리)
     */
    'BoxAttachment.URLParam': '',
    /**
     * 문서함붙임(완료문서첨부) 에서 기록물등록대장 창의 캡션 문자열 설정
     * ex) BoxAttachment.Caption=완료함
     */
    'BoxAttachment.Caption': '',
    /**
     * 대화상자의 크기 지정
     * - default = dialogwidth:1000;dialogheight:675;
     * - 최소값 : BoxAttachment.DlgOption=dialogwidth:870;dialogheight:675;
     */
    'BoxAttachment.DlgOption': 'dialogwidth: 1000;dialogheight:675;',
    /**
     * 디버그를 위해서 리턴값을 임의로 설정할 수 있도록 함
     */
    'BoxAttachment.RetValue': '',
    /**
     * 문서함붙임(완료문서첨부) 시, 결재문서 저장 포맷 설정 <HSO-15711 광주정보문화산업진흥원>
     * - [ 1 : hwx 저장 (default),  2 : hwp 비배포문서 저장 (서명/관인 제거), 3 : hwp 배포문서 저장(관인/서명 유지) ]
     */
    'BoxAttachment.BodyType': 1,
    /**
     * 첨부 대화상자의 "보기" 버튼과 "수정" 버튼을 "보기/수정" 버튼 하나로 통합
     * - true : 첨부 대화상자의 "보기" 버튼과 "수정" 버튼을 "보기/수정"
     * - false : 첨부 대화상자의 "보기" 버튼과 "수정" 버튼으로 나누어서 보임(기존과 동일, default) ]
     * * true 일 경우 첨부 수정권한이 없는 사용자의 경우엔 "보기" 버튼으로 표시
     */
    UseUnifiedViewModifyButton: false,
    /**
     * 일괄기안 시 공통 첨부파일이 있는 경우, 붙임문서창 [확인] 클릭할때 메시지 표시여부 설정 <금융감독원>
     * - true : 메시지 표시 ("공통에 등록된 첨부파일은 모든 시행문에 등록됩니다. 적용하시겠습니까?")
     * - false : 메시지 표시하지 않음 (default) ]
     * ※ 리소스ID는 61556 이므로, site 에서 CustomUI.xml 파일에 메시지 내용 수정 가능
     */
    'CommonAttach.ShowInfo': false,
    /**
     * 전자문서유통 시 첨부파일+본문 최대 크기 설정 (단위 : KB) (default : 6144 (6M))
     * - 수신처에 LDAP수신처가 있는 문서 기안/결재 시 check
     * - 기존에는 첨부파일 크기만 check 하였으나, 8.3.14 h01 부터 첨부파일에 결재문서 본문 크기까지 포함하여 check <GW-20116 인천국제공항공사>
     * ※ 기존  [PubdocDist] Section의 MaxAttachmentsSize 에서 변경됨
     */
    'MaxSize.LDAP': 6144,
    /**
     * 그룹간연동 시 첨부파일 최대 크기 설정 (단위 : KB) (default : 0) <대구은행>
     * - 0 으로 지정 시 첨부사이즈 제한 없음
     * * 수신처에 그룹간연동 수신처가 있는 문서 기안/결재 시 check
     * * 수신자에 그룹간연동과 유통 수신자가 동시에 있는 경우, 위 두 INI(MaxSize.LDAP, MaxSize.IOC) 중 더 작은 값이 적용됨
     */
    'MaxSize.IOC': 0,
  },
  LinkDoc: {
    /**
     * 문서함 URL 설정
     * URL=bms/com/hs/gwweb/list/retrieveRelationDocMainList.act
     */
    URL: '',
    /**
     * 문서함 URL에 사용되는 파라미터의 값들
     *
     * URLParam=APPLID=8010&applId=8010&APPLTYPE=3&USS=1&userId=%USU%&deptId=%DEPTID%&userDeptId=%DEPTID%&K=%KEY%&folderEndYear=%YEAR%
     *
     * 관련문서 링크 시, 전체부서문서 링크 사용 <10.2.2 추가, HSO-13547 코트라>
     * URLParam=APPLID=8010&applId=8010&APPLTYPE=3&USS=1&userId=%USU%&deptId=%DEPTID%&userDeptId=%DEPTID%&K=%KEY%&folderEndYear=%YEAR%&isAllDoc=Y
     */
    URLParam: '',
    /**
     * 관련문서에서 기록물등록대장의 웹타이틀
     */
    Caption: '관련문서추가',
    /**
     * 대화상자의 크기 지정
     * Ex) DlgOption=dialogwidth:1050;dialogheight:735;
     */
    DlgOption: 'dialogwidth: 1050;dialogheight:735;',
    /**
     * 열람 시 호출되는 URL
     * View.URL=bms/com/hs/appr/retrieveNotifyDoc.act
     */
    'View.URL': '',
    /**
     * 열람 시 파라미터값
     *
     * View.URLParam=USERID=%USU%&APPRIDLIST=%APPRID%&APPRIDXID=%APPRID%&CLTAPP=1&APPRDEPTID=%DEPTID%&APPRSTATUSLIST=1&APPRTYPELIST=1&MENUMASKLIST=%MENUMASK%&SIGNERTYPELIST=&WORDTYPE=%WORDTYPE%&APPLID=8010&PARTICIPANTID=&EXTERNALDOCF=0&EXTERNALDOCFLIST=0&DRAFTSRCLIST=0&menuID=undefined&K=%KEY%&fldrShare=%FLDRSHARE%&fldrShareDeptId=%FLDRSHAREDEPTID%
     */
    'View.URLParam': '',
    /**
     * 결재기에서 관련문서 버튼 활성/비활성 기능 사용여부 설정 <GW-18610 사회보장정보원>
     * - true : 기안 시 관련문서 추가여부와 관계없이 결재기에 관련문서 버튼 항상 활성화 (default),
     *            단, 결재자가 문서수정권한 없고, 기안 시 관련문서가 추가되지 않은 경우는 비활성화
     * - false : 기안 시 관련문서가 추가된 경우에만 결재기에 관련문서 버튼 활성화
     */
    ApprovalUseLinkDocAdd: true,
    /**
     * 일괄기안 시, 관련문서 안별 추가 기능 <HSO-14732, HSO-15303 MG새마을금고>
     */
    UseContentLinkdoc: false,
    /**
     * UseContentLinkdoc=true 사용 시, 관련문서 [공통]Tab 사용하지 않고 각 안별로 설정 <HSO-14732 MG새마을금고> (MG특화기능)
     */
    LinkDocModeMG: false,
  },
  BBS: {
    /**
     * Client에서 "게시하기" 시 연동 게시판 type 설정 <대법원>
     * [ 0 : GW게시판 연동(default), 1 : 외부 게시판 연동 ]
     */
    LinkageType: 0,
    /**
     * LinkageType=0 일때, 결재 Client에서 "게시하기" 사용 시 설정
     * URL=servlet/HIServlet
     */
    URL: '',
    /**
     * LinkageType=0 일때, 결재 Client에서 "게시하기" 사용 시 설정
     *  [ %USU% : 유저아이디,  %MSG% : 메시지 파일,  %KEY% : KEY값 ]
     *
     * Param=SENDER_ID=%USU%&SERVER_FILENAME=%MSG%&MET=EXT&SLET=bbs.BBSMtrlWriteWin.java&COMMUNITY_ID=001000000&LMET=CLOSE&popup=true&K=%KEY%
     */
    Param: '',
    /**
     * LinkageType=1 일때, 외부연동시 URL   <대법원>
     * ex) LinkageURL=http://my.netian.com/~goldjang/starting.html?empcode=%EMPCODE%&path=%PATH%&subject=%SUBJECT%
     */
    LinkageURL: '',
    /**
     * 게시하기 창 크기 설정 (default=850,720)
     */
    WindowSize: '850,720',
    /**
     * Client에서 "게시하기" 시 결재선check 여부 설정
     * [ true : 결재선에 있는 사용자만 게시, false : 모든 사용자 게시 ]
     */
    UseCheckSendBBS: false,
    /**
     * 결재문서 게시하기 시, 게시글본문에 결재문서를 이미지로 삽입하는 기능 <IBK캐피탈>
     * - true : 게시글 본문에 결재문서를 이미지로 삽입,
     * - false : 기존과 동일하게, 결재문서 첨부 추가 (default) ]
     */
    BodyToImage: false,
    /**
     * 결재문서 게시하기 시, default 게시판ID 설정 <IBK캐피탈>
     * [ 기본값은 빈 문자열이며, 설정하지 않은 경우에는 기존과 같이 [결재] 속성 게시판으로 선택됨 ]
     * Ex) BRD_ID=0000007pv
     */
    BRD_ID: '',
  },
  MAIL: {
    /**
     * 결재 Client에서 "메일쓰기" 사용 시 설정
     *
     * WebMail.Use=true
     * WebMail.URL=wma/msgm.do
     * WebMail.Param=acton=extcompose&uid=%USU%&SERVER_FILENAME=%MSG%&GWLANG=ko_KR&key=%KEY%
     *   : '편지가 발송되었습니다. 발송한 메일은 보낸 편지함에서 확인할 수 있습니다.' 화면이 표시되고 자동으로 닫힘
     *
     * ※ 10.2.2 추가 - 게시하기 : 게시하였습니다. [확인]  => 과 동작 통일, 기존설정으로 사용해도 문제없음)
     * WebMail.Param=acton=extcompose&uid=%USU%&SERVER_FILENAME=%MSG%&GWLANG=ko_KR&key=%KEY%&req_cl=true
     *   :  '편지가 발송되었습니다.' 알림창에 [확인] 표시, [확인] 클릭 시 창 종료
     */
    'WebMail.Use': '',
    'WebMail.URL': '',
    'WebMail.Param': '',
    /**
     * 메일쓰기 창 크기 설정 (default=850,767)
     */
    WindowSize: '850,767',
    /**
     * ButtonStatusAPI=KNOU_EnableWebMail   //버튼 활성/비활성을 위해 호출할 API명   <방송통신대>
     */
    ButtonStatusAPI: '',
    /**
     * CommandAPI=KNOU_SendWebMail     //클릭했을 때 수행할 API명   <방송통신대>
     */
    CommandAPI: '',
    /**
     * URL=http://mail.knou.ac.kr/servlet/crinity     //해당 사이트의 URL     <방송통신대>
     */
    URL: '',
    /**
     * PARAM=ptype=SSO&paction=mailWrite&i_UserID=%EMPCODE%&i_UserDomain=knou.ac.kr&to=%EMAIL_IN_DOC%;
     *
     * 파라미터 정보    <방송통신대>
     * - %EMPCODE% : 사번
     * - %EMAIL_IN_DOC% : 본문의 %이메일 셀을 체크하고 없으면 [상세정보5] 셀의 값을 가져온다.
     *
     */
    PARAM: '',
    /**
     * ModalType
     * - 1 : 창과 뷰어가 각각 별개로 뜸;(Modelss Window)
     * - 0 : default 창이 한번 뜨면 닫히기전까지 뷰어가 활성화가 안되고 창이 닫혀야 뷰어가 활성화됨;(Modal Window)
     */
    ModalType: 0,
    /**
     * 특정 기관의 사용자에게 결재문서 메일쓰기 기능을 사용할 수 없도록 메일쓰기 버튼을 보여주지 않는 기능 <다산>
     * - 다산에서 그룹웨어 웹 메일 대신 Exchange 서버로 전환함에 따라, 결재문서의 메일쓰기 기능을 없애기 위한 용도
     * - 이 기능은 부서 단위가 아닌 기관 단위로 동작함. 여러개의 기관을 설정할 경우 ; 로 구분
     * Ex) NotUsedOrgList=000011502
     */
    NotUsedOrgList: '',
  },
  Comment: {
    /**
     * 기안기 의견 입력창 크기 조절 (default=710,250) <HSO-13028 서울예술대>
     */
    'CommentAdd.WindowSize': '710,250',
    /**
     * 결재기 의견 입력창 크기 조절 (default=710,250) <HSO-13028 서울예술대>
     */
    'CommentApprovalAdd.WindowSize': '710,250',
    /**
     * 뷰어(문서보기) 의견창 크기 조절 (default=1005,370) <HSO-13028 서울예술대>
     */
    'CommentViewMode.WindowSize ': '1005,370',
    /**
     * 위의 상황을 제외한 경우 의견창 크기 조절 (default=1005,570) <HSO-13028 서울예술대>
     */
    'CommentOtherMode.WindowSize ': '1005,570',
  },
  MultiDraft: {
    /**
     * 특정서식만 일괄기안 가능 여부 설정 <HSO-15233 MG새마을금고>
     * [ true : FormID에 설정된 서식만 일괄기안 가능
     *   false : 통합서식/기안서식은 모두 일괄기안 가능 (default) ]
     */
    UseByFormID: false,
    /**
     * UseByFormID=true 사용 시, 일괄기안 가능 서식 지정 (콤마,로 복수서식 설정)
     * Ex) FormID=JHOMS221390000767000,JHOMS221380000766000,JHOMS223140002407000
     *
     * FormID에 설정된 서식만 기안기 상단의 "안추가 / 안삭제 / 안이동" 이 활성화되어 일괄기안 사용 가능
     */
    FormID: '',
  },
  RetrieveInfo: {
    /**
     * 결재 클라이언트에서 "문서정보" 사용 시 설정 <대법원>
     * 결재 클라이언트에 [문서정보] 버튼을 추가하여 (tooltip 118) 문서정보 Web page (결재경로/발송정보/문서정보 Tab만) 팝업 호출 기능
     */
    'RetrieveInfo.URL': '/bms/com/hs/gwweb/appr/retrieveInfoWnd.act',
    'RetrieveInfo.Param':
      'USERID=%USERID%&DEPTID=%DEPTID%&APPRID=%APPRID%&DOCATTR=%DOCATTR%&APPLID=%APPLID%&APPRTYPE=%APPRTYPE%&DISPTABIDX=1,3,4&SHOWTABIDX=1&APPRSTATUS=%APPRSTATUS%&WORDTYPE=3&FLDRSHARE=false&FLDRSHAREDEPTID=%DEPTID%&detachedDocNo=0&RECDOCSTATUS=%RECDOCSTATUS%&SENDID=%SENDID%&PARSENDID=%PARSENDID%&ORGAPPRID=%ORGAPPRID%&MENUMASK=YNYNNY&CURDEPTID=%DEPTID%&isClient=true&K=%KEY%&VIEWRANGE=0',
  },
  FindAddressWeb: {
    /**
     * UseFindAddressWeb=true 사용 시, 수신자지정 > 수기입력에서 우편번호 검색 창 크기/타이틀/URL설정  (기본으로 사용하면 됨)
     * WindowSize default=800,530
     */
    WindowSize: '800,530',
    Title: '',
    URL: '',
  },
  Square: {
    /**
     * 결재 Client에서 "스퀘어" 사용 시 설정 <HSO-9603 K사>
     */
    URL: 'square/contentsWriter.do',
    Param: 'userID=%USU%&K=%KEY%&SERVER_FILENAME=%MSG%&GWLANG=ko_KR',
  },
  CALENDAR: {
    /**
     * 결재 Client에서 "일정등록" 사용 시 설정   /Handy Groupware의 일정관리와는 연계되지 않음, 우정사업본부 외부솔루션과 연계 <116495-우정사업본부>
     * URL=test1.jsp
     * Param=uid1=%USU%&SERVER_FILENAME1=%MSG%&KEY1=%KEY%&TITLE=%TITLE%&DOCID=%DOCID%
     *  [ %USU% : 유저아이디(9자리),   %MSG% : 메시지 파일,   %KEY% : KEY값,
     *    %TITLE% : 결재제목(URL인코딩되어 들어감),    %DOCID% : 문서APPRID  ]
     *
     * * 10.2.2부터는 [Calendar] 설정 없이 tooltip 101번 추가 후 [일정등록] 버튼 사용 가능 <HSO-14351 K사>
     *    - 일정등록 창 안뜨는 경우, hscalendar 쪽 tmanagercfg.properties 파일에 bms.client.file.path=/home2/hso9/hip/data/ext 패스 확인 (서버경로와 동일하게 맞추기)
     */
    URL: '',
    Param: '',
  },
  Reply: {
    /**
     * 댓글페이지 URL 및 param 설정
     */
    'ReplyPage.URL': 'bms/cz/cb/viw/retrieveAnswerInfo.act',
    'ReplyPage.Param': 'DOCID=%DOCID%&K=%KEY%&POPUP=Y&ISC=Y',
    /**
     * 댓글페이지 팝업창 size 설정
     */
    WindowSize: '800,800',
    /**
     * 결재기 - 댓글 팝업 옵션
     */
    'Notify.Kyul': false,
    /**
     * 접수기 - 댓글 팝업 옵션
     */
    'Notify.Receipt': false,
    /**
     * 뷰어 - 댓글 팝업 옵션
     */
    'Notify.View': false,
  },
  Linkage: {
    /** 암호확인창에 SMS발송 유무 물어보도록   <한국전산원> */
    UseSMS: false,
    /**
     * 업무관리시스템 연계 문서 기안대기에서 기안 시, 등록된 서식이 2개 이상일때 서식 선택방법 설정
     * - 0 : 자동 선택    //결재선에 따라 적당한 셀을 가진 서식을 자동으로 찾아 실행,
     * - 1 : 사용자 선택  //사용자가 선택
     */
    'JobControl.UserSelect': 0,
    /**
     * 기안대기에서 업무관리서식을 기안 시 편집 여부 설정
     */
    'JobControl.Body.Edit': false,
    /**
     * 업무관리시스템에서 결재 서명이 일반 문자서명 / 이미지 서명을 선택 text/image
     */
    'JobControl.SignMethod': 'text',
    /**
     * KMS에서 첨부기안할 경우 첨부파일과 정보파일이 temp\handy폴더로 복사되면서 삭제되는데 이를 유지할 수 있는 기능요청  <한국은행>
     */
    'AttachFile.Remove': true,
    /**
     * 지식맵 체크 여부 설정 <한국은행>
     * 기안 시 자동 지식이관기능에서 지식맵을 선택하지 않은 경우, 메시지를 출력하고 예/아니오로 진행여부 설정('이문서는 대외 비공개이며 지식등록을 하지 않은 문서입니다' 결재를 진행하시겠습니까?')
     */
    'KMSMap.Check': false,
    /**
     * 지식맵의 시스템명.Linkage.ini파일에 있는 KMS.0.SystemName=KMSMapID 과 동일한 값 <한국은행>
     */
    'KMSMap.Name': 'KMSMapID',
    /**
     * 정보보안 연동 <노원구청>
     */
    'PIF.Use': false,
    /**
     * PIF.Use = true 일때, 문서에 개인정보가 있는데도 상신 진행 시,정보보안 관련 문자열(PIF.Pass.CellText)을 삽입할 셀이름 설정 <노원구청>
     */
    'PIF.Pass.CellName': '',
    /**
     * PIF.Use = true 일때, 문서에 개인정보가 있는데도 상신 진행 시,지정한 셀(PIF.Pass.CellName)에 설정한 문자열을 삽입 <노원구청>
     */
    'PIF.Pass.CellText': '',
    /**
     * QDB 연동문서 활용기안(새기안) 여부 설정
     * [ true : 새기안 가능,   false : 새기안 불가능(default) ]
     */
    'qdb.redraftable': false,
    /**
     * QDB 연동문서 재발송 여부 설정 <한국정보통신기술협회(TTA)>
     * [ true : 재발송 가능(default),   false : 재발송 불가능 ]
     */
    'qdb.resendable': true,
    /**
     * attach.ini로 로컬PC파일 첨부 시, 첨부파일 삭제여부 설정 (이동 / 복사 설정)  <금융감독원>
     * [ true : 삭제 (default) ,  false : 삭제하지 않음 ]
     */
    DeleteAfterAttach: true,
    /**
     * attach.ini 를 통한 첨부 연계 시, 첨부파일명이 중복될때 확인창 실행 여부 설정 <한국가스공사>
     * [ true : 기존과 동일, 첨부명 중복 시 확인창 실행 (default),
     *   false : 첨부명 중복 시 확인창 실행되지 않고 첨부명[1], 첨부명[2] 형태로 첨부명변경 자동 추가 ]
     *
     * ※ 관련 설정
     * globals.properties
     * queryAddDupAttach=true/false   (디폴트 true)
     *  [ true : 기존과 동일, 첨부명 중복 시 확인창 실행 (default),
     *    false : 첨부명 중복 시 확인창 실행되지 않고 첨부명[1], 첨부명[2] 형태로 첨부명변경 자동 추가 ]
     */
    QueryAddDupAttachByLinkage: true,
    /**
     * 연동문서의 서버저장 / PC저장 / 임시저장문서 새기안 / PC저장문서 새기안 막는 기능 <한국가스공사>
     * BaseCellName=miskey
     */
    BaseCellName: null,
    /**
     * 연동문서의 안추가/안삭제/안변경 기능 사용여부 설정 <한국가스공사>
     * [ true : 사용 가능 (default),   false : 사용 불가능 ]
     */
    'qdb.content.modifiable': true,
    /**
     * 결재 클라이언트 종료 시, GWOK라는 메시지 전송 여부 설정 (기본값:false) <GW-19523 인천항만공사>
     */
    'CloseSendCopyData.Use': false,
    /**
     * CloseSendCopyData.Use=true 일때, 설정한 클라이언트 종료 시 메시지 전송, 아무것도 설정하지 않으면 모든 모듈에 적용 (기본값:없음)  <GW-19523 인천항만공사>
     * [ 기안기 : SaGian.dll,  결재기 : SaKyul.dll , 뷰어 : SaView.dll ]
     */
    'CloseSendCopyData.Module': '',
    /**
     * ClassName 지정시 타겟 프로그램에만 메시지 전송 (기본값:없음)  <GW-19523 인천항만공사>
     * CloseSendCopyData.ClassName=타겟 프로그램의 클래스네임
     */
    'CloseSendCopyData.ClassName': '',
    /**
     * WindowName 지정시 타겟 프로그램에만 메시지 전송 (기본값:없음)  <GW-19523 인천항만공사>
     * CloseSendCopyData.WindowName=타겟 프로그램의 윈도우 캡션 이름
     */
    'CloseSendCopyData.WindowNam': '',
    /**
     * WM_COPYDATA 전달 구조체의 dwData에 저장되는 값 (숫자) (기본값:0) <GW-19523 인천항만공사>
     */
    'CloseSendCopyData.MessageType': 0,
    /**
     * WM_COPYDATA 전달 구조체의 lpData에 저장되는 값 (텍스트) (기본값:없음) <GW-19523 인천항만공사>
     * CloseSendCopyData.Message=GWOK
     */
    'CloseSendCopyData.Message': '',
    /**
     * attach.ini 를 통해 첨부된 파일 삭제 권한 설정 <GW-18449 한국청소년정책연구원>
     * - first : 결재선의 첫번째 결재자 연동 첨부 삭제 불가
     * - middle : 결재선의 중간 결재자 연동 첨부 삭제 불가
     * - last : 결재선의 마지막 결재자 연동 첨부 삭제 불가
     * Ex) AttachDeleteRestrictionSigner=first,middle
     */
    AttachDeleteRestrictionSigner: null,
    /**
     * 결재연동 attach.ini 로 첨부가 추가될때, 복호화 여부 설정 <GW-19664 국민연금공단>
     * * true : attach.ini 로 첨부가 추가될때 복호화 후 추가,
     * * false : attach.ini 로 첨부가 추가될때 아무 처리 없이 추가(default) ]
     */
    DecryptBeforeAttach: '',
    /**
     * 을지의 셀에 붙는 prefix 지정 <GW-17416 한국인터넷진흥원>
     * default = * 이며, UlgiCellPrefix=null 지정 시 prefix를 붙이지 않음
     *
     * * 기존에 Linkage.ini [SancClient] UlgiCellPrefix 에서 8.3.16 h02 부터 설정위치 이동
     */
    UlgiCellPrefix: '',
  },
  FormRestriction: {
    // not found
  },
  autodown: {
    // 웹 구현 불필요?
  },
  CustomWebDialog: {
    // 웹으로 구현 가능성 보임
  },
  CustomURLCall_OpenDoc: {
    // 웹으로 구현 가능성 보임
  },
  PIMS: {},
  Audit: {},
  DCS: {},
  CustomCell: {},
  positionname: {},
  SANC_SIGN_TITLE: {},
  RecentTmpl: {},
  M60: {},
  EDMS: {},
  NoSignTemplate: {},
  DutyMarkTemplate: {},
  Template: {},
  /** 중기청 지식평가를 위해서 사용, 2001/10/13 by 이경철 */
  KMS: {},
  DocSecurityKind: {},
  /** 개인정보. 셀명에서 %로 시작하는 정보를 INI 파일에 저장 */
  PersonalInfo: {},
  FAX: {},
  ORG: {},
  MobileAgent: {},
  Body: {},
  LDAP: {},
  LDAP2: {},
  LDAP3: {},
  DCRBRule: {},
  MarkAny: {},
  CERT: {},
  URL: {},
  RestrictedProgram: {},
  Restriction: {},
  'Append.ini': {},
  'Attach.ini': {},
  TemplateFlagEx: {},
  JajumComment: {},
  TemplateClassFlowType: {},
  ChiefPos: {},
  HelpMsg: {},
  PUBLICATION: {},
  KyulInfoTemplate: {},
  PrecheckForDraft: {},
  SpecialApprovalMsg: {},
  DRN: {},
  AttachPublicSeal: {},
  SavePersonalCabinet: {},
  CFOInspection: {},
  Version: {},
  RMS: {},
  RestrictionSancLine: {},
  InternalReply: {},
  InputAuditInfo: {},
  CapiAgent: {},
  MacroCell: {},
  ReturnDraftInfo: {},
  WebView2: {},
  CustomSaveDept: {},
  Cache: {},
  SignCellSplit: {},
};

(async () => {
  // 서버의 handydef.ini와 merge
  const serverHandydef = await getServerHandydef();
  Object.assign(HANDYDEF, serverHandydef);
  for (const key of Object.keys(HANDYDEF)) {
    Object.assign(HANDYDEF[key], serverHandydef[key]);
  }
  console.log('handydef', HANDYDEF);
})();

async function getServerHandydef() {
  const url = `${PROJECT_CODE}/resources/handydef.ini`;
  const serverHandydefText = await fetch(url, { cache: 'no-cache' })
    .then((res) => {
      if (res.status !== 200) {
        console.warn(url + ' file does not exist on the server. default handydef settings apply');
        return '';
      }
      return res.text();
    })
    .catch((reason) => {
      console.error(reason);
      return '';
    });

  return parseIniToJson(serverHandydefText);
}

/**
 * ini 파일 내용을 json 객체로 변환
 * @param {string} iniText
 * @returns
 */
function parseIniToJson(iniText) {
  const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;.*$/,
  };
  /**
   * 문자를 boolean, number 로 변환
   * @param {string} value
   */
  const parseValue = (value) => {
    if (value.toLocaleLowerCase() === 'true') return true;
    if (value.toLocaleLowerCase() === 'false') return false;
    if (value.startsWith('0')) return value;
    if (/^[0-9]*$/.test(value)) return parseInt(value);
    return value;
  };

  let section = null;
  return iniText
    .split(/[\r\n]+/)
    .filter((line) => !regex.comment.test(line))
    .reduce((json, line) => {
      if (regex.param.test(line)) {
        const matched = line.match(regex.param);
        if (section) {
          json[section][matched[1]] = parseValue(matched[2]);
        } else {
          json[matched[1]] = parseValue(matched[2]);
        }
      } else if (regex.section.test(line)) {
        const matched = line.match(regex.section);
        json[matched[1]] = {};
        section = matched[1];
      } else if (line.length === 0 && section) {
        section = null;
      }
      return json;
    }, {});
}
