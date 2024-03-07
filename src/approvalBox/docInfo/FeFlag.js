import { HoxEventType, dispatchHoxEvent, existsFlag, toggleFlag } from '../../utils/xmlUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeFlag.scss';

const data = [
  { flag: 'apprflag_temporary_work', msgCode: 'cmsg_2748' }, // 비정규직 열람
  { flag: 'apprflag_enforcedocpost', msgCode: 'cmsg_1806' }, // 시행문게시
  { flag: 'apprflag_express', msgCode: 'cmsg_1814' }, // 긴급
  { flag: 'apprflag_password', msgCode: 'cmsg_639' }, // 열람시 암호 확인
];

if (doccfg.useAutoSend) {
  data.push({ flag: 'apprflag_auto_send', msgCode: 'cmsg_2777' }); // 자동발송
}

/**
 * 결재 플래그
 */
export default class FeFlag extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    data.forEach((item) => {
      //
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'checkbox';
      input.id = item.flag;
      input.value = item.flag;
      input.addEventListener('change', (e) => {
        console.log(e.target.id, e.type, e.target.value);

        toggleFlag(this.hox, 'docInfo approvalFlag', e.target.value, e.target.checked);

        dispatchHoxEvent(this.hox, 'docInfo approvalFlag', HoxEventType.FLAG, 'change', e.target.value);
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
    super.setHox(hox);

    data.forEach((item) => {
      if (existsFlag(hox, 'docInfo approvalFlag', item.flag)) {
        this.shadowRoot.getElementById(item.flag).checked = true;
      }
    });
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('input').forEach((input) => (input.disabled = this.contentNumber > 1));
  }
}

// Define the new element
customElements.define('fe-flag', FeFlag);
