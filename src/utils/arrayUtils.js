import { isNotBlank } from './stringUtils';

/**
 * 배열에서 item 제거
 * @param {array} array
 * @param {string} item
 */
export const remove = (array, item) => {
  let idx = array.indexOf(item);
  if (idx > -1) {
    array.splice(idx, 1);
  }
};

/**
 * 배열에 item 추가. 없을때만 추가
 * @param {array} array
 * @param {string} item
 */
export const add = (array, item) => {
  let idx = array.indexOf(item);
  if (idx < 0) {
    array.push(item);
  }
};

/**
 * 배열의 item 을 force에 따라 추가 또는 제거한다
 * @param {array} array
 * @param {string} item
 * @param {boolean} force
 */
export const toggle = (array, item, force) => {
  if (force) {
    add(array, item);
  } else {
    remove(array, item);
  }
};

/**
 * text split. 공백은 제외한 배열로 반환
 * @param {string} text
 * @param {string} delimiter
 * @returns
 */
export const split = (text, delimiter = ' ') => {
  return text.split(delimiter).filter((e) => isNotBlank(e));
};
