import { getContentCellName } from '../../utils/contentUtils';
import { getNodes } from '../../utils/hoxUtils';
import Cell from '../CellNames';

export default class FeHwpCtrl extends HTMLElement {
  separatedContentFieldNames = ['결재제목', '본문', '수신', '수신처', '수신처캡션', '발신기관명', '발신명의', '각안발신명의', '각안수신처', '경유'];

  constructor() {
    super();
    console.debug('FeHwpCtrl init');
  }

  /**
   * 안의 시작과 끝 위치 정보
   * @param {number} contentNumber
   * @returns
   */
  getBoundingContentRect(contentNumber) {
    // 시작위치 이동 -> getDocumentInfo
    this.hwpCtrl.MoveToFieldEx(getContentCellName(Cell.DOC_TITLE, contentNumber), true, true, false);
    this.hwpCtrl.MovePos(24, 0, 0);
    let startSet = this.getDocumentInfo();

    // 마지막위치 이동 -> getDocumentInfo
    this.hwpCtrl.MoveToFieldEx(getContentCellName(Cell.SENDERNAME, contentNumber), true, false, false);
    this.hwpCtrl.MovePos(24, 0, 0);
    this.hwpCtrl.MovePos(23, 0, 0);
    let endSet = this.getDocumentInfo();

    return { sPara: startSet.Item('CurPara'), sPos: startSet.Item('CurPos'), ePara: endSet.Item('CurPara'), ePos: endSet.Item('CurPos') };
  }

  /**
   * 문서에 대한 정보
   * @param {boolean?} detail
   * @returns
   */
  getDocumentInfo(detail = false) {
    const act = this.hwpCtrl.CreateAction('DocumentInfo');
    const set = act.CreateSet();
    act.GetDefault(set);
    if (detail) {
      set.SetItem('DetailInfo', 1);
    }
    act.Execute(set);
    return set;
  }

  /**
   * 누름틀 보기 토글
   * @param {boolean} force true: 보이기, false: 숨기기
   */
  toggleViewOptionCtrkMark(force) {
    let vp = this.hwpCtrl.ViewProperties;
    let vo = vp.Item('OptionFlag');
    vp.SetItem('OptionFlag', force ? vo + 0x0002 : vo - 0x0002);
    this.hwpCtrl.ViewProperties = vp;
  }

  /**
   * 문서를 문자열로 넘겨준다
   * @param {string} format [HWP | HWPML2X | HTML | UNICODE | TEXT | JSON]
   * @param {string?} option [saveblock: 선택한 블록만 저장]
   * @returns
   */
  async getTextFile(format, option = '') {
    return new Promise((resolve, reject) => {
      this.hwpCtrl.GetTextFile(format, option, (data) => {
        //
        resolve(data);
      });
    });
  }

  /**
   * 현재 캐럿 위치에 문서 파일을 삽입
   *
   * @param {string | Blob} path - string: 서버 URL, Blob: blob파일
   * @param {string} format 문서 형식
   * @param {string?} arg 세부 옵션. format 형식에 따름
   * @returns {object} 성공실패여부 FileName, Size 등을 포함함 object
   */
  async insert(path, format, arg = '') {
    return new Promise((resolve, reject) => {
      this.hwpCtrl.Insert(path, format, arg, (res) => {
        //
        resolve(res);
      });
    });
  }

  /**
   *
   * @param {string} data 문자열로 변경된 text
   * @param {*} format 형식
   * @param {*} option [insertfile: 현재 커서 이루에 삽입]
   * @returns
   */
  async setTextFile(data, format, option) {
    return new Promise((resolve, reject) => {
      this.hwpCtrl.SetTextFile(data, format, option, (res) => {
        resolve(res);
      });
    });
  }

