import { getText } from '../../utils/hoxUtils';
import './FeParticipant.scss';

/**
 * 결재자
 *
 * - 권한설정은 스스로 설정
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
    this.approvalTypeSelect.addEventListener('change', (e) => {
      console.log('FeParticipant', e.type, e.target.tagName);
      this.dispatchEvent(new Event('change'));
    });

    const delBtn = this.shadowRoot.querySelector('button');
    delBtn.addEventListener('click', (e) => {
      console.log('FeParticipant', e.type, e.target.tagName);
      // 삭제 이벤트 전파
      this.dispatchEvent(new CustomEvent('delete', { bubbles: true, composed: true, detail: { target: this } }));
    });
  }

  /**
   *
   * @param {XMLElement} participant
   * @param {Array} approvalTypeList
   */
  set(participant, approvalTypeList, currentNo, finalNo) {
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

    this.approvalTypeSelect.textContent = null;
    approvalTypeList.forEach((approvalType) => {
      //
      const option = this.approvalTypeSelect.appendChild(document.createElement('option'));
      option.innerHTML = GWWEBMessage[approvalType.resourceCode[0].replace(/@@/g, '').replace(/\./g, '_')];
      option.value = approvalType.type;
    });

    this.shadowRoot.querySelector('.no').innerHTML = currentNo;
    this.shadowRoot.querySelector('.img-profile').style.backgroundImage = `url('${isDept ? '/user/img/team_profile_blank.png' : `/jsp/org/view/ViewPicture.jsp?user_id=${id}`}')`;
    this.shadowRoot.querySelector('.name').innerHTML = name;
    this.shadowRoot.querySelector('.rank').innerHTML = isDept ? '' : position;
    this.shadowRoot.querySelector('.team').innerHTML = isDept ? '' : deptName;
    this.shadowRoot.querySelector('.status').innerHTML = displayApprovalStatus;
  }
}

// Define the new element
customElements.define('fe-participant', FeParticipant);
