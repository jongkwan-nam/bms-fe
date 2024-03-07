import $ from 'jquery';
import syncFetch from 'sync-fetch';
import { FeMode, getFeMode } from '../../main/FeMode';
import '../../tree/dynatree';
import DateUtils from '../../utils/DateUtils';
import FeStorage from '../../utils/FeStorage';
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

    this.formID = getText(this.hox, 'docInfo formInfo formID');
    this.fldrId = getText(this.hox, 'docInfo folderInfo ID');
    this.fldrName = getText(this.hox, 'docInfo folderInfo name');
    this.STORAGE_FOLDER_HISTORY_KEY = `folder_history_${this.formID}`;
    this.fldrMap = new Map();

    let draftDate = getText(this.hox, 'docInfo draftDate');
    if (StringUtils.isBlank(draftDate)) {
      draftDate = DateUtils.format(rInfo.currentDate, 'YYYY-MM-DDTHH24:MI:SS');
      setText(hox, 'docInfo draftDate', draftDate);
    }

    this.#addEvent();

    /* local storage의 해당 서식의 폴더 히스토리를 select > option 에 추가 */
    const folderHistoryIdList = FeStorage.local.getArray(this.STORAGE_FOLDER_HISTORY_KEY);

    if (IDUtils.isNotNullID(this.fldrId)) {
      if (folderHistoryIdList.includes(this.fldrId)) {
        folderHistoryIdList.splice(folderHistoryIdList.indexOf(this.fldrId), 1);
      }
      folderHistoryIdList.unshift(this.fldrId);
    }

    // 히스토리의 폴더 검증
    for (const folderId of folderHistoryIdList) {
      if (StringUtils.isBlank(folderId)) {
        continue;
      }
      // folderId 검증 후 option 추가
      const data = syncFetch(`/bms/com/hs/gwweb/appr/retrieveValidFldr.act?fldrID=${folderId}&deptID=${rInfo.user.deptID}&draftDate=${draftDate.substring(0, 10)}`).json();
      if (data.ok) {
        const data = syncFetch(`/bms/com/hs/gwweb/appr/retrieveFldrInfo.act?fldrID=${folderId}&applID=${7010}`).json();
        this.fldrMap.set(data.fldrId, data);

        const option = this.shadowRoot.querySelector('select').appendChild(document.createElement('option'));
        option.value = data.fldrId;
        option.innerHTML = `${data.fldrName} (${GWWEBMessage['keepPeriodRange_' + data.fldrKeepingPeriod]})`;
      }
    }

    // 값 설정
    if ([FeMode.DRAFT, FeMode.ACCEPT].includes(getFeMode())) {
      const options = this.shadowRoot.querySelectorAll('select option');
      if (options.length === 0) {
        // 옵션이 하나도 없으면, 선택 옵션 추가
        const option = document.createElement('option');
        option.innerHTML = GWWEBMessage.cmsg_2500;
      }
      // 제일 최근(최상위) 옵션 선택
      this.shadowRoot.querySelector('select').dispatchEvent(new Event('change'));
    } else {
      if (IDUtils.isNotNullID(this.fldrId)) {
        this.shadowRoot.querySelector('select').value = this.fldrId;
      }
    }
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('select, button').forEach((input) => (input.disabled = this.contentNumber > 1));
  }

  #addEvent() {
    // 기록물철 select 선택
    const SELECT = this.shadowRoot.querySelector('select');
    SELECT.addEventListener('change', () => {
      console.log('select change', SELECT.value);
      //
      if (StringUtils.isBlank(SELECT.value)) {
        return;
      }

      const fldrInfo = this.fldrMap.get(SELECT.value);

      setText(this.hox, 'docInfo folderInfo ID', fldrInfo.fldrId);
      setText(this.hox, 'docInfo folderInfo name', fldrInfo.fldrName);

      // 이벤트 전파
      console.info('hoxEvent dispatch', HoxEventType.FOLDER);
      dispatchHoxEvent(this.hox, 'docInfo folderInfo', HoxEventType.FOLDER, 'change', fldrInfo);
    });

    // 선택 버튼: 기록물철 트리 호출
    this.shadowRoot.querySelector('button#btnFolderContainer').addEventListener('click', (e) => {
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
              console.log('[dynatree] onCustomRender', dtnode.data);

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
              console.log('[dynatree] onClick', dtnode);

              if (event.target.className !== 'dynatree-expander' && !dtnode.data.noLink) {
                this.fldrId = dtnode.data.fldrId;
                this.fldrName = dtnode.data.fldrName;
                console.log(`[dynatree] selected fldrId: ${this.fldrId}, fldrName: ${this.fldrName}`);
              } else {
                if (event.target.className !== 'dynatree-expander') {
                  dtnode.deactivate();
                  return false;
                }
              }
            },
          });

          $(tree)
            .dynatree('getRoot')
            .visit((dtnode) => dtnode.expand(true));
        });
    });

    // 기록물철 트리에서 선택 버튼
    this.shadowRoot.querySelector('button#btnFolderSelect').addEventListener('click', (e) => {
      // 기존 option에 있는 기록물철이면, 선택만 하고, 없으면 option 추가 및 선택, storage 저장
      const existsOption = SELECT.querySelector(`option[value="${this.fldrId}"`);
      if (existsOption !== null) {
        existsOption.selected = true;
      } else {
        const newOption = document.createElement('option');
        newOption.value = this.fldrId;
        newOption.innerHTML = this.fldrName;
        newOption.selected = true;
        SELECT.prepend(newOption);

        // not has
        if (!this.fldrMap.has(this.fldrId)) {
          this.fldrMap.set(this.fldrId, { fkdrId: this.fldrId, fldrName: this.fldrName });
        }

        FeStorage.local.set(
          this.STORAGE_FOLDER_HISTORY_KEY,
          Array.from(SELECT.querySelectorAll('option'))
            .map((option) => option.value)
            .join(',')
        );
      }
      SELECT.dispatchEvent(new Event('change'));

      this.shadowRoot.querySelector('.modal-container').classList.remove('open');
    });

    // 기록물철 트리에서 취소. do nothing
    this.shadowRoot.querySelector('button#btnFolderCancel').addEventListener('click', (e) => {
      this.shadowRoot.querySelector('.modal-container').classList.remove('open');
    });
  }
}

// Define the new element
customElements.define('fe-folder', FeFolder);