  /**
   * 현재 캐럿의 위치에 그림을 삽입
   * @param {URL} path 이미지 URL
   * @param {boolean} embeded 이미지 파일을 문서내에 포함할지 여부
   * @param {*} sizeOption 삽입할 그림의 크기
   * - 0: 이미지 원래의 크기. width, height 무시
   * - 1: width, height 크기
   * - 2: 셀의 크기만큼 조정
   * - 3: 표의 셀일 경우, 셀크기애 맞쳐 조정
   * @param {*} reverse 이미지 반전
   * @param {*} waterMark 워터마크 효과
   * @param {*} effect 그림 효과
   * - 0: 실제 이미지 그대로
   * - 1: 그레이 스케일
   * - 2: 흑백 효과
   * @param {*} width 가로 크기. 단위 mm
   * @param {*} height 높이 크기. 단위 mm
   * @returns 성공기 생성된 오브젝트, 실패시 null
   */
  async insertPicture(path, embeded, sizeOption, reverse, waterMark, effect, width, height) {
    return new Promise((resolve, reject) => {
      this.hwpCtrl.InsertPicture(path, embeded, sizeOption, reverse, waterMark, effect, width, height, (ctrl) => {
        resolve(ctrl);
      });
    });
  }

  /**
   *
   * @param {string} fileName 파일 이름. arg에 download:true 일때 사용
   * @param {string} format 문서 형식. default 'HWP'
   * @param {string} arg 세부 옵션
   * - lock     = boolean; true;  저장한 후 해당파일을 계속 오픈한 상태로 lock을 걸지 여부
   * - backup   = boolean; false; 백업파일 생성 여부
   * - compress = boolean; true;  압출 여부
   * - fullsave = boolean; false; 스토리지 파일을 완전히 새로 생성하여 저장
   * - prvimage = number;  2;     미리보기 이미지(0=off, 1=BMP, 2=GIF)
   * - prvtext  = numberl; 1;     미리보기 텍스트(0=off, 1=0)
   * - autosave = boolean; false; 자동저장 파일로 저장할지 여부(true=자동저장, false=지정파일로 저장)
   * - export   =                 다른 이름으로 저장은 하고, 열린문서는 바꾸지 않는다. (lock:false와 함께 설정시 동작)
   * - download = boolean; false; Download폴더에 다운로드. false 다운로드 하지 않음
   * @returns
   */
  async saveAs(fileName, format, arg) {
    return new Promise((resolve, reject) => {
      this.hwpCtrl.SaveAs(fileName, format, arg, (ret) => {
        /*
          {
              "result": true,
              "fileName": "a9203aef-8f20-4e44-98ac-82ab27d895b7.hwp",
              "size": 52736,
              "uniqueId": "6e6cb75c-a921-4f66-b6ab-793a54affc9a",
              "resultCode": 0
          }
          GET URL `/webhwpctrl/get/${uniqueId}/${fileName}`
         */
        if (ret.result) {
          resolve(ret);
        } else {
          reject(ret);
        }
      });
    });
  }

  /**
   * 새로 추가된 안의 셀명 정리
   */
  reAssignContentCellName() {
    const contentNumber = getNodes(this.hox, 'docInfo content').length;
    // let cellNames = ['결재제목', '본문', '수신', '수신', '수신처', '수신처캡션', '발신기관명', '발신명의', '틀', '각안', '각안발신명의', '각안수신처', '첨부정보', '경유', 'enforcement_caption', '공개여부'];
    // const separatedContentFieldNames = ['결재제목', '본문', '수신', '수신처', '수신처캡션', '발신기관명', '발신명의', '각안발신명의', '각안수신처', '경유'];
    let [oldNames, newNames] = [[], []];
    this.separatedContentFieldNames.forEach((cellName) => {
      oldNames.push(cellName + '{{1}}');
      newNames.push(cellName + '_' + contentNumber);
    });

    this.renameField(oldNames, newNames);
  }

  /**
   * 안의 셀명_번호 조정
   * @param {number} fromContentNumber
   * @param {number} toContentNumber
   */
  renameContentCellName(fromContentNumber, toContentNumber) {
    let [oldNames, newNames] = [[], []];
    this.separatedContentFieldNames.forEach((cellName) => {
      //
      oldNames.push(getContentCellName(cellName, fromContentNumber));
      newNames.push(getContentCellName(cellName, toContentNumber));
    });
    this.renameField(oldNames, newNames);
  }

  /**
   * 필드 이름 변경
   *
   * FIXHWP \x02로 연속된 값에 대해 동작하지 않음
   * @param {array<string>} oldNames
   * @param {array<string>} newNames
   */
  renameField(oldNames, newNames) {
    for (let i = 0; i < oldNames.length; i++) {
      this.hwpCtrl.RenameField(oldNames[i], newNames[i]);
    }
  }
}
