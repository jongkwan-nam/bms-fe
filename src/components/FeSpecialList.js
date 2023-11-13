/**
 *
 */
export default class FeSpecialList extends HTMLElement {
  constructor() {
    super();
    console.log('FeSpecialList init');
  }

  connectedCallback() {
    console.log('FeSpecialList connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './index.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-speciallist');
    this.shadowRoot.append(LINK, wrapper);

    for (let i = 0; i < 3; i++) {
      this.input = wrapper.appendChild(document.createElement('input'));
      this.input.type = 'search';
      this.input.placeholder = GWWEBMessage.cmsg_414 + (i + 1);
      this.input.id = 'specialItem' + i;
      this.input.addEventListener('change', (e) => {
        console.log(e.target.id, 'change', e.target.value);
        // set hox
        this.hox.querySelectorAll('docInfo specialList specialItem')[i].textContent = e.target.value;
      });
    }
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    // element 존재여부 체크
    if (this.hox.querySelector('docInfo specialList') === null) {
      let specialList = this.hox.querySelector('docInfo').appendChild(this.hox.createElement('specialList'));
      specialList.append(this.hox.createElement('specialItem'), this.hox.createElement('specialItem'), this.hox.createElement('specialItem'));
    }

    this.hox.querySelectorAll('docInfo specialList specialItem').forEach((item, i) => {
      //
      this.shadowRoot.querySelector('#specialItem' + i).value = item.textContent;
    });
  }
}

// Define the new element
customElements.define('fe-speciallist', FeSpecialList);
