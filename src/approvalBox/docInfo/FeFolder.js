import $ from 'jquery';
import syncFetch from 'sync-fetch';
import '../../lib/dynatree';
import DateUtils from '../../utils/DateUtils';
import feStorage from '../../utils/FeStorage';
import IDUtils from '../../utils/IDUtils';
import StringUtils from '../../utils/StringUtils';
import { HoxEventType, dispatchHoxEvent, getText, setText } from '../../utils/xmlUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeFolder.scss';

const ROOT_FOLDER_ID = '00000000000000000001';

/**
 * 기록물철
 */
export default class FeFolder extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    const dynatreeLink = document.createElement('link');
    dynatreeLink.setAttribute('rel', 'stylesheet');
    dynatreeLink.setAttribute('href', './css/dynatree.css');
    this.shadowRoot.append(dynatreeLink);

    wrapper.innerHTML = `
      <div>
        <select>
          <option>${GWWEBMessage.cmsg_2500}</option>
        </select>
        <button type="button" id="btnFolderContainer">${GWWEBMessage.W3143}</button>
      </div>
      <div class="modal-container">
        <div class="folder-container">
          <div id="tree" class="folder"></div>
          <div class="folder-btn">
            <button type="button" id="btnFolderSelect">${GWWEBMessage.W3143}</button>
            <button type="button" id="btnFolderCancel">${GWWEBMessage.W3201}</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    super.setHox(hox);

    this.fldrId = getText(this.hox, 'docInfo folderInfo ID');
    this.fldrName = getText(this.hox, 'docInfo folderInfo name');

    let draftDate = getText(this.hox, 'docInfo draftDate');
    if (StringUtils.isBlank(draftDate)) {
      draftDate = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
      setText(hox, 'docInfo draftDate', draftDate);
    }

    const STORAGE_FOLDER_HISTORY_KEY = `folder_history_${rInfo.objForm1.formID}`;

    const fldrMap = new Map();

    /* local storage의 해당 서식의 폴더 히스토리를 select > option 에 추가 */
    const folderIdList = feStorage.local.getArray(STORAGE_FOLDER_HISTORY_KEY);

    if (IDUtils.isNotNullID(this.fldrId)) {
      if (!folderIdList.includes(this.fldrId)) {
        folderIdList.push(this.fldrId);
      }
    }

    for (let folderId of folderIdList) {
      if (folderId.trim().length === 0) {
        continue;
      }
      // folderId 검증 후 option 추가
      const data = syncFetch(`/bms/com/hs/gwweb/appr/retrieveValidFldr.act?fldrID=${folderId}&deptID=${rInfo.user.deptID}&draftDate=${draftDate.substring(0, 10)}`).json();
      if (data.ok) {
        //
        const data = syncFetch(`/bms/com/hs/gwweb/appr/retrieveFldrInfo.act?fldrID=${folderId}&applID=${7010}`).json();
        fldrMap.set(data.fldrId, data);

        const option = this.shadowRoot.querySelector('select').appendChild(document.createElement('option'));
        option.value = data.fldrId;
        option.innerHTML = `${data.fldrName} (${GWWEBMessage['keepPeriodRange_' + data.fldrKeepingPeriod]})`;
      }
    }

    // 값 설정
    if (IDUtils.isNotNullID(this.fldrId)) {
      this.shadowRoot.querySelector('select').value = this.fldrId;
    }

    // 기록물철 select 선택
    this.shadowRoot.querySelector('select').addEventListener('change', (e) => {
      //
      console.log('select change', e.target.value, e.target.innerHTML);
      let fldrInfo = fldrMap.get(e.target.value);

      setText(this.hox, 'docInfo folderInfo ID', fldrInfo.fldrId);
      setText(this.hox, 'docInfo folderInfo name', fldrInfo.fldrName);

      // 이벤트 전파
      console.info('hoxEvent dispatch', HoxEventType.FOLDER);
      dispatchHoxEvent(this.hox, 'docInfo folderInfo', HoxEventType.FOLDER, 'change', fldrInfo);
    });

    // 선택 버튼: 기록물철 트리 호출
    this.shadowRoot.querySelector('button#btnFolderContainer').addEventListener('click', (e) => {
      //
      this.shadowRoot.querySelector('.modal-container').classList.add('open');

      const params = {
        APPLID: '',
        SEARCH_F: 0,
        userId: rInfo.user.ID,
        deptId: rInfo.user.deptID,
        TYPES: 'REGT',
        exids: '1000,2000,2500,3000,4000,5000,11000,8000,7100,7200,6000',
        FLDRID: '',
        FPARID: '00000000000000000009',
        BASEAPPLID: 7010,
        szyear: 9980,
      };
      const queryString = new URLSearchParams(params).toString();
      fetch('/bms/com/hs/gwweb/folder/retrieveIncPopApprFldrTree.act?' + queryString)
        .then((res) => res.json())
        .then((data) => {
          // console.log(JSON.parse(data.treeValue));

          let tree = this.shadowRoot.querySelector('#tree');

          $(tree).dynatree({
            title: 'tree',
            persist: false,
            clickFolderMode: 1,
            key: ROOT_FOLDER_ID,
            fx: { height: 'toggle', duration: 200 },
            children: JSON.parse(data.treeValue),
            onCustomRender: function (dtnode) {
              console.log('[dynatree] onCustomRender', dtnode.data?.title, dtnode.data?.noLink);

              const deptData = dtnode.data;
              let title = deptData.title.replace(/\\/g, '');
              let tooltip = deptData.tooltip?.replace(/"/g, '&quot;').replace(/\\/g, '');
              let dynatreeTitle = '';
              if (deptData.noLink) {
                dynatreeTitle = `
                    <span class="dynatree-title" title="${tooltip}">
                      <span class="node-folder ${deptData.viewDepth < 5 ? 'ableadd' : 'unableadd'}" id="${deptData.fldrId}">${title}</span>
                    </span>`;
              } else {
                dynatreeTitle = `
                    <a href="${deptData.href || '#'}" class="dynatree-title" title="${tooltip}">
                      <span class="node-folder ${deptData.viewDepth < 5 ? 'ableadd' : 'unableadd'}" id="${deptData.fldrId}">${title}</span>
                    </a>`;
              }
              return dynatreeTitle;
            },
            onClick: (dtnode, event) => {
              console.log('[dynatree] onClick', 'event.target.className=', event.target.className, 'dtnode.data.noLink=', dtnode.data.noLink, 'dtnode.data.title=', dtnode.data.title);

              if (event.target.className != 'dynatree-expander' && !dtnode.data.noLink) {
                this.fldrId = dtnode.data.fldrId;
                this.fldrName = dtnode.data.fldrName;
                console.log(`[dynatree] selected fldrId: ${this.fldrId}, fldrName: ${this.fldrName}`);
                // PopApprTree.selectFldr(dtnode.data, event);
              } else {
                if (event.target.className != 'dynatree-expander') {
                  dtnode.deactivate();
                  return false;
                }
              }
            },
            onQueryActivate: (activate, node) => {
              console.log('[dynatree] onQueryActivate', activate, 'node.data.fldrApplId=', node.data.fldrApplId);
              return true;
            },
          });

          $(tree)
            .dynatree('getRoot')
            .visit((dtnode) => dtnode.expand(true));
        });
    });

    // 기록물철 트리에서 선택 버튼
    this.shadowRoot.querySelector('button#btnFolderSelect').addEventListener('click', (e) => {
      //
      /* 기존 option에 있는 기록물철이면, 선택만 하고, 없으면 option 추가 및 선택, storage 저장 */
      let existsOption = this.shadowRoot.querySelector(`select option[value="${this.fldrId}"`);
      console.log('option is', existsOption);
      if (existsOption !== null) {
        existsOption.selected = true;
      } else {
        let newOption = this.shadowRoot.querySelector('select').appendChild(document.createElement('option'));
        newOption.value = this.fldrId;
        newOption.innerHTML = this.fldrName;
        newOption.selected = true;

        let historyValue = feStorage.local.get(STORAGE_FOLDER_HISTORY_KEY);
        feStorage.local.set(STORAGE_FOLDER_HISTORY_KEY, `${historyValue},${this.fldrId}`);
      }

      this.shadowRoot.querySelector('.modal-container').classList.remove('open');
    });

    // 기록물철 트리에서 취소. do nothing
    this.shadowRoot.querySelector('button#btnFolderCancel').addEventListener('click', (e) => {
      //
      this.shadowRoot.querySelector('.modal-container').classList.remove('open');
    });
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('select, button').forEach((input) => (input.disabled = this.contentNumber > 1));
  }
}

// Define the new element
customElements.define('fe-folder', FeFolder);
