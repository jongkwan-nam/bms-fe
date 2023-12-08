<%@ page language="java" pageEncoding="utf-8" contentType="text/html; charset=utf-8" %>

<link rel="stylesheet" type="text/css" href="/bms/fe/main.css" />
<script type="text/javascript" src="/bms/js/com/hs/gwweb/appr/retrieveMessage.act"></script>
<script defer type="text/javascript" src="/bms/fe/main.js"></script>
<script>
  GWWEBMessage['st_jeonhooyul_nosign'] = '전결(후열)';
  GWWEBMessage['st_jeonhooyul_sign'] = '전결(후결)';
  GWWEBMessage['st_jeonhooyul_nosanc'] = '전결(후열안함)';

  doccfg.docViewRatio = 1;
  doccfg.baseBodyContent = 1;
</script>
<main>
  <header class="menu-wrap">
    <button type="button" id="btnDraft" class="btn btn-primary">결재올림</button>
    <button type="button" id="btnApprovalBox" class="btn">결재정보</button>
    <button type="button" id="btnContentAdd" class="btn">안 추가</button>
    <button type="button" id="btnContentDel" class="btn">안 삭제(2)</button>
  </header>
  <article class="editor-wrap">
    <!-- <fe-editor id="editor1"></fe-editor> -->
    <!-- <fe-editor id="editor2" style="display: none"></fe-editor> -->
  </article>
  <article class="attach-wrap">
    <!-- <fe-attachbox></fe-attachbox> -->
  </article>
</main>
<aside id="approvalBox" class="modal-container">
  <div class="modal-content">
    <div class="modal-header"></div>
    <div class="modal-body"></div>
    <div class="modal-footer"></div>
  </div>
</aside>
