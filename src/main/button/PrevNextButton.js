import StringUtils from '../../utils/StringUtils';

/**
 * 이전 다음 버튼
 */
export default class PrevNextButton extends HTMLButtonElement {
  feCommentDialog = null;

  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerHTML = `<span id="prev" title="${GWWEBMessage.cmsg_396} ${GWWEBMessage.W3186}">${GWWEBMessage.cmsg_396}</span> │ <span id="next" title="${GWWEBMessage.cmsg_397} ${GWWEBMessage.W3186}">${GWWEBMessage.cmsg_397}</span>`;
    this.classList.add('btn');
    this.addEventListener('click', (e) => this.#doAction(e));

    // 연속결재가 아니면
    this.apprIdList = rInfo.parameterMap
      .get('APPRIDLIST')
      .split(',')
      .filter((id) => StringUtils.isNotBlank(id));

    if (this.apprIdList.length < 2) {
      this.remove();
    }

    this.apprId = rInfo.parameterMap.get('APPRIDXID');
    this.idIndex = this.apprIdList.indexOf(this.apprId);
    this.total = this.apprIdList.length;

    if (this.idIndex === 0) {
      this.querySelector('#prev').classList.add('disabled');
    } else if (this.idIndex === this.total - 1) {
      this.querySelector('#next').classList.add('disabled');
    }
  }

  async #doAction(e) {
    console.debug('PrevNextButton', e.target.id);
    //
    if (e.target.classList.contains('disabled')) {
      return;
    }
    if (e.target.id === 'prev') {
      --this.idIndex;
      this.#go();
    } else if (e.target.id === 'next') {
      ++this.idIndex;
      this.#go();
    }
  }

  #go() {
    //
    const id = this.apprIdList[this.idIndex];
    rInfo.parameterMap.set('APPRIDXID', id);

    const form = document.querySelector('body').appendChild(document.createElement('form'));
    form.method = 'POST';

    rInfo.parameterMap.forEach((value, key) => {
      const input = form.appendChild(document.createElement('input'));
      input.name = key;
      input.value = value;
    });

    form.submit();
  }
}

customElements.define('prevnext-button', PrevNextButton, { extends: 'button' });
