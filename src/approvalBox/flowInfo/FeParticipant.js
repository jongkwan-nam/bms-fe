import { getText, setText } from '../../utils/hoxUtils';
import './FeParticipant.scss';

/**
 * 결재자
 *
 * - 권한설정은 스스로 설정: 결재방법이 협조, 검사부, 참조, 결재안함, 공석이거나 완료된 문서는 문서수정을 할 수 없습니다.
 *   * 문서수정: defaultaction_editdoc
 *   * 결재경로변경: defaultaction_setupflow
 *   * 붙임문서 추가: defaultaction_addattach
 *   * 붙임문서 삭제: defaultaction_delattach
 *   * default 상수
 *     * 의견: defaultaction_viewcomment defaultaction_addcomment defaultaction_delcomment defaultaction_havecomment
 *     * 첨부: defaultaction_viewattach
 * - 상위로 이벤트 전파
 *   * 삭제 이벤트
 *   * approvalType 변경 이벤트
 * - 이벤트/데이터 수신
 *   * participant XML
 *   * approvalType 선택 가능한 값
 */
export default class FeParticipant extends HTMLElement {
  constructor() {
    super();
    console.debug('FeParticipant init');

    console.debug('FeParticipant connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-participant');
    wrapper.innerHTML = `
      <div class="no">
      </div>
      <div class="type">
        <select></select>
      </div>
      <div class="info">
        <span class="img-profile"></span>
        <span class="name"></span>
        <span class="rank"></span>
        <span class="team"></span>
      </div>
      <div class="status"></div>
      <div class="close">
        <button type="button">&times;</button>
      </div>
    `;

    this.shadowRoot.append(LINK, wrapper);

    this.approvalTypeSelect = this.shadowRoot.querySelector('.type select');

    // 결재방법 변경
    this.approvalTypeSelect.addEventListener('change', (e) => {
      console.log('FeParticipant', e.type, e.target.tagName, e.target.value);

      let prevApprovalType = getText(this.participant, 'approvalType');
      let prevApprovalSubType = getText(this.participant, 'approvalSubType');

      let idx = e.target.options.selectedIndex;
      let option = e.target.options.item(idx);
      console.log(`selected option: value=${option.value} type=${option.dataset.type}, subtype=${option.dataset.subType}, text=${option.dataset.text}`);

      setText(this.participant, 'approvalType', option.dataset.type);
      setText(this.participant, 'approvalSubType', option.dataset.subType);
      setText(this.participant, 'displayApprovalType', option.dataset.text);
      setText(this.participant, 'displayResourceCode', option.value);

      // 변경 이벤트 전파
      this.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: {
            index: this.index,
            // 변경된 값
            curr: { type: option.dataset.type, subType: option.dataset.subType },
            // 이전 값
            prev: { type: prevApprovalType, subType: prevApprovalSubType },
          },
        })
      );
    });

    const delBtn = this.shadowRoot.querySelector('button');
    // 결재자 삭제
    delBtn.addEventListener('click', (e) => {
      console.log('FeParticipant', e.type, e.target.tagName);
      // 삭제 이벤트 전파
      this.dispatchEvent(new CustomEvent('delete', { bubbles: true, composed: true, detail: { index: this.index, target: this } }));
    });
  }

  /**
   *
   * @param {XMLElement} participant
   */
  set(participant) {
    this.participant = participant;

    let type = getText(participant, 'type');
    let id = getText(participant, 'ID');
    let name = getText(participant, 'name');
    let position = getText(participant, 'position');
    let deptId = getText(participant, 'department ID');
    let deptName = getText(participant, 'department name');
    let approvalType = getText(participant, 'approvalType');
    let approvalSubType = getText(participant, 'approvalSubType');
    let displayApprovalType = getText(participant, 'displayApprovalType');
    let displayResourceCode = getText(participant, 'displayResourceCode');
    let approvalStatus = getText(participant, 'approvalStatus');
    let displayApprovalStatus = GWWEBMessage[approvalStatus];

    let isDept = type === 'dept';

    this.shadowRoot.querySelector('.img-profile').style.backgroundImage = `url('${isDept ? '/user/img/team_profile_blank.png' : `/jsp/org/view/ViewPicture.jsp?user_id=${id}`}')`;
    this.shadowRoot.querySelector('.name').innerHTML = name;
    this.shadowRoot.querySelector('.rank').innerHTML = isDept ? '' : position;
    this.shadowRoot.querySelector('.team').innerHTML = isDept ? '' : deptName;
    this.shadowRoot.querySelector('.status').innerHTML = displayApprovalStatus;
  }

  setIndex(i) {
    this.index = i;
    this.shadowRoot.querySelector('.no').innerHTML = i;
  }

  /**
   *
   * @param {array} availableApprovalTypes
   * @param {number} decidedIndex 강제적으로 지정할 옵션 인덱스
   */
  setApprovalTypes(availableApprovalTypes, decidedIndex) {
    let displayApprovalType = getText(this.participant, 'displayApprovalType');
    let matchedIndex = 0;

    this.approvalTypeSelect.textContent = null;
    availableApprovalTypes.forEach((approvalType, idx) => {
      //
      const option = this.approvalTypeSelect.appendChild(document.createElement('option'));
      option.innerHTML = GWWEBMessage[approvalType.resourceCode];
      option.value = approvalType.resourceCode;
      option.dataset.type = approvalType.type;
      option.dataset.subType = approvalType.subType;
      option.dataset.text = approvalType.text;

      if (decidedIndex < 0) {
        // TODO 기존 선택과 맞으면
        if (displayApprovalType === approvalType.text) {
          option.selected = true;
          matchedIndex = idx;
        }
      } else {
        if (idx === decidedIndex) {
          option.selected = true;
          matchedIndex = idx;
        }
      }
    });

    setText(this.participant, 'approvalType', availableApprovalTypes[matchedIndex].type);
    setText(this.participant, 'approvalSubType', availableApprovalTypes[matchedIndex].subType);
    setText(this.participant, 'displayApprovalType', availableApprovalTypes[matchedIndex].text);
    setText(this.participant, 'displayResourceCode', availableApprovalTypes[matchedIndex].resourceCode);
  }

  setCellName(cellName) {
    setText(this.participant, 'mappingCell cellName', cellName);
  }

  get type() {
    return getText(this.participant, 'type');
  }

  get id() {
    return getText(this.participant, 'ID');
  }

  get approvalType() {
    return getText(this.participant, 'approvalType');
  }
}

customElements.define('fe-participant', FeParticipant);
