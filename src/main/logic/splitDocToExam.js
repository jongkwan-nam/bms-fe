import { getAttr, getNode, getNodes, getText, setAttr, setText } from '../../utils/hoxUtils';

/**
 * @param {number[]} contentNumbers
 */
export default async (contentNumbers) => {
  //
  console.log('splitDocToExam');

  const feEditor1 = feMain.feEditor1;
  const hox = feMain.hox;
  const clonedHox = hox.cloneNode(true);

  const splitedExamDocMap = new Map();

  for (let n of contentNumbers) {
    const nodeContent = getNode(hox, 'content', n - 1);
    const splitedContentNode = nodeContent.cloneNode(true);

    // feEditor1 에 n번째 안 복사
    const hwpJsonData = await feEditor1.copyContent(n, 'JSON');
    const newHox = createHoxBySplitedContent(clonedHox, splitedContentNode);

    splitedExamDocMap.set('content' + n, {
      hwp: hwpJsonData,
      hox: newHox,
    });
  }

  return splitedExamDocMap;
};

/**
 *
 * @param {XMLDocument} clonedHox
 * @param {Element} splitedContentNode
 * @returns
 */
function createHoxBySplitedContent(clonedHox, splitedContentNode) {
  const apprID = getText(clonedHox, 'docInfo apprID');
  const contentTitle = getText(splitedContentNode, 'title');
  const contentEnforceType = getText(splitedContentNode, 'enforceType');

  const newHox = clonedHox.cloneNode(true);
  const newDocInfo = getNode(newHox, 'docInfo');

  setAttr(newHox, 'hox', 'type', 'enforce'); // hox의 속성 type => enforce
  setText(newHox, 'docInfo apprID', '00000000000000000000');
  newDocInfo.prepend(newHox.createElement('draftApprID')); // draftApprID 추가
  getText(newHox, 'docInfo draftApprID', apprID);

  setText(newHox, 'docInfo title', contentTitle); // 안의 제목으로 변경

  setText(newHox, 'docInfo enforceType', contentEnforceType); // 안의 발송종류로 변경

  // docNumber: displayDocNumber, docReqSequence, regNumber, expression/param 초기화. 발송의뢰시 새번호 채번
  setText(newHox, 'docNumber displayDocNumber', null);
  setText(newHox, 'docNumber docRegSequence', null);
  setText(newHox, 'docNumber regNumber', null);
  getNodes(newHox, 'docNumber expression param').forEach((param, i) => {
    if (getAttr(param, null, 'name') === '@N') {
      param.textContent = null;
    }
  });

  // docInfo content
  for (let node of getNodes(newHox, 'docInfo content')) {
    node.remove();
  }
  newDocInfo.append(splitedContentNode);

  setText(newHox, 'docInfo content receiptInfo senderID', rInfo.user.ID);
  setText(newHox, 'docInfo content receiptInfo senderDeptID', rInfo.apprDeptID);

  // docInfo enforceDate 발송의뢰시 설정

  // participant / participantID 초기화. 발송의뢰시 채번
  getNodes(newHox, 'approvalFlow participant').forEach((participant) => {
    setText(participant, 'participantID', '');
  });

  // examRequest / exam 초기화
  const nodeExam = getNode(newHox, 'examRequest exam');
  setText(nodeExam, 'examiner participantID', null);
  setText(nodeExam, 'examiner position', null);
  setText(nodeExam, 'examiner ID', '000000000');
  setText(nodeExam, 'examiner name', null);
  setText(nodeExam, 'examiner status', 'partapprstatus_will');
  setText(nodeExam, 'examDate', '1970-01-01T09:00:00');
  setText(nodeExam, 'examStatus', 'apprstatus_finish');
  setText(nodeExam, 'examID', '00000000000000000000');

  //
  return newHox;
}
