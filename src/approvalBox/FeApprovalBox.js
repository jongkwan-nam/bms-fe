import { HoxEventType, getNode, getNodes } from '../utils/xmlUtils';
import './FeApprovalBox.scss';

/**
 * 결재정보 abstract class
 */
export default class FeApprovalBox extends HTMLElement {
  contentCount = 1;
  contentNumber = 1;
  contentNode = null;

  constructor() {
    super();
  }

  /**
   *
   * @returns wrapper 컴포넌트 상위 div
   */
  init() {
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase());

    this.disabledLayer = document.createElement('div');
    this.disabledLayer.classList.add('disabled-layer');

    this.shadowRoot.append(link, wrapper, this.disabledLayer);

    return wrapper;
  }

  /**
   * hox 설정
   * - 안 갯수 설정
   * - 안 선택 이벤트 수신 -> changeContentNumberCallback 실행
   *
   * @param {XMLDocument} hox
   */
  setHox(hox) {
    this.hox = hox;

    this.contentCount = getNodes(this.hox, 'docInfo content').length;
    const contentSelector = document.querySelector('select#contentSelector');
    this.contentNumber = parseInt(contentSelector ? contentSelector.value : 1);
    this.contentNode = getNode(this.hox, 'docInfo content', this.contentNumber - 1);

    // 안 선택 이벤트 수신
    this.hox.addEventListener(HoxEventType.CONTENT, (e) => {
      console.debug('hoxEvent listen', e.type, e.detail);
      //
      if (e.detail.type === 'select') {
        this.contentNumber = e.detail.value;
        this.contentNode = getNode(this.hox, 'docInfo content', this.contentNumber - 1);
        this.changeContentNumberCallback();
      }
    });
  }

  changeContentNumberCallback() {
    // 필요시 override
  }

  /**
   * 사용자 입력이 되지 않도록 하는 레이어를 덮어 씌운다
   * @param {boolean} force true: disabled
   */
  toggleDisabled(force) {
    this.disabledLayer.classList.toggle('open', force);
  }
}
