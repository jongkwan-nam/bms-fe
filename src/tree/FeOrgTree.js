import FeDynatree from './FeDynaTree';
import './FeOrgTree.scss';

/**
 * 조직도 트리
 */
export default class FeOrgTree extends FeDynatree {
  title = 'orgTree';
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
        baseDept: '000010100',
        startDept: '',
        notUseDept: '000000101',
        checkbox: 'both',
        display: ',userListHeight255px',
        informalUser: false,
      })
    );
    console.log('dynatree', this.dynatree);

    this.dynatree.dynatree('getRoot').tree.getNodeByKey('000010100').activate();
  }

  onSelect(isSelected, dtnode) {
    console.log('[dynatree] onSelect', isSelected, dtnode.data.title, dtnode);
    //
  }

  onClick(dtnode, event) {
    console.debug('[dynatree] onClick', dtnode.data.title, dtnode.getEventTargetType(event), dtnode, event);
    //
    if (dtnode.getEventTargetType(event) === 'title') {
      dtnode.toggleSelect();
    }
  }

  onLazyRead(dtnode) {
    console.log('[dynatree] onLazyRead', dtnode.data.title, dtnode);
    //
    dtnode.appendAjax({
      url: '/directory-web/org.do',
      type: 'post',
      data: {
        acton: 'expandOrgTree',
        deptID: dtnode.data.key,
        notUseDept: '000000101',
        checkbox: 'both',
        display: ',userListHeight255px',
        informalUser: false,
      },
      success: (dtnode) => {
        console.log('[dynatree] appendAjax', dtnode.data.title, dtnode);
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
    // 부재
    if (!dtnode.data.isFolder && dtnode.data.absent) {
      nodeSpan.innerHTML += `<a onclick="orgPopup.viewUserAbsent('${dtnode.data.key}')" class='usr_attnd'>${GWWEBMessage.W3156}</a>`;
    }
  }
}

customElements.define('fe-orgtree', FeOrgTree);
