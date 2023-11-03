let workingHox;

let feTitle = document.querySelector('fe-title');
let feDocNumber = document.querySelector('fe-docnumber');
let feEditor1 = document.querySelector('fe-editor#editor1');

export const show = (hox) => {
  //
  workingHox = hox;
  feTitle.set(workingHox);
  feTitle.title = feEditor1.title;

  feDocNumber.set(workingHox);

  document.querySelector('body aside').classList.add('show');
};

document.getElementById('btnVerify').addEventListener('click', (e) => {
  console.log('approvalBox verify');
  // 적용 로직
  hox = workingHox;
  feEditor1.title = hox.querySelector('docInfo title').textContent;

  // 닫기
  document.querySelector('body aside').classList.remove('show');
});

document.getElementById('btnCancel').addEventListener('click', (e) => {
  console.log('approvalBox cancel');
  // 닫기
  document.querySelector('body aside').classList.remove('show');
});
