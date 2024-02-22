import FeDynatree from './FeDynaTree';
import './FePubshowGroupTree.scss';

/**
 * 조직도 트리 - 수신부서 그룹
 */
export default class FePubshowGroupTree extends FeDynatree {
  title = 'recGroupTree';
  checkbox = true;
  selectMode = 2;
  clickFolderMode = 1;

  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.dynatree = super.renderTree(
      super.getOrgData({
        acton: 'groupTree',
        base: rInfo.user.ID,
        groupType: 'G',
        checkbox: 'both',
        display: 'org, rootdept',
      })
    );
    console.log('dynatree', this.dynatree);
  }

  onSelect(isSelected, dtnode) {
    console.debug('[FePubshowGroupTree] onSelect', dtnode.data.title, isSelected);
    this.divTree.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { isSelected: isSelected, dtnode: dtnode } }));
  }

  onClick(dtnode, event) {
    console.debug('[FePubshowGroupTree] onClick', dtnode.data.title, dtnode.getEventTargetType(event), dtnode, event);

    if (dtnode.getEventTargetType(event) === 'title') {
      dtnode.toggleSelect();
    }
  }

  onLazyRead(dtnode) {
    console.debug('[FePubshowGroupTree] onLazyRead', dtnode.data.title, dtnode);
  }

  onRender(dtnode, nodeSpan) {
    console.debug('onLoader', dtnode, nodeSpan);
  }
}

customElements.define('fe-pubshowgrouptree', FePubshowGroupTree);
