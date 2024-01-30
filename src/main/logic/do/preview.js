import StringUtils from '../../../utils/StringUtils';
import { addNode, existsNode, getNode, setTextCDATA } from '../../../utils/xmlUtils';

export const doSetPreview = (hox, bodyText) => {
  //
  if (!existsNode(hox, 'docInfo preview')) {
    const node = getNode(hox, 'docInfo');
    const preview = addNode(node, 'preview');
    addNode(preview, 'type', 'text');
    addNode(preview, 'data');
  }

  setTextCDATA(hox, 'docInfo preview data', StringUtils.cutByMaxBytes(bodyText, 2000));
};
