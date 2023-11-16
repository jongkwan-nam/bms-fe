import './approvalBox.scss';

import './approvalBox/FeDocInfo';
import './approvalBox/FeFlow';
import './approvalBox/FeRecipient';
import './approvalBox/FeSender';

import './utils/TabUI';

let hox = opener.hox().cloneNode(true);

let feDocInfo = document.querySelector('fe-docinfo');
let feFlow = document.querySelector('fe-flow');
let feRecipient = document.querySelector('fe-recipient');
let feSender = document.querySelector('fe-sender');

feDocInfo.set(hox);

// 탭 선택 이벤트 리스너
document.querySelectorAll('[role="tabpanel"]').forEach((tabpanel) => {
  //
  tabpanel.addEventListener('active', (e) => {
    //
    console.log('tabpanel active', e.target.id);
    let id = e.target.id;

    switch (id) {
      case 'docInfo':
        feDocInfo.set(hox);
        break;
      case 'flowInfo':
        feFlow.set(hox);
        break;
      case 'recipientInfo':
        feRecipient.set(hox);
        break;
      case 'senderInfo':
        feSender.set(hox);
        break;
      default:
        throw new Error('undefined tabId: ' + id);
    }
  });
});

/*
 * 결재정보창 확인, 취소
 */
document.getElementById('btnVerify').addEventListener('click', (e) => {
  console.log('approvalBox verify');
  // hox 검증

  // opener에 hox 전달
  let ret = opener.receiveHox(hox);
  if (ret.ok) {
    // 닫기
    close();
  } else {
    alert(ret.message);
  }
});

document.getElementById('btnCancel').addEventListener('click', (e) => {
  console.log('approvalBox cancel');

  // 닫기
  close();
});

function close() {
  //
  window.close();
}
