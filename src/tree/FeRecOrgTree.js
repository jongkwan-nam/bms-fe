import FeDynatree from './FeDynaTree';
import './FeRecOrgTree.scss';

/**
 * 조직도 트리 - 수신부서 조직도
 */
export default class FeRecOrgTree extends FeDynatree {
  title = 'recOrgTree';
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
    console.log('dynatree', this.dynatree);

    this.dynatree.dynatree('getRoot').tree.getNodeByKey(rInfo.dept.ID).activate();
  }

  onSelect(isSelected, dtnode) {
    console.debug('[FeRecOrgTree] onSelect', dtnode.data.title, isSelected);
    this.divTree.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { isSelected: isSelected, dtnode: dtnode } }));
  }

  onClick(dtnode, event) {
    console.debug('[FeRecOrgTree] onClick', dtnode.data.title, dtnode.getEventTargetType(event), dtnode, event);
    if (dtnode.data.isFolder) {
      // 부서 선택시 소속 사용자 선택 해제
      dtnode.childList?.filter((child) => !child.data.isFolder && child.isSelected()).forEach((child) => child.select(false));
    } else {
      // 같은 폴더에서 사용자 선택을 라디오처럼 동작하도록, 해당 폴더 선택 해제
      dtnode.parent.childList?.filter((child) => !child.data.isFolder && child.isSelected()).forEach((child) => child.select(false));
      dtnode.parent?.select(false);
    }

    if (dtnode.getEventTargetType(event) === 'title') {
      dtnode.toggleSelect();
    }
  }

  onLazyRead(dtnode) {
    console.debug('[FeRecOrgTree] onLazyRead', dtnode.data.title, dtnode);
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
        console.log('[FeRecOrgTree] appendAjax', dtnode.data.title, dtnode);
        this.divTree.dispatchEvent(new CustomEvent('lazy', { bubbles: true, composed: true, detail: { dtnode: dtnode } }));
      },
    });
  }

  onRender(dtnode, nodeSpan) {
    console.debug('onRender', dtnode, nodeSpan);
    //
    if (dtnode.data.rbox == 'false') {
      dtnode.data.unselectable = true;
      nodeSpan.classList.add('ui-dynatree-notuse');
    } else {
      nodeSpan.classList.add('ui-dynatree-rbox-have');
    }
    // 사용자는 라디오로
    if (!dtnode.data.isFolder) {
      nodeSpan.querySelector('.dynatree-checkbox')?.classList.replace('dynatree-checkbox', 'dynatree-radio');
    }
  }
}

customElements.define('fe-recorgtree', FeRecOrgTree);
