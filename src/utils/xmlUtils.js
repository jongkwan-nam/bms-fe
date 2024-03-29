/*
 * XMLDocument Utility
 */

import ArrayUtils from './ArrayUtils';
import StringUtils from './StringUtils';

const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();
const euckrDecoder = new TextDecoder('euc-kr');

/**
 * 서버에서 xml을 로딩
 * @param {string} url
 * @param {boolean} isEucKr euc-kr 인코딩이 필요할때
 * @returns {Promise<XMLDocument>} xml
 */
export const loadXml = async (url, isEucKr = false) => {
  const res = await fetch(url);
  const xmlText = isEucKr ? euckrDecoder.decode(await res.arrayBuffer()) : await res.text();
  const xmlDoc = domParser.parseFromString(xmlText.trim(), 'application/xml');
  // console.debug('loadXml', url, xmlDoc);
  if (xmlDoc.querySelector('parseerror')) {
    throw new Error('XML parse error: ' + xmlDoc.querySelector('parseerror').textContent);
  }
  return xmlDoc;
};

/**
 * hox를 문자열로 변환
 * @param {XMLDocument} xml
 * @returns
 */
export const serializeXmlToString = (xml) => {
  // TODO 신규 추가한 node에 xmlns="" 자동 추가되는 현상. .replace(/xmlns=""/gi, '') 로 지우는거보다, 처음부터 안생기게 하는 방법
  return xmlSerializer.serializeToString(xml);
};

/**
 * text로 xml node를 만든다
 * @param {string} xmlText
 * @returns
 */
export const createNode = (xmlText) => {
  return domParser.parseFromString(xmlText, 'application/xml').children[0];
};

/**
 * 1개의 노드 추가 및 값 설정
 * @param {Element} element
 * @param {string} nodeName
 * @param {string} nodeValue
 * @returns
 */
export const addNode = (element, nodeName, nodeValue = null) => {
  const newNode = element.appendChild(element.getRootNode().createElement(nodeName));
  if (nodeValue !== null) newNode.textContent = nodeValue;
  return newNode;
};

/**
 * 여러개의 노드 추가
 * @param {Element} element
 * @param {string} selectors
 * @param {string} newNodeNames
 * @returns 추가된 node array
 */
export const addNodes = (element, selectors, ...newNodeNames) => {
  const addedNodes = [];
  if (selectors !== null) {
    element.querySelectorAll(selectors).forEach((element) => {
      newNodeNames.forEach((newNodeName) => {
        addedNodes.push(element.appendChild(element.getRootNode().createElement(newNodeName)));
      });
    });
  } else {
    newNodeNames.forEach((newNodeName) => {
      addedNodes.push(element.appendChild(element.getRootNode().createElement(newNodeName)));
    });
  }
  return addedNodes;
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
  return Array.from(element.querySelectorAll(selectors));
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
 * @param {number} def 빈값일때 초기값
 * @returns
 */
export const getNumber = (element, selectors, def) => {
  let text = element.querySelector(selectors)?.textContent;
  return text ? parseInt(text) : def;
};

/**
 * 노드 값 구하기
 * @param {Element} element
 * @param {string} selectors
 * @param {boolean} unescapeXml
 * @returns
 */
export const getText = (element, selectors, unescapeXml = false) => {
  let text = element.querySelector(selectors)?.textContent.trim();
  if (text && unescapeXml) {
    return StringUtils.unescapeXml(text);
  }
  return text;
};

/**
 * 노드 값 설정
 * @param {Element} element
 * @param {string} selectors
 * @param {string} text
 * @param {boolean} escapeXml
 */
export const setText = (element, selectors, text, escapeXml = false) => {
  getNode(element, selectors).textContent = escapeXml ? StringUtils.escapeXml(text) : text;
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
  FLAG: 'flag',
};
