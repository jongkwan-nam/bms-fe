import { FeMode, getFeMode } from '../main/FeMode';
import './docInfo/FeApprovalType';
import './docInfo/FeDocNumber';
import './docInfo/FeEnforceType';
import './docInfo/FeFlag';
import './docInfo/FeFolder';
import './docInfo/FeKeepPeriod';
import './docInfo/FePageCnt';
import './docInfo/FePublication';
import './docInfo/FeSecurityLevel';
import './docInfo/FeSpecialDoc';
import './docInfo/FeSpecialList';
import './docInfo/FeTitle';
import './docInfo/FeViewRange';
import './docInfo/FeViewRestriction';
import './FeDocInfo.scss';

export default class FeDocInfo extends HTMLElement {
  active = false;

  constructor() {
    super();
    console.debug('FeDocInfo init');
  }

  connectedCallback() {
    console.debug('FeDocInfo connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-docinfo');
    wrapper.innerHTML = `
      <label>발송종류</label>   <fe-enforcetype></fe-enforcetype>
      <label>제목</label>       <fe-title></fe-title>
      <label>&nbsp;</label>     <fe-flag></fe-flag>
      <label>문서번호</label>   <fe-docnumber></fe-docnumber>
      <label>문서종류</label>   <fe-approvaltype></fe-approvaltype>
      <label>기록물철</label>   <fe-folder></fe-folder>
      <label>보존기간</label>   <fe-keepperiod></fe-keepperiod>
      <label>열람범위</label>   <fe-viewrange></fe-viewrange>
      <label>열람제한</label>   <fe-viewrestriction></fe-viewrestriction>
      <label>보안등급</label>   <fe-securitylevel></fe-securitylevel>
      <label>공개여부</label>   <fe-publication></fe-publication>
      <label>특수기록물</label> <fe-specialdoc></fe-specialdoc>
      <label>쪽수</label>       <fe-pagecnt></fe-pagecnt>
      <label>검색어</label>     <fe-speciallist></fe-speciallist>
    `;

    this.shadowRoot.append(LINK, wrapper);

    this.feEnforceType = this.shadowRoot.querySelector('fe-enforcetype');
    this.feTitle = this.shadowRoot.querySelector('fe-title');
    this.feFlag = this.shadowRoot.querySelector('fe-flag');
    this.feDocNumber = this.shadowRoot.querySelector('fe-docnumber');
    this.feApprovalType = this.shadowRoot.querySelector('fe-approvaltype');
    this.feFolder = this.shadowRoot.querySelector('fe-folder');
    this.feKeepPeriod = this.shadowRoot.querySelector('fe-keepperiod');
    this.feViewRange = this.shadowRoot.querySelector('fe-viewrange');
    this.feViewRestriction = this.shadowRoot.querySelector('fe-viewrestriction');
    this.feSecurityLevel = this.shadowRoot.querySelector('fe-securitylevel');
    this.fePublication = this.shadowRoot.querySelector('fe-publication');
    this.feSpecialDoc = this.shadowRoot.querySelector('fe-specialdoc');
    this.fePageCnt = this.shadowRoot.querySelector('fe-pagecnt');
    this.feSpecialList = this.shadowRoot.querySelector('fe-speciallist');

    const feMode = getFeMode();
    if (FeMode.ACCEPT === feMode) {
      // 수신문서일때:
      this.feEnforceType.toggleDisabled(true);
      this.feViewRange.toggleDisabled(true);
      this.fePageCnt.toggleDisabled(true);
    }
  }

  set(hox) {
    if (this.active) {
      return;
    }

    this.feEnforceType.set(hox);
    this.feTitle.set(hox);
    this.feFlag.set(hox);
    this.feDocNumber.set(hox);
    this.feApprovalType.set(hox);
    this.feFolder.set(hox);
    this.feKeepPeriod.set(hox);
    this.feViewRange.set(hox);
    this.feViewRestriction.set(hox);
    this.feSecurityLevel.set(hox);
    this.fePublication.set(hox);
    this.feSpecialDoc.set(hox);
    this.fePageCnt.set(hox);
    this.feSpecialList.set(hox);

    this.active = true;
  }
}

// Define the new element
customElements.define('fe-docinfo', FeDocInfo);
