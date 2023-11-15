import $ from 'jquery';
import '../../_open_sources/dynatree';
import feStorage from '../../utils/FeStorage';
import * as DateUtils from '../../utils/dateUtils';

const ROOT_FOLDER_ID = '00000000000000000001';

export default class FeFolder extends HTMLElement {
  constructor() {
    super();
    console.debug('FeFolder init');
  }

  connectedCallback() {
    console.debug('FeFolder connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const LINK2 = document.createElement('link');
    LINK2.setAttribute('rel', 'stylesheet');
    LINK2.setAttribute('href', './css/dynatree.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-folder');
    wrapper.innerHTML = `
      <div>
        <select>
          <option>${GWWEBMessage.cmsg_2500}</option>
        </select>
        <button type="button" id="btnFolderContainer">${'선택'}</button>
      </div>
      <div class="modal-container">
        <div class="folder-container">
          <div id="tree" class="folder"></div>
          <div class="folder-btn">
            <button type="button" id="btnFolderSelect">선택</button>
            <button type="button" id="btnFolderCancel">취소</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.append(LINK, LINK2, wrapper);
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;
    this.fldrId = '';
    this.fldrName = '';

    const STORAGE_FOLDER_HISTORY_KEY = `folder_history_${rInfo.objForm1.formID}`;

    const fldrMap = new Map();

    /* local storage의 해당 서식의 폴더 히스토리를 select > option 에 추가 */
    let folderIdList = feStorage.local.getArray(STORAGE_FOLDER_HISTORY_KEY);
    for (let folderId of folderIdList) {
      if (folderId.trim().length === 0) {
        continue;
      }
      // folderId 검증 후 option 추가
      fetch(`/bms/com/hs/gwweb/appr/retrieveValidFldr.act?fldrID=${folderId}&deptID=${rInfo.user.deptID}&draftDate=${DateUtils.format(Date.now(), 'yyyy-mm-dd')}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            //
            fetch(`/bms/com/hs/gwweb/appr/retrieveFldrInfo.act?fldrID=${folderId}&applID=${7010}`)
              .then((res) => res.json())
              .then((data) => {
                //
                fldrMap.set(data.fldrId, data);
                let option = this.shadowRoot.querySelector('select').appendChild(document.createElement('option'));
                option.value = data.fldrId;
                option.innerHTML = `${data.fldrName} (${GWWEBMessage['keepPeriodRange_' + data.fldrKeepingPeriod]})`;
              });
          }
        });
    }

    /*
     * 기록물철 select 선택
     */
    this.shadowRoot.querySelector('select').addEventListener('change', (e) => {
      //
      console.log('select change', e.target.value, e.target.innerHTML);
      let fldrInfo = fldrMap.get(e.target.value);

      this.hox.querySelector('docInfo folderInfo ID').textContent = fldrInfo.fldrId;
      this.hox.querySelector('docInfo folderInfo name').textContent = fldrInfo.fldrName;

      // 이벤트 전파
      this.dispatchEvent(new CustomEvent('change', { detail: { folder: fldrInfo } }));
    });

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
          console.log(JSON.parse(data.treeValue));

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
              let tooltip = deptData.tooltip?.replace(/\"/g, '&quot;').replace(/\\/g, '');
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

    /**
     * 기록물철 트리에서 선택 버튼
     */
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

    this.shadowRoot.querySelector('button#btnFolderCancel').addEventListener('click', (e) => {
      //
      this.shadowRoot.querySelector('.modal-container').classList.remove('open');
    });
  }
}

// Define the new element
customElements.define('fe-folder', FeFolder);
