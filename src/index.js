import './index.scss';
import loadHox from './hox/loadHox';
import './components/FeTitle';
import './components/FeEditor';
import './components/FeDocNumber';
import './components/FeApprovalType';
import './components/FeFolder';
import * as approvalBox from './biz/approvalBox';

let trid = '2f32303233313130332f31362f35392f313032373533333333636365646438396533353838633432643735633633656432656361386165616435346436646166373065636235396166636338386434653735643539';

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
