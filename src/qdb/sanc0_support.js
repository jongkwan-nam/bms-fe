import StringUtils from '../utils/StringUtils';
import { getNodes, getText } from '../utils/xmlUtils';

export function one_by_one(objects_array, iterator, callback) {
  var start_promise = objects_array.reduce(function (prom, object, index) {
    return prom.then(function () {
      return iterator(object, index);
    });
  }, Promise.resolve()); // initial

  if (callback) {
    start_promise.then(callback);
  } else {
    return start_promise;
  }
}

export function transfile_url(TRID, fileName, convertHtm, useWasDRM) {
  var url;
  if (convertHtm) {
    url = PROJECT_CODE + '/com/hs/gwweb/appr/retrieveTRIDFile.act?TRID=' + TRID + '&ConvertHTM=true';
    if (fileName) {
      url += '&fileName=' + encodeURIComponent(fileName);
    }
  } else {
    url = PROJECT_CODE + '/com/hs/gwweb/appr/manageFileDwld.act?TRID=' + TRID;
    if (fileName) {
      url += '&fileName=' + encodeURIComponent(fileName);
    }
  }
  if (szKEY) {
    url += '&K=' + szKEY;
  }
  if (useWasDRM) {
    url += '&useWasDRM=' + useWasDRM;
  }
  url += '&_NOARG=' + new Date().getTime();
  return url;
}

export const EDITMODE_READONLY = 0; // ReadOnly 모드
export const EDITMODE_NORMAL = 1; // 일반편집 모드 (서식 작성기)
export const EDITMODE_USEFORM = 2; // 양식편집모드 (기안/결재기)
export const EDITMODE_DISTRIBUTE = 16; // 배포용 문서

export const DATATYPE_HTML = 1;
export const DATATYPE_TEXT = 2;
export const DATATYPE_UNION = 3;

export const CONVERT_TO_STRMARK = 1;
export const CONVERT_TO_ORIGINAL = 2;

export const CELL_CBODY = '본문';
export const CELL_FIXED_RECLIST = '고정수신처';

export const WORDTYPE_HWN = 0; // 아래아 한글
export const WORDTYPE_AWP = 1; // 아리랑 (Not used)
export const WORDTYPE_BFF = 2; // BizFlow Form
export const WORDTYPE_HWP2002 = 3; // 한글 2002
export const WORDTYPE_HUN = 4; // 훈민정음
export const WORDTYPE_HWPWEB = 5; // HWP WEB
export const WORDTYPE_TWE = 6; // TagFree Active Designer
export const WORDTYPE_HTML32 = 7; // HTML Editor
export const FORMTYPE_ONLY_ATTACH = 8;

// GetFieldList option용
const HWPFIELDCELL = 1; //셀에 부여된 필드 리스트만을 구한다. hwpFieldClickHere와는 함께 지정할 수 없다.
const HWPFIELDCLICKHERE = 2; //누름틀에 부여된 필드 리스트만을 구한다. hwpFieldCell과는 함께 지정할 수 없다.
const HWPFIELDSELECTION = 4; //셀렉션 내에 존재하는 필드 리스트를 구한다.
const HWPFIELDALL = 8; //셀, 누름틀 포함.

export const Capi = {
  putBodyFile: (bodyText, NoBuildMht, disableMouse, isLimited, isNotUnescape) => {},
  getUser: (userID) => {},
};

export function IMPL_RenameField(editorId, srcCellName, distCellName) {
  return HWP__RenameField(editor(editorId), HWP__WordFieldConverter(srcCellName, CONVERT_TO_STRMARK), HWP__WordFieldConverter(distCellName, CONVERT_TO_STRMARK), false);
}

export function IMPL_MoveToField(editorId, lpField, lpText, lpStart, lpMove, bMoveScreen) {
  var pADHelper = editor(editorId);
  var isDirty = IMPL_IsDocumentUpdated(editorId);
  var bText = lpText != 'code';
  var bStart = lpStart != 'end';
  var bSelect = lpMove == 'select';
  if (typeof lpMove == 'undefined') {
    bMoveScreen = true;
  }

  var bRet = HWP__MoveToField4Speed(pADHelper, lpField, bText, bStart, bSelect, bMoveScreen); //필드명 변환 필요없음
  IMPL_SetDocumentUpdated(editorId, isDirty);
  return bRet;
}

