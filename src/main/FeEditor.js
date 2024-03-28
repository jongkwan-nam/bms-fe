import ColorUtils from '../utils/ColorUtils';
import { getContentCellName } from '../utils/HoxUtils';
import StringUtils from '../utils/StringUtils';
import { HoxEventType, dispatchHoxEvent, getNode, getNodes, setText } from '../utils/xmlUtils';
import Cell from './CellNames';
import './FeEditor.scss';
import { FeMode, getFeMode } from './FeMode';
import { HWPFIELDALL, HWPFIELDCELL, HWPFIELDCLICKHERE, HWPFIELDCOUNT, HWPFIELDNUMBER, HWPFIELDPLAIN } from './const/CommonConst';
import FeHwpCtrl from './hwp/FeHwpCtrl';

const TIME_LABEL_INIT = 'Editor-init-';
const TIME_LABEL_OPEN = 'Editor-open-';

/**
 * 웹한글 에디터
 *
 * - 에디터를 컨트롤하기 위한 기능만 정의
 * - 결재 로직은 포함시키지 않는다
 * - 동일 인터페이스 차원에서 외부에서 호출되는 함수만 public, 그외 함수는 private. [Polaris, HTML]
 * - 콜백구조 API는 FeHwpCtrl에 async 구조로 변경하여 작성
 */
export default class FeEditor extends FeHwpCtrl {
  active = false;
  hwpCtrl = null;
  contentCount = 1;
  detectTitle = true;
  fieldList = [];
  cellCount = {
    pos: 0,
    sign: 0,
    agreePos: 0,
    agreeSign: 0,
  };

  constructor(id) {
    super();
    id && this.setAttribute('id', id);
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './main.css');

