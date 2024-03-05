import FeDynatree from './FeDynaTree';
import './FeSancOrgTree.scss';

/**
 * 조직도 트리 - 결재용
 */
export default class FeSancOrgTree extends FeDynatree {
  title = 'sancOrgTree';
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
        acton: 'initOrgTree',
        baseDept: rInfo.dept.ID,
        startDept: '',
        // notUseDept: '000000101',
        checkbox: 'both',
        // display: ',userListHeight255px',
        informalUser: false,
      })
    );
    console.debug('[FeSancOrgTree]', this.dynatree);

    this.dynatree.dynatree('getRoot').tree.getNodeByKey(rInfo.user.ID).activate();
  }

  onSelect(isSelected, dtnode) {
    console.debug('[FeSancOrgTree] onSelect', dtnode.data.title, isSelected);
    this.divTree.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { isSelected: isSelected, dtnode: dtnode } }));
  }

  onClick(dtnode, event) {
    const targetType = dtnode.getEventTargetType(event); // expander, checkbox, else
    console.debug('[FeSancOrgTree] onClick', dtnode.data.title, targetType, dtnode, event);
  }

  onDblClick(dtnode, event) {
    const targetType = dtnode.getEventTargetType(event);
    console.debug('[FeSancOrgTree] onDblClick', dtnode.data.title, targetType, dtnode, event);
    dtnode.select(true);
    dtnode.focus();

    this.divTree.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { isSelected: true, dtnode: dtnode } }));
  }

  onLazyRead(dtnode) {
    console.debug('[FeSancOrgTree] onLazyRead', dtnode.data.title, dtnode);
    //
    dtnode.appendAjax({
      url: '/directory-web/org.do',
      type: 'post',
      data: {
        acton: 'expandOrgTree',
        deptID: dtnode.data.key,
        // notUseDept: '000000101',
        checkbox: 'both',
        // display: ',userListHeight255px',
        informalUser: false,
      },
      success: (dtnode) => {
        console.log('[FeSancOrgTree] appendAjax', dtnode.data.title, dtnode);
        this.divTree.dispatchEvent(new CustomEvent('lazy', { bubbles: true, composed: true, detail: { dtnode: dtnode } }));
      },
    });
  }

  onRender(dtnode, nodeSpan) {
    console.debug('[FeSancOrgTree] onRender', dtnode, nodeSpan);
    //
    if (dtnode.data.rbox == 'false') {
      dtnode.data.unselectable = true;
      nodeSpan.classList.add('ui-dynatree-notuse');
    } else {
      nodeSpan.classList.add('ui-dynatree-rbox-have');
    }
    // 부재
    if (!dtnode.data.isFolder && dtnode.data.absent) {
      nodeSpan.innerHTML += `<a onclick="orgPopup.viewUserAbsent('${dtnode.data.key}')" class='usr_attnd'>${GWWEBMessage.W3156}</a>`;
    }
  }
}

customElements.define('fe-sancorgtree', FeSancOrgTree);
