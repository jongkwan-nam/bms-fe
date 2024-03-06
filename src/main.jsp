<%@ page language="java" pageEncoding="utf-8" contentType="text/html; charset=utf-8" %>

<link rel="stylesheet" type="text/css" href="/bms/fe/main.css" />
<script defer type="text/javascript" src="/bms/fe/main.js"></script>
<c:if test="${use_qdb_context}">
  <link type="text/css" href="<c:out value='${qdb_context}' />/js/lib/jquery.simplemodal/confirm.css" rel="stylesheet" />
  <script type="text/javascript" src="/js/lib/jQuery/jquery-1.12.3.js"></script>
  <script type="text/javascript" src="<c:out value='${qdb_context}' />/js/lib/jquery.simplemodal/jquery.simplemodal.js"></script>
  <script type="text/javascript" src="<c:out value='${qdb_context}' />/js/sanc0.js"></script>
</c:if>
<script>
  // 신규 메시지 추가
  GWWEBMessage['st_jeonhooyul_nosign'] = '전결(후열)';
  GWWEBMessage['st_jeonhooyul_sign'] = '전결(후결)';
  GWWEBMessage['st_jeonhooyul_nosanc'] = '전결(후열안함)';
  GWWEBMessage['pen_sign'] = '펜서명';
  GWWEBMessage['assist_signer_caption'] = '협조';
  GWWEBMessage['pubtype_open'] = GWWEBMessage.publicflag_public;
  GWWEBMessage['pubtype_partial'] = GWWEBMessage.publicflag_partial;
  GWWEBMessage['pubtype_not'] = GWWEBMessage.publicflag_private;
  GWWEBMessage['font_size'] = '글자 크기';
  GWWEBMessage['color_theme'] = '색상 테마';
  GWWEBMessage['content_split'] = '안 분리';

  // 신규 옵션 추가
  doccfg.summaryAddableApprover = true; // 결재자 요약전 추가 여부 설정 <대법원> [ false: 결재자가 요약전 새로 추가할 수 없음(default), true: 결재자가 요약전 새로 추가할 수 있음 ]
  doccfg.disableViewerCancel = <c:out value="${disableViewerCancel}" default="true" />;
  doccfg.qdbTemporarySaveFormId = '<c:out value="${qdbTemporarySaveFormId}" default="" />'; // 결재연동 임시저장 서식ID [설정된 서식ID는 결재연동시 '임시저장' 버튼이 활성화 된다. 2개 이상 설정시 콤마(,)로 구분한다.] from globals.properties

  // 테스트용 옵션값 수정
  doccfg.docViewRatio = 2;
  doccfg.baseBodyContent = 1;
  doccfg.usePreviewSignerName = true;
  doccfg.useSancPasswd = true;
  doccfg.passwordCheckWhenDraft = true;

  //
  rInfo.sendID = '<c:out value="${param.SENDIDLIST}"/>';
  rInfo.docattr = '<c:out value="${param.DOCATTRLIST}"/>';

  // param EXTERNALATTACHINFOPATH 외부 첨부
  const externalBodyFileID = '<c:out value="${EXTERNALBODYFILEID}" />';
  const externalAttchInfos = [];
  <c:forEach var="att" items="${EXTERNALATTACHINFOS}">
    /* hsattach.AddItemByGroup(mk_FileTransURL("${att.TRID}", "${att.fileName}", "${att.size}", 'attachtype_normal'), "${att.fileName}", "${att.size}", 0); */
    externalAttchInfos.push({
      trid: '<c:out value="${att.TRID}" />',
      fileName: '<c:out value="${att.fileName}" />',
      size: <c:out value="${att.size}" default="0" />
    });
  </c:forEach>;
</script>
<main>
  <header class="menu-wrap"></header>
  <article class="editor-wrap"></article>
  <div class="divider"></div>
  <article class="attach-wrap"></article>
</main>
<aside id="approvalBox" class="modal-container"></aside>
<div id="hiddenContainer" style="display: none !important"></div>
