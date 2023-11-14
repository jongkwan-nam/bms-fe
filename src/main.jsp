<%@ page language="java" pageEncoding="utf-8" contentType="text/html; charset=utf-8" %>

<link rel="stylesheet" type="text/css" href="/bms/fe/index.css" />
<script type="text/javascript" src="https://fe.handysoft.co.kr/webhwpctrl/js/hwpctrlapp/utils/util.js"></script>
<script type="text/javascript" src="https://fe.handysoft.co.kr/webhwpctrl/js/hwpctrlapp/hwpCtrlApp.js"></script>
<script type="text/javascript" src="https://fe.handysoft.co.kr/webhwpctrl/js/webhwpctrl.js"></script>
<script type="text/javascript" src="/bms/js/com/hs/gwweb/appr/retrieveMessage.act"></script>
<script defer type="text/javascript" src="/bms/fe/index.js"></script>

<main>
  <header>
    <button type="button" id="btnApprovalBox">결재정보</button>
  </header>
  <article class="attach-wrap">
    <div>첨부 영역</div>
  </article>
  <article class="editor-wrap">
    <fe-editor id="editor1"></fe-editor>
    <fe-editor id="editor2" style="display: none"></fe-editor>
  </article>
</main>
<aside id="approvalBox" class="modal-container">
  <div class="modal-content">
    <div class="modal-header">
      <div class="tab-group" role="tablist">
        <button type="button" class="tab-button" role="tab" target="#docInfo" active>문서정보</button>
        <button type="button" class="tab-button" role="tab" target="#approvalFlow">결재경로</button>
        <button type="button" class="tab-button" role="tab" target="#recipientInfo">수신부서</button>
        <button type="button" class="tab-button" role="tab" target="#senderInfo">발송부서</button>
      </div>
    </div>
    <div class="modal-body">
      <div class="tab-content" role="tabpanel" id="docInfo">
        <div class="doc-info">
          <label>발송종류</label>
          <fe-enforcetype></fe-enforcetype>
          <label>제목</label>
          <fe-title></fe-title>
          <label>flag</label>
          <fe-flag></fe-flag>
          <label>문서번호</label>
          <fe-docnumber></fe-docnumber>
          <label>문서종류</label>
          <fe-approvaltype></fe-approvaltype>
          <label>기록물철</label>
          <fe-folder></fe-folder>
          <label>보존기간</label>
          <fe-keepperiod></fe-keepperiod>
          <label>열람범위</label>
          <fe-viewrange></fe-viewrange>
          <label>열람제한</label>
          <fe-viewrestriction></fe-viewrestriction>
          <label>보안등급</label>
          <fe-securitylevel></fe-securitylevel>
          <label>공개여부</label>
          <fe-publication></fe-publication>
          <label>특수기록물</label>
          <fe-specialdoc></fe-specialdoc>
          <label>쪽수</label>
          <fe-pagecnt></fe-pagecnt>
          <label>검색어</label>
          <fe-speciallist></fe-speciallist>
        </div>
      </div>
      <div class="tab-content" role="tabpanel" id="flowInfo">
        <fe-flow></fe-flow>
      </div>
      <div class="tab-content" role="tabpanel" id="recipientInfo">
        <fe-recipient></fe-recipient>
      </div>
      <div class="tab-content" role="tabpanel" id="senderInfo">
        <fe-sender></fe-sender>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" id="btnVerify">확인</button>
      <button type="button" id="btnCancel">취소</button>
    </div>
  </div>
</aside>
