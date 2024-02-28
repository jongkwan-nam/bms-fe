import { FeMode, getFeMode } from '../FeMode';
import AcceptButton from './AcceptButton';
import AcceptRejectButton from './AcceptRejectButton';
import ApprovalBoxButton from './ApprovalBoxButton';
import AssignDocButton from './AssignDocButton';
import CommentButton from './CommentButton';
import DeliverDocButton from './DeliverDocButton';
import DraftButton from './DraftButton';
import HoldButton from './HoldButton';
import KyulButton from './KyulButton';
import MultiContentButton from './MultiContentButton';
import PCFileLoadButton from './PCFileLoadButton';
import PubshowButton from './PubshowButton';
import ReCallButton from './ReCallButton';
import ReWriteButton from './ReWriteButton';
import RejectButton from './RejectButton';
import RelationDocButton from './RelationDocButton';
import SaveHwpButton from './SaveHwpButton';
import SaveHwpDistButton from './SaveHwpDistButton';
import SaveHwpxButton from './SaveHwpxButton';
import SendBbsButton from './SendBbsButton';
import SendControlButton from './SendControlButton';
import SendMainButton from './SendMainButton';
import SendRejectButton from './SendRejectButton';
import SendRequestButton from './SendRequestButton';
import StampSealButton from './StampSealButton';
import StopButton from './StopButton';
import SummaryButton from './SummaryButton';
import TmprDocSaveButton from './TmprDocSaveButton';

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
        this.#append(new DraftButton()); // 결재올림
        this.#append(new PCFileLoadButton()); // 읽어오기
        this.#append(new ApprovalBoxButton()); // 결재정보
        this.#append(new SummaryButton()); // 요약
        this.#append(new CommentButton()); // 의견
        this.#append(new RelationDocButton()); // 관련문서
        this.#append(new PubshowButton()); // 공람
        this.#append(new TmprDocSaveButton()); // 임시저장
        this.#append(new MultiContentButton()); // 안추가
        this.#append(new SaveHwpDistButton()); // PC저장(배포용)
        this.#append(new SaveHwpxButton()); // PC저장(hwpx)
        this.#append(new SaveHwpButton()); // PC저장
        // 인쇄
        break;
      }
      case FeMode.KYUL: {
        this.#append(new KyulButton()); // 결재
        this.#append(new RejectButton()); // 반려
        this.#append(new StopButton()); // 중단
        this.#append(new HoldButton()); // 보류
        this.#append(new ApprovalBoxButton()); // 결재정보
        this.#append(new SummaryButton()); // 요약
        this.#append(new CommentButton()); // 의견
        this.#append(new RelationDocButton()); // 관련문서
        this.#append(new SendMainButton()); // 메일쓰기
        this.#append(new SaveHwpDistButton()); // PC저장(배포용)
        this.#append(new SaveHwpxButton()); // PC저장(hwpx)
        this.#append(new SaveHwpButton()); // PC저장
        // 인쇄
        break;
      }
      case FeMode.VIEW: {
        this.#append(new ReWriteButton()); // 재작성: 문서함에서 열었을때
        // 재발송
        this.#append(new PubshowButton()); // 공람지정
        // 본문복사
        this.#append(new SendMainButton()); // 메일쓰기
        this.#append(new SendBbsButton()); // 게시하기
        this.#append(new ReCallButton()); // 회수
        this.#append(new ApprovalBoxButton()); // 결재정보
        this.#append(new SummaryButton()); // 요약
        this.#append(new CommentButton()); // 의견
        this.#append(new RelationDocButton()); // 관련문서
        this.#append(new SaveHwpDistButton()); // PC저장(배포용)
        this.#append(new SaveHwpxButton()); // PC저장(hwpx)
        this.#append(new SaveHwpButton()); // PC저장
        // 인쇄
        break;
      }
      case FeMode.ACCEPT: {
        this.#append(new AcceptButton()); // 접수
        this.#append(new AssignDocButton()); // 지정
        this.#append(new DeliverDocButton()); // 배부
        this.#append(new AcceptRejectButton()); // 반송
        this.#append(new ApprovalBoxButton()); // 결재정보
        this.#append(new SummaryButton()); // 요약
        this.#append(new RelationDocButton()); // 관련문서
        this.#append(new SaveHwpDistButton()); // PC저장(배포용)
        // 인쇄
        break;
      }
      case FeMode.REQUEST: {
        this.#append(new SendRequestButton()); // 발송의뢰
        this.#append(new ApprovalBoxButton()); // 결재정보
        this.#append(new SaveHwpDistButton()); // PC저장(배포용)
        this.#append(new SaveHwpxButton()); // PC저장(hwpx)
        this.#append(new SaveHwpButton()); // PC저장
        // 인쇄
        break;
      }
      case FeMode.CONTROL: {
        this.#append(new StampSealButton()); // 관인
        this.#append(new SendControlButton()); // 발송처리
        this.#append(new SendRejectButton()); // 반송
        this.#append(new ApprovalBoxButton()); // 결재정보
        this.#append(new SaveHwpDistButton()); // PC저장
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
