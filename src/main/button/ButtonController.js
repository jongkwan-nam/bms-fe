import { FeMode, getFeMode } from '../FeMode';
import DraftButton from './DraftButton';

/**
 * 상황에 맞쳐 버튼의 노출을 관리한다.
 */
export default class ButtonController {
  constructor(parentSelector) {
    this.parent = document.querySelector(parentSelector);
  }

  start() {
    const feMode = getFeMode();
    switch (feMode) {
      case FeMode.DRAFT: {
        // 결재올림
        this.#append(new DraftButton());
        // 읽어오기
        // 결재정보
        // 요약
        // 임시저장
        // 안추가
        // PC저장, PC저장(배포용), PC저장(hwpx)
        // 인쇄
        break;
      }
      case FeMode.KYUL: {
        // 결재
        // 반려
        // 중단
        // 보류
        // 결재경로
        // 메일쓰기
        // PC저장, PC저장(배포용), PC저장(hwpx)
        // 인쇄
        break;
      }
      case FeMode.VIEW: {
        // 본문복사
        // 메일쓰기
        // 게시하기
        // 회수
        // 결재경로
        // PC저장, PC저장(배포용), PC저장(hwpx)
        // 인쇄
        break;
      }
      case FeMode.ACCEPT: {
        // 접수
        // 지정
        // 배부
        // 결재경로
        // 요약
        // PC저장
        // 인쇄
        break;
      }
      case FeMode.REQUEST: {
        // 발송의뢰 <-> none
        // 기안문   <-> 시행문
        // 결재경로
        // PC저장, PC저장(배포용), PC저장(hwpx)
        // 인쇄
        break;
      }
      case FeMode.CONTROL: {
        // 관인
        // 발송처리
        // 반송
        // 결재경로
        // PC저장
        // 인쇄
        break;
      }
      default:
        throw new Error('undefiend FeMode: ' + feMode);
    }
  }

  #append(button) {
    this.parent.append(button);
  }
}
