import $ from 'jquery';
import '../_open_sources/dynatree';

const CSS = ``;

const ROOT_FOLDER_ID = '00000000000000000001';

export default class FeFolder extends HTMLElement {
  constructor() {
    super();
    console.log('FeFolder init');
  }

  connectedCallback() {
    console.log('FeFolder connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './css/common.css');

    const LINK2 = document.createElement('link');
    LINK2.setAttribute('rel', 'stylesheet');
    LINK2.setAttribute('href', './css/dynatree.css');

    const STYLE = document.createElement('style');
    STYLE.innerHTML = CSS;

    const wrapper = document.createElement('div');
    wrapper.classList.add('folder');

    const tree = document.createElement('div');
    tree.id = 'tree';
    tree.classList.add('folder', 'dynatree');

    this.shadowRoot.append(LINK, LINK2, STYLE, wrapper, tree);

    this.select = wrapper.appendChild(document.createElement('select'));
    this.select.innerHTML = `<option>${GWWEBMessage.cmsg_2500}</option>`;

    this.button = wrapper.appendChild(document.createElement('button'));
    this.button.innerText = '선택';
    this.button.addEventListener('click', (e) => {
      //
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
            onClick: function (dtnode, event) {
              console.log('[dynatree] onClick', 'event.target.className=', event.target.className, 'dtnode.data.noLink=', dtnode.data.noLink, 'dtnode.data.title=', dtnode.data.title);

              if (event.target.className != 'dynatree-expander' && !dtnode.data.noLink) {
                PopApprTree.selectFldr(dtnode.data, event);
              } else {
                if (event.target.className != 'dynatree-expander') {
                  dtnode.deactivate();
                  return false;
                }
              }
            },
            onQueryActivate: function (activate, node) {
              console.log('[dynatree] onQueryActivate', activate, 'node.data.fldrApplId=', node.data.fldrApplId);

              if (node.data.fldrApplId == FD_APPLID_DEPTCABINET_FLDR) {
                return false;
              }
            },
          });

          $(tree)
            .dynatree('getRoot')
            .visit((dtnode) => dtnode.expand(true));
        });
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;
  }
}

// Define the new element
customElements.define('fe-folder', FeFolder);
