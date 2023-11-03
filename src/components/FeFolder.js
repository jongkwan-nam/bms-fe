// import $ from 'jquery';
import { createTree } from 'jquery.fancytree';
import './FeFolder.scss';
// import '../../node_modules/jquery.fancytree/dist/skin-lion/ui.fancytree.css';

const CSS = ``;

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

    const STYLE = document.createElement('style');
    STYLE.innerHTML = CSS;

    const wrapper = document.createElement('div');
    wrapper.classList.add('folder');

    const tree = document.createElement('div');
    tree.id = 'tree';

    this.shadowRoot.append(LINK, STYLE, wrapper, tree);

    this.select = wrapper.appendChild(document.createElement('select'));
    this.button = wrapper.appendChild(document.createElement('button'));
    this.button.innerText = '선택';
    this.button.addEventListener('click', (e) => {
      //
      const params = {
        APPLID: '',
        SEARCH_F: 0,
        deptId: '000010100',
        TYPES: 'REGT',
        exids: '1000,2000,2500,3000,4000,5000,11000,8000,7100,7200,6000',
        userId: '001000001',
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
        });

      createTree(tree, {
        source: [
          { title: 'Node 1', key: '1' },
          {
            title: 'Folder 2',
            key: '2',
            folder: true,
            children: [
              { title: 'Node 2.1', key: '3' },
              { title: 'Node 2.2', key: '4' },
            ],
          },
        ],
        checkbox: true,
        checkbox: function (event, data) {
          // Hide checkboxes for folders
          return data.node.isFolder() ? false : true;
        },
        tooltip: function (event, data) {
          // Create dynamic tooltips
          return data.node.title + ' (' + data.node.key + ')';
        },
        icon: function (event, data) {
          var node = data.node;
          // Create custom icons
          if (node.data.refType === 'foo') {
            return 'foo-icon-class';
          }
          // Exit without returning a value: continue with default processing.
        },
        activate: function (event, data) {
          // A node was activated: display its title:
          var node = data.node;
          // $('#echoActive').text(node.title);
          console.log('activate', node);
        },
        beforeSelect: function (event, data) {
          // A node is about to be selected: prevent this, for folder-nodes:
          if (data.node.isFolder()) {
            return false;
          }
        },
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
