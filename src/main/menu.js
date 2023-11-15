/**
 * 상단 메뉴 버튼
 */

// 결재정보 팝업 호출
document.getElementById('btnApprovalBox').addEventListener('click', (e) => {
  console.log('approvalBox show');
  // approvalBox.show(hox);
  window.open('./approvalBox.html', 'approvalBox', 'width=1020px,height=720px');
});
