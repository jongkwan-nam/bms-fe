import './approvalBox.scss';
import './approvalBox/FeDocInfo';
import './approvalBox/FeFlow';
import './approvalBox/FeRecipient';
import './approvalBox/FeSender';
import StyleController from './config/styleController';
import { FeMode, getFeMode } from './main/FeMode';
import * as TabUI from './utils/TabUI';
import { HoxEventType, dispatchHoxEvent, getNodeArray, getNodes, getText, setAttr } from './utils/hoxUtils';
import popupSizeRestorer from './utils/popupSizeRestorer';

popupSizeRestorer('approvalBox.window.size', 1020, 720);

let hox = opener.feMain.hox.cloneNode(true);

const feDocInfo = document.querySelector('fe-docinfo');
const feFlow = document.querySelector('fe-flow');
const feRecipient = document.querySelector('fe-recipient');
const feSender = document.querySelector('fe-sender');

const contentSelector = document.querySelector('select#contentSelector');

hox.addEventListener(HoxEventType.CONTENT, (e) => {
  console.info('hoxEvent listen', e.type, e.detail);
  if (getContentCount() > 1) {
    // 일괄기안
    // 1안 결재선 활성
    TabUI.active(document, 2, getSelectedContentNumber() === 1);
    // 1안 발송정보 활성
    TabUI.active(document, 4, getSelectedContentNumber() === 1);
  }
});

hox.addEventListener(HoxEventType.ENFORCETYPE, (e) => {
  console.info('hoxEvent listen', e.type, e.detail);

  // 발송종류에 따라, 탭(수신부서, 발송부서) 활성/비활성
  let enforceType = e.detail.value;
  switch (enforceType) {
    case 'enforcetype_external': {
      TabUI.active(document, 3, true);
      if (getContentCount() > 1) {
        // 일괄기안이면, 1안 일때만 활성
        TabUI.active(document, 4, getSelectedContentNumber() === 1);
      } else {
        TabUI.active(document, 4, true);
      }
      break;
    }
    case 'enforcetype_internal': {
      TabUI.active(document, 3, true);
      if (getContentCount() > 1) {
        // 일괄기안이면, 1안 일때만 활성
        TabUI.active(document, 4, getSelectedContentNumber() === 1);
      } else {
        TabUI.active(document, 4, true);
      }
      break;
    }
    case 'enforcetype_not': {
      TabUI.active(document, 3, false);
      if (getContentCount() > 1) {
        // 일괄기안이면, 1안 일때만 활성
        TabUI.active(document, 4, getSelectedContentNumber() === 1);
      } else {
        TabUI.active(document, 4, false);
      }
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

  // 현재 결재자/기안자 participant current = true 처리
  getNodes(hox, 'approvalFlow participant').forEach((participant) => setAttr(participant, null, 'current', 'false'));
  const feMode = getFeMode();
  if (feMode === FeMode.DRAFT) {
    // 첫 participant
    const draftParticipant = getNodeArray(hox, 'approvalFlow participant').filter((participant) => 'valid' === getText(participant, 'validStatus'))[0];
    setAttr(draftParticipant, null, 'current', 'true');
  } else if (feMode === FeMode.KYUL) {
    // approvalStatus = partapprstatus_now
    const nowParticipant = getNodeArray(hox, 'approvalFlow participant')
      .filter((participant) => 'valid' !== getText(participant, 'validStatus'))
      .filter((participant) => 'partapprstatus_now' === getText(participant, 'approvalStatus'))
      .filter((participant) => rInfo.user.ID === getText(participant, 'ID') || rInfo.user.ID === getText(participant, 'charger ID'))[0];

    setAttr(nowParticipant, null, 'current', 'true');
  }

  // 발송종류가 내부라면, hox 내용 지우기

  // opener에 hox 전달
  let ret = opener.feMain.receiveHox(hox);
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

/**
 * 안선택 select 초기화
 *
 * - 안별 option 추가
 * - 2안 이상이면 보이기
 * - 안 선택 이벤트 추가
 * - main의 안 번호로 selected 처리
 */
function initContentSelector() {
  // 안선택 select 화면 처리
  getNodes(hox, 'docInfo content').forEach((content, i) => {
    const option = contentSelector.appendChild(document.createElement('option'));
    option.value = i + 1;
    option.innerHTML = `${i + 1} ${GWWEBMessage.cmsg_765}`;
  });
  if (getNodes(hox, 'docInfo content').length > 1) {
    contentSelector.parentElement.classList.add('show');
  }

  // 안 선택 이벤트
  contentSelector.addEventListener('change', (e) => {
    console.info('hoxEvent dispatch', HoxEventType.CONTENT, 'select', e.target.value);
    //
    dispatchHoxEvent(hox, 'docInfo', HoxEventType.CONTENT, 'select', parseInt(e.target.value));
  });

  // main의 안 번호로 selected 처리
  const mainContentNumber = opener.feMain.getCurrentContentNumber();
  contentSelector.querySelectorAll('option')[mainContentNumber - 1].selected = true;
  contentSelector.dispatchEvent(new Event('change'));
}

function getSelectedContentNumber() {
  return parseInt(contentSelector.value);
}
function getContentCount() {
  return contentSelector.querySelectorAll('option').length;
}

initContentSelector();

const styleController = new StyleController();
styleController.start();

window.hox = () => {
  return hox;
};

window.onerror = (error) => {
  alert(error.toString());
};