export function IMPL_PutFieldText(word_id, lpField, lpStr) {
  if (lpField == CELL_FIXED_RECLIST) {
    var color = 'white';
    IMPL_PutFieldTextColor(word_id, lpField, lpStr, color);
    return;
  }

  if (window.console) console.log('IMPL_PutFieldText lpField=' + lpField);

  var isDirty = IMPL_IsDocumentUpdated(word_id);
  var pADHelper = editor(word_id);
  if (!lpField || lpField.length == 0) return true;
  var hwpCtrl = pADHelper.GetControl();
  if (lpField.charAt(0) != '%' && !hwpCtrl.FieldExist(lpField)) lpField = '%' + lpField;

  if (lpStr && typeof lpStr !== 'string') {
    lpStr = lpStr.toString();
  }

  if (lpStr == null || lpStr == '') {
    if (lpField.indexOf('{{') > -1 && lpField.indexOf('}}') > -1) {
      DeleteFieldText(hwpCtrl, lpField);
    } else {
      var nCount = this.IMPL_GetFieldCount(word_id, lpField, 'cell');
      for (var i = 0; i < nCount; i++) {
        var fieldName = lpField + '{{' + i + '}}';
        DeleteFieldText(hwpCtrl, fieldName);
      }
    }
  } else {
    hwpCtrl.PutFieldText(lpField, lpStr);
  }
  IMPL_SetDocumentUpdated(word_id, isDirty);
  return true;
}

export function IMPL_PutFieldText4Speed(word_id, lpField, lpText, nDataType) {
  var isDirty = IMPL_IsDocumentUpdated(word_id);
  var pADHelper = editor(word_id);
  var ret = HWP__PutFieldText4Speed(pADHelper, lpField, lpText, nDataType);
  IMPL_SetDocumentUpdated(word_id, isDirty);
  return ret;
}

export function IMPL_GetFieldTextEx(editorId, strField) {
  var hwpCtrl = editor(editorId).GetControl();
  if (hwpCtrl == null) return null;
  if (!strField || strField.length == 0) {
    return '';
  }

  if (strField.charAt(0) != '%' && !hwpCtrl.FieldExist(strField)) strField = '%' + strField;
  return hwpCtrl.GetFieldText(strField);
}

export function IMPL_GetCellInfo(word_id, Name, lpCellInfo) {
  var pADHelper = editor(word_id);
  lpCellInfo = HWP__GetCellInfo(pADHelper, Name, lpCellInfo);
  return lpCellInfo;
}

export function IMPL_SetFieldFormControlType(editorId, cellName, val) {
  return true;
}

export function IMPL_SetCellFieldName(editorId, field) {
  const hwpCtrl = editor(editorId).GetControl();
  return hwpCtrl.SetCurFieldName(field, HWPFIELDCELL, '', '');
}

export function editor(editorId) {
  let editor = null;
  if ('editor1' === editorId) {
    editor = feMain.feEditor1;
  } else if ('editor2' === editorId) {
    editor = feMain.feEditor2;
  }
  return {
    /**
     *
     * @returns {hwpCtrl}
     */
    GetControl: () => {
      return editor?.hwpCtrl;
    },
  };
}

