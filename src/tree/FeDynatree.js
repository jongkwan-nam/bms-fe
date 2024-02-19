import $ from 'jquery';
import syncFetch from 'sync-fetch';
import './dynatree';

const ROOT_FOLDER_ID = '00000000000000000001';

/**
 * dynatree abstract class
 */
export default class FeDynatree extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './approvalBox.css');

    const dynatreeLink = document.createElement('link');
    dynatreeLink.setAttribute('rel', 'stylesheet');
    dynatreeLink.setAttribute('href', './css/dynatree.css');

    this.wrapper = document.createElement('div');
    this.wrapper.classList.add(this.tagName.toLocaleLowerCase(), 'folder');

    this.shadowRoot.append(link, dynatreeLink, this.wrapper);
  }

  renderTree(data) {
    return $(this.wrapper).dynatree({
      title: this.title,
      persist: false,
      checkbox: this.checkbox,
      selectMode: this.selectMode,
      clickFolderMode: this.clickFolderMode,
      key: ROOT_FOLDER_ID,
      fx: { height: 'toggle', duration: 200 },
      children: data, // 트리 데이터
      onSelect: this.onSelect, // 선택 이벤트 핸들러
      onClick: this.onClick, // 클릭 이벤트 핸들러
      onLazyRead: this.onLazyRead, // 폴더 확장시 데이터 로드 핸들러
      onRender: this.onRender, // 그리기 핸들러
    });
  }

  getOrgData(orgParams) {
    return syncFetch('/directory-web/org.do?' + new URLSearchParams(orgParams).toString()).json();
  }
}
