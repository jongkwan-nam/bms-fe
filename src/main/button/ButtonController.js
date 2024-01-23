import { FeMode, getFeMode } from '../FeMode';
import AcceptButton from './AcceptButton';
import ApprovalBoxButton from './ApprovalBoxButton';
import CommentButton from './CommentButton';
import DraftButton from './DraftButton';
import HoldButton from './HoldButton';
import KyulButton from './KyulButton';
import MultiContentButton from './MultiContentButton';
import RejectButton from './RejectButton';
import SaveHwpButton from './SaveHwpButton';
import SaveHwpDistButton from './SaveHwpDistButton';
import SaveHwpxButton from './SaveHwpxButton';
import SendControlButton from './SendControlButton';
import SendRequestButton from './SendRequestButton';
import StopButton from './StopButton';
import SummaryButton from './SummaryButton';

/**
 * 상황에 맞쳐 버튼의 노출을 관리
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
        this.#append(new ApprovalBoxButton());
        // 요약
        this.#append(new SummaryButton());
        // 의견
        this.#append(new CommentButton());
        // 임시저장
        // 안추가
        this.#append(new MultiContentButton());
        // PC저장, PC저장(배포용), PC저장(hwpx)
        // 인쇄
        break;
      }
      case FeMode.KYUL: {
        // 결재
        this.#append(new KyulButton());
        // 반려
        this.#append(new RejectButton());
        // 중단
        this.#append(new StopButton());
        // 보류
        this.#append(new HoldButton());
        // 결재정보
        this.#append(new ApprovalBoxButton());
        // 요약
        this.#append(new SummaryButton());
        // 의견
        this.#append(new CommentButton());
        // 메일쓰기
        // PC저장, PC저장(배포용), PC저장(hwpx)
        // 인쇄
        break;
      }
      case FeMode.VIEW: {
        // 재작성: 문서함에서 열었을때
        // 재발송
        // 공람지정
        // 본문복사
        // 메일쓰기
        // 게시하기
        // 회수
        // 결재정보
        this.#append(new ApprovalBoxButton());
        // 요약
        this.#append(new SummaryButton());
        // 의견
        this.#append(new CommentButton());
        // PC저장, PC저장(배포용), PC저장(hwpx)
        this.#append(new SaveHwpDistButton());
        this.#append(new SaveHwpxButton());
        this.#append(new SaveHwpButton());
        // 인쇄
        break;
      }
      case FeMode.ACCEPT: {
        // 접수
        this.#append(new AcceptButton());
        // 지정
        // 배부
        // 결재정보
        this.#append(new ApprovalBoxButton());
        // 요약
        this.#append(new SummaryButton());
        // PC저장
        // 인쇄
        break;
      }
      case FeMode.REQUEST: {
        // 발송의뢰
        this.#append(new SendRequestButton());
        // 결재정보
        this.#append(new ApprovalBoxButton());
        // PC저장, PC저장(배포용), PC저장(hwpx)
        // 인쇄
        break;
      }
      case FeMode.CONTROL: {
        // 관인
        // 발송처리
        this.#append(new SendControlButton());
        // 반송
        // 결재정보
        this.#append(new ApprovalBoxButton());
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
