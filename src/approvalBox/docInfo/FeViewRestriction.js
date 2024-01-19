import { getText, setText } from '../../utils/xmlUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeViewRestriction.scss';

/**
 * 열람제한
 */
export default class FeViewRestriction extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    let viewRestrictions = [
      ['none', 'cmsg_292'],
      ['beforeComplete', 'cmsg_2147'],
      ['permanent', 'cmsg_1804'],
      ['expireDate', 'cmsg_2148'],
    ];
    for (let viewRestriction of viewRestrictions) {
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'radio';
      input.name = 'viewRestriction';
      input.id = 'viewRestriction_' + viewRestriction[0];
      input.value = viewRestriction[0];
      input.addEventListener('change', (e) => {
        //
        console.log('FeViewRestriction change', e.target.value);
        setText(this.hox, 'docInfo viewRestriction', e.target.value);

        this.shadowRoot.querySelector('#securityExpireDate').readOnly = e.target.value !== 'expireDate';
      });

      let label = wrapper.appendChild(document.createElement('label'));
      label.setAttribute('for', 'viewRestriction_' + viewRestriction[0]);
      label.innerHTML = GWWEBMessage[viewRestriction[1]];
    }
    // securityExpireDate
    let input = wrapper.appendChild(document.createElement('input'));
    input.type = 'date';
    input.id = 'securityExpireDate';
    input.addEventListener('change', (e) => {
      //
      setText(this.hox, 'docInfo securityExpireDate', e.target.value);
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    super.setHox(hox);

    let viewRestriction = getText(this.hox, 'docInfo viewRestriction');
    let securityExpireDate = getText(this.hox, 'docInfo securityExpireDate');
    let input = this.shadowRoot.querySelector(`#viewRestriction_${viewRestriction}`);
    if (input) {
      input.checked = true;

      this.shadowRoot.querySelector('#securityExpireDate').readOnly = securityExpireDate !== 'expireDate';
      if (viewRestriction === 'expireDate') {
        //
        this.shadowRoot.querySelector('#securityExpireDate').value = securityExpireDate;
      }
    }
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('input').forEach((input) => (input.disabled = this.contentNumber > 1));
  }
}

// Define the new element
customElements.define('fe-viewrestriction', FeViewRestriction);