    const wrapper = document.createElement('iframe');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());

    this.shadowRoot.append(link, wrapper);
  }

  /**
   * 에디터 로딩
   *
   * 로딩 완료까지 대기
   */
  async init() {
    this.id = this.getAttribute('id');

    console.time(TIME_LABEL_INIT + this.id);

    return new Promise((resolve, reject) => {
      this.shadowRoot.querySelector('iframe').src = './hwpctrlframe.html?id=' + this.id;

      const timer = setInterval(() => {
        if (this.hwpCtrl !== null) {
          console.timeEnd(TIME_LABEL_INIT + this.id);

          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * hwpctrlframe.html 에서 에디터 빌드가 완료되면 호출되는 콜백
   *
   * @param {HwpCtrl} hwpCtrl
   */
  buildWebHwpCtrlCallback(hwpCtrl, hwpServerUrl) {
    this.hwpCtrl = hwpCtrl;
    this.hwpServerUrl = hwpServerUrl;
    this.active = true;
  }

  show() {
    this.classList.add('show');
  }

  hide() {
    this.classList.remove('show');
  }

  /**
   * - hox 이벤트 리스너 추가
   * - 제목 변경 감지 -> hoxEvent 발행
   */
  start() {
    feMain.hox.addEventListener(HoxEventType.CONTENT, async (e) => {
      console.info('hoxEvent listen', e.type, e.detail);
      // switch (e.detail.type) {
      //   case 'add': {
      //     // 안 추가 이벤트
      //     await this.addContent();
      //     break;
      //   }
      //   case 'delete': {
      //     // 안 삭제 이벤트
      //     const deletedContentNumbers = e.detail.value;
      //     await this.deleteContent(...deletedContentNumbers);
      //     break;
      //   }
      //   case 'select': {
      //     // 안 선택 이벤트
      //     await this.selectContent(e.detail.value);
      //     break;
      //   }
      //   case 'move': {
      //     // 안 이동 이벤트
      //     let { from, to } = e.detail.value;
      //     await this.moveContent(from, to);
      //     break;
      //   }
      //   default:
      //     throw new Error('undefinded detatil.type: ' + e.detail.type);
      // }
    });

    const feMode = getFeMode();
    if ([FeMode.DRAFT, FeMode.KYUL].includes(feMode)) {
      // 제목 변경 감지. 에디터 밖으로 나가면 작동
      this.parentElement.addEventListener('mouseleave', (e) => {
        // console.debug('fe-editor', 'parent', this.parentElement, e.type, 'detectTitle', this.detectTitle, 'contentCount', this.contentCount);
        //
        if (this.detectTitle) {
          //
          let changed = false;
          for (let i = 0; i < this.contentCount; i++) {
            // 제목셀
            const titleCellName = getContentCellName(Cell.DOC_TITLE, i + 1);
            const titleCellText = this.hwpCtrl.GetFieldText(titleCellName);

            // hox 제목
            let contentTitleNode = getNode(feMain.hox, 'docInfo content', i).querySelector('title');
            if (titleCellText !== contentTitleNode.textContent) {
              setText(contentTitleNode, null, titleCellText, true);
              console.log('setTitle', titleCellName, titleCellText);
              changed = true;

              if (i === 0) {
                setText(feMain.hox, 'docInfo title', titleCellText, true);
              }
            }
          }
          if (changed) {
            dispatchHoxEvent(feMain.hox, 'docInfo', HoxEventType.TITLE, 'change', null);
          }
        }
      });
    }
  }

  /**
   * 발송처리: stamptable.hwp 로딩. 재사용을 위해
   */
  async loadStampTable() {
    //
    await this.openOnly(`${location.origin}${PROJECT_CODE}/js/com/hs/gwweb/appr/editor/stamptable.hwp`, 'HWP');
    this.stamptableHwpjson = await super.getTextFile('JSON');
    console.debug('loadStampTable', this.stamptableHwpjson);
  }

  /**
   * 문서 열기
   * 열기 성공 후 문서내 필드값 등 조사한다.
   * @param {string | Blob} docUrl
   * @returns
   */
  async open(docUrl, format = '', arg = 'imagedownsize') {
    console.time(TIME_LABEL_OPEN + this.id);
    await super.openDocument(docUrl, format, arg);
    console.timeEnd(TIME_LABEL_OPEN + this.id);

    this.resolveDocInfo();
  }

  /**
   * 문서 열기
   *
   * 요약전, 감사의견서 등에서 문서만 열 경우 사용
   * @param {string | Blob} docUrl
   * @param {string} format
   * @param {string} arg
   */
  async openOnly(docUrl, format = '', arg = 'imagedownsize') {
    console.time(TIME_LABEL_OPEN + this.id);
    await super.openDocument(docUrl, format, arg);
    console.timeEnd(TIME_LABEL_OPEN + this.id);
  }

  /**
   * hwpjson으로 문서열기
   * @param {string} jsonData
   */
  async openByJSON(jsonData) {
    this.hwpCtrl.Clear(1);
    let res = await super.insert(jsonData, 'JSON');
    console.log('openByJSON', res);
    if (!res.result) {
      throw new Error('openByJSON Error');
    }
  }

  /**
   * 문서에서 필요한 정보를 구한다.
   *
   * - fieldList: 전체 필드명 목록
   * - cellCount: 서명 관련 셀 갯수. 직위,서명,협조 등
   */
  resolveDocInfo() {
    // 필드 정보 구하기
    this.fieldList = [];
    this.fieldList.push(...this.hwpCtrl.GetFieldList(0, 1).split(String.fromCharCode(2)));
    this.fieldList.push(...this.hwpCtrl.GetFieldList(0, 2).split(String.fromCharCode(2)));
    console.log('fieldList', this.fieldList);

    // 셀(직위, 서명, 협조 등) 카운트 구하기
    this.cellCount = {
      pos: this.fieldList.filter((field) => field.startsWith(Cell.POS + '.')).length,
      sign: this.fieldList.filter((field) => field.startsWith(Cell.SIGN + '.')).length,
      agreePos: this.fieldList.filter((field) => field.startsWith(Cell.AGREE_POS + '.')).length,
      agreeSign: this.fieldList.filter((field) => field.startsWith(Cell.AGREE_SIGN + '.')).length,
      budgetControlPos: this.fieldList.filter((field) => field.startsWith(Cell.BUDGET_CONTROL_POS + '.')).length,
      budgetControlSign: this.fieldList.filter((field) => field.startsWith(Cell.BUDGET_CONTROL_SIGN + '.')).length,
      budgetPlannerPos: this.fieldList.filter((field) => field.startsWith(Cell.BUDGET_PLANNER_POS + '.')).length,
      budgetPlannerSign: this.fieldList.filter((field) => field.startsWith(Cell.BUDGET_PLANNER_SIGN + '.')).length,
    };
    console.log('cellCount', this.cellCount);
  }

  /**
   * 필드의 내용을 채운다
   *
   * - 입력되어 있는 내용은 지워진다.
   * - 글자 모양은 필드에 지정해 놓은 글자모양을 따라간다.
   * - 존재하지 않는 필드는 무시한다.
   * @param {string} name
   * @param {string} text
   * @param {number} textColor 색상값. 0xffffff 로 표현되는 rgb형식의 숫자값
   * @param {number} height 높이. HWPUNIT 단위
   * @param {string} faceNameHangul 폰트
   * @param {number} underlineType 밑줄. 0: none, 1: bottom, 2: center, 3: top
   */
  putFieldText(name, text, textColor = null, height = null, faceNameHangul = null, underlineType = null, bold = false) {
    console.debug('putFieldText', name, text, textColor, height, faceNameHangul, underlineType, bold);
    if (StringUtils.isBlank(text)) {
      this.hwpCtrl.PutFieldText(name, String.fromCharCode(2));
      return;
    } else {
      this.hwpCtrl.PutFieldText(name, text);
    }

    if (textColor !== null || height !== null || faceNameHangul !== null || underlineType !== null || bold) {
      this.moveToField(name, true, true, true);
      this.actionCharShape(textColor, height, faceNameHangul, underlineType, bold);
    }
  }

  appendFieldText(name, text, textColor = null, height = null, faceNameHangul = null, underlineType = null, bold = null) {
    console.debug('appendFielldText', name, text, textColor, height, faceNameHangul, underlineType, bold);
    // 필드의 끝으로 이동
    this.moveToField(name, true, false, false);
    // 삽입될 시작 위치 기억
    const startInfo = this.getDocumentInfo(false);
    // 텍스트 삽입
    const insertAction = this.hwpCtrl.CreateAction('InsertText');
    const set = insertAction.CreateSet();
    insertAction.GetDefault(set);
    set.SetItem('Text', text);
    insertAction.Execute(set);
    // 삽입된 끝 위치 기억
    const endInfo = this.getDocumentInfo(false);
    // shape 정보가 있으면
    if (textColor !== null || height !== null || faceNameHangul !== null || underlineType !== null || bold !== null) {
      // 삽입된 텍스트 블럭 설정
      this.hwpCtrl.SelectText(startInfo.Item('CurPara'), startInfo.Item('CurPos'), endInfo.Item('CurPara'), endInfo.Item('CurPos'));
      this.actionCharShape(textColor, height, faceNameHangul, underlineType, bold);
    }
  }

  #insertText(text) {
    const insertAction = this.hwpCtrl.CreateAction('InsertText');
    const set = insertAction.CreateSet();
    insertAction.GetDefault(set);
    set.SetItem('Text', text);
    insertAction.Execute(set);
  }

  actionCharShape(textColor = null, height = null, faceNameHangul = null, underlineType = null, bold = null) {
    const hwpAction = this.hwpCtrl.CreateAction('CharShape');
    const hwpSet = hwpAction.CreateSet();
    hwpAction.GetDefault(hwpSet);
    if (textColor !== null) {
      hwpSet.SetItem('TextColor', ColorUtils.colorNameToHex(textColor));
    }
    if (height !== null) {
      hwpSet.SetItem('Height', height);
    }
    if (faceNameHangul !== null) {
      hwpSet.SetItem('FaceNameHangul', faceNameHangul);
    }
    if (underlineType !== null) {
      hwpSet.SetItem('UnderlineType', underlineType);
    }
    if (bold !== null) {
      hwpSet.SetItem('Bold', bold);
    }

    hwpAction.Execute(hwpSet);
    super.runCancel();
  }

  /**
   * 화면 확대 종류. 0 = 사용자 정의, 1 = 쪽 맞춤, 2 = 폭 맞춤
   * @param {number} ratio
   */
  setViewZoom(ratio) {
    let act = this.hwpCtrl.CreateAction('ViewZoom');
    let vp = this.hwpCtrl.CreateSet('ViewProperties');
    act.GetDefault(vp);
    if (ratio < 3) {
      vp.SetItem('ZoomType', ratio);
    } else {
      vp.SetItem('ZoomType', 0);
      vp.SetItem('ZoomRatio', ratio);
    }
    this.hwpCtrl.ViewProperties = vp;
    act.Execute(vp);
  }

  /**
   * 리본 메뉴 접기/펴기
   * @param {boolean} force
   */
  foldRibbon(force) {
    this.hwpCtrl.FoldRibbon(force);
  }

  /**
   * 읽기 전용 모드
   * @param {boolean} force
   */
  setReadMode(force) {
    const option = force ? 1 : 0;
    this.hwpCtrl.SetToolBar(option, 'TOOLBAR_MENU'); // 메뉴
    this.hwpCtrl.SetToolBar(option, 'TOOLBAR_STANDARD'); // 보기 > 도구상자 > 서식
    this.hwpCtrl.ShowRibbon(!force); // 보기 > 도구상자 > 기본
    this.hwpCtrl.ReadOnlyMode = force; // 문서를 읽기 전용 모드로
    this.hwpCtrl.ShowCaret(!force); // 캐럿 숨기기
  }

  /**
   * 편집 모드를 변경한다.
   *
   * @param {number} mode 편집모드
   * -  0: EDITMODE_READONLY   읽기 전용
   * -  1: EDITMODE_NORMAL     일반 편집 모드
   * -  2: EDITMODE_USEFORM    양식 모드. Cell과 누름틀 중 양식 모드에서 편집 가능 속성을 가진것만 편집 가능
   * - 16: EDITMODE_DISTRIBUTE 배포용 문서(SetEditMode로 지정 불가능)
   */
  setEditMode(mode) {
    this.hwpCtrl.EditMode = mode;
  }

  /**
   * 전체 문서를 복사한다
   * @param {string} format
   * @returns
   */
  async copyDocument(format) {
    // this.setEditMode(1);
    super.toggleViewOptionCtrkMark(true);
    const text = await super.getTextFile(format);
    super.toggleViewOptionCtrkMark(false);
    // this.setEditMode(2);
    console.debug('copyDocument', format);
    return text;
  }

  /**
   * 안의 내용 복사
   * @param {number} contentNumber
   * @param {string} format
   * @returns
   */
  async copyContent(contentNumber, format) {
    this.setEditMode(1);
    super.toggleViewOptionCtrkMark(true);
    const rect = super.getBoundingContentRect(contentNumber);
    this.hwpCtrl.SelectText(rect.sPara, rect.sPos, rect.ePara, rect.ePos);
    const text = await super.getTextFile(format, 'saveblock');
    super.toggleViewOptionCtrkMark(false);
    this.setEditMode(2);
    console.debug('copyContent', contentNumber, format);
    return text;
  }

  async insertContent(jsonData) {
    this.hwpCtrl.Clear(1);
    let res = await super.insert(jsonData, 'JSON');
    console.debug('insertContent', res);
    if (!res.result) {
      throw new Error('insertContent Error');
    }
  }

  // async insert(url, format, arg) {
  //   let res = await super.insert(url, format, arg);
  //   console.debug('insert', res);
  //   if (!res.result) {
  //     throw new Error('insert Error. url=' + url + ' format=' + format);
  //   }
  // }

  /**
   * 안 추가
   *
   * hox는 FeContent에서 추가되어 있다
   */
  async addContent() {
    console.time('addContent');
    this.detectTitle = false;

    this.setEditMode(1);

    this.contentCount = getNodes(feMain.hox, 'docInfo content').length;
    console.log('addContent ', this.contentCount);
    //
    super.toggleViewOptionCtrkMark(true);

    const rect = super.getBoundingContentRect(1);

    this.hwpCtrl.SelectText(rect.sPara, rect.sPos, rect.ePara, rect.ePos);

    let jsonData = await super.getTextFile('JSON', 'saveblock');

    super.runCancel();

    await super.run('MoveDocEnd');
    await super.run('BreakPage');

    this.hwpCtrl.MovePos(5, 0, 0); // 현재 리스트의 끝

    let res = await super.insert(jsonData, 'JSON');

    // 셀명 변경
    super.reAssignContentCellName();

    // doccfg.baseBodyContent 옵션 처리
    // 1: 1안의 본문복사 (default), 0: 빈 본문, -1: 추가전의 마지막 안의 본문 복사
    switch (parseInt(doccfg.baseBodyContent)) {
      case 1: {
        // 1안 전체를 복사했으므로 do nothing
        break;
      }
      case 0: {
        // 결재제목, 본문 내용 삭제
        [Cell.DOC_TITLE, Cell.CBODY].forEach((cellName) => {
          this.putFieldText(cellName + '_' + this.contentCount, '');
        });
        break;
      }
      case -1: {
        // n-1 안의 본문 복사. 2안이라면 복사할 필요 없음
        // TODO 여러번 수행라면 오동작
        if (this.contentCount > 2) {
          // 제목
          let title = this.hwpCtrl.GetFieldText(Cell.DOC_TITLE + '_' + (this.contentCount - 1));
          this.hwpCtrl.PutFieldText(Cell.DOC_TITLE + '_' + this.contentCount, title);

          // 본문
          this.moveToField(Cell.CBODY + '_' + (this.contentCount - 1), true, true, true);
          let bodyText = await super.getTextFile('JSON', 'saveblock');

          this.moveToField(Cell.CBODY + '_' + this.contentCount, true, true, true);
          await super.run('Erase');

          let ret = await super.setTextFile(bodyText, 'JSON', 'insertfile');
        }
        break;
      }
    }

    super.toggleViewOptionCtrkMark(false);

    this.setEditMode(2);

    this.detectTitle = true;
    console.timeEnd('addContent');
  }

  /**
   * 안 삭제
   * - hox content는 FeContent에서 삭제되어 있다
   *
   * ref) batchDraft.js #deleteHwpBody
   * @param  {...any} contentNumbers
   */
  async deleteContent(...contentNumbers) {
    console.time('deleteContent');
    this.detectTitle = false;

    this.setEditMode(1);

    super.toggleViewOptionCtrkMark(true);
    for (const contentNumber of contentNumbers.reverse()) {
      // 발신명의 셀을 기준으로 이전 안의 끝과 현재 안의 끝을 찾아서 삭제
      console.log('deleteContent', contentNumber);

      const prevRect = super.getBoundingContentRect(contentNumber - 1);
      const currRect = super.getBoundingContentRect(contentNumber);

      this.hwpCtrl.SelectText(prevRect.ePara, prevRect.ePos, currRect.ePara, currRect.ePos);
      await super.run('Erase');
    }
    // 셀_n 조정
    /* 삭제전 총 6안일때, 안 번호를 배열 [1, 2, 3, 4, 5, 6]로 만들고, 삭제한 안 [3, 5] 번호 빼서
       남은 [1, 2, 4, 6] 배열로 인덱스와 값의 관계가 틀어지는 걸로 찾아
       안 번호 재정렬
     */
    const wholeContentNumbers = Array.from({ length: this.contentCount }, (_, i) => i + 1); // [1,2,3,4,5,6]
    const remainContentNumners = wholeContentNumbers.filter((n) => !contentNumbers.includes(n)); // [1,2,4,6]
    remainContentNumners.forEach((n, i) => {
      // 세번째 루프에서 n(4), i(2) 이면, n(4) 안을 i(2) + 1 = 3안으로 변경
      if (n - i !== 1) {
        super.renameContentCellName(n, i + 1);
      }
    });
    this.contentCount = getNodes(feMain.hox, 'docInfo content').length; // 뻬고 남은 안 번호

    super.toggleViewOptionCtrkMark(false);

    this.setEditMode(2);

    this.detectTitle = true;
    console.timeEnd('deleteContent');
  }

  /**
   * 안 선택. 화면을 이동한다
   *
   * @param {number} contentNumber
   */
  async selectContent(contentNumber) {
    // 안번호의 제목셀을 찾고, 현재 페이지를 구하여 스크롤 이동한다.
    const cellName = getContentCellName(Cell.DOC_TITLE, contentNumber);
    console.debug('selectContent', contentNumber, cellName);

    const ret1 = this.moveToFieldEx(cellName, true, false, false);

    // TODO
    // await super.run('MovePageBegin');
  }

  async moveContent(from, to) {
    console.time('moveContent');
    this.detectTitle = false;

    console.log('move', from, to);

    this.detectTitle = true;
    console.timeEnd('moveContent');
  }

  /**
   * 서명하기
   *
   * @param {string} cellName 셀명
   * @param {string} text 날짜 텍스트
   * @param {URL} url 서명 이미지 url
   */
  async doSign(cellName, text, url) {
    this.setEditMode(1);

    // doccfg.signShowSignerDataAlign: 서명칸에 날짜 표시(서명일자) 위치 설정. [ top : 서명 위 (default) ,  bottom : 서명 아래 ]

    const contentCount = getNodes(feMain.hox, 'docInfo content').length;
    for (let i = 0; i < contentCount; i++) {
      const name = `${cellName}{{${i}}}`;

      this.putFieldText(name, text, 0x000000);

      this.moveToField(name, true, true, true);
      await super.run('ParagraphShapeAlignCenter');

      if (doccfg.signShowSignerDataAlign === 'top') {
        this.hwpCtrl.MovePos(23); // moveEndOfLine
      } else {
        this.hwpCtrl.MovePos(22); // moveStartOfLine
      }

      await super.insertPicture(url, true, 3, false, false, 0);
    }

    this.setEditMode(2);
    // URL.revokeObjectURL(url);
    console.debug('doSign', cellName, text, url);
  }

  /**
   * 관인/부서장인 날인
   *
   * @param {string} url 관인 이미지 URL
   */
  async doSealStamp(url, stampWidth, stampHeight) {
    //
    this.resolveDocInfo();

    this.setEditMode(1);
    super.toggleViewOptionCtrkMark(true);

    this.putFieldText(Cell.SEAL_STAMP, '');
    this.putFieldText(Cell.SEAL_OMISSION, '');

    const existSealStamp = this.existField(Cell.SEAL_STAMP);
    console.log('existSealStamp', existSealStamp);
    if (!existSealStamp) {
      // TODO 안이 여러개 있을 경우  추가 작업 필요
      const ret = this.moveToField(Cell.SENDERNAME);
      // this.#insertText('발신명의위치');
      // await new Promise((resolve) => setTimeout(() => resolve(true), 1000));

      console.log('moveToField(Cell.SENDERNAME)', ret, this.hwpCtrl.GetCurFieldName(1));
      // 발신명의로 이동
      this.hwpCtrl.MovePos(24, null, null);
      // this.#insertText('발신명의 표 탈출');

      // await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
      this.hwpCtrl.MovePos(23, null, null);
      // this.#insertText('줄 끝으로');

      // await new Promise((resolve) => setTimeout(() => resolve(true), 1000));

      // await super.run('MoveDocEnd');
      await this.insert(`${location.origin}${PROJECT_CODE}/js/com/hs/gwweb/appr/editor/stamptable.hwp`, 'HWP');

      // await this.insert(this.stamptableHwpjson, 'JSON');
    }

    const existSenderName = this.existField(Cell.SENDERNAME);
    if (!existSenderName) {
      throw new Error('Error: not found cell ' + Cell.SENDERNAME);
    }

    // this.moveToField(Cell.SEAL_STAMP, true, true, false);
    // await super.run('MoveLeft');

    this.moveToField(Cell.SEAL_STAMP, true, true, false);

    if (stampWidth && stampHeight) {
      await super.insertPicture(url, true, 1, false, false, 0, stampWidth, stampHeight);
    } else {
      await super.insertPicture(url, true, 0, false, false, 0);
    }

    // 날인된 도장의 위치 이동
    // super.toggleViewOptionCtrkMark(true);

    const senderNameCellInfo = super.getCellInfo(Cell.SENDERNAME);
    const senderNameTableInfo = super.getTableInfo(Cell.SENDERNAME);
    const sealStampTableInfo = super.getTableInfo(Cell.SEAL_STAMP);

    this.moveToField(Cell.SENDERNAME, true, true, false);

    let yPos = senderNameTableInfo.Item('Height') - (sealStampTableInfo.Item('Height') + senderNameCellInfo.Item('Height')) / 2;
    let xPos = senderNameTableInfo.Item('HorzOffset') + (senderNameTableInfo.Item('Width') - sealStampTableInfo.Item('Width')) / 2;

    const senderNameText = this.hwpCtrl.GetFieldText(Cell.SENDERNAME);
    if (StringUtils.isBlank(senderNameText)) {
      throw new Error('발신명의가 비어 있습니다.');
    }

    let faceName = this.hwpCtrl.CharShape.Item('FaceNameHangul');
    if (StringUtils.isBlank(faceName)) {
      faceName = '굴림';
    }
    const height = this.hwpCtrl.CharShape.Item('Height');
    const fontSize = Math.round(height / 100);

    let textSize = 0;
    for (var i = 0; i < senderNameText.length; i++) {
      if ((senderNameText.charCodeAt(i) & 0xff00) !== 0) {
        textSize += 2;
      } else {
        textSize += 1;
      }
    }

    const charOffset = (textSize > 34 ? 34 : textSize) / 2 - 1;
    const fontWidth = fontSize * 50;
    let horizontalAdjust = charOffset * fontWidth;

    if (fontWidth > senderNameCellInfo.Item('Width')) {
      xPos += senderNameCellInfo.Item('Width') / 2;
    } else {
      xPos += horizontalAdjust;
    }

    const para = this.hwpCtrl.ParaShape;
    para.SetItem('AlignType', 3);
    this.hwpCtrl.ParaShape = para;

    this.moveToFieldEx(Cell.SEAL_STAMP);
    const hwpAction = this.hwpCtrl.CreateAction('TablePropertyDialog');
    const hwpSet = hwpAction.CreateSet();
    hwpAction.GetDefault(hwpSet);

    hwpSet.SetItem('HorzRelTo', 1); //가로 위치의 기준. 		0 = 종이 영역(Paper) 		1 = 쪽 영역(Page) 		2 = 다단 영역(Column) 		3 = 문단 영역(Paragraph) 		(TreatAsChar가 FALSE일 경우에만 사용된다)
    hwpSet.SetItem('VertRelTo', 1);
    hwpSet.SetItem('HorzAlign', 0);
    hwpSet.SetItem('VertAlign', 2);
    hwpSet.SetItem('HorzOffset', parseInt(xPos)); //HorzRelTo와 HorzAlign을 기준으로 한 X축 위치 오프셋 값. HWPUNIT 단위.
    hwpSet.SetItem('VertOffset', Math.round(yPos));
    hwpSet.SetItem('TreatAsChar', 0);
    hwpSet.SetItem('TextWrap', 2);
    /*
      그리기 개체와 본문 사이의 배치 방법.
      0 = 어울림(Square)
      1 = 자리 차지(Top & Bottom)
      2 = 글 뒤로(Behind Text)
      3 = 글 앞으로(In front of Text)
      4 = 경계를 명확히 지킴(Tight) - 현재 사용안함
      5 = 경계를 통과함(Through) - 현재 사용안함
      (TreatAsChar가 FALSE일 경우에만 사용된다)
    */
    hwpSet.SetItem('FlowWithText', 1);
    hwpSet.Item('ShapeTableCell')?.SetItem('VertAlign', 1);

    hwpAction.Execute(hwpSet);

    super.toggleViewOptionCtrkMark(false);
    this.setEditMode(2);

    console.debug('doSealStamp', url);
  }

  async doSkipStamp(url) {
    //
    this.putFieldText(Cell.SEAL_STAMP, '');
    this.putFieldText(Cell.SEAL_OMISSION, '');

    this.moveToField(Cell.SEAL_OMISSION, true, true, false);

    super.toggleViewOptionCtrkMark(true);
    await super.insertPicture(url, true, 3, false, false, 0);
    super.toggleViewOptionCtrkMark(false);

    console.debug('doSkipStamp', url);
  }

  /**
   * 서버로 저장하고, 다운로드 가능한 URL 반환
   * @param {string} fileName
   * @param {string} format
   * @param {string} arg
   * @returns 다운로드 URL
   */
  async saveServer(fileName = '', format = 'HWP', arg = 'lock:FALSE;prvimage:0;prvtext:0;code:acp;') {
    /*
      {
        "result": true,
        "fileName": "346c4437-ba71-4927-a001-a8862dbe44f9.hwp",
        "size": 12800,
        "uniqueId": "245cdd98-aaab-4a57-ae48-128068ddfe26",
        "resultCode": 0
      }    
    */
    // this.hwpServerUrl: 'https://fewebhwp.handysoft.co.kr/webhwpctrl/'
    const ret = await super.saveAs(fileName, format, arg);
    ret['downloadURL'] = `${this.hwpServerUrl}get/${ret.uniqueId}/${ret.fileName}`;

    return ret;
  }

  /**
   * PC에 저장한다. 정확히는 다운로드 된다
   * @param {string} fileName PC에 저장될 파일 이름
   * @param {*} format 문서 형식
   * @returns
   */
  async saveLocal(fileName, format = 'HWP') {
    return await super.saveAs(fileName, format, 'download:true');
  }

  printDocument() {
    this.hwpCtrl.PrintDocument();
  }

  /**
   * 필드가 있는지
   * @param {string} name
   * @returns
   */
  existField(name) {
    return this.hwpCtrl.FieldExist(name);
  }

  /**
   * 사인 관련 셀 내용 지우기
   * - 직위, 서명, 협조직위, 협조, 예산통제직위, 예산통제, 기획예산직위, 기획예산
   */
  clearSignCell() {
    // 직위
    for (let i = 0; i < this.cellCount.pos; i++) {
      this.putFieldText(Cell.POS + '.' + (i + 1), '');
    }
    // 서명
    for (let i = 0; i < this.cellCount.sign; i++) {
      this.putFieldText(Cell.SIGN + '.' + (i + 1), '');
    }
    // 협조직위
    for (let i = 0; i < this.cellCount.agreePos; i++) {
      this.putFieldText(Cell.AGREE_POS + '.' + (i + 1), '');
    }
    // 협조
    for (let i = 0; i < this.cellCount.agreeSign; i++) {
      this.putFieldText(Cell.AGREE_SIGN + '.' + (i + 1), '');
    }
    // 예산통제직위: BUDGET_CONTROL_POS
    for (let i = 0; i < this.cellCount.budgetControlPos; i++) {
      this.putFieldText(Cell.BUDGET_CONTROL_POS + '.' + (i + 1), '');
    }
    // 예산통제: BUDGET_CONTROL_SIGN
    for (let i = 0; i < this.cellCount.budgetControlSign; i++) {
      this.putFieldText(Cell.BUDGET_CONTROL_SIGN + '.' + (i + 1), '');
    }
    // 기획예산직위: BUDGET_PLANNER_POS
    for (let i = 0; i < this.cellCount.budgetPlannerPos; i++) {
      this.putFieldText(Cell.BUDGET_PLANNER_POS + '.' + (i + 1), '');
    }
    // 기획예산: BUDGET_PLANNER_SIGN
    for (let i = 0; i < this.cellCount.budgetPlannerSign; i++) {
      this.putFieldText(Cell.BUDGET_PLANNER_SIGN + '.' + (i + 1), '');
    }
  }

  /**
   * hox approvalFlow participant를 본문 서명셀들에 반영한다
   *
   * - 결재 완료 상태
   */
  reflectApprovalFlow() {
    //
  }

  getText() {
    this.hwpCtrl.InitScan(0x00, 0x0070);
    const text = this.hwpCtrl.GetText();
    this.hwpCtrl.ReleaseScan();
    return text;
  }

  /**
   * 특정 페이지의 텍스트를 얻는다
   *
   * @param {number} pageNo 텍스트를 얻을 페이지 번호
   * @param {number?} option 생략하면, 모든 컨트롤에 대햐 텍스트를 얻는다. 본문 텍스는는 옵션에 관계없이 얻는다
   * - 1: 표 내부 텍스트만 얻는다
   * - 2: 글상자 내부 텍스트만 얻는다
   * - 3: 캡션 내부 텍스트만 얻는다
   * @returns
   */
  getPageText(pageNo, option) {
    return this.hwpCtrl.GetPageText(pageNo, option).trim();
  }

  /**
   * 본문셀의 내용을 텍스트로 구한다
   * @param {number} contentNumber
   * @returns
   */
  getCellBodyText(contentNumber = 1) {
    return this.hwpCtrl.GetFieldText(`${Cell.CBODY}{{${contentNumber - 1}}}`);
  }

  /**
   * 본문셀의 내용을 json 형식으로 구한다
   * @returns
   */
  async getCellBodyAsJSON() {
    this.moveToField(Cell.CBODY, true, true, true);
    return await super.getTextFile('JSON', 'saveblock');
  }

  /**
   * json 형식 내용을 본문셀에 설정. 기존 내용 삭제함
   * @param {string} jsonData
   */
  async setCellBodyAsJSON(jsonData) {
    this.moveToField(Cell.CBODY, true, true, true);
    await super.run('Erase');

    super.toggleViewOptionCtrkMark(true);
    this.setEditMode(1);
    await super.setTextFile(jsonData, 'JSON', 'insertfile');
    this.setEditMode(2);
    super.toggleViewOptionCtrkMark(false);
  }

  focusToField(cellName) {
    this.moveToFieldEx(cellName, true, true, false);
  }

  /**
   * 배포용 문서로 PC저장
   */
  saveDistributeHwp() {
    const title = (StringUtils.isBlank(this.title) ? 'Noname' : this.title) + '_배포용.hwp';
    const password = randomPassword();
    //
    const hwpAction = this.hwpCtrl.CreateAction('FileSetSecurity');
    const hwpActionSet = hwpAction.CreateSet();
    hwpAction.GetDefault(hwpActionSet);
    hwpActionSet.SetItem('FileName', title);
    hwpActionSet.SetItem('Password', password);
    hwpActionSet.SetItem('NoPrint', 0);
    hwpActionSet.SetItem('NoCopy', 1);
    const ret = hwpAction.Execute(hwpActionSet);
    console.log('saveDistributeHwp', ret);
  }

  saveHwpx() {
    const title = (StringUtils.isBlank(this.title) ? 'Noname' : this.title) + '.hwpx';
    this.saveLocal(title, 'HWPX');
  }

  saveHwp() {
    const title = (StringUtils.isBlank(this.title) ? 'Noname' : this.title) + '.hwp';
    this.saveLocal(title, 'HWP');
  }

  setDocumentUpdated(isModified) {
    this.hwpCtrl.IsModified = isModified ? 1 : 0;
  }

  /**
   *
   * @param {string} fieldName
   * @param {*} shape
   */
  setCharShape(fieldName, shape) {
    if (StringUtils.isNotBlank(fieldName)) {
      const matched = fieldName.match(/{{|}}/g);
      if (matched && matched.length === 2) {
        // 인덱스가 있으면, 해당 필드만 처리
        this.moveToField(fieldName, true, true, true);
        this.#setCharShape(shape);
      } else {
        // 인덱스가 없으면, loop 돌면서 전체 처리
        const fieldCount = this.getFieldCount(fieldName, 'cell');
        for (var i = 0; i < fieldCount; i++) {
          this.moveToField(fieldName + '{{' + i + '}}', true, true, true);
          this.#setCharShape(shape);
        }
      }
    } else {
      this.#setCharShape(shape);
    }
  }

  getFieldCount(fieldName, option) {
    if (StringUtils.isBlank(fieldName)) return 0;

    const fieldList = this.#getFieldListEx('count', option, fieldName);
    if (fieldList.iFieldCnt == 0) return 0;

    const field = fieldList.lpFields[0];
    if (!field || field.indexOf(fieldName) < 0) return 0;

    const startIndex = field.indexOf('{{');
    const endIndex = field.lastIndexOf('}}');
    if (startIndex < 0 || endIndex < 0) return 1;

    const count = parseInt(field.substring(startIndex + 2, endIndex), 10);
    if (isNaN(count)) return 1;
    else return count;
  }

  #setCharShape(shape) {
    var action = this.hwpCtrl.CreateAction('CharShape');
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
    super.runCancel();
  }

  #getFieldListEx(nFieldFormat, nFieldType, lpField) {
    const lpFieldArray = new Object();
    lpFieldArray.lpFields = new Array();
    lpFieldArray.lpTexts = new Array();
    lpFieldArray.lpObjs = new Array();
    lpFieldArray.iFieldCnt = 0;

    let fieldList = '';
    if (nFieldType == HWPFIELDALL) {
      // 한글 2010에서는 all 옵션이 동작하지 않음
      fieldList = this.hwpCtrl.GetFieldList(HWPFIELDPLAIN, HWPFIELDCELL);
      fieldList += String.fromCharCode(2);
      fieldList += this.hwpCtrl.GetFieldList(HWPFIELDPLAIN, HWPFIELDCLICKHERE);
    } else {
      fieldList = this.hwpCtrl.GetFieldList(HWPFIELDPLAIN, nFieldType); //viNumber.iVal = (short)HWPFIELDPLAIN;//iType;
    }

    const fields = fieldList.split(String.fromCharCode(2));
    const fieldMap = new Map();
    let fieldCnt = 0;

    const strArrayFldList = new Array();
    for (let i = 0; i < fields.length; i++) {
      const strField = fields[i];
      if (strField == '') {
        continue;
      }
      if (lpField && strField != lpField) continue;

      if (!fieldMap.get(strField)) fieldCnt = 0;

      fieldMap.set(strField, ++fieldCnt);

      if (nFieldFormat != HWPFIELDCOUNT) {
        let strFieldNumbering = strField;
        if (nFieldFormat == HWPFIELDNUMBER) strFieldNumbering += '{{' + (fieldCnt - 1) + '}}';
        strArrayFldList.push(strFieldNumbering);
      }
    }
    fieldMap.forEach((nCount, strField) => {
      if (nFieldFormat == HWPFIELDCOUNT) {
        strArrayFldList.push(strField + '{{' + nCount + '}}');
      }
    });
    if (strArrayFldList.length > 0) {
      lpFieldArray.iFieldCnt = strArrayFldList.length;
      for (let i = 0; i < lpFieldArray.iFieldCnt; i++) {
        lpFieldArray.lpFields.push(strArrayFldList[i]);
      }
    }
    return lpFieldArray;
  }

  /**
   * 지정한 필드로 캐럿을 이동한다
   * @param {string} field 필드 이름
   * @param {boolean} text   true: 누름틀 내부의 텍스트로 이동, false: 누름틀 코드로 이동. 생략시 true
   * @param {boolean} start  true: 필드의 처음으로 이동,        false: 끝으로 이동.        생략시 true
   * @param {boolean} select true: 필드 내용을 블록으로 선택,   false: 캐럿만 이동.        생략시 false
   * @returns {boolean} 성공 여부
   */
  moveToField(field, text = true, start = true, select = false) {
    return this.hwpCtrl.MoveToField(field, text, start, select);
  }

  /**
   * 지정한 필드로 캐럿을 이동 후 캐럿 위치로 화면을 이동한다
   * @param {string} field 필드 이름
   * @param {boolean} text   true: 누름틀 내부의 텍스트로 이동, false: 누름틀 코드로 이동. 생략시 true
   * @param {boolean} start  true: 필드의 처음으로 이동,        false: 끝으로 이동.        생략시 true
   * @param {boolean} select true: 필드 내용을 블록으로 선택,   false: 캐럿만 이동.        생략시 false
   * @returns {boolean} 성공 여부
   */
  moveToFieldEx(field, text = true, start = true, select = false) {
    return this.hwpCtrl.MoveToFieldEx(field, text, start, select);
  }

  getFieldText(field) {
    return this.hwpCtrl.GetFieldText(field);
  }

  moveScroll(horzPos = 0, vertPos = 0) {
    const scrollPosSet = this.hwpCtrl.ScrollPosInfo;
    scrollPosSet.SetItem('HorzPos', horzPos);
    scrollPosSet.SetItem('VertPos', vertPos);
    this.hwpCtrl.ScrollPosInfo = scrollPosSet;
  }

  moveScrollTop() {
    this.moveScroll(0, 0);
  }

  moveScrollBottom() {
    this.moveScroll(0, this.hwpCtrl.ScrollPosInfo.Item('VertLimitPos'));
  }

  /**
   *
   * @param {number} moveID
   * @param {*} para
   * @param {*} pos
   */
  movePos(moveID, para, pos) {
    return this.hwpCtrl.MovePos(moveID, para, pos);
  }

  /**
   * ini GianInitCaretPosToField, KyulInitCaretPosToField 옵션 수행
   * @param {string} iniValue
   * @returns
   */
  initCaretPosToField(iniValue) {
    if (StringUtils.isBlank(iniValue)) {
      return;
    }
    const [cellName, modeMode = 'file', end = ''] = iniValue.split(',');

    // 웹한글 안으로 포커스 이동
    this.shadowRoot.querySelector('iframe').contentWindow.document.querySelector('iframe')?.focus();

    if (modeMode === 'file') {
      this.moveScroll(0, 0); // 스크롤 이동
    } else if (modeMode === 'field') {
      // cell 위치가 최상단에 위치
      // const pos = this.hwpCtrl.GetPos();
      // console.log('pos', pos, pos.list, pos.para, pos.pos);
      // this.movePos(27, pos.para, pos.pos);
      this.moveScrollBottom();
    }
    this.moveToFieldEx(cellName, true, end !== 'end', false);
    this.hwpCtrl.ShowCaret(true);

    console.log('initCaretPosToField', cellName, modeMode, end);
  }

  set title(title) {
    this.hwpCtrl.PutFieldText(Cell.DOC_TITLE, title);
  }
  get title() {
    return this.hwpCtrl.GetFieldText(Cell.DOC_TITLE);
  }

  get cbody() {
    return this.hwpCtrl.GetFieldText(Cell.CBODY);
  }

  set modified(val) {
    this.hwpCtrl.IsModified = val;
  }
  get modified() {
    return this.hwpCtrl.IsModified;
  }
}

// Define the new element
customElements.define('fe-editor', FeEditor);

function randomPassword() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
}
