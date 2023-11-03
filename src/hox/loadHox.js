export default async (trid) => {
  let res = await fetch('/bms/com/hs/gwweb/appr/retrieveSancLineXmlInfoByTrid.act?TRID=' + trid);
  let xmlText = await res.text();

  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  console.log(xmlDoc);

  return xmlDoc;
};
