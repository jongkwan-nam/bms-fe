import { getContentCellName } from '../utils/contentUtils';
import { HoxEventType, dispatchHoxEvent, getNode, getNodes, setText } from '../utils/hoxUtils';
import * as StringUtils from '../utils/stringUtils';
import Cell from './CellNames';
import './FeEditor.scss';
import FeHwpCtrl from './hwp/FeHwpCtrl';

const TIME_LABEL_INIT = 'Editor-init';
const TIME_LABEL_OPEN = 'Editor-open';

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
    this.setAttribute('id', id);
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
    console.time(TIME_LABEL_INIT);

    this.id = this.getAttribute('id');

    return new Promise((resolve, reject) => {
      this.shadowRoot.querySelector('iframe').src = './hwpctrlframe.html?id=' + this.id;

      const timer = setInterval(() => {
        if (this.hwpCtrl !== null) {
          console.timeEnd(TIME_LABEL_INIT);
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

  /**
   * - hox 이벤트 리스너 추가
   * - 제목 변경 감지 -> hoxEvent 발행
   */
  start() {
    feMain.hox.addEventListener(HoxEventType.CONTENT, (e) => {
      console.info('hoxEvent listen', e.type, e.detail);
      switch (e.detail.type) {
        case 'add': {
          // 안 추가 이벤트
          this.addContent();
          break;
        }
        case 'delete': {
          // 안 삭제 이벤트
          const deletedContentNumbers = e.detail.value;
          this.deleteContent(...deletedContentNumbers);
          break;
        }
        case 'select': {
          // 안 선택 이벤트
          this.selectContent(e.detail.value);
          break;
        }
        case 'move': {
          // 안 이동 이벤트
          let { from, to } = e.detail.value;
          this.moveContent(from, to);
          break;
        }
        default:
          throw new Error('undefinded detatil.type: ' + e.detail.type);
      }
    });

    // 제목 변경 감지. 에디터 밖으로 나가면 작동
    this.parentElement.addEventListener('mouseleave', (e) => {
      // console.log('fe-editor parent mouseleave', this.detectTitle, this.contentCount);
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

  /**
   * 문서 열기
   * @param {string} docUrl
   * @returns
   */
  async open(docUrl) {
    console.time(TIME_LABEL_OPEN);
    await super.openDocument(docUrl, '', 'imagedownsize');
    console.timeEnd(TIME_LABEL_OPEN);

    this.#resolveDocInfo();
  }

  /**
   * 문서에서 필요한 정보를 구한다.
   *
   * - fieldList: 전체 필드명 목록
   * - cellCount: 서명 관련 셀 갯수. 직위,서명,협조 등
   */
  #resolveDocInfo() {
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
   * 편집 모드를 변경한다.
   *
   * @param {number} mode 편집모드
   * - 0: 읽기 전용
   * - 1: 일반 편집 모드
   * - 2: 양식 모드. Cell과 누름틀 중 양식 모드에서 편집 가능 속성을 가진것만 편집 가능
   * - 16: 배포용 문서(SetEditMode로 지정 불가능)
   */
  setEditMode(mode) {
    this.hwpCtrl.EditMode = mode;
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
  putFieldText(name, text, textColor = null, height = null, faceNameHangul = null, underlineType = null) {
    if (StringUtils.isBlank(text)) {
      this.hwpCtrl.PutFieldText(name, String.fromCharCode(2));
    } else {
      this.hwpCtrl.PutFieldText(name, text);
    }

    if (height !== null || textColor !== null || faceNameHangul !== null || underlineType !== null) {
      this.hwpCtrl.MoveToField(name, true, true, true);
      const hwpAction = this.hwpCtrl.CreateAction('CharShape');
      const hwpActionSet = hwpAction.CreateSet();
      hwpAction.GetDefault(hwpActionSet);
      if (height !== null) {
        hwpActionSet.SetItem('Height', height);
      }
      if (textColor !== null) {
        hwpActionSet.SetItem('TextColor', textColor);
      }
      if (faceNameHangul !== null) {
        hwpActionSet.SetItem('FaceNameHangul', faceNameHangul);
      }
      if (underlineType !== null) {
        hwpActionSet.SetItem('UnderlineType', underlineType);
      }

      hwpAction.Execute(hwpActionSet);
      this.hwpCtrl.Run('Cancel');
    }
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

    this.hwpCtrl.Run('Cancel');

    this.hwpCtrl.Run('MoveDocEnd');
    this.hwpCtrl.Run('BreakPage');

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
          this.hwpCtrl.MoveToField(Cell.CBODY + '_' + (this.contentCount - 1), true, true, true);
          let bodyText = await super.getTextFile('JSON', 'saveblock');

          this.hwpCtrl.MoveToField(Cell.CBODY + '_' + this.contentCount, true, true, true);
          this.hwpCtrl.Run('Erase');

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
  deleteContent(...contentNumbers) {
    console.time('deleteContent');
    this.detectTitle = false;

    this.setEditMode(1);

    super.toggleViewOptionCtrkMark(true);
    contentNumbers.reverse().forEach((contentNumber) => {
      // 발신명의 셀을 기준으로 이전 안의 끝과 현재 안의 끝을 찾아서 삭제
      console.log('deleteContent', contentNumber);

      const prevRect = super.getBoundingContentRect(contentNumber - 1);
      const currRect = super.getBoundingContentRect(contentNumber);

      this.hwpCtrl.SelectText(prevRect.ePara, prevRect.ePos, currRect.ePara, currRect.ePos);
      this.hwpCtrl.Run('Erase');
    });
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
  selectContent(contentNumber) {
    // 안번호의 제목셀을 찾고, 현재 페이지를 구하여 스크롤 이동한다.
    this.hwpCtrl.MoveToFieldEx(getContentCellName(Cell.DOC_TITLE, contentNumber), true, true, false);
    // let set = super.getDocumentInfo(true);
    // let curPage = set.Item('DetailCurPage');
    // console.log('curPage', curPage);
    this.hwpCtrl.Run('MovePageBegin');
  }

  moveContent(from, to) {
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
    this.putFieldText(cellName, text, 0x000000);
    this.hwpCtrl.MoveToField(cellName, true, true, true);
    this.hwpCtrl.Run('ParagraphShapeAlignCenter');
    this.hwpCtrl.MovePos(23); // moveEndOfLine
    await super.insertPicture(url, true, 3, false, false, 0);
    this.setEditMode(2);
    URL.revokeObjectURL(url);
  }

  /**
   * 서버로 저장하고, 다운로드 가능한 URL 반환
   * @param {string} fileName
   * @param {string} format
   * @param {string} arg
   * @returns 다운로드 URL
   */
  async saveServer(fileName = '', format = 'HWP', arg = 'lock:FALSE;prvimage:0;prvtext:0;code:acp;') {
    //
    const ret = await super.saveAs(fileName, format, arg);

    // this.hwpServerUrl: 'https://fewebhwp.handysoft.co.kr/webhwpctrl/'
    return `${this.hwpServerUrl}get/${ret.uniqueId}/${ret.fileName}`;
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

  set title(title) {
    this.hwpCtrl.PutFieldText(Cell.DOC_TITLE, title);
  }
  get title() {
    return this.hwpCtrl.GetFieldText(Cell.DOC_TITLE);
  }
}

// Define the new element
customElements.define('fe-editor', FeEditor);
