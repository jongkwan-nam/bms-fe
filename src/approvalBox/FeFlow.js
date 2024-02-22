import FeSancOrgTree from '../tree/FeSancOrgTree';
import { getNodes, getText } from '../utils/xmlUtils';
import './FeFlow.scss';
import './flowInfo/FeParticipantList';
import FeParticipantList from './flowInfo/FeParticipantList';

/**
 * 결재선 화면
 * 조직도 트리와 선택된 participant 관리
 */
export default class FeFlow extends HTMLElement {
  active = false;

  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add(this.tagName.toLocaleLowerCase(), 'tree-list');
    wrapper.innerHTML = `
      <div class="tree"></div>
      <div class="list"></div>
    `;

    this.shadowRoot.append(link, wrapper);

    // 트리 생성
    this.feSancOrgTree = this.shadowRoot.querySelector('.tree').appendChild(new FeSancOrgTree());
    this.feSancOrgTree.addEventListener('select', (e) => {
      // TODO 중복 사용자를 추가할 방법!
      if (e.detail.isSelected) {
        this.feParticipantlist.add(e.detail.dtnode);
      } else {
        this.feParticipantlist.delete(e.detail.dtnode);
      }
    });
    this.feSancOrgTree.addEventListener('lazy', (e) => {
      this.#matchTreeAndHox();
    });

    // 결재선 목록 생성
    this.feParticipantlist = this.shadowRoot.querySelector('.list').appendChild(new FeParticipantList());
    this.feParticipantlist.addEventListener('delete', (e) => {
      console.log('Event', e.type, e.target, e);
      let id = e.detail.id;
      this.feSancOrgTree.dynatree.dynatree('getRoot').tree.getNodeByKey(id)?._select(false, false);
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    if (this.active) {
      return;
    }

    this.hox = hox;
    this.#matchTreeAndHox();
    this.feParticipantlist.set(hox);

    this.active = true;
  }

  #matchTreeAndHox() {
    getNodes(this.hox, 'approvalFlow participant').forEach((participant) => {
      let id = getText(participant, 'ID');
      this.feSancOrgTree.dynatree.dynatree('getRoot').tree.getNodeByKey(id)?._select(true, false);
    });
  }
}

// Define the new element
customElements.define('fe-flow', FeFlow);
