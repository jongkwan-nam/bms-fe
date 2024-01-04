<%@ page language="java" pageEncoding="utf-8" contentType="text/html; charset=utf-8" %>

<link rel="stylesheet" type="text/css" href="/bms/fe/main.css" />
<script type="text/javascript" src="/bms/js/com/hs/gwweb/appr/retrieveMessage.act"></script>
<script defer type="text/javascript" src="/bms/fe/main.js"></script>
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

  // 신규 옵션 추가
  doccfg.summaryAddableApprover = true; // 결재자 요약전 추가 여부 설정 <대법원> [ false: 결재자가 요약전 새로 추가할 수 없음(default), true: 결재자가 요약전 새로 추가할 수 있음 ]

  // 테스트용 옵션값 수정
  doccfg.docViewRatio = 2;
  doccfg.baseBodyContent = 1;
  doccfg.usePreviewSignerName = true;
</script>
<main>
  <header class="menu-wrap"></header>
  <article class="editor-wrap"></article>
  <div class="divider"></div>
  <article class="attach-wrap"></article>
</main>
<aside id="approvalBox" class="modal-container"></aside>
