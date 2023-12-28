import StyleController from './config/styleController';
import Cell from './main/CellNames';
import './main/FeEditor';
import './summaryBox.scss';
import { createNode, getAttr, getNode, getNodeArray, getText, toggleFlag } from './utils/hoxUtils';
import { getObjectID, isNotNullID } from './utils/idUtils';
import popupSizeRestorer from './utils/popupSizeRestorer';

popupSizeRestorer('approvalBox.window.size', 800, 920);

const styleController = new StyleController();
styleController.start();

// let hox = opener.feMain.hox.cloneNode(true);
const hox = opener.feMain.hox;
let nodeObjectIDOfSummary = null;
let apprID = getText(hox, 'docInfo apprID');
const feEditor = document.querySelector('fe-editor');

(async () => {
  // 에디터 로딩
  await feEditor.init();
  // 보기 모드 설정
  feEditor.setViewZoom(doccfg.docViewRatio);
  // 리본메뉴 보이기
  feEditor.foldRibbon(true);

  // 문서 열기
  // 저장된 요약이 있으면, feMain으로부터 open url 구하기
  if (opener.feMain.summary.filePath !== null) {
    await feEditor.openOnly(location.origin + opener.feMain.summary.filePath);
  } else {
    // 서버에서 template 받아서 열기
    const summaryTemplateURL = `${location.origin}${PROJECT_CODE}/com/hs/gwweb/appr/retrieveServerFile.act?UID=${rInfo.user.ID}&res=Summary.hwp`;
    await feEditor.openOnly(summaryTemplateURL);
  }

  // 양식모드 설정
  feEditor.setEditMode(2);

  // 본문으로 커서 이동
  feEditor.focusToField(Cell.CBODY);

  // 기존 요약이 있는지
  let foundSummaryNodes = getNodeArray(hox, 'docInfo objectIDList objectID').filter((objectID) => 'objectidtype_summary' === getAttr(objectID, null, 'type'));
  if (foundSummaryNodes.length === 0) {
    document.querySelector('#btnDelete').disabled = true;
  } else {
    nodeObjectIDOfSummary = foundSummaryNodes[0];
  }
})();

window.hox = () => {
  return hox;
};

window.onerror = (error) => {
  alert(error.toString());
};

/* Button Event */

document.querySelector('#btnSave').addEventListener('click', async () => {
  // 저장
  const downloadURL = await feEditor.saveServer(apprID + '_summary');
  const { ok, location, TRID, size } = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/getFileFromURL.act?url=${downloadURL}`).then((res) => res.json());
  console.log('summaryFileInfo', ok, location, TRID, size);
  if (!ok) {
    throw new Error('요약전 저장 실패');
  }

  // hox 처리
  toggleFlag(hox, 'docInfo approvalFlag', 'apprflag_summary', true);
  if (nodeObjectIDOfSummary === null) {
    let id = '00000000000000000000';
    if (isNotNullID(apprID)) {
      id = getObjectID(apprID, 3);
    }
    const nodeObjectID = createNode(`
      <objectID dirty="new" type="objectidtype_summary">
        <ID>${id}</ID>
        <name>OBJECTTYPE_SUMMARY</name>
        <participantID>00000000000000000000</participantID>
      </objectID>  
    `);
    getNode(hox, 'docInfo objectIDList').appendChild(nodeObjectID);
  }

  opener.feMain.summary.filePath = `${PROJECT_CODE}/${location}`;
  opener.feMain.summary.TRID = TRID;
  alert(GWWEBMessage.cmsg_1699); // 저장하였습니다.

  closeBox();
});

document.querySelector('#btnDelete').addEventListener('click', (e) => {
  // 삭제
  if (!confirm(GWWEBMessage.cmsg_1049)) {
    // 요약을 삭제하시겠습니까?
    return;
  }

  // hox 처리
  toggleFlag(hox, 'docInfo approvalFlag', 'apprflag_summary', false);
  nodeObjectIDOfSummary.remove();

  opener.feMain.summary.filePath = null;
  opener.feMain.summary.TRID = null;

  closeBox();
});

document.querySelector('#btnPCOpen').addEventListener('click', () => {
  // 읽어오기
  document.querySelector('#pcOpenFile').click();
});

document.querySelector('#btnPCSave').addEventListener('click', async () => {
  // PC저장
  const ret = await feEditor.saveLocal('summary.hwp');
  console.log(ret);
});

document.querySelector('#btnPrint').addEventListener('click', () => {
  // 인쇄
  feEditor.printDocument();
});

document.querySelector('#btnClose').addEventListener('click', () => {
  // 종료
  // PC에서 읽어 왔는지, 타이핑 한 내용이 있는지,
  // console.log(`
  //   feEditor.modified:          ${feEditor.modified}
  //   feEditor.getPageText():     ${feEditor.getPageText()}
  //   feEditor.getPageCount():    ${feEditor.getPageCount()}
  //   feEditor.getCharCount():    ${feEditor.getCharCount()}
  //   feEditor.isEmptyDocument(): ${feEditor.isEmptyDocument()}
  // `);
  closeBox(); // 저장, 삭제 버튼이 별도로 있으므로 그냥 닫기
});

// PC에서 읽어오기
document.querySelector('#pcOpenFile').addEventListener('change', async (e) => {
  console.log(e.target.files);
  if (e.target.files?.length < 1) {
    return;
  }
  const file = e.target.files[0];

  if (file.type === 'application/handy-hwx') {
    // hwx 파일은 서버에 올려서 매직 제거한 다운로드 URL을 구한다.
    const formData = new FormData();
    formData.append('BODY', file);
    const data = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageFileUpload.act`, { method: 'POST', body: formData }).then((res) => res.json());
    if (!data.ok) {
      throw new Error('서버 업로드 실패');
    }
    console.log('uploaded File', data.files[0]);
    const { TRID, fileName, size } = data.files[0];
    let bodyURL = `${location.origin}/${PROJECT_CODE}/com/hs/gwweb/appr/manageFileDwld.act?TRID=${TRID}&wordType=5&WORDTYPE=5&fileName=${encodeURIComponent(fileName)}&ConvertHTM=false&K=${opener.szKEY}`;
    await feEditor.openOnly(bodyURL);
  } else {
    const blob = new Blob([file], { type: file.type });
    console.log('blob', blob);
    await feEditor.openOnly(blob);
  }
});

window.onbeforeunload = (e) => {
  e.preventDefault();
  return (e.returnValue = '');
};

function closeBox() {
  window.onbeforeunload = null;
  window.close();
}
