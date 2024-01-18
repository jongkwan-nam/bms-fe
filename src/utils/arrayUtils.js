import StringUtils from './StringUtils';

export default class ArrayUtils {
  /**
   * 배열에서 item 제거
   * @param {array} array
   * @param {string} item
   */
  static remove(array, item) {
    let idx = array.indexOf(item);
    if (idx > -1) {
      array.splice(idx, 1);
    }
  }

  /**
   * 배열에 item 추가. 없을때만 추가
   * @param {array} array
   * @param {string} item
   */
  static add(array, item) {
    let idx = array.indexOf(item);
    if (idx < 0) {
      array.push(item);
    }
  }

  /**
   * 배열의 item 을 force에 따라 추가 또는 제거한다
   * @param {array} array
   * @param {string} item
   * @param {boolean} force
   */
  static toggle(array, item, force) {
    if (force) {
      this.add(array, item);
    } else {
      this.remove(array, item);
    }
  }

  /**
   * text split. 공백은 제외한 배열로 반환
   * @param {string} text
   * @param {string} delimiter
   * @returns
   */
  static split(text, delimiter = ' ') {
    return text.split(delimiter).filter((e) => StringUtils.isNotBlank(e));
  }
}
