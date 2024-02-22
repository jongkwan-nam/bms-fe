import { getAttr, getText } from '../../utils/xmlUtils';
import './FePubshow.scss';

/**
 * 공람: 선택된 공람자
 */
export default class FePubshow extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './main.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.innerHTML = `
      <div class="info">
        <span class="img-profile"></span>
        <span class="name"></span>
        <span class="rank"></span>
        <span class="team"></span>
      </div>
      <div class="close">
        <button type="button">&times;</button>
      </div>
    `;

    this.shadowRoot.append(LINK, wrapper);
  }

  /**
   *
   * @param {Element} pubshow
   */
  set(pubshow) {
    console.log('FePubshow set', pubshow);
    /*
      <pubShow>
          <ID>001000001</ID>
          <name>남종관</name>
          <type>user</type>
          <position></position>
          <department>
              <ID>000010100</ID>
              <name>FE팀</name>
          </department>
          <actorID>001000001</actorID>
          <actorDeptID>000010100</actorDeptID>
      </pubShow>
    */
    let pubshowId = getText(pubshow, 'ID');
    let pubshowType = getText(pubshow, 'type');
    let pubshowName = getText(pubshow, 'name');
    let pubshowPosition = getText(pubshow, 'position');
    let pubshowDeptId = getText(pubshow, 'department ID');
    let pubshowDeptName = getText(pubshow, 'department name');

    this.pubshow = pubshow;
    this.setAttribute('id', pubshowId);
    this.setAttribute('type', pubshowType);

    const imgProfile = this.shadowRoot.querySelector('.img-profile');
    const name = this.shadowRoot.querySelector('.name');
    const rank = this.shadowRoot.querySelector('.rank');
    const team = this.shadowRoot.querySelector('.team');
    const delBtn = this.shadowRoot.querySelector('button');
    delBtn.addEventListener('click', () => {
      // 삭제 이벤트 전파
      this.dispatchEvent(new CustomEvent('deletePubshow', { bubbles: true, composed: true, detail: { type: pubshowType, id: pubshowId } }));
    });

    switch (pubshowType) {
      case 'dept': {
        imgProfile.style.backgroundImage = `url('/user/img/team_profile_blank.png')`;
        name.innerHTML = pubshowName;
        break;
      }
      case 'user': {
        imgProfile.style.backgroundImage = `url('/jsp/org/view/ViewPicture.jsp?user_id=${pubshowId}')`;
        name.innerHTML = pubshowName;
        rank.innerHTML = pubshowPosition;
        team.innerHTML = pubshowDeptName;
        break;
      }
      case 'deptGroup': {
        name.innerHTML = pubshowName;
        break;
      }
      default:
        throw new Error('unknown type: ' + pubshowType);
    }
  }

  get id() {
    return getText(this.pubshow, 'ID');
  }

  get type() {
    return getAttr(this.pubshow, null, 'type');
  }
}

customElements.define('fe-pubshow', FePubshow);
