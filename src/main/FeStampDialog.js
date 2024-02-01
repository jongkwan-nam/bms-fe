import syncFetch from 'sync-fetch';
import { getLastSignParticipant } from '../utils/HoxUtils';
import { HoxEventType, addNode, existsNode, getNode, getText, setText } from '../utils/xmlUtils';
import './FeStampDialog.scss';

/**
 * 관인 선택 다이얼로그
 */
export default class FeStampDialog extends HTMLElement {
  isClose = false;
  stampInfoMap = new Map();
  skipStampURL = null;
  skipChiefStampURL = null;

  constructor() {
    super();
    this.init();
  }

  init() {
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './main.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.cmsg_534}</label>
      </div>
      <div class="body">
        <div>
          <ul class="list"></ul>
        </div>
        <div>
          <img class="preview"/>
        </div>
      </div>
      <div class="footer">
        <div>
          <input type="checkbox" id="applyAll">
          <label for="applyAll"></label>
        </div>
        <div>
          <button type="button" id="btnVerify" class="btn btn-primary">${GWWEBMessage.cmsg_0006}</button>
          <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
        </div>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.shadowRoot.querySelector('#btnVerify').addEventListener('click', async () => {
      await this.#doStamp();
      //
      this.isClose = true;
    });

    this.shadowRoot.querySelector('#btnCancel').addEventListener('click', () => {
      this.isClose = true;
    });

    feMain.hox.addEventListener(HoxEventType.CONTENT, async (e) => {
      console.info('hoxEvent listen', e.type, e.detail);
      if (e.detail.type === 'select') {
        // 안선택 이벤트
        this.#renderList();
      }
    });
  }

  connectedCallback() {
    this.isClose = false;

    this.#renderList();
  }

  async await() {
    return new Promise((resolve, reject) => {
      //
      const interval = setInterval(() => {
        if (this.isClose) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }

  #renderList() {
    this.currentContentNumber = feMain.feContentNavigator.examDocSelectedIndex + 1;
    const currentContent = getNode(feMain.hox, 'docInfo content', this.currentContentNumber - 1);
    const draftDeptId = getText(feMain.hox, 'docInfo drafter department ID');
    const senderDeptId = getText(currentContent, 'receiptInfo senderDeptID');
    const lastSignDeptId = getText(getLastSignParticipant(feMain.hox), 'department ID');
    this.enforceType = getText(currentContent, 'enforceType');
    let type = 'enforcetype_external' === this.enforceType ? 0 : 3;
    console.log('currentContentNumber', this.currentContentNumber, 'enforceType', this.enforceType, 'draftDeptId', draftDeptId, 'lastSignDeptId', lastSignDeptId, 'senderDeptId', senderDeptId);

    // 발송종류에 따른 문구
    if ('enforcetype_external' === this.enforceType) {
      this.shadowRoot.querySelector('.header label').innerHTML = GWWEBMessage.cmsg_534;
      this.shadowRoot.querySelector('#applyAll ~ label').innerHTML = GWWEBMessage.appr_batchdraft_005;
    } else if ('enforcetype_internal' === this.enforceType) {
      this.shadowRoot.querySelector('.header label').innerHTML = GWWEBMessage.cmsg_602 + GWWEBMessage.W3143;
      this.shadowRoot.querySelector('#applyAll ~ label').innerHTML = GWWEBMessage.appr_batchdraft_006;
    }

    const key = `${type}_${draftDeptId}_${lastSignDeptId}_${senderDeptId}`;
    if (!this.stampInfoMap.has(key)) {
      const stampInfos = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/retrieveStampInfos.act?type=${type}&draftDeptId=${draftDeptId}&lastSignDeptId=${lastSignDeptId}&senderDeptId=${senderDeptId}`).json();
      this.stampInfoMap.set(key, stampInfos);

      stampInfos.stamps.push(this.#getSkipStampInfo(type));
    }
    console.debug('stampInfoMap', this.stampInfoMap);
    const stampInfos = this.stampInfoMap.get(key);

    const list = this.shadowRoot.querySelector('.list');
    list.textContent = null;
    const preview = this.shadowRoot.querySelector('.preview');
    Array.from(stampInfos.stamps).forEach((stamp, i) => {
      const li = list.appendChild(document.createElement('li'));
      li.innerHTML = stamp.stampName;
      li.addEventListener('click', (e) => {
        list.querySelectorAll('li').forEach((li) => li.classList.remove('selected'));
        li.classList.add('selected');
        if (!stamp.url) {
          const sealBlob = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/manageFileDwld.act?TRID=${stampInfos.TRIDs[i]}`).blob();
          stamp.url = URL.createObjectURL(sealBlob);
        }
        preview.src = stamp.url;
        preview.dataset.fno = stamp.fno;

        console.debug('stamp', stamp);
      });
    });
    list.querySelector(':first-child').click();
  }

  /**
   * 날인
   * - 모두적용 여부에 따른 날인 대상 수집
   * - 각 안별 날인함수 호출
   */
  async #doStamp() {
    // 모두 적용이거나 아니거나
    let contentNumbers = [];
    if (this.shadowRoot.querySelector('#applyAll').checked) {
      if ('enforcetype_internal' === this.enforceType) {
        contentNumbers = feMain.feContentNavigator.internalContentNumbers;
      } else if ('enforcetype_external' === this.enforceType) {
        contentNumbers = feMain.feContentNavigator.externalContentNumbers;
      }
    } else {
      contentNumbers.push(this.currentContentNumber);
    }
    console.log('#doStamp', contentNumbers);

    for (const contentNumber of contentNumbers) {
      //
      const key = 'content' + contentNumber;
      const examDoc = feMain.splitedExamDocMap.get(key);
      await feMain.feEditor2.openByJSON(examDoc.hwpJson);

      await this.#doSealStamp(contentNumber);

      // hox 처리
      const nodeContent = getNode(feMain.hox, 'docInfo content', contentNumber - 1);
      if (!existsNode(nodeContent, 'stampName')) {
        addNode(nodeContent, 'stampName');
      }
      setText(nodeContent, 'stampName', this.shadowRoot.querySelector('.list li.selected').innerHTML);

      // 날인된 본문 저장
      examDoc.hwpJson = await feMain.feEditor2.copyDocument('JSON');
    }
  }

  /**
   * 안 하나에 대해 관인/부서장인 날인 처리
   * @param {number} contentNumber 안 번호
   */
  async #doSealStamp(contentNumber) {
    /*
      - editor2에 현재 시행문 insert
      - 관인셀 clear
      - 관인생략셀 clear
      - 관인테이블 없으면, stamptable.hwp insert
      - 관인 이미지 추가
      - 관인 위치 조정
    */
    //
    const url = this.shadowRoot.querySelector('.preview').src;
    const fno = parseInt(this.shadowRoot.querySelector('.preview').dataset.fno);
    console.log('#doSealStamp', url, fno);

    if (fno === -1) {
      await feMain.feEditor2.doSkipStamp(url);
    } else {
      await feMain.feEditor2.doSealStamp(url);
    }
    // feContentNavigator 에 날인 표시
    feMain.feContentNavigator.setCompletedOfSealStamp(contentNumber);
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

customElements.define('fe-stampdialog', FeStampDialog);
