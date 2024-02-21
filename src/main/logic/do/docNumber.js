import IDUtils from '../../../utils/IDUtils';
import OrgUtils from '../../../utils/OrgUtils';
import StringUtils from '../../../utils/StringUtils';
import { addNode, getAttr, getNode, getNodes, getText, setAttr, setText } from '../../../utils/xmlUtils';
import Cell from '../../CellNames';
import FeEditor from '../../FeEditor';

/**
 * hox의 내용으로 문서번호를 채번하여 docNumber 노드의 내용을 채운다
 *
 * @param {XMLDocument} hox
 * @param {FeEditor} feEditor
 */
export const doSetDocNumber = (hox, feEditor) => {
  const apprID = getText(hox, 'docInfo apprID');
  const draftDeptId = getText(hox, 'docInfo drafter department ID');

  const nodeOfDocNumber = findNodeOfDocNumber(hox);
  const docNumberFormat = getAttr(nodeOfDocNumber, 'expression', 'format');
  const nodeOfExpression = getNode(nodeOfDocNumber, 'expression');
  nodeOfExpression.textContent = null; // expression param 지운후 새로 채우기

  // 채번 기준 부서
  const [refDeptId, refDeptCode] = findRefDept(draftDeptId, docNumberFormat);

  // 문서번호 채번
  const newDocNumber = IDUtils.getDocNumber(refDeptId, apprID);

  let displayDocNumber = docNumberFormat;

  docNumberFormat.split(/[^@\w]/).forEach((name) => {
    if (!name.startsWith('@')) {
      return;
    }
    //
    let value = '';
    switch (name) {
      case '@D': {
        const enforceType = getText(hox, 'docInfo enforceType');
        const dept = OrgUtils.getDept(draftDeptId);
        if (doccfg.useDocnumDeptName2 && enforceType == 'enforcetype_external') {
          value = StringUtils.isBlank(dept.name2) ? dept.name : dept.name2;
        } else {
          value = dept.name;
        }
        break;
      }
      case '@d': {
        const dept = OrgUtils.getDept(draftDeptId);
        value = dept.alias;
        if (StringUtils.isBlank(value)) throw new Error(GWWEBMessage.W1365);
        break;
      }
      case '@R': {
        const repDept = OrgUtils.getRepDept(draftDeptId);
        value = repDept.name;
        break;
      }
      case '@r': {
        const repDept = OrgUtils.getRepDept(draftDeptId);
        value = repDept.alias;
        if (StringUtils.isBlank(value)) throw new Error(GWWEBMessage.W1365);
        break;
      }
      case '@Y': {
        value = doccfg.DocNumYear;
        break;
      }
      case '@y': {
        value = doccfg.DocNumYear.toString().substring(2);
        break;
      }
      case '@C': {
        value = getText(nodeOfDocNumber, 'classCode');
        break;
      }
      case '@N': {
        value = newDocNumber;
        break;
      }
      default:
        break;
    }
    displayDocNumber = displayDocNumber.replace(name, value);
    // add param node
    const nodeOfParam = addNode(nodeOfExpression, 'param', value);
    setAttr(nodeOfParam, null, 'name', name);
  });

  setText(nodeOfDocNumber, 'displayDocNumber', displayDocNumber);
  setText(nodeOfDocNumber, 'docRegSequence', newDocNumber);
  setText(nodeOfDocNumber, 'regNumber', refDeptCode + StringUtils.unshift(newDocNumber, 6, '0'));

  const approvalType = getText(hox, 'docInfo approvalType');
  if ('apprtype_receipt' === approvalType) {
    feEditor.putFieldText(Cell.ACCEPT_NUM, displayDocNumber); // 접수번호
  } else {
    feEditor.putFieldText(Cell.DOC_NUM, displayDocNumber); // 문서번호
  }
};

/**
 * apprid, 접수번호 채번
 *
 * @param {XMLDocument} hox
 * @param {FeEditor} feEditor
 */
