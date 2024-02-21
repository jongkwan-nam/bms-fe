import FeStorage from './FeStorage';

const DELAY = 300;
let timeoutId = null;

/**
 * 기억된 창크기로 변경
 *
 * @param {string} popupName
 * @param {number} minWidth
 * @param {number} minHeight
 */
export default (popupName, minWidth = 800, minHeight = 600) => {
  console.debug('popupSizeRestorer', popupName, minWidth, minHeight);
  //
  if (isWindowRemember()) {
    const feMainWindow = FeStorage.local.get(popupName);
    if (feMainWindow !== null) {
      const [width, height] = feMainWindow.split(',');
      window.resizeTo(width, height);
      console.debug('window.resizeTo', popupName, width, height);
    }
  }

  // 창크기 변경 기억
  window.addEventListener('resize', () => {
    if (isWindowRemember()) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = Math.max(minWidth, window.outerWidth);
        const height = Math.max(minHeight, window.outerHeight);
        FeStorage.local.set(popupName, width + ',' + height);
        console.log('window resize event. set Storage', popupName, width, height);
      }, DELAY);
    }
  });
};

function isWindowRemember() {
  return FeStorage.local.getBoolean('feMain.window.remember', false);
}