function HWP__MoveToField4Speed(pADHelper, lpField, bText, bStart, bSelect, bMoveScreen) {
  var bRet = false;
  var hwpCtrl = pADHelper.GetControl();

  if (hwpCtrl == null) return false;

  var oldEditMode = hwpCtrl.EditMode;
  if (!bStart) hwpCtrl.EditMode = EDITMODE_NORMAL;

  hwpCtrl.InitScan(0xff, 0x77, 0, 0, 0, 0);

  console.debug('hwpCtrl.MoveToFieldEx lpField=' + lpField + ' bText=' + bText + ' bStart=' + bStart + ' bSelect=' + bSelect + ' bMoveScreen=' + bMoveScreen);

  /*셀명 숨김시 hwpCtrl.MoveToField는 되고 
	hwpCtrl.MoveToFieldEx는 안되네
	*/
  if (!bSelect && bText && bStart && bMoveScreen) {
    //지정된 필드로 캐럿을 이동한 후 캐럿 위치로 화면을 이동한다.
    bRet = hwpCtrl.MoveToFieldEx(lpField, bText, bStart, bSelect);
  } else {
    //지정한 필드로 캐럿을 이동한다.
    bRet = hwpCtrl.MoveToField(lpField, bText, bStart, bSelect);
  }

  console.debug('hwpCtrl.MoveToFieldEx bRet=' + bRet);

  hwpCtrl.ReleaseScan();

  if (!bStart) hwpCtrl.EditMode = oldEditMode;
  return bRet;
}

function HWP__WordFieldConverter(strFieldName, sSwitch) {
  if (sSwitch == CONVERT_TO_STRMARK) {
    if (strFieldName.indexOf('{{') > 0) strFieldName = strFieldName.substring(0, strFieldName.indexOf('{{'));
    if (strFieldName.indexOf('}}') > 0) strFieldName = strFieldName.substring(0, strFieldName.indexOf('}}'));
  }
  return strFieldName;
}

function HWP__RenameField(pADHelper, Name, lpszNewCellName) {
  var hwpCtrl = pADHelper.GetControl();

  if (hwpCtrl == null) return false;
  if (hwpCtrl.FieldExist(Name)) {
    console.log('hwpCtrl.RenameField from ' + Name + ' lpszNewCellName=' + lpszNewCellName);
    hwpCtrl.RenameField(Name, lpszNewCellName);
  }

  return true;
}

function IMPL_IsDocumentUpdated(word_id) {
  var bRet = false;
  try {
    var pADHelper = editor(word_id);
    var hwpCtrl = pADHelper.GetControl();
    bRet = hwpCtrl.IsModified == 0 ? false : true; //	0 = 내용이 변하지 않음 //				1 = 내용이 변경되었음 //				2 = 내용이 변했지만, 자동 저장되었음
  } catch (e) {
    if (window.console) console.log(e);
  }
  return bRet;
}

export function IMPL_SetDocumentUpdated(word_id, isModified) {
  var pADHelper = editor(word_id);
  var hwpCtrl = pADHelper.GetControl();
  if (isModified) hwpCtrl.IsModified = 1;
  else hwpCtrl.IsModified = 0;
}

function IMPL_PutFieldTextColor(word_id, lpField, lpStr, color) {
  if (window.console) console.log('IMPL_PutFieldTextColor lpField=' + lpField + ' color=' + color);

  if (!color) color = 'black';
  var isDirty = IMPL_IsDocumentUpdated(word_id);
  var pADHelper = editor(word_id);
  if (!lpField || lpField.length == 0) return true;
  var hwpCtrl = pADHelper.GetControl();
  if (lpField.charAt(0) != '%' && !hwpCtrl.FieldExist(lpField)) lpField = '%' + lpField;

  if (lpStr && typeof lpStr !== 'string') {
    lpStr = lpStr.toString();
  }

  if (lpStr == null || lpStr == '') {
    if (lpField.indexOf('{{') > -1 && lpField.indexOf('}}') > -1) {
      DeleteFieldText(hwpCtrl, lpField);
      let shape = { color: color };
      IMPL_SetCharShape(word_id, lpField, shape);
    } else {
      var nCount = this.IMPL_GetFieldCount(word_id, lpField, 'cell');
      for (var i = 0; i < nCount; i++) {
        var fieldName = lpField + '{{' + i + '}}';
        DeleteFieldText(hwpCtrl, fieldName);
      }
    }
  } else {
    let shape = { color: color };
    IMPL_SetCharShape(word_id, lpField, shape);
    hwpCtrl.PutFieldText(lpField, lpStr);
  }
  IMPL_SetDocumentUpdated(word_id, isDirty);
}

