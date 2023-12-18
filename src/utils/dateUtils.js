import { unshift } from './stringUtils';

/**
 *
 * @param {*} date
 * @param {*} pattern yyyy, yy, mm, m, dd, d, hh, h, mi, i, ss, s
 */
export function format(date = new Date(), pattern = 'yyyy-mm-dd hh:mi:ss') {
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
  formatDate = formatDate.replace('yyyy', year);
  formatDate = formatDate.replace('yy', zero(year - 2000, 2));
  formatDate = formatDate.replace('mm', zero(month, 2));
  formatDate = formatDate.replace('mi', zero(minute, 2));
  formatDate = formatDate.replace('m', month);
  formatDate = formatDate.replace('i', minute);
  formatDate = formatDate.replace('dd', zero(day, 2));
  formatDate = formatDate.replace('d', day);
  formatDate = formatDate.replace('hh', zero(hour, 2));
  formatDate = formatDate.replace('h', hour);
  formatDate = formatDate.replace('ss', zero(second, 2));
  formatDate = formatDate.replace('s', second, 2);

  return formatDate;
}

function zero(num, len) {
  return unshift(num, len, '0');
}
