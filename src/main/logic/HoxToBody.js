import ColorUtils from '../../utils/ColorUtils';
import { getContentCellName } from '../../utils/contentUtils';
import DateUtils from '../../utils/DateUtils';
import { getAttr, getNodes, getText } from '../../utils/hoxUtils';
import Cell from '../CellNames';

/**
 * hox 내용을 본문에 적용하는 함수 모음
 *
 * TODO 복수안일때 같은 이름의 복수의 셀에 적용되도록 수정 필요
 */
export class HoxToBody {
  constructor(hox, editor) {
    this.hox = hox;
    this.editor = editor;
  }

  /**
   * 사용자, 부서 정보 설정
   */
  setOrgEx() {
    fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveOrgExInfo.act?UID=${rInfo.user.ID}&DID=${rInfo.user.deptID}`)
      .then((res) => res.json())
      .then((orgExtInfo) => {
        if (!orgExtInfo.ok) {
          console.warn('사용자, 부서 추가 정보 구하기 실패');
          return;
        }
        // HANDY_HSO_Approval_ini.xlxs #서식Guide html/웹한글과 클라이언트 셀명 합침
        // 사용자 정보
        // - userExt.email:          개인이메일, [상세정보5]
        this.editor.putFieldText(Cell.USER_EMAIL, orgExtInfo.userExt.email);
        this.editor.putFieldText('[상세정보5]', orgExtInfo.userExt.email);
        // - rInfo.user.mobilePhone: 개인휴대폰, [상세정보3]
        this.editor.putFieldText(Cell.USER_MOBILE, rInfo.user.mobilePhone);
        this.editor.putFieldText('[상세정보3]', rInfo.user.mobilePhone);
        // - userExt.phone:          개인전화,   [상세정보2]
        this.editor.putFieldText(Cell.USER_PHONE, orgExtInfo.userExt.phone);
        this.editor.putFieldText('[상세정보2]', orgExtInfo.userExt.phone);
        // - userExt.fax:            개인팩스,   [상세정보1]
        this.editor.putFieldText(Cell.USER_FAX, orgExtInfo.userExt.fax);
        this.editor.putFieldText('[상세정보1]', orgExtInfo.userExt.fax);
        // - userExt.homeURL:                    [상세정보4]
        this.editor.putFieldText('[상세정보4]', orgExtInfo.userExt.homeURL);
        // - rInfo.user.userColumn1,,n: [user_column1,,n]
        for (let i = 0; i < 20; i++) {
          this.editor.putFieldText(`[user_column${i + 1}]`, rInfo.user['userColumn' + (i + 1)]);
        }

        // 부서 정보
        // - deptExt.homeURL: 부서홈페이지, 홈페이지, [부서상세정보4], %홈페이지
        this.editor.putFieldText(Cell.DEPT_INFO4, orgExtInfo.deptExt.homeURL);
        this.editor.putFieldText('홈페이지', orgExtInfo.deptExt.homeURL);
        this.editor.putFieldText('[부서상세정보4]', orgExtInfo.deptExt.homeURL);
        this.editor.putFieldText('%홈페이지', orgExtInfo.deptExt.homeURL);
        // - deptExt.phone:   부서전화,     전화,     [부서상세정보2], %전화
        this.editor.putFieldText(Cell.DEPT_INFO2, orgExtInfo.deptExt.phone);
        this.editor.putFieldText('전화', orgExtInfo.deptExt.phone);
        this.editor.putFieldText('[부서상세정보2]', orgExtInfo.deptExt.phone);
        this.editor.putFieldText('%전화', orgExtInfo.deptExt.phone);
        // - deptExt.fax:     부서팩스,     전송,     [부서상세정보1], %전송
        this.editor.putFieldText(Cell.DEPT_INFO1, orgExtInfo.deptExt.fax);
        this.editor.putFieldText('전송', orgExtInfo.deptExt.fax);
        this.editor.putFieldText('[부서상세정보1]', orgExtInfo.deptExt.fax);
        this.editor.putFieldText('%전송', orgExtInfo.deptExt.fax);
        // - deptExt.zip:     부서우편번호, 우편번호, [부서상세정보3], %우편번호
        this.editor.putFieldText(Cell.DEPT_INFO3, orgExtInfo.deptExt.zip);
        this.editor.putFieldText('우편번호', orgExtInfo.deptExt.zip);
        this.editor.putFieldText('[부서상세정보3]', orgExtInfo.deptExt.zip);
        this.editor.putFieldText('%우편번호', orgExtInfo.deptExt.zip);
        // - deptExt.address: 부서주소,     주소,     [부서상세정보6], %주소
        this.editor.putFieldText(Cell.DEPT_INFO6, orgExtInfo.deptExt.address);
        this.editor.putFieldText('주소', orgExtInfo.deptExt.address);
        this.editor.putFieldText('[부서상세정보6]', orgExtInfo.deptExt.address);
        this.editor.putFieldText('%주소', orgExtInfo.deptExt.address);
        // - deptExt.email:                 이메일,                    %이메일
        this.editor.putFieldText('이메일', orgExtInfo.deptExt.email);
        this.editor.putFieldText('%이메일', orgExtInfo.deptExt.email);
      });
  }

  /**
   * 표어 설정
   */
  setCampaign() {
    fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/getCampaign.act`)
      .then((res) => res.json())
      .then((campaianInfo) => {
        if (!campaianInfo.result) {
          console.warn('표어 정보 구하기 실패');
          return;
        }
        // 머리표어 HEAD_CAMPAIGN
        this.editor.putFieldText(Cell.HEAD_CAMPAIGN, campaianInfo.campaignHead);
        // FOOT_CAMPAIGN: '꼬리표어'
        this.editor.putFieldText(Cell.FOOT_CAMPAIGN, campaianInfo.campaignTail);
      });
  }

  /**
   * 수신, 수신처캡션, 수신처 설정
   */
  setReceive() {
    // 수신, 수신처캡션, 수신처
    let [receiveCellName, receCaptionCellName, reclistCellName] = ['', '', ''];
    let [receiveCellValueName, receCaptionCellValueName, reclistCellValueName] = ['', '', ''];
    getNodes(this.hox, 'docInfo content').forEach((content, i) => {
      // 수신, 수신처캡션, 수신처
      [receiveCellName, receCaptionCellName, reclistCellName] = [getContentCellName(Cell.RECEIVE, i + 1), getContentCellName(Cell.RECV_CAPTION, i + 1), getContentCellName(Cell.RECLIST, i + 1)];

      const enforceType = getText(content, 'enforceType');
      if (enforceType === 'enforcetype_not') {
        [receiveCellValueName, receCaptionCellValueName, reclistCellValueName] = [GWWEBMessage[enforceType], '', ''];
      } else {
        // content receiptInfo recipient rec 갯수로 수신, 수신처캡션, 수신처 설정
        if (getNodes(content, 'receiptInfo recipient rec').length > 1) {
          // 복수의 수신처 일때
          [receiveCellValueName, receCaptionCellValueName, reclistCellValueName] = [GWWEBMessage.cmsg_1080, GWWEBMessage.cmsg_2718, getText(content, 'receiptInfo > displayString')];
        } else {
          // 단일 수신처
          [receiveCellValueName, receCaptionCellValueName, reclistCellValueName] = [getText(content, 'receiptInfo > displayString'), '', ''];
        }
      }
      this.editor.putFieldText(receiveCellName, receiveCellValueName);
      this.editor.putFieldText(receCaptionCellName, receCaptionCellValueName);
      this.editor.putFieldText(reclistCellName, reclistCellValueName);
      console.debug('수신', receiveCellName, receiveCellValueName, receCaptionCellName, receCaptionCellValueName, reclistCellName, reclistCellValueName);
    });
  }

  /**
   * 결재선
   */
  setApprovalFlow() {
    let signCellIndex = 0;
    let agreeCellIndex = 0;
    let [posCellName, posCellValue] = ['', ''];
    let [signCellName, signCellValue] = ['', ''];
    const textColor = ColorUtils.colorNameToHex(doccfg.previewSignerNameFontColor);
    // const height = sizeToHwpUnit(doccfg.previewSignerNameFontSize);

    getNodes(this.hox, 'approvalFlow participant').forEach((paricipant) => {
      if (getText(paricipant, 'validStatus') === 'revoked') {
        return;
      }
      // 기 결재된 서명은 건드리면 안되고, 남는 서명칸은 비워야 한다.
      let approvalType = getText(paricipant, 'approvalType');
      let approvalStatus = getText(paricipant, 'approvalStatus');
      let position = getText(paricipant, 'position');
      let name = getText(paricipant, 'name');

      if ('partapprstatus_done' === approvalStatus) {
        return;
      }

      if ('user_approval' === approvalType) {
        // 결재
        ++signCellIndex;
        [posCellName, posCellValue] = [`${Cell.POS}.${signCellIndex}`, position];
        [signCellName, signCellValue] = [`${Cell.SIGN}.${signCellIndex}`, name];
      } else if (['user_agree_s', 'user_agree_p', 'dept_agree_s', 'dept_agree_p'].includes(approvalType)) {
        // 협조
        ++agreeCellIndex;
        [posCellName, posCellValue] = [`${Cell.AGREE_POS}.${agreeCellIndex}`, position];
        [signCellName, signCellValue] = [`${Cell.AGREE_SIGN}.${agreeCellIndex}`, name];
      }
      this.editor.putFieldText(posCellName, posCellValue);
      if (doccfg.usePreviewSignerName) {
        this.editor.putFieldText(signCellName, signCellValue, textColor);
      }
      console.debug('putFieldText', signCellName, signCellValue);
    });

    // assist_signer_caption: 결재선에 협조자(부서/개인)가 있으면 "협조" 표시, 없으면 빈값
    this.editor.putFieldText('assist_signer_caption', agreeCellIndex > 0 ? GWWEBMessage.assist_signer_caption : '');
    // TODO enforcement_caption: 쓰는건가?

    // 남는 서명칸 비우기
    for (signCellIndex++; signCellIndex <= this.editor.cellCount.sign; signCellIndex++) {
      // 남는 서명
      this.editor.putFieldText(`${Cell.POS}.${signCellIndex}`, '');
      this.editor.putFieldText(`${Cell.SIGN}.${signCellIndex}`, '');
      console.debug('putFieldText', `${Cell.SIGN}.${signCellIndex}`, '');
    }
    for (agreeCellIndex++; agreeCellIndex <= this.editor.cellCount.agreeSign; agreeCellIndex++) {
      // 남는 협조
      this.editor.putFieldText(`${Cell.AGREE_POS}.${agreeCellIndex}`, '');
      this.editor.putFieldText(`${Cell.AGREE_SIGN}.${agreeCellIndex}`, '');
      console.debug('putFieldText', `${Cell.AGREE_SIGN}.${agreeCellIndex}`, '');
    }
  }

  /**
   * 기안자 이름
   */
  setDrafter() {
    this.editor.putFieldText(Cell.DRAFTER, rInfo.user.name);
  }

  /**
   * 기안일자
   */
  setDraftDate() {
    this.editor.putFieldText(Cell.DRAFT_DATE, DateUtils.format(getText(this.hox, 'draftDate'), 'YYYY.MM.DD'));
  }

  /**
   * 결재제목
   */
  setTitle() {
    getNodes(this.hox, 'docInfo content').forEach((content, i) => {
      this.editor.putFieldText(getContentCellName(Cell.DOC_TITLE, i + 1), getText(content, 'title'));
    });
  }

  /**
   * 발신명의
   */
  setSenderName() {
    getNodes(this.hox, 'docInfo content').forEach((content, i) => {
      this.editor.putFieldText(getContentCellName(Cell.SENDERNAME, i + 1), getText(content, 'receiptInfo senderName'));
    });
  }

  /**
   * 발신기관명
   *
   * TODO handydef.ini SendOrgName.Type.발송종류 옵션으로 선택 가능함
   */
  setSendOrgName() {
    this.editor.putFieldText(Cell.ORGAN, getText(this.hox, 'content sendOrgName'));
  }

  /**
   * 문서번호
   */
  setDocNumber() {
    this.editor.putFieldText(Cell.DOC_NUM, getText(this.hox, 'docInfo docNumber displayDocNumber'));
  }

  /**
   * 공개여부
   */
  setPublication() {
    this.editor.putFieldText(Cell.DOC_PUBLIC, GWWEBMessage[getAttr(this.hox, 'publication', 'type')]);
  }

  /**
   * 시행일자
   */
  setEnforceDate() {
    this.editor.putFieldText(Cell.ENFORCE_DATE, DateUtils.format(new Date(), 'YYYY.MM.DD'));
  }

  /**
   * 접수번호
   */
  setAcceptNumber() {
    //
  }

  /**
   * 접수일자
   */
  setAcceptDate() {
    //
  }

  /**
   * 관인
   */
  setSealStamp() {
    //
  }

  /**
   * 관인생략
   */
  setSealOmission() {
    //
  }

  /**
   * 로고
   */
  setLogo() {
    //
  }

  /**
   * 심볼
   */
  setSymmbol() {
    //
  }
}

/**
 * 12pt를 1200 HWPUNIT으로 변환
 * @param {string} sizeValue
 */
function sizeToHwpUnit(sizeValue) {
  if (sizeValue.includes('pt')) {
    return parseInt(sizeValue) * 100;
  }
}
