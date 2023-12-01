import './approvalBox.scss';

import './approvalBox/FeDocInfo';
import './approvalBox/FeFlow';
import './approvalBox/FeRecipient';
import './approvalBox/FeSender';
import { HoxEventType } from './utils/hoxUtils';

import * as TabUI from './utils/TabUI';

let hox = opener.hox().cloneNode(true);

let feDocInfo = document.querySelector('fe-docinfo');
let feFlow = document.querySelector('fe-flow');
let feRecipient = document.querySelector('fe-recipient');
let feSender = document.querySelector('fe-sender');

hox.addEventListener(HoxEventType.ENFORCETYPE, (e) => {
  console.info('hoxEvent listen', e.type, e.detail);
  //
  let enforceType = e.detail.value;
  // 발송종류에 따라, 탭 활성/비활성
  switch (enforceType) {
    case 'enforcetype_external': {
      TabUI.active(document, 3, true);
      TabUI.active(document, 4, true);
      break;
    }
    case 'enforcetype_internal': {
      TabUI.active(document, 3, true);
      TabUI.active(document, 4, true);
      break;
    }
    case 'enforcetype_not': {
      TabUI.active(document, 3, false);
      TabUI.active(document, 4, false);
      break;
    }
    default:
      break;
  }
});

TabUI.init(document, (activeTab) => {
  switch (activeTab.id) {
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
      throw new Error('undefined tabId: ' + activeTab.id);
  }
});

TabUI.select(document, 1);

/*
 * 결재정보창 확인, 취소
 */
document.getElementById('btnVerify').addEventListener('click', (e) => {
  console.log('approvalBox verify');
  // hox 검증

  // 발송종류가 내부라면, hox 내용 지우기

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

window.hox = () => {
  return hox;
};
