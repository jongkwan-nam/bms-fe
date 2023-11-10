import './index.scss';
import loadHox from './hox/loadHox';
import './components/FeEditor';
import * as approvalBox from './biz/approvalBox';
import './utils/TabUI';

let trid = rInfo.hoxFileTRID; // '2f32303233313130362f31302f35332f313030363464623639343330383539623762383866663632316464613861396433363535366536343134363435633766316336336538356362376333616233306634646333';

let docUrl = 'https://fe.handysoft.co.kr/bms/com/hs/gwweb/appr/downloadFormFile.act?K=00J2s33yr3&formID=JHOMS232880000001000&USERID=001000001&WORDTYPE=5&_NOARG=1698896160838';

let hox;

let feEditor1 = document.querySelector('fe-editor#editor1');
let feEditor2 = document.querySelector('fe-editor#editor2');

loadHox(trid).then((doc) => {
  hox = doc;
  console.log(hox);

  feEditor1.set(hox, docUrl);
});

window.hox = () => {
  return hox;
};

// event listener
document.getElementById('btnApprovalBox').addEventListener('click', (e) => {
  console.log('approvalBox show');
  approvalBox.show(hox);
});
