/**
 * hox에 누락된 부분이 있는지 검사해서 채운다
 *
 * @param {XMLDocument} hox
 */
export default (hox) => {
  // docInfo publication openStartDate
  let publication = hox.querySelector('docInfo publication');
  let openStartDate = publication.querySelector('openStartDate');
  if (openStartDate === null) {
    openStartDate = hox.createElement('openStartDate');
    publication.append(openStartDate);
  }

  // content
  hox.querySelectorAll('docInfo content').forEach((content) => {
    // title
    let title = content.querySelector('title');
    if (title === null) {
      title = hox.createElement('title');
      content.insertAdjacentElement('afterbegin', title);
    }

    // receiptInfo / recipient
    let receiptInfo = content.querySelector('receiptInfo');
    let recipient = receiptInfo.querySelector('recipient');
    if (recipient === null) {
      recipient = hox.createElement('recipient');
      receiptInfo.insertAdjacentElement('afterbegin', recipient);
    }

    // pageCnt
    let pageCnt = content.querySelector('pageCnt');
    if (pageCnt === null) {
      pageCnt = hox.createElement('pageCnt');
      pageCnt.textContent = '0';
      content.insertAdjacentElement('beforeend', pageCnt);
    }
  });
};
