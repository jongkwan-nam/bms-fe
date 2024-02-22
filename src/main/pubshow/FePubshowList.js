import syncFetch from 'sync-fetch';
import { createNode, getAttr, getNode, getNodes, getText } from '../../utils/xmlUtils';
import FePubshow from './FePubshow';
import './FePubshowList.scss';

/**
 * 공람자 목록
 *
 * - 트리에서 전달된 dtnode로 FePubshow 생성
 * - FePubshow로부터 삭제 이벤트 수신 처리
 * - hox pubShowInfo 업데이트
 */
export default class FePubshowList extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './main.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.innerHTML = `
      <header>
        <label>${GWWEBMessage.cmsg_485}</label>
      </header>
      <ul id="list" class="list"></ul>
    `;

    this.shadowRoot.append(link, wrapper);

    this.LIST = this.shadowRoot.querySelector('#list');
    this.LIST.addEventListener('deletePubshow', (e) => {
      console.log('Event', e.type, e.target, e);
      // li 삭제
      let li = e.target.closest('li');
      li.remove();

      // 트리 선택 해제 시도. FePubshowBody에서 처리

      // hox 업데이트
      this.#updateHox();
    });
  }

  set(hox) {
    this.hox = hox;

    this.#renderList();
  }

  /**
   * 왼쪽 트리영역에서 선택된 값
   * @param {DynaTreeNode} dtnode
   * @param {string} from
   */
  add(dtnode, from) {
    console.log('add', from, dtnode.data.scope, dtnode);

    switch (from) {
      case 'org': {
        // 부서인지, 사용자인지 구분하여 추가
        if (dtnode.data.isFolder) {
          // 부서 추가
          this.#addDept(dtnode);
        } else {
          // 사용자 추가
          this.#addUser(dtnode);
        }
        break;
      }
      case 'group': {
        // scope에 따라 구분하여 추가
        if (dtnode.data.scope === 'group') {
          // 그룹추가
          // TODO 옵션 찾기
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
          this.#addDept(dtnode);
          // 하위 부서 구하여, 모두 추가
          this.#addSubDept(dtnode);
        } else if (dtnode.data.scope === 'dept') {
          // 시행부서 추가
          this.#addDept(dtnode);
        }
        break;
      }
      default:
        throw new Error('unknown from: ' + from);
    }
    // hox 업데이트
    this.#updateHox();
  }

  #addDept(dtnode) {
    this.LIST.querySelector(`[uuid="dept_${dtnode.data.key}"]`)?.remove();
    //
    let xmlText = `
    <pubShow>
      <ID>${dtnode.data.key}</ID>
      <name>${dtnode.data.title}</name>
      <type>dept</type>
      <actorID>${rInfo.user.ID}</actorID>
      <actorDeptID>${rInfo.dept.ID}</actorDeptID>
    </pubShow>`;
    let pubshowNode = getNode(this.hox, 'pubShowInfo').appendChild(createNode(xmlText));

    let li = this.LIST.appendChild(document.createElement('li'));
    li.setAttribute('uuid', `dept_${dtnode.data.key}`);
    li.appendChild(new FePubshow()).set(pubshowNode);
  }

  #addSubDept(dtnode) {
    let res = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveSubDeptList.act?DEPTID=${dtnode.data.key}`).json();
    if (!res.ok) {
      throw new Error('notfound sub dept: ' + dtnode.data.key);
    }
    res.subDeptList.forEach((dept) => {
      this.LIST.querySelector(`[uuid="dept_${dept.ID}"]`)?.remove();
      //
      let xmlText = `
      <pubShow>
        <ID>${dept.ID}</ID>
        <name>${dept.name}</name>
        <type>dept</type>
        <actorID>${rInfo.user.ID}</actorID>
        <actorDeptID>${rInfo.dept.ID}</actorDeptID>
      </pubShow>`;
      let pubshowNode = getNode(this.hox, 'pubShowInfo').appendChild(createNode(xmlText));

      let li = this.LIST.appendChild(document.createElement('li'));
      li.setAttribute('uuid', `dept_${dept.ID}`);
      li.appendChild(new FePubshow()).set(pubshowNode);
    });
  }

  #addUser(dtnode) {
    this.LIST.querySelector(`[uuid="user_${dtnode.data.key}"]`)?.remove();
    //
    let xmlText = `
    <pubShow>
      <ID>${dtnode.data.key}</ID>
      <name>${dtnode.data.name}</name>
      <type>user</type>
      <position>${dtnode.data.positionName}</position>
      <department>
          <ID>${dtnode.data.deptID}</ID>
          <name>${dtnode.data.deptName}</name>
      </department>
      <actorID>${rInfo.user.ID}</actorID>
      <actorDeptID>${rInfo.dept.ID}</actorDeptID>
    </pubShow>`;
    let pubshowNode = getNode(this.hox, 'pubShowInfo').appendChild(createNode(xmlText));

    let li = this.LIST.appendChild(document.createElement('li'));
    li.setAttribute('uuid', `user_${dtnode.data.key}`);
    li.appendChild(new FePubshow()).set(pubshowNode);
  }

  #addGroup(dtnode) {
    this.LIST.querySelector(`[uuid="deptGroup_${dtnode.data.key}"]`)?.remove();
    //
    let xmlText = `
    <pubShow>
      <ID>${dtnode.data.key}</ID>
      <name>${dtnode.data.title}</name>
      <type>deptGroup</type>
      <actorID>${rInfo.user.ID}</actorID>
      <actorDeptID>${rInfo.dept.ID}</actorDeptID>
    </pubShow>`;
    let pubshowNode = getNode(this.hox, 'pubShowInfo').appendChild(createNode(xmlText));

    let li = this.LIST.appendChild(document.createElement('li'));
    li.setAttribute('uuid', `deptGroup_${dtnode.data.key}`);
    li.appendChild(new FePubshow()).set(pubshowNode);
  }

  /**
   * 왼쪽 트리영역에서 선택해제된 값
   * @param {DynaTreeNode} dtnode
   * @param {string} from
   */
  delete(dtnode, from) {
    console.log('delete', from, dtnode);

    switch (from) {
      case 'org': {
        const type = dtnode.data.isFolder ? 'dept' : 'user';
        this.LIST.querySelector(`[uuid="${type}_${dtnode.data.key}"]`)?.remove();
        break;
      }
      case 'group': {
        this.LIST.querySelector(`[uuid="deptGroup_${dtnode.data.key}"]`)?.remove();
        break;
      }
      default:
        throw new Error('unknown from: ' + from);
    }
    // hox 업데이트
    this.#updateHox();
  }

  #renderList() {
    this.LIST.textContent = null;
    getNodes(this.hox, 'pubShowInfo pubShow').forEach((pubshow) => {
      let li = this.LIST.appendChild(document.createElement('li'));
      li.setAttribute('uuid', `${getAttr(pubshow, null, 'type')}_${getText(pubshow, 'ID')}`);
      li.appendChild(new FePubshow()).set(pubshow);
    });
  }

  #updateHox() {
    getNode(this.hox, 'pubShowInfo').textContent = null;
    //
    this.LIST.querySelectorAll('fe-pubshow').forEach((fePubshow) => {
      //
      getNode(this.hox, 'pubShowInfo').appendChild(fePubshow.pubshow);
    });

    // 내용 변경 이벤트 전파
    this.dispatchEvent(new Event('change'));
  }
}

customElements.define('fe-pubshowlist', FePubshowList);
