const CSS = `
div.title {
  position: relative;
  text-align: center;
}
div.title input {
  display: block;
}
`;

/**
 *
 */
export default class FeTitle extends HTMLElement {
  constructor() {
    super();
    console.log('FeTitle init');
  }

  connectedCallback() {
    console.log('FeTitle connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './css/common.css');

    const STYLE = document.createElement('style');
    STYLE.innerHTML = CSS;

    const wrapper = document.createElement('div');
    wrapper.classList.add('title');
    this.shadowRoot.append(LINK, STYLE, wrapper);

    this.input = wrapper.appendChild(document.createElement('input'));
    this.input.type = 'text';
    this.input.addEventListener('change', (e) => {
      let title = e.target.value;
      // set hox
      this.hox.querySelector('docInfo title').textContent = title;

      this.dispatchEvent(new CustomEvent('change', { detail: { title: title } }));
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    this.input.value = hox.querySelector('docInfo title').textContent;
  }

  set title(title) {
    this.input.value = title;
  }
  get title() {
    return this.input.value;
  }
}

// Define the new element
customElements.define('fe-title', FeTitle);
