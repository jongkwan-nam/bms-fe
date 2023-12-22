/*
  스타일 관리
  - 테마: OS 테마, 라이트, 다크
  - 폰트
 */
import FeStorage from '../utils/FeStorage';

const FONT_KEY = 'FeMain.font';
const THEME_KEY = 'FeMain.theme';
const OS = 'os';
const LIGHT = 'light';
const DARK = 'dark';

export default class StyleController {
  constructor() {
    //
    this.fontSize = FeStorage.local.getNumber(FONT_KEY, 11); // 단위 pt
    this.theme = FeStorage.local.get(THEME_KEY, LIGHT);
    this.darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.isDark;

    /**
     * Storage theme change Listener
     * ! 스토리지를 변경한 페이지에선 이벤트가 발생하지 않음
     */
    onstorage = (e) => {
      console.debug('onstorage', e.key, e.oldValue, e.newValue);
      if (e.key === THEME_KEY) {
        this.theme = e.newValue;
        this.applyTheme();
      } else if (e.key === FONT_KEY) {
        this.fontSize = e.newValue;
        this.applyFontSize();
      }
    };

    this.darkMediaQuery.addEventListener('change', (e) => {
      console.debug('darkMediaQuery change', e);
      if (this.theme === OS) {
        this.applyTheme();
      }
    });
  }

  start() {
    this.applyTheme();
    this.applyFontSize();
  }

  /**
   * 테마 변경
   * @param {string} changedTheme
   */
  applyTheme(changedTheme = null) {
    if (changedTheme !== null) {
      this.theme = changedTheme;
    }
    if (this.theme === OS) {
      this.isDark = this.darkMediaQuery.matches;
    } else {
      this.isDark = this.theme === DARK;
    }

    document.documentElement.setAttribute('theme', this.isDark ? DARK : LIGHT);
    FeStorage.local.set(THEME_KEY, this.theme);
    console.debug('applyTheme', this.theme, this.isDark ? DARK : LIGHT);
  }

  /**
   * 전체 폰트 크기 변경
   * @param {number} changedFontSize
   */
  applyFontSize(changedFontSize = null) {
    if (changedFontSize !== null) {
      this.fontSize = changedFontSize;
    }

    document.querySelector('html').style.fontSize = this.fontSize + 'pt';
    FeStorage.local.set(FONT_KEY, this.fontSize);
    console.debug('applyFontSize', this.fontSize);
  }
}
