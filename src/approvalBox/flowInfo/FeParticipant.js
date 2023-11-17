import './FeParticipant.scss';

/**
 *
 */
export default class FeParticipant extends HTMLElement {
  constructor() {
    super();
    console.debug('FeParticipant init');

    console.debug('FeParticipant connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-participant');
    this.shadowRoot.append(LINK, wrapper);
  }

  /**
   *
   * @param {XMLElement} participant
   */
  set(participant) {
    this.participant = participant;

    this.shadowRoot.querySelector('.fe-participant').innerHTML = `
    <div>
      <select>
        <option>${this.participant.querySelector('displayApprovalType').textContent}</option>
      </select>
    </div>
    <div>
      ${this.participant.querySelector('department name').textContent}
      ${this.participant.querySelector('name').textContent}
      ${this.participant.querySelector('position').textContent}
    </div>
    <div>${GWWEBMessage[this.participant.querySelector('approvalStatus').textContent]}</div>
    `;

    this.participant.querySelector('name').textContent;
  }
}

// Define the new element
customElements.define('fe-participant', FeParticipant);
