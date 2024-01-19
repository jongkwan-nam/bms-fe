import SVG from '../../svg/SVG';
import { getText, setText, toggleFlag } from '../../utils/xmlUtils';
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
 *   * 선택가능: 확인, 검토/결재, 전결
 *   * Readonly
 *     * 활성: 기안
 *     * 비활성: 후열, 결재안함, 협조, 참조, 부서협조
 *
 * - 상위로 이벤트 전파
 *   * 삭제 이벤트
 *   * approvalType 변경 이벤트
 *
 * - 이벤트/데이터 수신
 *   * participant XML
 *   * approvalType 선택 가능한 값
 */
export default class FeParticipant extends HTMLElement {
  grantedAction = {
    editdoc: true,
    setupflow: true,
    addattach: true,
    delattach: true,
  };

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
      <div class="no"></div>
      <div class="type"><select></select></div>
      <div class="info">
        <span class="img-profile"></span>
        <span class="name"></span>
        <span class="rank"></span>
        <span class="team"></span>
      </div>
      <div class="config">${SVG.config}</div>
      <div class="status"></div>
      <div class="close"><button type="button">&times;</button></div>
      <div class="actions">
        <input type="checkbox" id="setupflow"><label for="setupflow">${GWWEBMessage.cmsg_2332}</label>
        <input type="checkbox" id="editdoc"  ><label for="editdoc"  >${GWWEBMessage.cmsg_2331}</label>
        <input type="checkbox" id="addattach"><label for="addattach">${GWWEBMessage.cmsg_1813}${GWWEBMessage.cmsg_1510}</label>
        <input type="checkbox" id="delattach"><label for="delattach">${GWWEBMessage.cmsg_1813}${GWWEBMessage.cmsg_1511}</label>
      </div>
    `;

    this.shadowRoot.append(LINK, wrapper);

    this.approvalTypeSelect = this.shadowRoot.querySelector('.type select');

    // 결재방법 변경
    this.approvalTypeSelect.addEventListener('change', (e) => {
      console.log('FeParticipant', e.type, e.target.tagName, e.target.value);

      let currApprovalType = getText(this.participant, 'approvalType');
      let currApprovalSubType = getText(this.participant, 'approvalSubType');

      let idx = e.target.options.selectedIndex;
      let option = e.target.options.item(idx);
      console.log(`selected option: value=${option.value} type=${option.dataset.type}, subtype=${option.dataset.subType}, text=${option.dataset.text}`);

      // 변경 내용 저장
      setText(this.participant, 'approvalType', option.dataset.type);
      setText(this.participant, 'approvalSubType', option.dataset.subType);
      setText(this.participant, 'displayApprovalType', option.dataset.text);
      setText(this.participant, 'displayResourceCode', option.value);

      // 권한설정
      this.#changedGrantedActionCallback();

      // 변경 이벤트 전파
      this.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: {
            index: this.index,
            // 현재 값
            curr: { type: currApprovalType, subType: currApprovalSubType },
            // 변경된 값
            next: { type: option.dataset.type, subType: option.dataset.subType },
          },
        })
      );
    });

    const delBtn = this.shadowRoot.querySelector('button');
    // 결재자 삭제
    delBtn.addEventListener('click', (e) => {
      console.log('FeParticipant', e.type, e.target.tagName);
      // 삭제 이벤트 전파
      let id = getText(this.participant, 'ID');
      this.dispatchEvent(new CustomEvent('delete', { bubbles: true, composed: true, detail: { index: this.index, id: id } }));
    });

    // 권한설정 뷰 클릭 이벤트
    this.shadowRoot.querySelector('.config').addEventListener('click', (e) => {
      this.shadowRoot.querySelector('.actions').classList.toggle('open');
    });

    // 권한 아이템 체크 이벤트
    this.shadowRoot.querySelectorAll('.actions input').forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        //
        let id = e.target.id;
        let checked = e.target.checked;
        this.grantedAction[id] = checked;
        console.log('defaultaction', id, checked, this.grantedAction);

        toggleFlag(this.participant, 'grantedAction', 'defaultaction_' + id, checked);
      });
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
   * 선택가능한 결재방법 및 결정된 결재방법 설정
   *
   * @param {array} availableApprovalTypes
   * @param {number} decidedIndex 강제적으로 지정할 옵션 인덱스
   */
  setApprovalTypes(availableApprovalTypes, decidedIndex = -1) {
    //
    let hoxDisplayApprovalType = getText(this.participant, 'displayApprovalType');
    let hoxApprovalType = getText(this.participant, 'approvalType');
    let hoxApprovalSubType = getText(this.participant, 'approvalSubType');
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
        // 기존 선택값으로
        if (hoxApprovalType === approvalType.type && hoxApprovalSubType === approvalType.subType) {
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

    console.log(`${this.index}. ${JSON.stringify(availableApprovalTypes.map((type) => type.text))} ${decidedIndex} => ${matchedIndex}`);

    setText(this.participant, 'approvalType', availableApprovalTypes[matchedIndex].type);
    setText(this.participant, 'approvalSubType', availableApprovalTypes[matchedIndex].subType);
    setText(this.participant, 'displayApprovalType', availableApprovalTypes[matchedIndex].text);
    setText(this.participant, 'displayResourceCode', availableApprovalTypes[matchedIndex].resourceCode);

    // 권한설정
    this.#changedGrantedActionCallback();
  }

  setCellName(cellName) {
    setText(this.participant, 'mappingCell cellName', cellName);
  }

  /**
   * 결재방법 변경 후 권한설정 처리
   */
  #changedGrantedActionCallback() {
    let resourceCode = getText(this.participant, 'displayResourceCode');
    switch (resourceCode) {
      case 'st_first': // 기안
        // 전체선택, Readonly
        this.#toggleGrantedAction(true);
        this.#disabledGrantedAction(true);
        break;
      case 'st_user_nosign': // 확인
      case 'st_other': // 검토
      case 'st_current': // 결재
      case 'st_user_jeonkyul': // 전결
        // 선택 가능
        this.#checkGrantedAction();
        this.#disabledGrantedAction(false);
        break;
      default: // 그외
        // 전체해제, Readonly
        this.#toggleGrantedAction(false);
        this.#disabledGrantedAction(true);
        break;
    }

    toggleFlag(this.participant, 'grantedAction', 'defaultaction_editdoc', this.shadowRoot.querySelector('#editdoc').checked);
    toggleFlag(this.participant, 'grantedAction', 'defaultaction_setupflow', this.shadowRoot.querySelector('#setupflow').checked);
    toggleFlag(this.participant, 'grantedAction', 'defaultaction_addattach', this.shadowRoot.querySelector('#addattach').checked);
    toggleFlag(this.participant, 'grantedAction', 'defaultaction_delattach', this.shadowRoot.querySelector('#delattach').checked);
  }

  #disabledGrantedAction(force) {
    this.shadowRoot.querySelectorAll('.actions input').forEach((checkbox) => {
      checkbox.disabled = force;
    });
  }

  #toggleGrantedAction(force) {
    this.shadowRoot.querySelectorAll('.actions input').forEach((checkbox) => {
      checkbox.checked = force;
    });
  }

  #checkGrantedAction() {
    //
    this.shadowRoot.querySelector('#editdoc').checked = this.grantedAction.editdoc;
    this.shadowRoot.querySelector('#setupflow').checked = this.grantedAction.setupflow;
    this.shadowRoot.querySelector('#addattach').checked = this.grantedAction.addattach;
    this.shadowRoot.querySelector('#delattach').checked = this.grantedAction.delattach;
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

  get approvalSubType() {
    return getText(this.participant, 'approvalSubType');
  }
}

customElements.define('fe-participant', FeParticipant);
