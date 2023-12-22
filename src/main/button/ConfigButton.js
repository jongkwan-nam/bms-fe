import SVG from '../../svg/SVG';

export default class ConfigButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = SVG.option;
    this.classList.add('btn', 'btn-primary');
    this.addEventListener('click', (e) => this.#doAction());

    /* 글자크기 변경 */
    document.querySelector('#fontSize').addEventListener('change', (e) => {
      let size = e.target.value;
      document.querySelector('html').style.fontSize = size + 'px';
    });
  }

  async #doAction() {
    const hox = feMain.hox;
    document.querySelector('#config').classList.toggle('open');
  }
}

customElements.define('config-button', ConfigButton, { extends: 'button' });
