import * as stringUtils from '../../utils/stringUtils';

/**
 *
 */
export default class FeSpecialDoc extends HTMLElement {
  static get observedAttributes() {
    return ['data-pubtype'];
  }

  constructor() {
    super();
    console.debug('FeSpecialDoc init');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('FeSpecialDoc attributeChangedCallback', name, oldValue, newValue);
    //
    if (name === 'data-pubtype') {
      if (newValue === 'pubtype_open') {
        this.shadowRoot.querySelector('#pubspdoc_secret').checked = false;
        this.shadowRoot.querySelector('#pubspdoc_secret').disabled = true;
        this.shadowRoot.querySelector('#pubspdoc_secret').dispatchEvent(new Event('change'));
      } else if (newValue === 'pubtype_partial') {
        this.shadowRoot.querySelector('#pubspdoc_secret').disabled = false;
      } else if (newValue === 'pubtype_not') {
        this.shadowRoot.querySelector('#pubspdoc_secret').disabled = false;
      }
    }
  }

  connectedCallback() {
    console.debug('FeSpecialDoc connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-specialdoc');
    this.shadowRoot.append(LINK, wrapper);

    const pubspdoc = ['pubspdoc_present', 'pubspdoc_secret', 'pubspdoc_eachmng', 'pubspdoc_copyright', 'pubspdoc_specialspec'];

    pubspdoc.forEach((item) => {
      //
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'checkbox';
      input.id = item;
      input.value = item;
      input.addEventListener('change', (e) => {
        console.log('FeSpecialDoc change', e.target.value);
        //
        let pubspdocValue = Array.from(this.shadowRoot.querySelectorAll('[id^="pubspdoc_"]'))
          .filter((input) => input.checked)
          .map((input) => input.value)
          .join(' ');

        this.hox.querySelector('docInfo publication specialDoc').textContent = pubspdocValue;
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
    this.hox = hox;

    // hox값 화면 표시
    let specialDoc = this.hox.querySelector('docInfo publication specialDoc').textContent;
    specialDoc
      .split(' ')
      .filter((flag) => stringUtils.isNotBlank(flag))
      .forEach((flag) => {
        //
        this.shadowRoot.querySelector('#' + flag).checked = true;
      });
  }
}

// Define the new element
customElements.define('fe-specialdoc', FeSpecialDoc);