function DeleteFieldText(hwpCtrl, field) {
  console.log('DeleteFieldText field=' + field);

  var oldEditMode = hwpCtrl.EditMode;
  hwpCtrl.EditMode = EDITMODE_NORMAL;

  if (selectFieldContent(hwpCtrl, field)) {
    hwpCtrl.Run('Erase');
    hwpCtrl.MoveToField(field);
  }

  hwpCtrl.EditMode = oldEditMode;

  return true;
}

// 필드의 내용 선택
function selectFieldContent(hwpCtrl, field) {
  if (hwpCtrl.MoveToField(field)) {
    //캐럿이 위치한 필드의 상태 정보 0 필드없음.1 셀, 2 누름틀, 4 글상자
    if (hwpCtrl.CurFieldState & 2) {
      hwpCtrl.MoveToField(field, true, true, true);

      var selectedPos = hwpCtrl.GetSelectedPos();
      if (selectedPos) {
        if (window.console) {
          console.log('startPara=' + selectedPos.spara + ', startPos=' + selectedPos.spos + ', endPara=' + selectedPos.epara + ', endPos=' + selectedPos.epos);
        }
        var ret = hwpCtrl.SelectText(selectedPos.spara, selectedPos.spos, selectedPos.epara, selectedPos.epos);
        if (window.console) console.log('SelectText result:', ret);
      }
      /*slist : 설정된 블록의 시작 리스트 아이디.
			spara : 설정된 블록의 시작 문단 아이디.
			spos : 설정된 블록의 문단 내 시작 글자 단위 위치. 
			elist : 설정된 블록의 끝 리스트 아이디.
			epara : 설정된 블록의 끝 문단 아이디.
			epos : 설정된 블록의 문단 내 끝 글자 단위 위치. 
			
			// 캐럿의 시작 위치 기억
			var docInfo = IMPL_GetDocumentInfo(hwpCtrl, false);
			var startPara = docInfo.Item("CurPara");
			var startPos = docInfo.Item("CurPos");

			// 캐럿의 마지막 위치 기억
			docInfo = IMPL_GetDocumentInfo(hwpCtrl, false);
			var endPara = docInfo.Item("CurPara");
			var endPos = docInfo.Item("CurPos");
			*/
    } else {
      hwpCtrl.Run('SelectAll');
    }
    return true;
  } else return false;
}

// 글자 속성 변경
// field 명이 지정되어 있으면 filed 내의 전체 글자의 속성을 변경하고,
// 그렇지 않으면 현재 블럭이 잡힌 부분의 글자 속성을 변경
// HSO-11208 field index 고려
function IMPL_SetCharShape(word_id, field, shape) {
  var hwpCtrl = editor(word_id).GetControl();

  if (word_id == null || shape == null) return;

  var isDirty = IMPL_IsDocumentUpdated(word_id);

  //필드명이 지정되어 있는 경우 필드 내용을 select
  if (field && field.length > 0) {
    // 인덱스가 있는지 여부에 따라
    var matched = field.match(/{{|}}/g);
    if (matched != null && matched.length == 2) {
      // 인덱스가 있으면, 해당 필드만 처리
      hwpCtrl.MoveToField(field, true, true, true);
      _setCharShape(hwpCtrl, shape);
    } else {
      // 인덱스가 없으면, loop 돌면서 전체 처리
      var fieldCount = this.IMPL_GetFieldCount(word_id, field, 'cell');
      for (var i = 0; i < fieldCount; i++) {
        hwpCtrl.MoveToField(field + '{{' + i + '}}', true, true, true);
        _setCharShape(hwpCtrl, shape);
      }
    }
  } else {
    // 필드명 없으면, 현재 선택된 부분만 적용
    _setCharShape(hwpCtrl, shape);
  }

  IMPL_SetDocumentUpdated(word_id, isDirty);
}