export const doSetReceiptNumber = (hox, feEditor) => {
  //
  const draftDeptId = getText(hox, 'docInfo drafter department ID');

  const nodeOfDocNumber = findNodeOfDocNumber(hox);
  const docNumberFormat = getAttr(nodeOfDocNumber, 'expression', 'format');
  const nodeOfExpression = getNode(nodeOfDocNumber, 'expression');
  nodeOfExpression.textContent = null; // expression param 지운후 새로 채우기

  // 채번 기준 부서
  const [refDeptId, refDeptCode] = findRefDept(draftDeptId, docNumberFormat);

  // 문서번호 채번
  const newReceiptNumberObj = IDUtils.getReceiptNumber(refDeptId, rInfo.sendID, 3);

  let displayDocNumber = docNumberFormat;

  docNumberFormat.split(/[^@\w]/).forEach((name) => {
    if (!name.startsWith('@')) {
      return;
    }
    //
    let value = '';
    switch (name) {
      case '@D': {
        const enforceType = getText(hox, 'docInfo enforceType');
        const dept = OrgUtils.getDept(draftDeptId);
        if (doccfg.useDocnumDeptName2 && enforceType == 'enforcetype_external') {
          value = StringUtils.isBlank(dept.name2) ? dept.name : dept.name2;
        } else {
          value = dept.name;
        }
        break;
      }
      case '@d': {
        const dept = OrgUtils.getDept(draftDeptId);
        value = dept.alias;
        if (StringUtils.isBlank(value)) throw new Error(GWWEBMessage.W1365);
        break;
      }
      case '@R': {
        const repDept = OrgUtils.getRepDept(draftDeptId);
        value = repDept.name;
        break;
      }
      case '@r': {
        const repDept = OrgUtils.getRepDept(draftDeptId);
        value = repDept.alias;
        if (StringUtils.isBlank(value)) throw new Error(GWWEBMessage.W1365);
        break;
      }
      case '@Y': {
        value = doccfg.DocNumYear;
        break;
      }
      case '@y': {
        value = doccfg.DocNumYear.toString().substring(2);
        break;
      }
      case '@C': {
        value = getText(nodeOfDocNumber, 'classCode');
        break;
      }
      case '@N': {
        value = newReceiptNumberObj.receiptNumber;
        break;
      }
      default:
        break;
    }
    displayDocNumber = displayDocNumber.replace(name, value);
    // add param node
    const nodeOfParam = addNode(nodeOfExpression, 'param', value);
    setAttr(nodeOfParam, null, 'name', name);
  });

  setText(nodeOfDocNumber, 'displayDocNumber', displayDocNumber);
  setText(nodeOfDocNumber, 'docRegSequence', newReceiptNumberObj.receiptNumber);
  setText(nodeOfDocNumber, 'regNumber', refDeptCode + StringUtils.unshift(newReceiptNumberObj.receiptNumber, 6, '0'));

  if (StringUtils.isNotBlank(newReceiptNumberObj.apprId)) {
    setText(hox, 'docInfo apprID', newReceiptNumberObj.apprId);
  }

  feEditor.putFieldText(Cell.ACCEPT_NUM, displayDocNumber); // 접수번호
};

/**
 * 문서번호 초기 설정
 * - 일반/수신에 따라 docNumber 선택
 * - displayDocNumber, expression/param 만 설정
 *
 * @param {XMLDocument} hox
 */
