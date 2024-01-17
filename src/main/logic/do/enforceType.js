import { getNodeArray, getText, setText } from '../../../utils/hoxUtils';

/**
 * 일괄기안을 고려하여, content/enforceType 조사하여, docInfo/enforceType 결정
 *
 * @param {XMLDocument} hox
 */
export const doSetEnforceType = (hox) => {
  //
  const enforceTypes = getNodeArray(hox, 'docInfo content').map((content) => getText(content, 'enforceType'));
  console.log('enforceTypes', enforceTypes);

  let enforceType = 'enforcetype_not';
  if (enforceTypes.includes('enforcetype_external')) {
    enforceType = 'enforcetype_external';
  } else if (enforceTypes.includes('enforcetype_internal')) {
    enforceType = 'enforcetype_internal';
  }
  setText(hox, 'docInfo enforceType', enforceType);
};
