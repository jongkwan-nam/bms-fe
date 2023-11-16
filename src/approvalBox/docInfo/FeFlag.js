import { toggleFlag } from '../../utils/hoxUtils';

const data = [
  { flag: 'apprflag_temporary_work', msgCode: 'cmsg_2748' }, // 비정규직 열람
  { flag: 'apprflag_enforcedocpost', msgCode: 'cmsg_1806' }, // 시행문게시
  { flag: 'apprflag_express', msgCode: 'cmsg_1814' }, // 긴급
  { flag: 'apprflag_password', msgCode: 'cmsg_639' }, // 열람시 암호 확인
];

/**
 *
 */
export default class FeFlag extends HTMLElement {
  constructor() {
    super();
    console.debug('FeFlag init');
  }

  connectedCallback() {
    console.debug('FeFlag connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-flag');
    this.shadowRoot.append(LINK, wrapper);

    data.forEach((item) => {
      //
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'checkbox';
      input.id = item.flag;
      input.value = item.flag;
      input.addEventListener('change', (e) => {
        console.log(e.target.id, e.type, e.target.value);

        toggleFlag(this.hox, 'docInfo approvalFlag', e.target.value, e.target.checked);
      });

      let label = wrapper.appendChild(document.createElement('label'));
      label.setAttribute('for', item.flag);
      label.innerHTML = GWWEBMessage[item.msgCode];
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;
  }
}

// Define the new element
customElements.define('fe-flag', FeFlag);
