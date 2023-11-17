import { getText, setText } from '../../utils/hoxUtils';
import './FeViewRange.scss';

/**
 *
 */
export default class FeViewRange extends HTMLElement {
  constructor() {
    super();
    console.debug('FeViewRange init');
  }

  connectedCallback() {
    console.debug('FeViewRange connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-viewrange');
    this.shadowRoot.append(LINK, wrapper);

    let viewRanges = [
      ['all', 'cabinet_msg_1'],
      ['org', 'cabinet_msg_2'],
      ['dept', 'cabinet_msg_3'],
    ];
    for (let viewRange of viewRanges) {
      let input = wrapper.appendChild(document.createElement('input'));
      input.type = 'radio';
      input.name = 'viewRange';
      input.id = 'viewRange_' + viewRange[0];
      input.value = viewRange[0];
      input.addEventListener('change', (e) => {
        //
        console.log('FeViewRange change', e.target.value);
        setText(this.hox, 'docInfo viewRange', e.target.value);
      });

      let label = wrapper.appendChild(document.createElement('label'));
      label.setAttribute('for', 'viewRange_' + viewRange[0]);
      label.innerHTML = GWWEBMessage[viewRange[1]];
    }
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    let viewRange = getText(this.hox, 'docInfo viewRange');
    let input = this.shadowRoot.querySelector(`#viewRange_${viewRange}`);
    console.log('FeViewRange set', input);
    if (input) {
      input.checked = true;
    }
  }
}

// Define the new element
customElements.define('fe-viewrange', FeViewRange);
