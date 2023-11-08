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
  <div>
    <table border="1">
      <tr>
        <th>발송종류</th>
        <td><fe-enforcetype></fe-enforcetype></td>
      </tr>
      <tr>
        <th>제목</th>
        <td><fe-title></fe-title></td>
      </tr>
      <tr>
        <th>flag</th>
        <td><fe-flag></fe-flag></td>
      </tr>
      <tr>
        <th>문서번호</th>
        <td><fe-docnumber></fe-docnumber></td>
      </tr>
      <tr>
        <th>문서종류</th>
        <td><fe-approvaltype></fe-approvaltype></td>
      </tr>
      <tr>
        <th>기록물철</th>
        <td><fe-folder></fe-folder></td>
      </tr>
      <tr>
        <th>보존기간</th>
        <td><fe-keepperiod></fe-keepperiod></td>
      </tr>
      <tr>
        <th>열람범위</th>
        <td><fe-viewrange></fe-viewrange></td>
      </tr>
      <tr>
        <th>열람제한</th>
        <td><fe-viewrestriction></fe-viewrestriction></td>
      </tr>
      <tr>
        <th>보안등급</th>
        <td><fe-securitylevel></fe-securitylevel></td>
      </tr>
      <tr>
        <th>공개여부</th>
        <td><fe-publication></fe-publication></td>
      </tr>
      <tr>
        <th>특수기록물</th>
        <td><fe-specialdoc></fe-specialdoc></td>
      </tr>
      <tr>
        <th>쪽수</th>
        <td><fe-pagecnt></fe-pagecnt></td>
      </tr>
      <tr>
        <th>검색어</th>
        <td><fe-speciallist></fe-speciallist></td>
      </tr>
    </table>
    <div>
      <button type="button" id="btnVerify">확인</button>
      <button type="button" id="btnCancel">취소</button>
    </div>
  </div>
</aside>
