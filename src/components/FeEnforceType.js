/**
 * 발송종류
 */
export default class FeEnforceType extends HTMLElement {
  constructor() {
    super();
    console.log('FeEnforceType init');
  }

  connectedCallback() {
    console.log('FeEnforceType connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './index.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-enforcetype');
    this.shadowRoot.append(LINK, wrapper);

    let enforcetypes = ['enforcetype_external', 'enforcetype_internal', 'enforcetype_not'];

    enforcetypes.forEach((type) => {
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'radio';
      input.name = 'enforcetype';
      input.id = type;
      input.value = type;
      input.addEventListener('change', (e) => {
        console.log(e.target.id, e.type, e.target.value);
        //
        this.hox.querySelector('docInfo enforceType').textContent = e.target.value;
      });

      let label = wrapper.appendChild(document.createElement('label'));
      label.setAttribute('for', type);
      label.innerHTML = GWWEBMessage[type];
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    let enforceType = hox.querySelector('docInfo enforceType').textContent;
    let enforceTypeRadio = this.shadowRoot.querySelector('#' + enforceType);
    if (enforceTypeRadio) {
      enforceTypeRadio.checked = true;
    }
  }
}

// Define the new element
customElements.define('fe-enforcetype', FeEnforceType);
