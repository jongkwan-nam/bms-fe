import ServerConfig from '../../ini/ServerConfig';
import { HANDYDEF } from '../../ini/handydefini';
import { getText, setText } from '../../utils/xmlUtils';
import FeApprovalBox from '../FeApprovalBox';
import './FeViewRange.scss';

/**
 * 열람범위
 */
export default class FeViewRange extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    const showViewlevel = ServerConfig.getJhomsConfig('approval', 'show_viewlevel');
    let viewRangeSplit = HANDYDEF.Sanction['ViewRange'].split(',');
    let viewRanges = [];
    let viewRangesMsg = '';
    for (let i = 0; i < viewRangeSplit.length; i++) {
      if (showViewlevel == true) {
        switch (viewRangeSplit[i]) {
          case 'none':
            viewRangesMsg = 'cmsg_2360'; //1등급
            break;
          case 'dept':
            viewRangesMsg = 'cmsg_2361'; //2등급
            break;
          case 'all':
            viewRangesMsg = 'cmsg_2362'; //3등급
            break;
          default:
            viewRangesMsg = '';
            console.error("showViewlevel True / HANDYDEF.Sanction['ViewRange'] check");
            break;
        }
      } else {
        switch (viewRangeSplit[i]) {
          case 'dept':
            viewRangesMsg = 'cabinet_msg_3'; //부서
            break;
          case 'org':
            viewRangesMsg = 'cabinet_msg_2'; //소속기관
            break;
          case 'all':
            viewRangesMsg = 'cabinet_msg_1'; //전체
            break;
          default:
            console.error("showViewlevel False / HANDYDEF.Sanction['ViewRange'] check");
            viewRangesMsg = '';
            break;
        }
      }
      //오탈자 및 등록 되지 않을 경우 빼고 생성
      if (viewRangesMsg !== '') {
        viewRanges.push([viewRangeSplit[i], viewRangesMsg]);
      }
    }

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
    super.setHox(hox);

    let viewRange = getText(this.hox, 'docInfo viewRange');
    let input = this.shadowRoot.querySelector(`#viewRange_${viewRange}`);
    if (input) {
      input.checked = true;
    }
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('input').forEach((input) => (input.disabled = this.contentNumber > 1));
  }
}

// Define the new element
customElements.define('fe-viewrange', FeViewRange);
