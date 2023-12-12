import { HoxEventType, getAttr, getFlagList, setText } from '../../utils/hoxUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeSpecialDoc.scss';

/**
 *
 */
export default class FeSpecialDoc extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    const pubspdoc = ['pubspdoc_present', 'pubspdoc_secret', 'pubspdoc_eachmng', 'pubspdoc_copyright', 'pubspdoc_specialspec'];

    pubspdoc.forEach((item) => {
      //
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'checkbox';
      input.id = item;
      input.value = item;
      input.addEventListener('change', (e) => {
        console.debug('FeSpecialDoc change', e.target.value);
        //
        let pubspdocValue = Array.from(this.shadowRoot.querySelectorAll('[id^="pubspdoc_"]'))
          .filter((input) => input.checked)
          .map((input) => input.value)
          .join(' ');

        setText(this.hox, 'docInfo publication specialDoc', pubspdocValue);
      });

      let label = wrapper.appendChild(document.createElement('label'));
      label.setAttribute('for', item);
      label.innerHTML = GWWEBMessage[item];
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    super.setHox(hox);

    this.hox.addEventListener(HoxEventType.PUBLICATIONTYPE, (e) => {
      console.info('hoxEvent listen', e.type, e.detail);
      // 공개여부 변동에 따라
      let newValue = e.detail.value;

      if (newValue === 'pubtype_open') {
        this.shadowRoot.querySelector('#pubspdoc_secret').checked = false;
        this.shadowRoot.querySelector('#pubspdoc_secret').disabled = true;
        this.shadowRoot.querySelector('#pubspdoc_secret').dispatchEvent(new Event('change'));
      } else if (newValue === 'pubtype_partial') {
        this.shadowRoot.querySelector('#pubspdoc_secret').disabled = false;
      } else if (newValue === 'pubtype_not') {
        this.shadowRoot.querySelector('#pubspdoc_secret').disabled = false;
      }
    });

    // hox값 화면 표시
    getFlagList(this.hox, 'docInfo publication specialDoc').forEach((flag) => {
      console.debug('specialDoc', flag);
      //
      this.shadowRoot.querySelector('#' + flag).checked = true;
    });
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('input').forEach((input) => (input.disabled = this.contentNumber > 1));
    if (this.contentNumber === 1) {
      // 1안이고, 공개이면 비밀기록물은 disabled이어야 한다
      if (getAttr(this.hox, 'docInfo publication', 'type') === 'pubtype_open') {
        this.shadowRoot.querySelector('#pubspdoc_secret').disabled = true;
      }
    }
  }
}

// Define the new element
customElements.define('fe-specialdoc', FeSpecialDoc);
