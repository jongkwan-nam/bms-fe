import FeDynatree from './FeDynaTree';
import './FeRecLdapTree.scss';

/**
 * 조직도 트리 - LDAP
 */
export default class FeRecLdapTree extends FeDynatree {
  title = 'recLdapTree';
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
        acton: 'initLdapTree',
      })
    );
    console.log('dynatree', this.dynatree);
  }

  onSelect(isSelected, dtnode) {
    console.debug('[FeRecLdapTree] onSelect', dtnode.data.title, isSelected);
    this.divTree.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { isSelected: isSelected, dtnode: dtnode } }));
  }

  onClick(dtnode, event) {
    console.debug('[FeRecLdapTree] onClick', dtnode.data.title, dtnode.getEventTargetType(event), dtnode, event);

    if (dtnode.getEventTargetType(event) === 'title') {
      dtnode.toggleSelect();
    }
  }

  onLazyRead(dtnode) {
    console.debug('[FeRecLdapTree] onLazyRead', dtnode.data.title, dtnode);
    //
    dtnode.appendAjax({
      url: '/directory-web/org.do',
      type: 'post',
      data: {
        acton: 'expandLdapTree',
        deptID: dtnode.data.key,
      },
      success: (dtnode) => {
        console.log('[FeRecLdapTree] appendAjax', dtnode.data.title, dtnode);
        this.divTree.dispatchEvent(new CustomEvent('lazy', { bubbles: true, composed: true, detail: { dtnode: dtnode } }));
      },
    });
  }

  onRender(dtnode, nodeSpan) {
    console.debug('onLoader', dtnode, nodeSpan);
    //
    if (dtnode.data.rbox == 'false') {
      dtnode.data.unselectable = true;
      nodeSpan.classList.add('ui-dynatree-notuse');
    } else {
      nodeSpan.classList.add('ui-dynatree-rbox-have');
    }
  }
}

customElements.define('fe-recldaptree', FeRecLdapTree);
