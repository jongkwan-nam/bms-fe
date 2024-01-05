/**
 * 발송의뢰
 */
export default class SendRequestButton extends HTMLButtonElement {
  constructor() {
    super();
  }

  connectedCallback() {
    //
    this.innerText = GWWEBMessage.W4125;
    this.classList.add('btn', 'btn-primary');
    this.addEventListener('click', (e) => this.#doAction());
  }

  async #doAction() {
    /*
      copyDocAsXmlPromise
        IMPL_CopyDocAsXml
          HWP__CopyDocAsXml 에디터2의 내용을 HWPML2X 형식의 xml 로 읽기
      SendDoc.updateContentPromise 안별로 contentIndex, bodyHwpXml, title, enforceHox(docInfo content를 분리해 각각 가진)
      isMulti: Doc.setExamDraftDocCommon  hox의 content 내용 수정
      SendDoc.setExamEnforceDocPromise
        if(pInfo.isMultiDraft()) {
          SendDoc.setExamEnforceDoc();
        } else {
          Doc.setExamDraftDoc();
        }
      SendDoc.setPostExamEnforceDocPromise
      real_SendRequest

      발송의뢰: 통합서식=일괄기안. 기안서식 --> 시행문 변환 필요
        대내시행 -> 새 apprid로 문서 분리
        대외시행 -> 시행문으로 만듬
    */
  }
}

customElements.define('sendrequest-button', SendRequestButton, { extends: 'button' });
