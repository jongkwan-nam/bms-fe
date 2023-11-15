import data from './FePublication.json';
import * as StringUtils from '../../utils/stringUtils';
import * as ArrayUtils from '../../utils/arrayUtils';
import * as DateUtils from '../../utils/dateUtils';

const MaxLength_publicRestricReason = 10;
const MaxLength_listPublicRestricReason = 10;

/**
 *
 */
export default class FePublication extends HTMLElement {
  constructor() {
    super();
    console.debug('FePublication init');
  }

  connectedCallback() {
    console.debug('FePublication connected');
    this.attachShadow({ mode: 'open' });

    const LINK = document.createElement('link');
    LINK.setAttribute('rel', 'stylesheet');
    LINK.setAttribute('href', './approvalBox.css');

    const wrapper = document.createElement('div');
    wrapper.classList.add('fe-publication');
    this.shadowRoot.append(LINK, wrapper);

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
        console.log('FePublication change', e.target.value);
        //
        this.hox.querySelector('docInfo publication').setAttribute('type', e.target.value);
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
        // 이벤트 전파. 특수기록물: 비밀기록물 체크 풀고, disabled 처리
        this.dispatchEvent(new CustomEvent('change', { detail: { pubtype: e.target.value } }));
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
      console.log(e.target.id, 'change', e.target.checked);
      // hox 반영
      let approvalFlag = this.hox.querySelector('docInfo approvalFlag').textContent;
      let flagArray = approvalFlag.split(' ').filter((flag) => StringUtils.isNotBlank(flag));

      ArrayUtils.toggle(flagArray, 'apprflag_open_body', e.target.checked);

      this.hox.querySelector('docInfo approvalFlag').textContent = flagArray.join(' ');
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
        this.hox.querySelector('docInfo publication publicationFlag').textContent = val;

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
          this.hox.querySelector('docInfo publication openStartDate').textContent = '1970-01-01T09:00:00';
        } else if (e.target.value === '1') {
          // '의사결정 또는 내부검토' 선택
          // 공개제한종료일 초기값
          if (StringUtils.isBlank(this.openstartdateValue)) {
            let d = new Date();
            d.setDate(d.getDate() + 90);
            this.openstartdateValue = DateUtils.format(d, 'yyyy-mm-dd');
          }
          //
          this.shadowRoot.querySelector('#openstartdate_permanent').dispatchEvent(new Event('change'));
        }
      });
    });

    // 공개제한종료일 date 선택 이벤트
    this.shadowRoot.querySelector('#openstartdate').addEventListener('change', (e) => {
      console.log('#openstartdate change', e.target.value);
      this.openstartdateValue = e.target.value;
      // hox 적용
      this.hox.querySelector('docInfo publication openStartDate').textContent = e.target.value + 'T00:00:00';
    });

    // 공개제한종료일 영구 checkbox 이벤트
    this.shadowRoot.querySelector('#openstartdate_permanent').addEventListener('change', (e) => {
      console.log('#openstartdate_permanent change', e.target.checked);
      //
      this.shadowRoot.querySelector('#openstartdate').readOnly = e.target.checked;
      if (e.target.checked) {
        // 영구 체크인 경우, 공개제한종료일 date 값 임시 기억 및 값 삭제
        this.openstartdateValue = this.shadowRoot.querySelector('#openstartdate').value;
        this.shadowRoot.querySelector('#openstartdate').value = null;
        // hox에 영구 날짜 설정
        this.hox.querySelector('docInfo publication openStartDate').textContent = '9999-12-31T09:00:00';
      } else {
        // 해제인 경우, 공개제한종료일 date에 기존 값 설정
        this.shadowRoot.querySelector('#openstartdate').value = this.openstartdateValue;
        this.shadowRoot.querySelector('#openstartdate').dispatchEvent(new Event('change'));
      }
    });

    // 공개제한부분표시 input 이벤트
    this.shadowRoot.querySelector('#publicRestric').addEventListener('change', (e) => {
      console.log('#publicRestric change', e.target.value);
      // hox 반영
      this.hox.querySelector('docInfo publication publicRestric').textContent = e.target.value;
    });

    // 공개제한부분표시 입력 제한 이벤트
    this.shadowRoot.querySelector('#publicRestric').addEventListener('keyup', (e) => {
      console.log('#publicRestric keyup', e.target.value);
      // 숫자 ',' '-' 필터링
      e.target.value = e.target.value.replace(/[^-,0-9]/g, '');
    });

    // 공개제한사유 입력 이벤트
    this.shadowRoot.querySelector('#publicRestricReason').addEventListener('change', (e) => {
      console.log('#publicRestricReason change', e.target.value);
      // hox 반영
      this.hox.querySelector('docInfo publication publicRestricReason').textContent = e.target.value;
    });

    // 공개제한사유 글자제한 이벤트
    this.shadowRoot.querySelector('#publicRestricReason').addEventListener('keyup', (e) => {
      console.log('#publicRestricReason keyup', e.target.value);
      // 제한 글자수를 넘지 않는지 체크
      e.target.value = StringUtils.cutByMaxBytes(e.target.value, MaxLength_publicRestricReason);
    });

    // 목록공개 라디오 선택 이벤트
    this.shadowRoot.querySelectorAll('[name="openlist"]').forEach((input) => {
      input.addEventListener('change', (e) => {
        console.log(e.target.id, 'change', e.target.value);
        // 비공개이면 상세 표시
        this.shadowRoot.querySelector('#listOpenDetail').classList.toggle('open', e.target.value === '1');
        // hox 반영
        let approvalFlag = this.hox.querySelector('docInfo approvalFlag').textContent;
        let flagArray = approvalFlag.split(' ').filter((flag) => StringUtils.isNotBlank(flag));

        // 공개이면 flag 추가
        ArrayUtils.toggle(flagArray, 'apprflag_open_list', e.target.value === '0');

        this.hox.querySelector('docInfo approvalFlag').textContent = flagArray.join(' ');
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
        console.log('#listPublicationFlag_ change', val);
        this.hox.querySelector('docInfo publication listPublicationFlag').textContent = val;
      });
    });

    // 목록공개 - 목록비공개사유 글자제한 이벤트
    this.shadowRoot.querySelector('#listPublicRestricReason').addEventListener('keyup', (e) => {
      console.log('#listPublicRestricReason keyup', e.target.value);
      // 제한 글자수를 넘지 않는지 체크
      e.target.value = StringUtils.cutByMaxBytes(e.target.value, MaxLength_listPublicRestricReason);
    });

    // 목록공개 - 목록비공개사유 입력 이벤트
    this.shadowRoot.querySelector('#listPublicRestricReason').addEventListener('change', (e) => {
      console.log('#listPublicRestricReason change', e.target.value);
      // hox 반영
      this.hox.querySelector('docInfo publication listPublicRestricReason').textContent = e.target.value;
    });
  }

  /**
   *
   * @param {XMLDocument} hox
   */
  set(hox) {
    this.hox = hox;

    // hox값으로, 화면에 값 설정

    // 공개여부
    let publicflag = this.hox.querySelector('docInfo publication').getAttribute('type');
    let input = this.shadowRoot.querySelector(`#publictype_${publicflag}`);
    input.checked = true;
    input.dispatchEvent(new Event('change'));

    // docInfo publication openStartDate 추가
    this.hox.querySelector('docInfo publication').appendChild(this.hox.createElement('openStartDate'));

    // 비공개사유 1~8호
    let publicationFlag = this.hox.querySelector('docInfo publication publicationFlag').textContent;
    publicationFlag
      .split(' ')
      .filter((flag) => StringUtils.isNotBlank(flag))
      .forEach((flag) => {
        this.shadowRoot.querySelector('#publicationFlag_' + flag).checked = true;

        // 비공개사유 5호 - 공개제한종료일
        if (flag === '5') {
          let openStartDate = this.hox.querySelector('docInfo publication openStartDate').textContent;
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
    let publicRestric = this.hox.querySelector('docInfo publication publicRestric').textContent;
    this.shadowRoot.querySelector('#publicRestric').value = publicRestric;

    // 공개제한사유
    let publicRestricReason = this.hox.querySelector('docInfo publication publicRestricReason').textContent;
    this.shadowRoot.querySelector('#publicRestricReason').value = publicRestricReason;

    // 목록공개여부
    let approvalFlag = this.hox.querySelector('docInfo approvalFlag').textContent;
    this.shadowRoot.querySelector(`#openlist_${approvalFlag.indexOf('apprflag_open_list') > -1 ? '0' : '1'}`).checked = true;

    // 목록비공개근거 1~8호
    let listPublicationFlag = this.hox.querySelector('docInfo publication listPublicationFlag').textContent;
    listPublicationFlag
      .split(' ')
      .filter((flag) => StringUtils.isNotBlank(flag))
      .forEach((flag) => {
        this.shadowRoot.querySelector('#listPublicationFlag_' + flag).checked = true;
      });

    // 목록비공개사유
    let listPublicRestricReason = this.hox.querySelector('docInfo publication listPublicRestricReason').textContent;
    this.shadowRoot.querySelector('#listPublicRestricReason').value = listPublicRestricReason;
  }
}

// Define the new element
customElements.define('fe-publication', FePublication);
