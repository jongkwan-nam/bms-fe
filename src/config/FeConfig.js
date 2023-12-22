import SVG from '../svg/SVG';
import './FeConfig.scss';
import StyleController from './styleController';

/**
 * 환경 설정
 */
export default class FeConfig extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    //
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './main.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.innerHTML = `
      <div class="config-header">
        <label class="config-title">${GWWEBMessage.cmsg_2471}</label>
        <button type="button" id="btnConfig" title="${GWWEBMessage.cmsg_2471}">${SVG.option}</button>
      </div>
      <div class="config-body">
        <label for="fontSize">🖊️${GWWEBMessage.font_size}</label>
        <div>
          <input type="number" id="fontSize" min="10" max="18" step="1" value="11" />pt
        </div>
        <label>🔆${GWWEBMessage.color_theme}</label>
        <div class="theme-wrap">
          <input type="radio" name="theme" id="themeos" value="os" /><label for="themeos">${SVG.theme.os}</label>
          <input type="radio" name="theme" id="themelight" value="light" /><label for="themelight">${SVG.theme.light}</label>
          <input type="radio" name="theme" id="themedark" value="dark" /><label for="themedark">${SVG.theme.dark}</label>
        </div>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.shadowRoot.querySelector('#btnConfig').addEventListener('click', (e) => wrapper.classList.toggle('open'));

    const styleController = new StyleController();
    styleController.start();

    console.log(`styleController = fontSize: ${styleController.fontSize}, theme: ${styleController.theme}`);

    /* 글자크기 변경 */
    const fontSize = this.shadowRoot.querySelector('#fontSize');
    fontSize.addEventListener('change', () => {
      styleController.applyFontSize(fontSize.value);
    });
    fontSize.value = styleController.fontSize;

    /* 테마 변경 */
    this.shadowRoot.querySelectorAll('input[name="theme"]').forEach((theme) => {
      if (theme.value === styleController.theme) {
        theme.checked = true;
      }
      theme.addEventListener('change', () => {
        styleController.applyTheme(theme.value);
      });
    });
  }
}

customElements.define('fe-config', FeConfig);
