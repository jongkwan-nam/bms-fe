import syncFetch from 'sync-fetch';
import './FeSignDialog.scss';

const W = 400;
const H = Math.round((W * 129) / 326);
/**
 * 서명 선택
 */
export default class FeSignDialog extends HTMLElement {
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
      <div class="title-bar">
        <label>${GWWEBMessage.cmsg_351}</label>
      </div>
      <div class="method-bar">
        <input type="radio" name="method" id="method_1" value="1"><label for="method_1">${GWWEBMessage.cmsg_1193}</label>
        <input type="radio" name="method" id="method_3" value="3"><label for="method_3">${GWWEBMessage.cmsg_1194}</label>
        <input type="radio" name="method" id="method_2" value="2"><label for="method_2">${GWWEBMessage.pen_sign}</label>
      </div>
      <div class="sign-bar">
        <canvas id="signCanvas" width="${W}px" height="${H}px"></canvas>
      </div>
      <div class="image-bar">
      </div>
    `;

    this.shadowRoot.append(link, wrapper);

    this.canvas = this.shadowRoot.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = '48px Comic Sans MS';
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // 도장 이미지 선택 event
    this.shadowRoot.querySelector('.image-bar').addEventListener('click', (e) => {
      if (e.target.tagName !== 'IMG' || !this.activeStamp) {
        return;
      }
      this.clearCanvas();

      // 선택된 이미지를 canvas에 그리기
      const img = e.target;
      const wrh = img.width / img.height;
      let newWidth = this.canvas.width;
      let newHeight = newWidth / wrh;
      if (newHeight > this.canvas.height) {
        newHeight = this.canvas.height;
        newWidth = newHeight * wrh;
      }
      const xOffset = newWidth < this.canvas.width ? (this.canvas.width - newWidth) / 2 : 0;
      const yOffset = newHeight < this.canvas.height ? (this.canvas.height - newHeight) / 2 : 0;

      this.ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
      console.log(`
          this.canvas: w=${this.canvas.width}, h=${this.canvas.height}
          image:  w=${img.width}, h=${img.height}
          offset: x=${xOffset}, y=${yOffset}, w=${newWidth}, h=${newHeight}
        `);
    });

    // 펜서명 이벤트
    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.activePen) return;
      if (e.button !== 0) return;
      // 그리기 시작
      this.shouldDraw = true;
      this.ctx.beginPath();
      let elementRect = e.target.getBoundingClientRect();
      this.ctx.moveTo(e.clientX - elementRect.left, e.clientY - elementRect.top);
    });
    this.canvas.addEventListener('mouseup', (e) => {
      if (!this.activePen) return;
      if (e.button !== 0) return;
      // 그리기 종료
      this.shouldDraw = false;
    });
    this.canvas.addEventListener('mouseleave', (e) => {
      if (!this.activePen) return;
      if (e.button !== 0) return;
      // 그리기 종료
      this.shouldDraw = false;
    });
    this.canvas.addEventListener('mousemove', (e) => {
      // 그리는 중
      if (!this.activePen) return;
      if (e.button !== 0) return;
      if (!this.shouldDraw) return;

      let elementRect = e.target.getBoundingClientRect();
      this.ctx.lineTo(e.clientX - elementRect.left, e.clientY - elementRect.top);
      this.ctx.stroke();
    });

    // 서명종류 선택 이벤트
    this.shadowRoot.querySelectorAll('[name="method"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        console.log('method change', e.target.value, this);
        switch (e.target.value) {
          case '1': {
            this.activeStamp = true;
            this.activeText = false;
            this.activePen = false;

            wrapper.classList.toggle('stamp', true);
            wrapper.classList.toggle('text', false);
            wrapper.classList.toggle('pen', false);
            this.clearCanvas();
            this.restoreStamp();
            break;
          }
          case '2': {
            this.activeStamp = false;
            this.activeText = false;
            this.activePen = true;

            wrapper.classList.toggle('stamp', false);
            wrapper.classList.toggle('text', false);
            wrapper.classList.toggle('pen', true);
            this.clearCanvas();
            this.restorePen();
            break;
          }
          case '3': {
            this.activeStamp = false;
            this.activeText = true;
            this.activePen = false;

            wrapper.classList.toggle('stamp', false);
            wrapper.classList.toggle('text', true);
            wrapper.classList.toggle('pen', false);
            this.clearCanvas();
            this.drawSignText();
            break;
          }
        }
      });
    });
  }

  open() {
    const UserSignData = syncFetch(`${PROJECT_CODE}/com/hs/gwweb/appr/rertieveUserSignData.act?UID=${rInfo.user.ID}`).json();
    console.log('UserSignData', UserSignData);

    let defaultSancMethod = UserSignData.sancmethod < 5 ? UserSignData.sancmethod : 1;
    this.shadowRoot.querySelector('#method_' + defaultSancMethod).click();

    this.shadowRoot.querySelector('.image-bar').textContent = null;
    Array.from(UserSignData.list).forEach((fid) => {
      const img = this.shadowRoot.querySelector('.image-bar').appendChild(new Image());
      img.src = `${PROJECT_CODE}/com/hs/gwweb/appr/manageFileDwld.act?TRID=${fid}`;
    });
  }

  drawSignText() {
    this.ctx.fillText(rInfo.user.name, this.canvas.width / 2, this.canvas.height / 2);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
  }

  restoreStamp() {
    //
  }

  restorePen() {
    //
  }
}

customElements.define('fe-signdialog', FeSignDialog);
