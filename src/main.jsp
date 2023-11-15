<%@ page language="java" pageEncoding="utf-8" contentType="text/html; charset=utf-8" %>

<link rel="stylesheet" type="text/css" href="/bms/fe/main.css" />
<script type="text/javascript" src="/bms/js/com/hs/gwweb/appr/retrieveMessage.act"></script>
<script defer type="text/javascript" src="/bms/fe/main.js"></script>

<main>
  <header class="menu-wrap">
    <button type="button" id="btnApprovalBox">결재정보</button>
  </header>
  <article class="editor-wrap">
    <fe-editor id="editor1"></fe-editor>
    <fe-editor id="editor2" style="display: none"></fe-editor>
  </article>
  <article class="attach-wrap">
    <div>첨부 영역</div>
  </article>
</main>
<aside id="approvalBox" class="modal-container">
  <div class="modal-content">
    <div class="modal-header"></div>
    <div class="modal-body"></div>
    <div class="modal-footer"></div>
  </div>
</aside>
