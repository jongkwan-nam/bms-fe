export default async (trid) => {
  let res = await fetch('/bms/com/hs/gwweb/appr/retrieveSancLineXmlInfoByTrid.act?TRID=' + trid);
  let xmlText = await res.text();

  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  console.debug(xmlDoc);

  // hox 정상인지 체크
  if (xmlDoc.querySelector('docInfo title') === null) {
    throw new Error('hox is not valid');
  }

  return xmlDoc;
};
