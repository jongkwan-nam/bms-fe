import './index.scss';
import loadHox from './hox/loadHox';
import './components/FeTitle';
import './components/FeEditor';
import './components/FeDocNumber';
import * as approvalBox from './biz/approvalBox';

let trid = '2f32303233313130322f31302f35332f313030313339363138313863653536373834366263383534316236386532656361306238326334393564646531373962636163633931393066663236643631353534303639';

let docUrl = 'https://fe.handysoft.co.kr/bms/com/hs/gwweb/appr/downloadFormFile.act?K=00J2s33yr3&formID=JHOMS232880000001000&USERID=001000001&WORDTYPE=5&_NOARG=1698896160838';

let hox;
let workingHox;

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
