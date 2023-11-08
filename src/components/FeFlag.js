import * as StringUtils from '../utils/stringUtils';
import * as ArrayUtils from '../utils/arrayUtils';

const data = [
  { flag: 'apprflag_temporary_work', msgCode: 'cmsg_2748' }, // 비정규직 열람
  { flag: 'apprflag_enforcedocpost', msgCode: 'cmsg_1806' }, // 시행문게시
  { flag: 'apprflag_express', msgCode: 'cmsg_1814' }, // 긴급
  { flag: 'apprflag_password', msgCode: 'cmsg_639' }, // 열람시 암호 확인
];

const CSS = ``;

/**
 *
 */
export default class FeFlag extends HTMLElement {
  constructor() {
    super();
    console.log('FeFlag init');
  }

  connectedCallback() {
    console.log('FeFlag connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './css/common.css');

    const STYLE = document.createElement('style');
    STYLE.innerHTML = CSS;

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-flag');
    this.shadowRoot.append(LINK, STYLE, wrapper);

    data.forEach((item) => {
      //
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'checkbox';
      input.id = item.flag;
      input.value = item.flag;
      input.addEventListener('change', (e) => {
        console.log(e.target.id, e.type, e.target.value);
        //
        let approvalFlag = this.hox.querySelector('docInfo approvalFlag').textContent;
        let flagArray = approvalFlag.split(' ').filter((flag) => StringUtils.isNotBlank(flag));

        ArrayUtils.toggle(flagArray, e.target.value, e.target.checked);

        this.hox.querySelector('docInfo approvalFlag').textContent = flagArray.join(' ');
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
