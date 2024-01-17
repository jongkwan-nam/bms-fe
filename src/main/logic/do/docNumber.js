import { addNode, getAttr, getNode, getText, setAttr, setText } from '../../../utils/hoxUtils';
import * as IdUtils from '../../../utils/idUtils';
import * as OrgUtils from '../../../utils/orgUtils';
import * as StringUtils from '../../../utils/stringUtils';

/**
 * hox의 내용으로 문서번를 채번하여 docNumber 노드의 내용을 채운다
 *
 * @param {XMLDocument} hox
 */
export const doSetDocNumber = (hox) => {
  const docNumberFormat = getAttr(hox, 'docInfo docNumber expression', 'format');
  const apprID = getText(hox, 'docInfo apprID');
  const enforceType = getText(hox, 'docInfo enforceType');
  const nodeOfExpression = getNode(hox, 'docInfo docNumber expression');

  // 기안자의 대표부서
  const draftDeptId = getText(hox, 'docInfo drafter department ID');
  const draftDept = OrgUtils.getDept(draftDeptId);

  let refDeptId = draftDeptId; // 문서번호 채번시 기준이 되는 부서
  let refDeptCode = draftDept.deptCode;
  if (docNumberFormat.indexOf('@R') > -1 || docNumberFormat.indexOf('@r') > -1) {
    const repDept = OrgUtils.getRepDept(draftDeptId);
    refDeptId = repDept.ID;
    refDeptCode = repDept.deptCode;
  }

  // 문서번호 채번
  const newDocNumber = IdUtils.getDocNumber(refDeptId, apprID);

  //
  const displayDocNumber = docNumberFormat;
  // expression param 지운후 새로 채우기
  nodeOfExpression.textContent = null;
  docNumberFormat.split(/[^@\w]/).forEach((name) => {
    if (!name.startsWith('@')) {
      return;
    }
    //
    let value = '';
    switch (name) {
      case '@D': {
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
        value = getText(hox, 'docInfo docNumber classCode');
        break;
      }
      case '@N': {
        value = newDocNumber;
        break;
      }
      default:
        break;
    }
    displayDocNumber.replace(name, value);
    // add param node
    const nodeOfParam = addNode(nodeOfExpression, 'param', value);
    setAttr(nodeOfParam, null, 'name', name);
  });

  setText(hox, 'docInfo docNumber displayDocNumber', displayDocNumber);
  setText(hox, 'docInfo docNumber docRegSequence', newDocNumber);
  setText(hox, 'docInfo docNumber regNumber', refDeptCode + StringUtils.unshift(newDocNumber, 6, '0'));
};
