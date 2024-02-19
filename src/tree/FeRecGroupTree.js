import FeDynatree from './FeDynaTree';
import './FeRecGroupTree.scss';

/**
 * 조직도 트리 - 수신부서 그룹
 */
export default class FeRecGroupTree extends FeDynatree {
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
        base: '001000001',
        groupType: 'A',
        checkbox: 'both',
        display: 'org, rootdept, group, ldap, doc24, ucorg2, userSingle',
      })
    );
    console.log('dynatree', this.dynatree);
  }

  onSelect(isSelected, dtnode) {
    console.debug('[FeRecGroupTree] onSelect', dtnode.data.title, isSelected);
    this.divTree.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { isSelected: isSelected, dtnode: dtnode } }));
  }

  onClick(dtnode, event) {
    console.debug('[FeRecGroupTree] onClick', dtnode.data.title, dtnode.getEventTargetType(event), dtnode, event);

    if (dtnode.getEventTargetType(event) === 'title') {
      dtnode.toggleSelect();
    }
  }

  onLazyRead(dtnode) {
    console.debug('[FeRecGroupTree] onLazyRead', dtnode.data.title, dtnode);
  }

  onRender(dtnode, nodeSpan) {
    console.debug('onLoader', dtnode, nodeSpan);
  }
}

customElements.define('fe-recgrouptree', FeRecGroupTree);
