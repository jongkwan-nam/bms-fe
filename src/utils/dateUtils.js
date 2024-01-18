import StringUtils from './StringUtils';

export default class DateUtils {
  /**
   *
   * @param {*} date
   * @param {*} pattern
   * today: 2023녕 9월 6일 오전 4시 8분 4초
   * - YYYY: 4자리 연도. 2023
   * - YY: 2자리 연도. 23
   * - MMM: 월이름. 9월
   * - MM: 2자리 월. 09
   * - M: 1자리 월. 9
   * - DD: 2자리 일. 06
   * - D: 1자일 일. 6
   * - HH24: 24시간 2자리. 04
   * - MI: 분. 08
   * - SS: 초. 04
   */
  static format(date = new Date(), pattern = 'YYYY-MM-DD HH24:MI:SS') {
    if (typeof date !== 'object') {
      date = new Date(date);
    }
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    let formatDate = pattern;
    formatDate = formatDate.replace('YYYY', year);
    formatDate = formatDate.replace('YY', this.zero(year - 2000, 2));
    formatDate = formatDate.replace('MMM', GWWEBMessage.cmsg_2154.split(',')[month - 1]);
    formatDate = formatDate.replace('MM', this.zero(month, 2));
    formatDate = formatDate.replace('MI', this.zero(minute, 2));
    formatDate = formatDate.replace('M', month);
    formatDate = formatDate.replace('DD', this.zero(day, 2));
    formatDate = formatDate.replace('D', day);
    formatDate = formatDate.replace('HH24', this.zero(hour, 2));
    formatDate = formatDate.replace('SS', this.zero(second, 2));

    return formatDate;
  }

  static zero(num, len) {
    return StringUtils.unshift(num, len, '0');
  }
}
