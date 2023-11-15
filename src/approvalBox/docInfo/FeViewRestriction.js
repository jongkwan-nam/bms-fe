/**
 *
 */
export default class FeViewRestriction extends HTMLElement {
  constructor() {
    super();
    console.debug('FeViewRestriction init');
  }

  connectedCallback() {
    console.debug('FeViewRestriction connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-viewrestriction');
    this.shadowRoot.append(LINK, wrapper);

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
        this.hox.querySelector('docInfo viewRestriction').textContent = e.target.value;

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
      this.hox.querySelector('docInfo securityExpireDate').textContent = e.target.value;
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    let viewRestriction = this.hox.querySelector('docInfo viewRestriction').textContent;
    let securityExpireDate = this.hox.querySelector('docInfo securityExpireDate').textContent;
    let input = this.shadowRoot.querySelector(`#viewRestriction_${viewRestriction}`);
    console.log('FeViewRestriction set', input);
    if (input) {
      input.checked = true;

      this.shadowRoot.querySelector('#securityExpireDate').readOnly = securityExpireDate !== 'expireDate';
      if (viewRestriction === 'expireDate') {
        //
        this.shadowRoot.querySelector('#securityExpireDate').value = securityExpireDate;
      }
    }
  }
}

// Define the new element
customElements.define('fe-viewrestriction', FeViewRestriction);
