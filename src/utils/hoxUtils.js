import * as ArrayUtils from './arrayUtils';

/**
 * 서버에서 xml을 로딩
 * @param {string} trid
 * @returns
 */
export const loadHox = async (trid) => {
  const res = await fetch('/bms/com/hs/gwweb/appr/retrieveSancLineXmlInfoByTrid.act?TRID=' + trid);
  const xmlText = await res.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  console.debug(xmlDoc);

  // hox 정상인지 체크
  if (xmlDoc.querySelector('docInfo title') === null) {
    throw new Error('hox is not valid');
  }

  return xmlDoc;
};

/**
 * hox에 해당 노드가 존재하는지
 * @param {Element} hox
 * @param {string} selectors
 * @returns
 */
export const existsNode = (hox, selectors) => {
  return hox.querySelectorAll(selectors).length > 0;
};

/**
 * 노드 추가
 * @param {Document} hox
 * @param {string} selectors
 * @param {string} newNodeName
 */
export const addNode = (hox, selectors, newNodeName) => {
  hox.querySelectorAll(selectors).forEach((element) => {
    element.appendChild(hox.createElement(newNodeName));
  });
};

/**
 * 첫번째 노드 1개 반환
 * @param {Element} hox
 * @param {string} selectors
 * @returns
 */
export const getNode = (hox, selectors) => {
  return hox.querySelector(selectors);
};

/**
 * 노드 배열 반환
 * @param {Element} hox
 * @param {string} selectors
 * @returns
 */
export const getNodes = (hox, selectors) => {
  return hox.querySelectorAll(selectors);
};

/**
 * hox의 해당 값 구하기
 * @param {Element} hox
 * @param {string} selectors
 * @returns
 */
export const getText = (hox, selectors) => {
  return hox.querySelector(selectors)?.textContent;
};

/**
 * hox의 해당 값 설정
 * @param {Element} hox
 * @param {string} selectors
 * @param {string} text
 */
export const setText = (hox, selectors, text) => {
  hox.querySelector(selectors).textContent = text;
};

/**
 * hox의 해당 값을 CDATA로 설정
 * @param {Document} hox
 * @param {string} selectors
 * @param {string} text
 */
export const setTextCDATA = (hox, selectors, text) => {
  console.log('setTextCDATA', selectors, text);
  //
  hox.querySelector(selectors).textContent = null;
  hox.querySelector(selectors).appendChild(hox.createCDATASection(text));
};

/**
 * hox의 해당 속성 구하기
 * @param {Element} hox
 * @param {string} selectors
 * @param {string} attName
 * @returns
 */
export const getAttr = (hox, selectors, attName) => {
  return hox.querySelector(selectors)?.getAttribute(attName);
};

/**
 * hox의 해당 속성 값 설정
 * @param {Element} hox
 * @param {string} selectors
 * @param {string} attName
 * @param {string} attValue
 */
export const setAttr = (hox, selectors, attName, attValue) => {
  hox.querySelector(selectors)?.setAttribute(attName, attValue);
};

/**
 * hox의 해당 값중에 flag가 있는지 여부
 * @param {Element} hox
 * @param {string} selectors
 * @param {string} flag
 * @returns
 */
export const existsFlag = (hox, selectors, flag) => {
  return ArrayUtils.split(getText(hox, selectors)).includes(flag);
};

/**
 * hox의 해당 값중에 flag 추가
 * @param {Element} hox
 * @param {string} selectors
 * @param {string} flag
 */
export const addFlag = (hox, selectors, flag) => {
  const flagArray = ArrayUtils.split(getText(hox, selectors));
  ArrayUtils.add(flagArray, flag);
  hox.querySelector(selectors).textContent = flagArray.join(' ');
};

/**
 * hox의 해당 값중에 flag 제거
 * @param {Element} hox
 * @param {string} selectors
 * @param {string} flag
 */
export const removeFlag = (hox, selectors, flag) => {
  const flagArray = ArrayUtils.split(getText(hox, selectors));
  ArrayUtils.remove(flagArray, flag);
  hox.querySelector(selectors).textContent = flagArray.join(' ');
};

/**
 * force에 따라 추가 또는 제거
 * @param {Element} hox
 * @param {string} selectors
 * @param {string} flag
 * @param {boolean} force
 */
export const toggleFlag = (hox, selectors, flag, force) => {
  if (force) {
    addFlag(hox, selectors, flag);
  } else {
    removeFlag(hox, selectors, flag);
  }
};

/**
 * hox의 해당 값을 flag 배열로 반환
 * @param {Element} hox
 * @param {string} selectors
 * @returns
 */
export const getFlagList = (hox, selectors) => {
  return ArrayUtils.split(getText(hox, selectors));
};
