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
 * text로 xml node를 만든다
 * @param {string} xmlText
 * @returns
 */
export const createNode = (xmlText) => {
  return new DOMParser().parseFromString(xmlText, 'text/xml').childNodes[0];
};

/**
 * hox에 해당 노드가 존재하는지
 * @param {Element} element
 * @param {string} selectors
 * @returns
 */
export const existsNode = (element, selectors) => {
  return element.querySelectorAll(selectors).length > 0;
};

/**
 * 노드 추가
 * @param {Document} hox
 * @param {string} selectors
 * @param {string} newNodeNames
 */
export const addNode = (hox, selectors, ...newNodeNames) => {
  hox.querySelectorAll(selectors).forEach((element) => {
    newNodeNames.forEach((newNodeName) => {
      element.appendChild(hox.createElement(newNodeName));
    });
  });
};

/**
 * 노드 반환
 * @param {Element} element
 * @param {string} selectors
 * @param {number} nth 결과가 복수일때, 선택할 노드의 index
 * @returns
 */
export const getNode = (element, selectors, nth = 0) => {
  if (selectors !== null) {
    const nodeList = element.querySelectorAll(selectors);
    if (nodeList.length > 0) {
      return nodeList[nth];
    }
    return null;
  } else {
    return element;
  }
};

/**
 * 노드 배열 반환
 * @param {Element} element
 * @param {string} selectors
 * @returns
 */
export const getNodes = (element, selectors) => {
  return element.querySelectorAll(selectors);
};

/**
 * element의 값이 [ true | 1 ] 인지
 * @param {Element} element
 * @param {string} selectors
 * @returns
 */
export const getBoolean = (element, selectors) => {
  let text = element.querySelector(selectors)?.textContent;
  return text?.trim() === 'true' || text?.trim() === '1';
};

/**
 * element의 값을 number로 반환
 * @param {Element} element
 * @param {string} selectors
 * @returns
 */
export const getNumber = (element, selectors) => {
  let text = element.querySelector(selectors)?.textContent;
  return text ? parseInt(text) : 0;
};

/**
 * 해당 값 구하기
 * @param {Element} element
 * @param {string} selectors
 * @param {number} nth
 * @returns
 */
export const getText = (element, selectors, nth = 0) => {
  if (nth > 0) {
    return getNode(element, selectors, nth).textContent;
  }
  return element.querySelector(selectors)?.textContent;
};

/**
 * 해당 값 설정
 * @param {Element} element
 * @param {string} selectors
 * @param {string} text
 */
export const setText = (element, selectors, text) => {
  element.querySelector(selectors).textContent = text;
};

/**
 * 해당 값을 CDATA로 설정
 * @param {Element} element
 * @param {string} selectors
 * @param {string} text
 */
export const setTextCDATA = (element, selectors, text) => {
  element.querySelector(selectors).textContent = null;
  element.querySelector(selectors).appendChild(element.getRootNode().createCDATASection(text));
};

/**
 * 해당 속성 구하기
 * @param {Element} element
 * @param {string?} selectors null이면, element의 속성
 * @param {string} attName
 * @returns
 */
export const getAttr = (element, selectors, attName) => {
  if (selectors === null) {
    return element.getAttribute(attName);
  } else {
    return element.querySelector(selectors)?.getAttribute(attName);
  }
};

/**
 * 해당 속성 값 설정
 * @param {Element} element
 * @param {string} selectors
 * @param {string} attName
 * @param {string} attValue
 */
export const setAttr = (element, selectors, attName, attValue) => {
  if (selectors === null) {
    element.setAttribute(attName, attValue);
  } else {
    element.querySelector(selectors)?.setAttribute(attName, attValue);
  }
};

/**
 * 해당 값중에 flag가 있는지 여부
 * @param {Element} element
 * @param {string} selectors
 * @param {string} flag
 * @returns
 */
export const existsFlag = (element, selectors, flag) => {
  return ArrayUtils.split(getText(element, selectors)).includes(flag);
};

/**
 * 해당 값중에 flag 추가
 * @param {Element} element
 * @param {string} selectors
 * @param {string} flag
 */
export const addFlag = (element, selectors, flag) => {
  const flagArray = ArrayUtils.split(getText(element, selectors));
  ArrayUtils.add(flagArray, flag);
  element.querySelector(selectors).textContent = flagArray.join(' ');
};

/**
 * 해당 값중에 flag 제거
 * @param {Element} element
 * @param {string} selectors
 * @param {string} flag
 */
export const removeFlag = (element, selectors, flag) => {
  const flagArray = ArrayUtils.split(getText(element, selectors));
  ArrayUtils.remove(flagArray, flag);
  element.querySelector(selectors).textContent = flagArray.join(' ');
};

/**
 * force에 따라 추가 또는 제거
 * @param {Element} element
 * @param {string} selectors
 * @param {string} flag
 * @param {boolean} force
 */
export const toggleFlag = (element, selectors, flag, force) => {
  if (force) {
    addFlag(element, selectors, flag);
  } else {
    removeFlag(element, selectors, flag);
  }
};

/**
 * 해당 값을 flag 배열로 반환
 * @param {Element} element
 * @param {string} selectors
 * @returns
 */
export const getFlagList = (element, selectors) => {
  return ArrayUtils.split(getText(element, selectors));
};

/**
 * hox 이벤트 전파
 * @param {Element} element
 * @param {string} selectors
 * @param {string} eventType
 * @param {string} eventDetailType
 * @param {object} eventDetailValue
 */
export const dispatchHoxEvent = (element, selectors, eventType, eventDetailType, eventDetailValue) => {
  getNode(element, selectors).dispatchEvent(
    new CustomEvent(eventType, {
      bubbles: true,
      composed: true,
      detail: {
        type: eventDetailType,
        value: eventDetailValue,
      },
    })
  );
};

export const HoxEventType = {
  FOLDER: 'folder',
  ENFORCETYPE: 'enforceType',
  PUBLICATIONTYPE: 'publicationType',
  OBJECTIDLIST: 'objectIDList',
  CONTENT: 'content',
  TITLE: 'title',
};
