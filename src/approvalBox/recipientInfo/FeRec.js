import StringUtils from '../../utils/StringUtils';
import { getAttr, getText } from '../../utils/xmlUtils';
import './FeRec.scss';

/**
 * 수신부서: 선택된 수신자
 */
export default class FeRec extends HTMLElement {
  constructor() {
    super();
    console.debug('FeRec init');

    this.init();
  }

  connectedCallback() {
    // FeRecList에서 위치조정(insertBefore)을 하기 때문에, 반복 호출되므로 attachShadow가 위치하면 안된다
  }

  init() {
    console.debug('FeRec connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-rec');
    wrapper.innerHTML = `
      <span class="rec-type"></span>
      <div class="rec-info">
        <span class="img-profile"></span>
        <span class="name"></span>
        <span class="rank"></span>
        <span class="team"></span>
      </div>
      <div class="rec-close">
        <button type="button">&times;</button>
      </div>
    `;

    this.shadowRoot.append(LINK, wrapper);
  }

  /**
   *
   * @param {Element} rec
   */
  set(rec) {
    let type = getAttr(rec, null, 'type');
    let id = getText(rec, 'ID');
    let chargerID = getText(rec, 'charger ID');

    this.rec = rec;
    this.setAttribute('id', id);
    this.setAttribute('type', type);

    const recType = this.shadowRoot.querySelector('.rec-type');
    const imgProfile = this.shadowRoot.querySelector('.img-profile');
    const name = this.shadowRoot.querySelector('.name');
    const rank = this.shadowRoot.querySelector('.rank');
    const team = this.shadowRoot.querySelector('.team');
    const delBtn = this.shadowRoot.querySelector('button');
    delBtn.addEventListener('click', () => {
      // 삭제 이벤트 전파
      this.dispatchEvent(new CustomEvent('deleteRec', { bubbles: true, composed: true, detail: { type: type, id: id, chargerID: chargerID } }));
    });

    switch (type) {
      case 'rectype_dept': {
        let chargerID = getText(rec, 'charger ID');
        if (StringUtils.isBlank(chargerID)) {
          // 부서 선택
          recType.innerHTML = GWWEBMessage.hsappr_0164;
          imgProfile.style.backgroundImage = `url('/user/img/team_profile_blank.png')`;
          name.innerHTML = getText(rec, 'name');
        } else {
          // 사용자 선택
          recType.innerHTML = GWWEBMessage.W2440;
          imgProfile.style.backgroundImage = `url('/jsp/org/view/ViewPicture.jsp?user_id=${chargerID}')`;
          name.innerHTML = getText(rec, 'charger name');
          let positionName = getText(rec, 'charger positionName');
          if (StringUtils.isBlank(positionName)) {
            // TODO 직위 구하고, 설정
          }
          rank.innerHTML = positionName;
          team.innerHTML = getText(rec, 'name');
        }
        break;
      }
      case 'rectype_unifiedgroup': {
        recType.innerHTML = GWWEBMessage.cmsg_1166;
        name.innerHTML = getText(rec, 'name');
        break;
      }
      case 'rectype_manual': {
        recType.innerHTML = GWWEBMessage.cmsg_1167;
        name.innerHTML = getText(rec, 'name');
        break;
      }
      case 'rectype_ldap': {
        recType.innerHTML = GWWEBMessage.rectype_ldap;
        imgProfile.style.backgroundImage = `url('/user/img/profile_photo_blank.png')`;
        name.innerHTML = getText(rec, 'name');
        break;
      }
      default:
        throw new Error('unknown type: ' + type);
    }
  }

  get displayString() {
    return getText(this.rec, 'displayString');
  }

  get id() {
    return getText(this.rec, 'ID');
  }

  get type() {
    return getAttr(this.rec, null, 'type');
  }
}

customElements.define('fe-rec', FeRec);
