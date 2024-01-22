import { addNode, createNode, getNode, setText } from '../../../utils/xmlUtils';
import Cell from '../../CellNames';

/**
 *
 * @param {XMLDocument} hox
 * @param {string[]} fieldList
 */
export const doInitClientInfo = (hox, fieldList) => {
  const CellXmlText = `
    <cell type="" width="" height="">
        <cellName></cellName>
        <cellFormat></cellFormat>
        <signCell>
            <title first="false" align="center" valign="${doccfg.signShowSignerDataAlign}" kind="fmt_normal">
            </title>
            <WMF width="0" height="0" size="0" align="center" valign="top" signText="" />
        </signCell>
    </cell>
  `;

  const clientInfo = getNode(hox, 'clientInfo');
  let cellInfo = getNode(hox, 'clientInfo cellInfo');
  if (cellInfo === null) {
    cellInfo = addNode(clientInfo, 'cellInfo');
  }
  //
  fieldList.forEach((cellName) => {
    /*
      <cell width="134" height="38">
        <cellName>서명.2</cellName>
        <cellFormat>fmt_normal</cellFormat>
        <signCell>
          <title first="false" align="center" valign="bottom" kind="fmt_normal"/>
          <WMF width="134" height="38" size="0" align="center" valign="bottom" signText=""/>
        </signCell>
      </cell>

      #define CELLTYPE_NORMAL_STR				    _T("celltype_normal")
      #define CELLTYPE_AGREE_STR				    _T("celltype_agree")
      #define CELLTYPE_AUDIT_STR				    _T("celltype_audit")
      #define CELLTYPE_AUDITDEPT_STR			  _T("celltype_auditdept")
      #define CELLTYPE_CONFIRM_STR			    _T("celltype_confirm")
      #define CELLTYPE_DELIBERATIONDEPT_STR	_T("celltype_deliberationdept")
      #define CELLTYPE_CUSTOM_STR				    _T("celltype_custom")
      #define CELLTYPE_COMPLIANCEUSER_STR		_T("celltype_complianceuser")
      #define CELLTYPE_COMPLIANCEDEPT_STR		_T("celltype_compliancedept")
    */
    // 서명, 협조, 감사, 감사부, 특별협조, 심의부서

    let cellType = '';
    let cellFormat = 'cellFormat';

    if (equalsCell(cellName, Cell.SIGN)) {
      // 서명
      cellType = 'celltype_normal';
      cellInfo.appendChild(createCellNode(CellXmlText, cellType, cellName, cellFormat));
    } else if (equalsCell(cellName, Cell.AGREE_SIGN)) {
      // 협조
      cellType = 'celltype_agree';
      cellInfo.appendChild(createCellNode(CellXmlText, cellType, cellName, cellFormat));
    } else if (equalsCell(cellName, Cell.AUDIT_SIGN)) {
      // 감사
      cellType = 'celltype_audit';
      cellInfo.appendChild(createCellNode(CellXmlText, cellType, cellName, cellFormat));
    } else if (equalsCell(cellName, Cell.AUDITDEPT_SIGN)) {
      // 검사부
      cellType = 'celltype_auditdept';
      cellInfo.appendChild(createCellNode(CellXmlText, cellType, cellName, cellFormat));
    } else if (equalsCell(cellName, Cell.CONFIRM_SIGN)) {
      // 서명날인
      cellType = 'celltype_confirm';
      cellInfo.appendChild(createCellNode(CellXmlText, cellType, cellName, cellFormat));
    } else if (equalsCell(cellName, Cell.DELIBDEPT_SIGN)) {
      // 심의부서
      cellType = 'celltype_deliberationdept';
      cellInfo.appendChild(createCellNode(CellXmlText, cellType, cellName, cellFormat));
    } else if (equalsCell(cellName, Cell.CUSTOM_SIGN)) {
      // 특별협조
      cellType = 'celltype_custom';
      cellInfo.appendChild(createCellNode(CellXmlText, cellType, cellName, cellFormat));
    } else if (equalsCell(cellName, Cell.COMPL_SIGN)) {
      // 준법감시자
      cellType = 'celltype_complianceuser';
      cellInfo.appendChild(createCellNode(CellXmlText, cellType, cellName, cellFormat));
    } else if (equalsCell(cellName, Cell.COMPLDEPT_SIGN)) {
      // 준법감시부
      cellType = 'celltype_compliancedept';
      cellInfo.appendChild(createCellNode(CellXmlText, cellType, cellName, cellFormat));
    }
  });
};

/**
 * cell 노드 생성
 * @param {string} templateText
 * @param {string} cellType
 * @param {string} cellName
 * @param {string} cellFormat
 */
function createCellNode(templateText, cellType, cellName, cellFormat) {
  const cell = createNode(templateText);
  cell.setAttribute('type', cellType);
  setText(cell, 'cellName', cellName);
  setText(cell, 'cellFormat', cellFormat);

  return cell;
}

function equalsCell(name, sign) {
  return name.startsWith(sign + '.');
}
