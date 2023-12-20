import * as ArrayUtils from '../../utils/arrayUtils';
import * as DateUtils from '../../utils/dateUtils';
import { HoxEventType, dispatchHoxEvent, existsFlag, getAttr, getText, setAttr, setText, toggleFlag } from '../../utils/hoxUtils';
import * as StringUtils from '../../utils/stringUtils';
import FeApprovalBox from '../FeApprovalBox';
import data from './FePublication.json';
import './FePublication.scss';

const MaxLength_publicRestricReason = 10;
const MaxLength_listPublicRestricReason = 10;

/**
 *
 */
export default class FePublication extends FeApprovalBox {
  constructor() {
    super();
  }

  connectedCallback() {
    const wrapper = super.init();

    const publicTypes = [
      ['pubtype_open', 'publicflag_public'],
      ['pubtype_partial', 'publicflag_partial'],
      ['pubtype_not', 'publicflag_private'],
    ];

    const pubTypeWrap = wrapper.appendChild(document.createElement('div'));
    pubTypeWrap.id = 'pubtypeField';

    // 공개, 부분공개, 비공개
    for (let publicType of publicTypes) {
      let input = pubTypeWrap.appendChild(document.createElement('input'));
      input.type = 'radio';
      input.name = 'publictype';
      input.id = 'publictype_' + publicType[0];
      input.value = publicType[0];
      input.addEventListener('change', (e) => {
        console.debug('FePublication change', e.target.value);
        //
        setAttr(this.hox, 'docInfo publication', 'type', e.target.value);

        console.info('hoxEvent dispatch', HoxEventType.PUBLICATIONTYPE);
        dispatchHoxEvent(this.hox, 'docInfo publication', HoxEventType.PUBLICATIONTYPE, 'change', e.target.value);

        // 공개여부 값에 따라, UI 조정. open/close 등
        if (e.target.value === 'pubtype_open') {
          // 공개
          this.shadowRoot.querySelector('#privateField').classList.remove('open');
          this.shadowRoot.querySelector('#listOpenField').classList.remove('open');
        } else if (e.target.value === 'pubtype_partial') {
          // 부분공개
          this.shadowRoot.querySelector('#privateField').classList.add('open');
          this.shadowRoot.querySelector('#listOpenField').classList.remove('open');
        } else {
          // 비공개
          this.shadowRoot.querySelector('#privateField').classList.add('open');
          this.shadowRoot.querySelector('#listOpenField').classList.add('open');
        }
      });

      let label = pubTypeWrap.appendChild(document.createElement('label'));
      label.setAttribute('for', 'publictype_' + publicType[0]);
      label.innerHTML = GWWEBMessage[publicType[1]];
    }

    // 정보공개(원문)
    let input = pubTypeWrap.appendChild(document.createElement('input'));
    input.type = 'checkbox';
    input.id = 'openBody';
    input.addEventListener('change', (e) => {
      console.debug(e.target.id, 'change', e.target.checked);
      // hox 반영
      toggleFlag(this.hox, 'docInfo approvalFlag', 'apprflag_open_body', e.target.checked);
    });
    let label = pubTypeWrap.appendChild(document.createElement('label'));
    label.setAttribute('for', 'openBody');
    label.innerHTML = GWWEBMessage.cmsg_308;

    // 비공개사유, 공개제한부분표시, 공개제한사유, 목록공개여부, 목록비공개사유
    const subWrap = wrapper.appendChild(document.createElement('div'));
    subWrap.innerHTML = `
      <div id="privateField" class="hidden-field">
        <div class="sub-field">
          <label>비공개사유</label>
          <ol>
            ${data.publicationFlag
              .map((publication) => {
                let html = `<li>
                  <input type="checkbox" id="publicationFlag_${publication.no}" value="${publication.no}">
                  <label for="publicationFlag_${publication.no}" title="${publication.description}">${publication.no}호 ${publication.content}</label>`;
                if (publication.no === 5) {
                  html += `
                    <div id="publicationFlag5Detail" class="hidden-field">
                      <p><input type="radio" name="openstart" id="openstart_0" value="0"><label for="openstart_0">감사, 감독, 검사, 시험 등</label></p>
                      <p><input type="radio" name="openstart" id="openstart_1" value="1"><label for="openstart_1">의사결정 또는 내부검토</label></p>
                      <p id="openstartDetail" class="hidden-field">
                        <label for="openstartdate">공개제한종료일</label><input type="date" id="openstartdate">
                        <input type="checkbox" id="openstartdate_permanent"/><label for="openstartdate_permanent">영구</label>
                      </p>
                    </div>
                  `;
                }
                html += '</li>';
                return html;
              })
              .join('')}
          </ol>
        </div>
        <div class="sub-field">
          <label for="publicRestric">공개제한부분표시</label>
          <div>
            <input type="text" id="publicRestric" placeHolder="${GWWEBMessage.W1093}" />
          </div>
        </div>
        <div class="sub-field">
          <label for="publicRestricReason">공개제한사유</label>
          <div>
            <input type="text" id="publicRestricReason" />
          </div>
        </div>
      </div>
      <div id="listOpenField" class="hidden-field">
        <div class="sub-field">
          <label>목록공개여부</label>
          <div>
            <div>
              <input type="radio" name="openlist" id="openlist_0" value="0"><label for="openlist_0">목록공개</label>
              <input type="radio" name="openlist" id="openlist_1" value="1"><label for="openlist_1">목록비공개</label>
            </div>
            <div id="listOpenDetail" class="hidden-field">
              <div>
              ${Array.from({ length: 8 })
                .map((v, i) => `<input type="checkbox" id="listPublicationFlag_${i + 1}" value="${i + 1}"><label for="listPublicationFlag_${i + 1}">${i + 1}호</label>`)
                .join('')}
              </div>
              <div>
                <lebel for="listPublicRestricReason">목록비공개사유</lebel>
                <input type="text" id="listPublicRestricReason" placeholder="목록비공개사유"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 비공개사유 이벤트
    this.shadowRoot.querySelectorAll('[id^="publicationFlag_"]').forEach((input, key, parent) => {
      input.addEventListener('change', (e) => {
        // hox 적용
        let val = Array.from(parent)
          .filter((i) => i.checked)
          .map((i) => i.value)
          .join(' ');

        setText(this.hox, 'docInfo publication publicationFlag', val);

        // 5일때, 상세 표시
        if (e.target.value === '5') {
          this.shadowRoot.querySelector('#publicationFlag5Detail').classList.toggle('open', e.target.checked);
        }
      });
    });

    // 비공개사유 5호 상세 - 라디오 선택 이벤트
    this.shadowRoot.querySelectorAll('[name="openstart"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        // 선택값에 따른 상세 표시
        this.shadowRoot.querySelector('#openstartDetail').classList.toggle('open', e.target.value === '1');
        // 시, 공개제한종료일 초기값 설정
        if (e.target.value === '0') {
          // '감사,감독,검사, 시험 등' 선택
          setText(this.hox, 'docInfo publication openStartDate', '1970-01-01T09:00:00');
        } else if (e.target.value === '1') {
          // '의사결정 또는 내부검토' 선택
          // 공개제한종료일 초기값
          if (StringUtils.isBlank(this.openstartdateValue)) {
            let d = new Date();
            d.setDate(d.getDate() + 90);
            this.openstartdateValue = DateUtils.format(d, 'YYYY-MM-DD');
          }
          //
          this.shadowRoot.querySelector('#openstartdate_permanent').dispatchEvent(new Event('change'));
        }
      });
    });

    // 공개제한종료일 date 선택 이벤트
    this.shadowRoot.querySelector('#openstartdate').addEventListener('change', (e) => {
      console.debug('#openstartdate change', e.target.value);
      this.openstartdateValue = e.target.value;
      // hox 적용
      setText(this.hox, 'docInfo publication openStartDate', e.target.value + 'T00:00:00');
    });

    // 공개제한종료일 영구 checkbox 이벤트
    this.shadowRoot.querySelector('#openstartdate_permanent').addEventListener('change', (e) => {
      console.debug('#openstartdate_permanent change', e.target.checked);
      //
      this.shadowRoot.querySelector('#openstartdate').readOnly = e.target.checked;
      if (e.target.checked) {
        // 영구 체크인 경우, 공개제한종료일 date 값 임시 기억 및 값 삭제
        this.openstartdateValue = this.shadowRoot.querySelector('#openstartdate').value;
        this.shadowRoot.querySelector('#openstartdate').value = null;
        // hox에 영구 날짜 설정
        setText(this.hox, 'docInfo publication openStartDate', '9999-12-31T09:00:00');
      } else {
        // 해제인 경우, 공개제한종료일 date에 기존 값 설정
        this.shadowRoot.querySelector('#openstartdate').value = this.openstartdateValue;
        this.shadowRoot.querySelector('#openstartdate').dispatchEvent(new Event('change'));
      }
    });

    // 공개제한부분표시 input 이벤트
    this.shadowRoot.querySelector('#publicRestric').addEventListener('change', (e) => {
      console.debug('#publicRestric change', e.target.value);
      // hox 반영
      setText(this.hox, 'docInfo publication publicRestric', e.target.value);
    });

    // 공개제한부분표시 입력 제한 이벤트
    this.shadowRoot.querySelector('#publicRestric').addEventListener('keyup', (e) => {
      console.debug('#publicRestric keyup', e.target.value);
      // 숫자 ',' '-' 필터링
      e.target.value = e.target.value.replace(/[^-,0-9]/g, '');
    });

    // 공개제한사유 입력 이벤트
    this.shadowRoot.querySelector('#publicRestricReason').addEventListener('change', (e) => {
      console.debug('#publicRestricReason change', e.target.value);
      // hox 반영
      setText(this.hox, 'docInfo publication publicRestricReason', e.target.value);
    });

    // 공개제한사유 글자제한 이벤트
    this.shadowRoot.querySelector('#publicRestricReason').addEventListener('keyup', (e) => {
      console.debug('#publicRestricReason keyup', e.target.value);
      // 제한 글자수를 넘지 않는지 체크
      e.target.value = StringUtils.cutByMaxBytes(e.target.value, MaxLength_publicRestricReason);
    });

    // 목록공개 라디오 선택 이벤트
    this.shadowRoot.querySelectorAll('[name="openlist"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        console.debug(e.target.id, 'change', e.target.value);
        // 비공개이면 상세 표시
        this.shadowRoot.querySelector('#listOpenDetail').classList.toggle('open', e.target.value === '1');
        // hox 반영
        toggleFlag(this.hox, 'docInfo approvalFlag', 'apprflag_open_list', e.target.value === '0');
      });
    });

    // 목록공개 - 비공개 1 ~ 8호 이벤트
    this.shadowRoot.querySelectorAll('[id^="listPublicationFlag_"]').forEach((input, key, parent) => {
      input.addEventListener('change', (e) => {
        // hox 적용
        let val = Array.from(parent)
          .filter((i) => i.checked)
          .map((i) => i.value)
          .join(' ');
        console.debug('#listPublicationFlag_ change', val);
        setText(this.hox, 'docInfo publication listPublicationFlag', val);
      });
    });

    // 목록공개 - 목록비공개사유 글자제한 이벤트
    this.shadowRoot.querySelector('#listPublicRestricReason').addEventListener('keyup', (e) => {
      console.debug('#listPublicRestricReason keyup', e.target.value);
      // 제한 글자수를 넘지 않는지 체크
      e.target.value = StringUtils.cutByMaxBytes(e.target.value, MaxLength_listPublicRestricReason);
    });

    // 목록공개 - 목록비공개사유 입력 이벤트
    this.shadowRoot.querySelector('#listPublicRestricReason').addEventListener('change', (e) => {
      console.debug('#listPublicRestricReason change', e.target.value);
      // hox 반영
      setText(this.hox, 'docInfo publication listPublicRestricReason', e.target.value);
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    super.setHox(hox);

    // hox값으로, 화면에 값 설정

    // 공개여부
    let publicflag = getAttr(this.hox, 'docInfo publication', 'type');
    let input = this.shadowRoot.querySelector(`#publictype_${publicflag}`);
    input.checked = true;

    // 비공개사유 1~8호
    let publicationFlag = getText(this.hox, 'docInfo publication publicationFlag');
    ArrayUtils.split(publicationFlag).forEach((flag) => {
      this.shadowRoot.querySelector('#publicationFlag_' + flag).checked = true;

      // 비공개사유 5호 - 공개제한종료일
      if (flag === '5') {
        let openStartDate = getText(this.hox, 'docInfo publication openStartDate');
        if (StringUtils.isBlank(openStartDate)) {
          this.shadowRoot.querySelector('#openstart_0').checked = true;
          this.shadowRoot.querySelector('#openstartdate').textContent = null;
          this.shadowRoot.querySelector('#openstartdate_permanent').checked = false;
        } else if (openStartDate === '9999-12-31T09:00:00') {
          this.shadowRoot.querySelector('#openstart_1').checked = true;
          this.shadowRoot.querySelector('#openstartdate').textContent = null;
          this.shadowRoot.querySelector('#openstartdate_permanent').checked = true;
        } else {
          this.shadowRoot.querySelector('#openstart_1').checked = true;
          this.shadowRoot.querySelector('#openstartdate').value = openStartDate;
          this.shadowRoot.querySelector('#openstartdate_permanent').checked = false;
        }
      }
    });

    // 공개제한부분표시
    this.shadowRoot.querySelector('#publicRestric').value = getText(this.hox, 'docInfo publication publicRestric');

    // 공개제한사유
    this.shadowRoot.querySelector('#publicRestricReason').value = getText(this.hox, 'docInfo publication publicRestricReason');

    // 목록공개여부
    this.shadowRoot.querySelector(`#openlist_${existsFlag(this.hox, 'docInfo approvalFlag', 'apprflag_open_list') ? '0' : '1'}`).checked = true;

    // 목록비공개근거 1~8호
    let listPublicationFlag = getText(this.hox, 'docInfo publication listPublicationFlag');
    ArrayUtils.split(listPublicationFlag).forEach((flag) => {
      this.shadowRoot.querySelector('#listPublicationFlag_' + flag).checked = true;
    });

    // 목록비공개사유
    this.shadowRoot.querySelector('#listPublicRestricReason').value = getText(this.hox, 'docInfo publication listPublicRestricReason');
  }

  changeContentNumberCallback() {
    this.shadowRoot.querySelectorAll('input').forEach((input) => (input.disabled = this.contentNumber > 1));
  }
}

// Define the new element
customElements.define('fe-publication', FePublication);
