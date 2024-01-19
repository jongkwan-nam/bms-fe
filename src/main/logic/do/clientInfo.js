import Cell from '../../CellNames';
import FeEditor from '../../FeEditor';

/**
 *
 * @param {XMLDocument} hox
 * @param {FeEditor} feEditor
 */
export const doInitClientInfo = (hox, feEditor) => {
  //
  feEditor.fieldList.forEach((field) => {
    /*
<cell width="134" height="38"><cellName>서명.2</cellName><cellFormat>fmt_normal</cellFormat><signCell><title first="false" align="center" valign="bottom" kind="fmt_normal"/><WMF width="134" height="38" size="0" align="center" valign="bottom" signText=""/></signCell></cell>    
#define CELLTYPE_NORMAL_STR				_T("celltype_normal")
#define CELLTYPE_AGREE_STR				_T("celltype_agree")
#define CELLTYPE_AUDITDEPT_STR			_T("celltype_auditdept")
#define CELLTYPE_AUDIT_STR				_T("celltype_audit")
#define CELLTYPE_CONFIRM_STR			_T("celltype_confirm")
#define CELLTYPE_DELIBERATIONDEPT_STR	_T("celltype_deliberationdept")
#define CELLTYPE_CUSTOM_STR				_T("celltype_custom")
#define CELLTYPE_COMPLIANCEUSER_STR		_T("celltype_complianceuser")
#define CELLTYPE_COMPLIANCEDEPT_STR		_T("celltype_compliancedept")
    */
    // 서명, 협조, 감사, 감사부, 특별협조, 심의부서
    if (field.startWith(Cell.SIGN)) {
      //
    }
  });
};