function _setCharShape(hwpCtrl, shape) {
  var action = hwpCtrl.CreateAction('CharShape');
  var set = action.CreateSet();
  action.GetDefault(set);
  // color
  if (shape.color != null) {
    var colorCode = 0x000000;
    if (shape.color == 'blue') colorCode = 0xff0000;
    else if (shape.color == 'green') colorCode = 0x00ff00;
    else if (shape.color == 'red') colorCode = 0x0000ff;
    else if (shape.color == 'white') colorCode = 0xffffff;
    set.SetItem('TextColor', colorCode);
    //alert("[vect3] colorCode = " + colorCode);
  }
  // height
  if (shape.height != null) {
    set.SetItem('Height', shape.height);
    //alert("[vect3] Height = " + shape.height);
  }
  // bold
  if (shape.bold != null) set.SetItem('Bold', shape.bold);

  action.Execute(set);

  // 블럭 해제
  hwpCtrl.Run('Cancel');
}

function HWP__PutFieldText4Speed(pADHelper, lpField, lpText, nDataType) {
  var hwpCtrl = pADHelper.GetControl();
  if (hwpCtrl == null) return false;
  hwpCtrl.PutFieldText(lpField, lpText);
  return true;
}

function HWP__GetCellInfo(pADHelper, Name, lpCellInfo) {
  //
  var hwpCtrl = pADHelper.GetControl();

  if (hwpCtrl == null) return lpCellInfo;

  var bText = true;
  var lpStart = 'end';
  var lpMove = 'move';
  var bStart = true; //lpStart!= "end";
  var bSelect = false; //lpMove=="select";

  var bRet;

  bRet = HWP__MoveToField4Speed(pADHelper, Name, bText, bStart, bSelect);

  if (!bRet) {
    return false;
  }

  var tableSet = hwpCtrl.CellShape;
  if (!tableSet) return lpCellInfo;

  var cell = tableSet.Item('Cell');

  var pt = {};
  pt.x = cell.Item('Width');
  pt.y = cell.Item('Height');

  if (pt.x == 0 || pt.y == 0) {
    return false;
  }

  IMPL_GetCurPageNum(pADHelper);
  lpCellInfo = { cellName: Name };
  lpCellInfo.cx = CONV_HWP_POINT(pt.x);
  lpCellInfo.cy = CONV_HWP_POINT(pt.y);
  return lpCellInfo;
}

function IMPL_GetCurPageNum(pADHelper) {
  return HWP__GetCurPageNo(pADHelper);
}

function HWP__GetCurPageNo(pADHelper) {
  //
  var hwpCtrl = pADHelper.GetControl();
  if (hwpCtrl == null) return 0;
  var act = hwpCtrl.CreateAction('DocumentInfo');
  var set = act.CreateSet();
  act.GetDefault(set);
  set.SetItem('DetailInfo', 1);
  act.Execute(set);

  var DetailCurPage = 0;
  if (set.ItemExist('CurPara')) {
    DetailCurPage = set.Item('DetailCurPage');
  }

  return DetailCurPage;
}

// HWP 단위(1/100 포인트)를 포인트 단위로 변환
function CONV_HWP_POINT(val) {
  return parseInt(val / 100);
}

export function toHash(text) {
  const hash = new Map();
  text
    .split(' ')
    .filter((t) => StringUtils.isNotBlank(t))
    .forEach((t) => hash.set(t, true));
  return hash;
}

//같은부서로 여러번 병렬협조 보낼 수도 있으니 상태도 체크
export function isNowStatusDeptAgreeP(draftHox, deptID) {
  if (!draftHox) {
    return false;
  }

  const participantNodes = getNodes(draftHox, 'approvalFlow participant');
  for (let i = 0; i < participantNodes.length; i++) {
    const participant = participantNodes[i];

    if (getText(participant, 'validStatus') === 'revoked') continue;

    const at = getText(participant, 'approvalType');
    const as = getText(participant, 'approvalStatus');
    const id = getText(participant, 'ID');
    if (at === 'dept_agree_p' && id === deptID && as === 'partapprstatus_now') {
      return true;
    }
  }
  return false;
}
