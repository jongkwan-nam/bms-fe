import { HoxEventType, dispatchHoxEvent, getNode, getNodes, setText } from '../utils/hoxUtils';
import Cell from './CellNames';
import './FeEditor.scss';
import FeHwpCtrl from './hwp/FeHwpCtrl';

const TIME_LABEL_INIT = 'Editor-init';
const TIME_LABEL_OPEN = 'Editor-open';

/**
 * 웹한글 에디터
 */
export default class FeEditor extends FeHwpCtrl {
  active = false;
  hwpCtrl = null;
  contentCount = 1;
  detectTitle = true;
  fieldList = [];

  constructor() {
    super();
    console.debug('FeEditor init');
  }

  connectedCallback() {
    console.debug('FeEditor connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './main.css');

    const wrapper = document.createElement('iframe');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());

    this.shadowRoot.append(LINK, wrapper);
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    this.hox.addEventListener(HoxEventType.CONTENT, (e) => {
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
          const titleCellName = this.getContentCellName(Cell.DOC_TITLE, i + 1);
          const titleCellText = this.hwpCtrl.GetFieldText(titleCellName);

          // hox 제목
          let contentTitleNode = getNode(this.hox, 'docInfo content', i).querySelector('title');
          if (titleCellText !== contentTitleNode.textContent) {
            setText(contentTitleNode, null, titleCellText, true);
            changed = true;

            if (i === 0) {
              setText(this.hox, 'docInfo title', titleCellText, true);
            }
          }
        }
        if (changed) {
          dispatchHoxEvent(this.hox, 'docInfo', HoxEventType.TITLE, 'change', null);
        }
      }
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
   *
   * @param {URL} docUrl
   */
  async init() {
    console.time(TIME_LABEL_INIT);

    this.id = this.getAttribute('id');

    return new Promise((resolve, reject) => {
      this.shadowRoot.querySelector('iframe').src = './hwpctrlframe.html?id=' + this.id;

      let timer = setInterval(() => {
        if (this.hwpCtrl !== null) {
          console.timeEnd(TIME_LABEL_INIT);
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }

  /**
   *
   * @param {string} docUrl
   * @returns
   */
  async open(docUrl) {
    console.time(TIME_LABEL_OPEN);
    return new Promise((resolve, reject) => {
      //
      this.hwpCtrl.Open(docUrl, '', 'imagedownsize', (e) => {
        console.timeEnd(TIME_LABEL_OPEN);
        console.log('hwpCtrl.Open callback', e);
        if (e.result) {
          resolve();
        } else {
          reject(e.errorMessage);
        }
      });
    });
  }

  /**
   * 편집 모드를 변경한다.
   * @param {number} mode
   * - 0: 읽기 전용
   * - 1: 일반 편집 모드
   * - 2: 양식 모드. Cell과 누름틀 중 양식 모드에서 편집 가능 속성을 가진것만 편집 가능
   * - 16: 배포용 문서(SetEditMode로 지정 불가능)
   */
  setEditMode(mode) {
    this.hwpCtrl.EditMode = mode;
  }

  /**
   *
   * @param {string} name
   * @param {string} text
   */
  putFieldText(name, text) {
    this.hwpCtrl.PutFieldText(name, text);
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

    this.contentCount = getNodes(this.hox, 'docInfo content').length;
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
          super.putFieldTextEmpty(cellName + '_' + this.contentCount);
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
    this.contentCount = getNodes(this.hox, 'docInfo content').length; // 뻬고 남은 안 번호

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
    this.hwpCtrl.MoveToFieldEx(super.getContentCellName(Cell.DOC_TITLE, contentNumber), true, true, false);
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
  async setSign(cellName, text, url) {
    super.putFieldTextEmpty(cellName);
    this.hwpCtrl.PutFieldText(cellName, text);

    this.hwpCtrl.MoveToField(cellName);
    this.hwpCtrl.MovePos(23); // moveEndOfLine
    await super.insertPicture(url, true, 2, false, false, 0);

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

  existField(name) {
    return this.hwpCtrl.FieldExist(name);
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
