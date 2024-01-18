export default class StringUtils {
  /**
   *
   * @param {string} ch
   * @returns
   */
  static charByteSize(ch) {
    if (ch == null || ch.length == 0) {
      return 0;
    }
    var charCode = ch.charCodeAt(0);
    if (charCode <= 0x00007f) {
      if (charCode == 0x00000a) {
        return 2;
      } else {
        return 1;
      }
    } else if (charCode <= 0x0007ff) {
      return 2;
    } else if (charCode <= 0x00ffff) {
      return 3;
    } else {
      return 4;
    }
  }

  /**
   * str이 몇 바이트인지 구하기
   * @param {string} str
   * @returns
   */
  static getBytesLength(str) {
    let l = 0;
    for (let i = 0; i < str.length; i++) {
      l += this.charByteSize(str.charAt(i));
    }
    return l;
  }

  /**
   *
   * @param {string} str
   * @param {number} max
   * @returns
   */
  static cutByMaxBytes(str, max) {
    let size = 0;
    for (let i = 0; i < str.length; i++) {
      let byteSize = this.charByteSize(str.charAt(i));
      size += byteSize;
      if (size > max) {
        return str.substring(0, i);
      }
    }
    return str;
  }

  /**
   * 빈값인지
   * @param {string} str
   * @returns
   * - undefined = true
   * - null = true
   * - '' = true
   * - ' ' = true
   */
  static isBlank(str) {
    return typeof str === 'undefined' || str === null || str.trim() === '';
  }

  /**
   *
   * @param {string} str
   * @returns
   */
  static isNotBlank(str) {
    return !this.isBlank(str);
  }

  static escapeXml(str) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return str.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  static unescapeXml(str) {
    var doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.documentElement.textContent;
  }

  /**
   * 총 길이가 len이 되도록 str 앞에 bit를 추가
   * @param {string | number} str
   * @param {number} len
   * @param {string} bit
   * @returns
   */
  static unshift(str, len, bit) {
    if (typeof str === 'number') {
      str = str.toString();
    }
    let end = len - str.length;
    for (let i = 0; i < end; i++) {
      str = bit + str;
    }
    return str;
  }
}
