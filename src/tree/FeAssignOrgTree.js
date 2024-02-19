import './FeAssignOrgTree.scss';
import FeDynatree from './FeDynaTree';

/**
 * 조직도 트리 - 접수: 담당자 지정
 */
export default class FeAssignOrgTree extends FeDynatree {
  title = 'assignOrgTree';
  checkbox = true;
  selectMode = 1;
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
        startDept: rInfo.dept.ID,
        // notUseDept: '000000101',
        checkbox: 'list',
        display: 'org,rootdept',
      })
    );
    console.log('dynatree', this.dynatree);

    this.dynatree.dynatree('getRoot').tree.getNodeByKey(rInfo.dept.ID).expand();
  }

  onSelect(isSelected, dtnode) {
    console.debug('[FeAssignOrgTree] onSelect', dtnode.data.title, isSelected);
    this.divTree.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail: { isSelected: isSelected, dtnode: dtnode } }));
  }

  onClick(dtnode, event) {
    const eventTarget = dtnode.getEventTargetType(event); // title or checkbox
    console.debug('[FeAssignOrgTree] onClick', dtnode.data.title, eventTarget, dtnode, event);

    if (eventTarget === 'title') {
      dtnode.toggleSelect();
    } else if (eventTarget === 'checkbox') {
      dtnode.activate();
    }
  }

  onLazyRead(dtnode) {
    console.debug('[FeAssignOrgTree] onLazyRead', dtnode.data.title, dtnode);
    //
    dtnode.appendAjax({
      url: '/directory-web/org.do',
      type: 'post',
      data: {
        acton: 'expandOrgTree',
        deptID: dtnode.data.key,
        checkbox: 'list',
        display: 'org,rootdept',
      },
      success: (dtnode) => {
        console.log('[FeAssignOrgTree] appendAjax', dtnode.data.title, dtnode);
        this.divTree.dispatchEvent(new CustomEvent('lazy', { bubbles: true, composed: true, detail: { dtnode: dtnode } }));
      },
    });
  }

  onRender(dtnode, nodeSpan) {
    console.debug('onRender', dtnode, nodeSpan);
    // 사용자는 라디오로
    if (!dtnode.data.isFolder) {
      nodeSpan.querySelector('.dynatree-checkbox')?.classList.replace('dynatree-checkbox', 'dynatree-radio');
    }
  }
}

customElements.define('fe-assignorgtree', FeAssignOrgTree);
