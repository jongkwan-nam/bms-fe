import syncFetch from 'sync-fetch';
import { addNode, createNode, existsNode, getAttr, getNode, getNodes, getText } from '../../utils/hoxUtils';
import FeRec from './FeRec';
import './FeRecList.scss';

/**
 * 수신부서 목록
 *
 * - 트리에서 전달된 dtnode로 FeRec 생성
 * - FeRec로부터 삭제 이벤트 수신 처리
 * - 수신부서 순서 변경
 * - hox recipient 업데이트
 * - 수신부서 표기명 제공
 */
export default class FeRecList extends HTMLElement {
  constructor() {
    super();
    console.debug('FeRecList init');
  }

  connectedCallback() {
    console.info('FeRecList connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-reclist');
    wrapper.innerHTML = `
      <header>
        <label>${GWWEBMessage.recvdept}</label>
        <div>
          <button type="button" id="upBtn" title="${GWWEBMessage.cmsg_1154}">△</button>
          <button type="button" id="downBtn" title="${GWWEBMessage.cmsg_1155}">▽</button>
        </div>
      </header>
      <ul id="list" class="list"></ul>
    `;

    this.shadowRoot.append(LINK, wrapper);

    this.LIST = this.shadowRoot.querySelector('#list');
    this.LIST.addEventListener('deleteRec', (e) => {
      console.log('Event', e.type, e.target, e);
      // li 삭제
      let li = e.target.closest('li');
      li.remove();

      // hox 업데이트
      this.#updateHox();
      // this.postProcess();
    });

    // 수신부서 선택
    this.LIST.addEventListener('click', (e) => {
      this.LIST.querySelectorAll('li').forEach((li) => li.classList.remove('selected'));
      e.target.closest('li').classList.add('selected');
    });

    // 수신부서 위로 버튼 이벤트
    this.shadowRoot.querySelector('#upBtn').addEventListener('click', () => {
      let selectedLI = this.LIST.querySelector('.selected');
      if (selectedLI !== null && selectedLI.previousSibling) {
        this.LIST.insertBefore(selectedLI, selectedLI.previousSibling);
        this.#updateHox();
      }
    });
    // 수신부서 아래로 버튼 이벤트
    this.shadowRoot.querySelector('#downBtn').addEventListener('click', () => {
      let selectedLI = this.LIST.querySelector('.selected');
      if (selectedLI !== null) {
        this.LIST.insertBefore(selectedLI, selectedLI.nextSibling?.nextSibling);
        this.#updateHox();
      }
    });
  }

  set(hox) {
    this.hox = hox;
    //
    this.#renderRecList();
  }

  /**
   * 왼쪽 트리영역에서 선택된 값
   * @param {DynaTreeNode} dtnode
   * @param {string} from
   */
  add(dtnode, from) {
    console.log('add', dtnode, from);
    // 기존 목록이 있으면, 삭제 후 추가한다.
    switch (from) {
      case 'org': {
        // 부서인지, 사용자인지 구분하여 추가
        if (dtnode.data.isFolder) {
          // 시행부서 추가
          this.#addDept(dtnode);
        } else {
          // 업무담당자 추가
          this.#addUser(dtnode);
        }
        break;
      }
      case 'group': {
        // scope에 따라 구분하여 추가
        if (dtnode.data.scope === 'group') {
          // 그룹추가
          if (doccfg.addRecpGroupMember) {
            // 그룹을 풀어서 추가
            dtnode.childList.forEach((child) => {
              //
              if (child.data.scope === 'subdept') {
                this.#addSubDept(child);
              } else if (child.data.scope === 'dept') {
                this.#addDept(child);
              }
            });
          } else {
            // 그룹으로 추가
            this.#addGroup(dtnode);
          }
        } else if (dtnode.data.scope === 'subdept') {
          // 하위 부서 구하여, 모두 추가
          this.#addSubDept(dtnode);
        } else if (dtnode.data.scope === 'dept') {
          // 시행부서 추가
          this.#addDept(dtnode);
        }
        break;
      }
      case 'manual': {
        // 외부 수신처 추가
        this.#addManual(dtnode);
        break;
      }
      case 'ldap': {
        // LDAP 추가
        this.#addLdap(dtnode);
        break;
      }
      case 'doc24': {
        this.#addDoc24(dtnode);
        break;
      }
      default:
        throw new Error('unknown from: ' + from);
    }
    // hox 업데이트
    this.#updateHox();
  }

