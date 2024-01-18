import syncFetch from 'sync-fetch';
import TabUI from '../utils/TabUI';
import json from './FeSignDialog.json';
import './FeSignDialog.scss';

const W = 400;
const H = Math.round((W * 129) / 326);
/**
 * 서명 선택
 */
export default class FeSignDialog extends HTMLElement {
  signImageURL = null;
  selectedPanel = null;
  isSetStamp = false;
  isSetText = false;
  isSetPen = false;
  isCancel = false;

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
    wrapper.style.width = W + 28 + 'px';
    wrapper.innerHTML = `
      <div class="header">
        <label>${GWWEBMessage.cmsg_351}</label>
      </div>
      <div class="method-select tab-group" role="tablist">
        <button type="button" class="tab-button" role="tab" target="#stampPanel" value="1">${GWWEBMessage.cmsg_1193}</button>
        <button type="button" class="tab-button" role="tab" target="#textPanel" value="3">${GWWEBMessage.cmsg_1194}</button>
        <button type="button" class="tab-button" role="tab" target="#penPanel" value="2">${GWWEBMessage.pen_sign}</button>
      </div>
      <div class="body">
        <div id="stampPanel" role="tabpanel">
          <canvas width="${W}px" height="${H}px"></canvas>
          <div class="stamp-list"></div>
        </div>
        <div id="textPanel" role="tabpanel">
          <canvas width="${W}px" height="${H}px"></canvas>
          <div class="config text-config">
            <div>
              <label>글꼴</label>
              <select id="fontFamily">
              ${json.fontFamily.map((font) => `<option value="${font}">${font}</option>`).join('')}
              </select>
            </div>
            <div>
              <label>크기</label>
              <button type="button" class="font-size btn" value="down">-</button>
              <button type="button" class="font-size btn" value="up">+</button>
            </div>
          </div>
        </div>
        <div id="penPanel" role="tabpanel">
          <canvas width="${W}px" height="${H}px"></canvas>
          <div class="config pen-config">
            <div>
              <label>펜 굵기</label>
              <input type="number" id="penWidth" min="${json.penSize.min}" max="${json.penSize.max}" step="1" value="${json.penSize.default}" />
            </div>
            <div>
              <label>펜 색</label>
              <select id="penColor">
              ${json.penColor.map((color) => `<option value="${color.value}">${color.name}</option>`)}
              </select>
            </div>
            <div>
              <button type="button" id="penClear" class="btn">${GWWEBMessage.cmsg_1388 /* 지우기 */}</button>
            </div>
            <div>
              <label for="penFile">${GWWEBMessage.cmsg_1393 /* 불러오기 */}</label>
              <input type="file" id="penFile" />
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <button type="button" id="btnVerify" class="btn btn-primary" disabled>${GWWEBMessage.cmsg_0006}</button>
        <button type="button" id="btnCancel" class="btn">${GWWEBMessage.cmsg_663}</button>
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    TabUI.init(this.shadowRoot, (activePanel) => {
      this.selectedPanel = activePanel;
      this.#decideActivatedButton();
    });

    this.initStampSign();
    this.initTextSign();
    this.initPenSign();

    // 확인
    this.shadowRoot.querySelector('#btnVerify').addEventListener('click', (e) => {
      console.log('btnVerify click');
      this.selectedPanel.querySelector('canvas').toBlob((blob) => {
        //
        this.signImageURL = URL.createObjectURL(blob);
      });
    });

    // 취소
    this.shadowRoot.querySelector('#btnCancel').addEventListener('click', (e) => {
      console.log('btnCancel click');
      this.isCancel = true;
    });
  }

  /**
   * 서명 결과 전달
   * @returns 선택했으면 서명의 objectURL, 취소면 null
   */
  async getSignImageURL() {
    return new Promise((resolve, reject) => {
      //
      const interval = setInterval(() => {
        if (this.signImageURL !== null) {
          //
          clearInterval(interval);
          resolve(this.signImageURL);
        }
        if (this.isCancel) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }

  initStampSign() {
    //
    this.stampCanvas = this.shadowRoot.querySelector('#stampPanel canvas');
    this.stampCtx = this.stampCanvas.getContext('2d');

    // 도장 이미지 선택 event
    this.shadowRoot.querySelector('.stamp-list').addEventListener('click', (e) => {
      if (e.target.tagName !== 'IMG') {
        return;
      }
      this.stampCtx.clearRect(0, 0, this.stampCanvas.width, this.stampCanvas.height);
      this.stampCtx.beginPath();

      // 선택된 이미지를 canvas에 그리기
      const img = e.target;
      const wrh = img.width / img.height;
      let newWidth = this.stampCanvas.width;
      let newHeight = newWidth / wrh;
      if (newHeight > this.stampCanvas.height) {
        newHeight = this.stampCanvas.height;
        newWidth = newHeight * wrh;
      }
      const xOffset = newWidth < this.stampCanvas.width ? (this.stampCanvas.width - newWidth) / 2 : 0;
      const yOffset = newHeight < this.stampCanvas.height ? (this.stampCanvas.height - newHeight) / 2 : 0;

      this.stampCtx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
      this.isSetStamp = true;
      this.#decideActivatedButton();
    });
  }

  initTextSign() {
    const drawText = () => {
      this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
      this.textCtx.beginPath();

      this.textCtx.font = `${this.fontSize}px ${this.fontFamily}`;
      this.textCtx.fillStyle = 'black';
      //
      this.textCtx.fillText(rInfo.user.name, this.textCanvas.width / 2, this.textCanvas.height / 2);
      this.isSetText = true;
    };

    this.fontSize = 120;
    this.fontFamily = null;

    this.textCanvas = this.shadowRoot.querySelector('#textPanel canvas');
    this.textCtx = this.textCanvas.getContext('2d');
    this.textCtx.textAlign = 'center';
    this.textCtx.textBaseline = 'middle';

    // 폰트 변경 이벤트
    this.shadowRoot.querySelector('#fontFamily').addEventListener('change', (e) => {
      this.fontFamily = this.shadowRoot.querySelector('#fontFamily').value;
      drawText();
    });
    this.shadowRoot.querySelector('#fontFamily').dispatchEvent(new Event('change'));
    // 폰트 크기 이벤트
    this.shadowRoot.querySelectorAll('.font-size').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (e.target.value === 'up') {
          this.fontSize += 10;
        } else {
          this.fontSize -= 10;
        }
        drawText();
      });
    });
  }

  initPenSign() {
    const drawLine = (x1, y1, x2, y2) => {
      //
      this.penCtx.beginPath();
      this.penCtx.lineWidth = this.shadowRoot.querySelector('#penWidth').value;
      this.penCtx.strokeStyle = this.shadowRoot.querySelector('#penColor').value;
      this.penCtx.lineJoin = 'round';
      this.penCtx.moveTo(x1, y1);
      this.penCtx.lineTo(x2, y2);
      this.penCtx.closePath();
      this.penCtx.stroke();
    };
    //
    this.penCanvas = this.shadowRoot.querySelector('#penPanel canvas');
    this.penCtx = this.penCanvas.getContext('2d');

    let [x, y] = [0, 0];

    // 펜서명 이벤트
    this.penCanvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      // 그리기 시작
      [x, y] = [e.offsetX, e.offsetY];
      this.shouldPenDraw = true;
    });
    this.penCanvas.addEventListener('mouseup', (e) => {
      if (e.button !== 0) return;
      // 그리기 종료
      this.shouldPenDraw = false;

      drawLine(x, y, e.offsetX, e.offsetY);
      [x, y] = [0, 0];
    });
    this.penCanvas.addEventListener('mouseleave', (e) => {
      if (e.button !== 0) return;
      // 그리기 종료
      this.shouldPenDraw = false;
      [x, y] = [0, 0];
    });
    this.penCanvas.addEventListener('mousemove', (e) => {
      // 그리는 중
      if (e.button !== 0) return;
      if (!this.shouldPenDraw) return;

      drawLine(x, y, e.offsetX, e.offsetY);
      [x, y] = [e.offsetX, e.offsetY];

      this.isSetPen = true;
      this.#decideActivatedButton();
    });

    // clear 이벤트
    this.shadowRoot.querySelector('#penClear').addEventListener('click', () => {
      this.penCtx.setTransform(1, 0, 0, 1, 0, 0);
      this.penCtx.clearRect(0, 0, this.penCanvas.width, this.penCanvas.height);
      this.penCtx.beginPath();

      this.isSetPen = false;
    });
    // 외부 파일 이벤트
    this.shadowRoot.querySelector('#penFile').addEventListener('change', (e) => {
      console.log('files', e.target.files);
      this.penCtx.clearRect(0, 0, this.penCanvas.width, this.penCanvas.height);
      this.penCtx.beginPath();

      const fileUrl = URL.createObjectURL(e.target.files[0]);
      const img = new Image();
      img.onload = () => {
        //
        const wrh = img.width / img.height;
        let newWidth = this.penCanvas.width;
        let newHeight = newWidth / wrh;
        if (newHeight > this.penCanvas.height) {
          newHeight = this.penCanvas.height;
          newWidth = newHeight * wrh;
        }
        const xOffset = newWidth < this.penCanvas.width ? (this.penCanvas.width - newWidth) / 2 : 0;
        const yOffset = newHeight < this.penCanvas.height ? (this.penCanvas.height - newHeight) / 2 : 0;

        this.penCtx.drawImage(img, xOffset, yOffset, newWidth, newHeight);

        this.isSetPen = true;
      };
      img.src = fileUrl;
    });
  }

  #decideActivatedButton() {
    const isSet = ('stampPanel' === this.selectedPanel.id && this.isSetStamp) || ('textPanel' === this.selectedPanel.id && this.isSetText) || ('penPanel' === this.selectedPanel.id && this.isSetPen);
    this.shadowRoot.querySelector('#btnVerify').disabled = !isSet;
  }

  open() {
    this.signImageURL = null;
    this.selectedPanel = null;
    this.isCancel = false;

    // 서명정보 구하기
    const userSignData = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/rertieveUserSignData.act?UID=${rInfo.user.ID}`).json();
    console.log('UserSignData', userSignData);

    // [도장, 문자서명, 펜서명] 초기 화면 결정
    let defaultSancMethod = userSignData.sancmethod < 5 ? userSignData.sancmethod : 1;
    if (defaultSancMethod === 1 && userSignData.list.length === 0) {
      defaultSancMethod = 3;
    }
    this.shadowRoot.querySelectorAll('[role="tab"]').forEach((tab, i) => {
      if (tab.value == defaultSancMethod) {
        TabUI.select(this.shadowRoot, i + 1);
      }
    });

    // 도장 이미지 설정
    this.shadowRoot.querySelector('.stamp-list').textContent = null;
    Array.from(userSignData.list).forEach((fid) => {
      const img = this.shadowRoot.querySelector('.stamp-list').appendChild(new Image());
      img.src = `${PROJECT_CODE}/com/hs/gwweb/appr/manageFileDwld.act?TRID=${fid}`;
    });
  }
}

customElements.define('fe-signdialog', FeSignDialog);
