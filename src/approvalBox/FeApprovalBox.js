import { HoxEventType, getNode, getNodes } from '../utils/hoxUtils';

/**
 * 결재정보 abstract class
 */
export default class FeApprovalBox extends HTMLElement {
  contentNumber = 1;
  contentCount = 1;
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

    this.shadowRoot.append(link, wrapper);

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
    this.contentNode = getNode(this.hox, 'docInfo content');

    // 안 선택 이벤트 수신
    this.hox.addEventListener(HoxEventType.CONTENT, (e) => {
      console.log('hoxEvent listen', e.type, e.detail);
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
}
