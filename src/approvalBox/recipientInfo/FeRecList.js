import syncFetch from 'sync-fetch';
import { getLastSignParticipant } from '../../utils/HoxUtils';
import { HoxEventType, addNodes, createNode, existsFlag, existsNode, getAttr, getNode, getNodes, getText } from '../../utils/xmlUtils';
import FeApprovalBox from '../FeApprovalBox';
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
export default class FeRecList extends FeApprovalBox {
  stampInfoMap = new Map();
  skipStampURL = null;
  skipChiefStampURL = null;

  constructor() {
    super();
  }

  connectedCallback() {
    this.wrapper = super.init();

    this.wrapper.innerHTML = `
      <header>
        <label>${GWWEBMessage.recvdept}</label>
        <div>
          <button type="button" id="upBtn" title="${GWWEBMessage.cmsg_1154}">△</button>
          <button type="button" id="downBtn" title="${GWWEBMessage.cmsg_1155}">▽</button>
        </div>
      </header>
      <ul id="list" class="list"></ul>
      <div class="stamp-wrap">
        <div>
          <ul class="stamp-list"></ul>
        </div>
        <div>
          <img class="preview"/>
        </div>
      </div>
    `;

    this.LIST = this.shadowRoot.querySelector('#list');
    this.LIST.addEventListener('deleteRec', (e) => {
      console.log('Event', e.type, e.target, e);
      // li 삭제
      let li = e.target.closest('li');
      li.remove();

      // hox 업데이트
      this.#updateHox();
    });

    // 수신부서 선택
    this.LIST.addEventListener('click', (e) => {
      this.LIST.querySelectorAll('li').forEach((li) => li.classList.remove('selected'));
      e.target.closest('li')?.classList.add('selected');
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
    super.setHox(hox);

    hox.addEventListener(HoxEventType.FLAG, (e) => {
      console.info('hoxEvent listen', e.type, e.detail);
      if (e.detail.type === 'apprflag_auto_send') {
        this.#initAutoSend();
      }
    });

    hox.addEventListener(HoxEventType.ENFORCETYPE, (e) => {
      console.info('hoxEvent listen', e.type, e.detail);
      this.#initAutoSend();
    });

    this.#initAutoSend();
    this.#renderRecList();
  }

  changeContentNumberCallback() {
    console.log('FeRecList changeContentNumberCallback');
    this.#initAutoSend();
    this.#renderRecList();
    this.dispatchEvent(new Event('change')); // 수신부서 표기명, 발신명의 업데이트를 위해
  }

  /**
   * 왼쪽 트리영역에서 선택된 값
   * @param {DynaTreeNode} dtnode
   * @param {string} from
   */
  add(dtnode, from) {
    console.log('add', from, dtnode.data.scope, dtnode);
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
          this.#addDept(dtnode);
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

    console.log(this.contentNumber, this.contentNode);
    let recNode = getNode(this.contentNode, 'receiptInfo recipient').appendChild(createNode(xmlText));
    let li = this.LIST.appendChild(document.createElement('li'));
    li.setAttribute('uuid', `rectype_dept_${dtnode.data.key}`);
    li.appendChild(new FeRec()).set(recNode);
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
    let rec = getNode(this.contentNode, 'receiptInfo recipient').appendChild(createNode(xmlText));
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
    let rec = getNode(this.contentNode, 'receiptInfo recipient').appendChild(createNode(xmlText));
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
      let rec = getNode(this.contentNode, 'receiptInfo recipient').appendChild(createNode(xmlText));
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

  #initAutoSend() {
    if (!doccfg.useAutoSend) {
      return;
    }
    if (!existsFlag(this.hox, 'docInfo approvalFlag', 'apprflag_auto_send')) {
      // 자동발송이 해제됬을 경우
      getNodes(this.hox, 'docInfo content').forEach((content) => {
        getNode(content, 'stamp')?.remove();
      });
      return;
    }
    this.enforceType = getText(this.contentNode, 'enforceType');
    this.wrapper.classList.toggle('auto-send', 'enforcetype_not' !== this.enforceType);
    if ('enforcetype_not' === this.enforceType) {
      getNode(this.contentNode, 'stamp')?.remove();
      return;
    }

    const drafterId = getText(this.hox, 'docInfo drafter ID');
    const draftDeptId = getText(this.hox, 'docInfo drafter department ID');
    const senderDeptId = draftDeptId;
    const lastSignDeptId = getText(getLastSignParticipant(this.hox), 'department ID');
    const type = 'enforcetype_external' === this.enforceType ? 0 : 3;

    const key = `${type}_${draftDeptId}_${lastSignDeptId}_${senderDeptId}`;
    if (!this.stampInfoMap.has(key)) {
      const stampInfos = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveStampInfos.act?type=${type}&draftDeptId=${draftDeptId}&lastSignDeptId=${lastSignDeptId}&senderDeptId=${senderDeptId}`).json();
      this.stampInfoMap.set(key, stampInfos);

      stampInfos.stamps.push(this.#getSkipStampInfo(type));
    }
    console.debug('stampInfoMap', this.stampInfoMap);
    const stampInfos = this.stampInfoMap.get(key);

    const list = this.shadowRoot.querySelector('.stamp-list');
    list.textContent = null;

    Array.from(stampInfos.stamps).forEach((stamp, i) => {
      const li = list.appendChild(document.createElement('li'));
      li.innerHTML = stamp.stampName;
      li.dataset.key = `${stamp.ID}_${stamp.fno}_${stamp.type}`;
      li.addEventListener('click', (e) => {
        list.querySelectorAll('li').forEach((li) => li.classList.remove('selected'));
        li.classList.add('selected');
        if (!stamp.url) {
          const sealBlob = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageFileDwld.act?TRID=${stampInfos.TRIDs[i]}`).blob();
          stamp.url = URL.createObjectURL(sealBlob);
        }

        const preview = this.shadowRoot.querySelector('.preview');
        preview.src = stamp.url;
        preview.dataset.fno = stamp.fno;

        console.debug('stamp', stamp);

        getNode(this.contentNode, 'stamp')?.remove();
        this.contentNode.appendChild(createNode(`<stamp id="${stamp.ID}" fno="${stamp.fno}" type="${stamp.type}" userid="${drafterId}" deptid="${draftDeptId}"/>`));
      });
    });
    //
    const stampNode = getNode(this.contentNode, 'stamp');
    if (stampNode !== null) {
      const id = getAttr(stampNode, null, 'id');
      const fno = getAttr(stampNode, null, 'fno');
      const type = getAttr(stampNode, null, 'type');

      list.querySelector(`li[data-key="${id}_${fno}_${type}"]`)?.click();
    } else {
      list.querySelector(':first-child').click();
    }
  }

  #renderRecList() {
    if (!existsNode(this.contentNode, 'receiptInfo recipient')) {
      addNodes(this.contentNode, 'receiptInfo', 'recipient');
    }

    this.LIST.textContent = null;
    getNodes(this.contentNode, 'receiptInfo recipient rec').forEach((rec) => {
      console.log(this.contentNumber, 'recipient rec', rec);
      //
      let li = this.LIST.appendChild(document.createElement('li'));
      li.setAttribute('uuid', `${getAttr(rec, null, 'type')}_${getText(rec, 'ID')}`);
      li.appendChild(new FeRec()).set(rec);
    });
  }

  #updateHox() {
    getNode(this.contentNode, 'receiptInfo recipient').textContent = null;
    //
    this.LIST.querySelectorAll('fe-rec').forEach((feRec) => {
      //
      getNode(this.contentNode, 'receiptInfo recipient').appendChild(feRec.rec);
    });

    // 내용 변경 이벤트 전파
    this.dispatchEvent(new Event('change'));
  }

  get displayString() {
    return Array.from(this.LIST.querySelectorAll('fe-rec'))
      .map((feRec) => feRec.displayString)
      .join(',');
  }

  /**
   * 관인/부서장인 생략 정보(name, url)
   * @param {number} type 0: 대외, 3: 대내
   * @returns
   */
  #getSkipStampInfo(type) {
    if (type === 0 && this.skipStampURL === null) {
      this.skipStampURL = URL.createObjectURL(syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveServerFile.act?UID=${rInfo.user.ID}&res=skipstamp.bmp&fileType=attach`).blob());
    } else if (type === 3 && this.skipChiefStampURL === null) {
      this.skipChiefStampURL = URL.createObjectURL(syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveServerFile.act?UID=${rInfo.user.ID}&res=skipchiefstamp.bmp&fileType=attach`).blob());
    }
    return {
      ID: '000000000',
      fno: -1,
      type: type,
      stampName: type === 0 ? '관인생략' : '서명인생략',
      url: type === 0 ? this.skipStampURL : this.skipChiefStampURL,
    };
  }
}

customElements.define('fe-reclist', FeRecList);
