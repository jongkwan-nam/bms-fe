import DateUtils from '../../../utils/DateUtils';
import { getText } from '../../../utils/xmlUtils';
import FeSignDialog from '../../FeSignDialog';

/**
 * 서명 다이얼로그
 *
 * @param {XMLDocument} hox
 * @returns
 */
export const dialogSign = async (hox) => {
  const result = { ok: true, message: '' };
  //
  const feEditor1 = feMain.feEditor1;

  const participant = feMain.getCurrentParticipant();
  const cellName = getText(participant, 'mappingCell cellName');

  // 서명선택
  let feSignDialog = new FeSignDialog();
  const modalContainer = document.querySelector('.modal-container');
  modalContainer.textContent = null;
  modalContainer.append(feSignDialog);
  modalContainer.classList.add('open');
  feSignDialog.open();

  const signImageURL = await feSignDialog.getSignImageURL();
  console.log('signImageURL', signImageURL);
  if (signImageURL === null) {
    // 서명 취소 => 결재 취소
    modalContainer.classList.remove('open');
    result.ok = false;
    return result;
  }

  let signExtraText = '';
  if (doccfg.signShowSignerDate) {
    // 서명칸에 날짜 표시(서명일자) 여부 설정
    // true : 기안자/검토자/협조자/결재권자/협조부서 서명칸에 날짜 표시
    // false : 결재권자(최종결재자) 서명칸에만 날짜 표시 (default)
    // 서버시간 구하기
    /**
     * /bms/com/hs/gwweb/appr/getServerTime.act K: 00G392eYq
     * > {"currentDate":1702859639184,"ok":true}
     */
    const serverTimeInfo = await fetch(`${PROJECT_CODE}/com/hs/gwweb/appr/getServerTime.act`).then((res) => res.json());
    const serverTime = new Date(serverTimeInfo.currentDate);
    console.log('serverTime', serverTime);
    // doccfg.signDateFormat
    const mmdd = DateUtils.format(serverTime, doccfg.signDateFormat);

    signExtraText = mmdd;
  }

  await feEditor1.doSign(cellName, signExtraText, signImageURL);
  console.log('feEditor1.setSign', cellName);

  // 서명창 닫기
  modalContainer.classList.remove('open');

  return result;
};