  #addDept(dtnode) {
    this.LIST.querySelector(`[uuid="rectype_dept_${dtnode.data.key}"]`)?.remove();
    //
    let xmlText = `
    <rec type="rectype_dept">
      <ID>${dtnode.data.key}</ID>
      <name>${dtnode.data.title}</name>
      <charger>
        <ID/>
        <name/>
        <positionName/>
        <department>
          <ID/>
          <name/>
        </department>
      </charger>
      <displayString>${dtnode.data.title}${GWWEBMessage.cmsg_0034}</displayString>
    </rec>`;
    let rec = getNode(this.hox, 'docInfo content receiptInfo recipient').appendChild(createNode(xmlText));
    let li = this.LIST.appendChild(document.createElement('li'));
    li.setAttribute('uuid', `rectype_dept_${dtnode.data.key}`);
    li.appendChild(new FeRec()).set(rec);
  }
  #addUser(dtnode) {
    let saveDeptInfo = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSaveDeptInfo.act?DID=${dtnode.data.deptID}`).json();
    if (!saveDeptInfo.ok) {
      throw new Error('notfound dept: ' + dtnode.data.deptID);
    }
    //
    this.LIST.querySelector(`[uuid="rectype_dept_${saveDeptInfo.dept.ID}"]`)?.remove();
    //
    let xmlText = `
    <rec type="rectype_dept">
      <ID>${saveDeptInfo.dept.ID}</ID>
      <name>${saveDeptInfo.dept.name}</name>
      <charger>
        <ID>${dtnode.data.key}</ID>
        <name>${dtnode.data.name}</name>
        <positionName>${dtnode.data.positionName}</positionName>
        <department>
          <ID>${dtnode.data.deptID}</ID>
          <name>${dtnode.data.deptName}</name>
        </department>
      </charger>
      <displayString>${saveDeptInfo.dept.name}${GWWEBMessage.cmsg_0034}</displayString>
    </rec>`;
    let rec = getNode(this.hox, 'docInfo content receiptInfo recipient').appendChild(createNode(xmlText));
    let li = this.LIST.appendChild(document.createElement('li'));
    li.setAttribute('uuid', `rectype_dept_${saveDeptInfo.dept.ID}`);
    li.appendChild(new FeRec()).set(rec);
  }
  #addGroup(dtnode) {
    this.LIST.querySelector(`[uuid="rectype_unifiedgroup_${dtnode.data.key}"]`)?.remove();
    //
    let xmlText = `
    <rec type="rectype_unifiedgroup">
      <ID>${dtnode.data.key}</ID>
      <name>${dtnode.data.title}</name>
      <charger>
        <ID/>
        <name/>
        <positionName/>
        <department>
          <ID/>
          <name/>
        </department>
      </charger>
      <displayString>${dtnode.data.name}</displayString>
      <recSymbolItems/>
    </rec>`;
    let rec = getNode(this.hox, 'docInfo content receiptInfo recipient').appendChild(createNode(xmlText));
    let li = this.LIST.appendChild(document.createElement('li'));
    li.setAttribute('uuid', `rectype_unifiedgroup_${dtnode.data.key}`);
    li.appendChild(new FeRec()).set(rec);
  }
  #addSubDept(dtnode) {
    let res = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSubDeptList.act?DEPTID=${dtnode.data.key}&OPTION=recvbox`).json();
    if (!res.ok) {
      throw new Error('notfound sub dept: ' + dtnode.data.key);
    }
    res.subDeptList.forEach((dept) => {
      this.LIST.querySelector(`[uuid="rectype_dept_${dept.ID}"]`)?.remove();
      //
      let xmlText = `
      <rec type="rectype_dept">
        <ID>${dept.ID}</ID>
        <name>${dept.name}</name>
        <charger>
          <ID/>
          <name/>
          <positionName/>
          <department>
            <ID/>
            <name/>
          </department>
        </charger>
        <displayString>${dept.name}${GWWEBMessage.cmsg_0034}</displayString>
      </rec>`;
      let rec = getNode(this.hox, 'docInfo content receiptInfo recipient').appendChild(createNode(xmlText));
      let li = this.LIST.appendChild(document.createElement('li'));
      li.setAttribute('uuid', `rectype_dept_${dept.ID}`);
      li.appendChild(new FeRec()).set(rec);
    });
  }
  #addManual(dtnode) {
    //
  }
  #addLdap(dtnode) {
    //
  }
  #addDoc24(dtnode) {
    //
  }

  /**
   * 왼쪽 트리영역에서 선택해제된 값
   * @param {DynaTreeNode} dtnode
   * @param {string} from
   */
  delete(dtnode, from) {
    console.log('delete', dtnode, from);
    //
    switch (from) {
      case 'org': {
        break;
      }
      case 'group': {
        // doccfg.addRecpGroupMember
        // dtnode: key, scope[group | subdept | dept], title
        break;
      }
      case 'manual': {
        break;
      }
      case 'ldap': {
        break;
      }
      case 'doc24': {
        break;
      }
      default:
        throw new Error('unknown from: ' + from);
    }
  }

  #renderRecList() {
    if (!existsNode(this.hox, 'docInfo content receiptInfo recipient')) {
      addNode(this.hox, 'docInfo content receiptInfo', 'recipient');
    }

    getNodes(this.hox, 'docInfo content receiptInfo recipient rec').forEach((rec) => {
      console.log('recipient rec', rec);
      //
      let li = this.LIST.appendChild(document.createElement('li'));
      li.setAttribute('uuid', `${getAttr(rec, null, 'type')}_${getText(rec, 'ID')}`);
      li.appendChild(new FeRec()).set(rec);
    });
  }

  #updateHox() {
    getNode(this.hox, 'docInfo content receiptInfo recipient').textContent = null;
    //
    this.LIST.querySelectorAll('fe-rec').forEach((feRec) => {
      //
      getNode(this.hox, 'docInfo content receiptInfo recipient').appendChild(feRec.rec);
    });

    // 내용 변경 이벤트 전파
    this.dispatchEvent(new Event('change'));
  }

  get displayString() {
    return Array.from(this.LIST.querySelectorAll('fe-rec'))
      .map((feRec) => feRec.displayString)
      .join(',');
  }
}

customElements.define('fe-reclist', FeRecList);