export const doInitDocNumber = (hox) => {
  const draftDeptId = getText(hox, 'docInfo drafter department ID'); // 기안자 부서

  const nodeOfDocNumber = findNodeOfDocNumber(hox);

  // expression param 지운후 새로 채우기
  const nodeOfExpression = getNode(nodeOfDocNumber, 'expression');
  nodeOfExpression.textContent = null;

  const docNumberFormat = getAttr(nodeOfDocNumber, 'expression', 'format');
  let displayDocNumber = docNumberFormat;

  docNumberFormat.split(/[^@\w]/).forEach((name) => {
    if (!name.startsWith('@')) {
      return;
    }

    let value = '';
    switch (name) {
      case '@D': {
        const enforceType = getText(hox, 'docInfo enforceType');
        const dept = OrgUtils.getDept(draftDeptId);
        if (doccfg.useDocnumDeptName2 && enforceType == 'enforcetype_external') {
          value = StringUtils.isBlank(dept.name2) ? dept.name : dept.name2;
        } else {
          value = dept.name;
        }
        break;
      }
      case '@d': {
        const dept = OrgUtils.getDept(draftDeptId);
        value = dept.alias;
        if (StringUtils.isBlank(value)) throw new Error(GWWEBMessage.W1365);
        break;
      }
      case '@R': {
        const repDept = OrgUtils.getRepDept(draftDeptId);
        value = repDept.name;
        break;
      }
      case '@r': {
        const repDept = OrgUtils.getRepDept(draftDeptId);
        value = repDept.alias;
        if (StringUtils.isBlank(value)) throw new Error(GWWEBMessage.W1365);
        break;
      }
      case '@Y': {
        value = doccfg.DocNumYear;
        break;
      }
      case '@y': {
        value = doccfg.DocNumYear.toString().substring(2);
        break;
      }
      case '@C': {
        value = getText(nodeOfDocNumber, 'classCode');
        break;
      }
      case '@N': {
        value = '';
        break;
      }
    }
    if ('@N' !== name) {
      displayDocNumber = displayDocNumber.replace(name, value);
    }
    // add param node
    const nodeOfParam = addNode(nodeOfExpression, 'param', value);
    setAttr(nodeOfParam, null, 'name', name);
  });

  setText(nodeOfDocNumber, 'displayDocNumber', displayDocNumber);
};

/**
 * 문서번호 채번
 * - doInitDocNumber 로 다른 값은 있는 상태
 * - 새 번호 채번하여, displayDocNumber, docRegSequence, regNumber
 * @param {XMLDocument} hox
 */
export const doNewDocNumber = (hox) => {
  const apprID = getText(hox, 'docInfo apprID');
  const draftDeptId = getText(hox, 'docInfo drafter department ID'); // 기안자 부서

  const nodeOfDocNumber = findNodeOfDocNumber(hox);
  const docNumberFormat = getAttr(nodeOfDocNumber, 'expression', 'format');
  const displayDocNumber = getText(nodeOfDocNumber, 'displayDocNumber');

  // 채번 기준 부서
  const [refDeptId, refDeptCode] = findRefDept(draftDeptId, docNumberFormat);

  // 문서번호 채번
  const newDocNumber = IDUtils.getDocNumber(refDeptId, apprID);

  getNodes(nodeOfDocNumber, 'expression param').forEach((param) => {
    if ('@N' === param.getAttribute('name')) {
      param.textContent = newDocNumber;
    }
  });

  setText(nodeOfDocNumber, 'displayDocNumber', displayDocNumber.replace('@N', newDocNumber));
  setText(nodeOfDocNumber, 'docRegSequence', newDocNumber);
  setText(nodeOfDocNumber, 'regNumber', refDeptCode + StringUtils.unshift(newDocNumber, 6, '0'));
};

/**
 * 일반 수신인지 구분하여, docNumber 노드를 구한다
 * @param {XMLDocument} hox
 * @returns
 */
export function findNodeOfDocNumber(hox) {
  const approvalType = getText(hox, 'docInfo approvalType');

  let nodeOfDocNumber = getNode(hox, 'docInfo docNumber');
  if ('apprtype_receipt' === approvalType) {
    const signDepth = parseInt(getAttr(hox, 'previewInfo', 'depth'));
    nodeOfDocNumber = getNode(hox, 'previewInfo receipt docNumber', signDepth - 1);
  }
  return nodeOfDocNumber;
}

/**
 * 채번 기준부서 구하기
 * @param {string} deptId
 * @param {string} docNumberFormat
 * @returns
 */
function findRefDept(deptId, docNumberFormat) {
  const dept = OrgUtils.getDept(deptId);
  let [id, code] = [dept.ID, dept.deptCode];
  if (docNumberFormat.indexOf('@R') > -1 || docNumberFormat.indexOf('@r') > -1) {
    const repDept = OrgUtils.getRepDept(id);
    [id, code] = [repDept.ID, repDept.deptCode];
  }
  return [id, code];
}
