import { HANDYDEF } from './handydefini';

/**
 * ini 파일 내용을 json 객체로 변환
 * @param {string} iniText
 * @returns
 */
function parseIniToJson(iniText) {
  const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;.*$/,
  };
  /**
   * 문자를 boolean, number 로 변환
   * @param {string} value
   */
  const parseValue = (value) => {
    if (value.toLocaleLowerCase() === 'true') return true;
    if (value.toLocaleLowerCase() === 'false') return false;
    if (value.startsWith('0')) return value;
    if (/^[0-9]*$/.test(value)) return parseInt(value);
    return value;
  };

  let section = null;
  return iniText
    .split(/[\r\n]+/)
    .filter((line) => !regex.comment.test(line))
    .reduce((json, line) => {
      if (regex.param.test(line)) {
        const matched = line.match(regex.param);
        if (section) {
          json[section][matched[1]] = parseValue(matched[2]);
        } else {
          json[matched[1]] = parseValue(matched[2]);
        }
      } else if (regex.section.test(line)) {
        const matched = line.match(regex.section);
        json[matched[1]] = {};
        section = matched[1];
      } else if (line.length === 0 && section) {
        section = null;
      }
      return json;
    }, {});
}

// Merge a `source` object to a `target` recursively
const merge = (target, source) => {
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (let key of Object.keys(source)) {
    if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]));
  }

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
};

const testdata = `
[Sanction]
AddRejectCommentOnKyul = true                
AddPostponeCommentOnKyul=false
bUseLastSignerHyupjoType=true
AuditTab.Signer.Auto.Insert=true
XXXXXXXX=YYYYYYYYYYYYYYYYYYYYYYYYYYYYY

[LDAP]
;driver=servercache
HostIP=ldap.gcc.go.kr
HostPort=389
[LinkDoc]
URL=bms/com/hs/gwweb/list/retrieveRelationDocMainList.act
URLParam=APPLID=8010&applId=8010&APPLTYPE=3&USS=1&userId=%USU%&deptId=%DEPTID%&userDeptId=%DEPTID%&K=%KEY%&folderEndYear=%YEAR%
View.URL=bms/com/hs/appr/retrieveNotifyDoc.act
View.URLParam=USERID=%USU%&APPRIDLIST=%APPRID%&APPRIDXID=%APPRID%&CLTAPP=1&APPRDEPTID=%DEPTID%&APPRSTATUSLIST=1&APPRTYPELIST=1&MENUMASKLIST=%MENUMASK%&SIGNERTYPELIST=&WORDTYPE=%WORDTYPE%&APPLID=8010&PARTICIPANTID=&EXTERNALDOCF=0&EXTERNALDOCFLIST=0&DRAFTSRCLIST=0&menuID=undefined&K=%KEY%&fldrShare=%FLDRSHARE%&fldrShareDeptId=%FLDRSHAREDEPTID%
DlgOption=dialogwidth:1050;dialogheight:784;

`;

// var javascript_ini = parseIniToJson(data);
// console.log(javascript_ini);
// console.log(javascript_ini.LinkDoc.URL);
// console.log(javascript_ini.LinkDoc['View.URL']);

export const getHandydef = async () => {
  const url = `${PROJECT_CODE}/resources/handydef.ini`;
  const serverHandydef = await fetch(url, { cache: 'no-cache' })
    .then((res) => {
      if (res.status !== 200) {
        console.warn(url + ' file does not exist on the server. default handydef settings apply');
        return '';
      }
      return res.text();
    })
    .catch((reason) => {
      console.warn(reason);
      return '';
    });

  if (HANDYDEF.System['Clipboard.OpenRetryCount']) {
    //
  }

  return merge(HANDYDEF, parseIniToJson(serverHandydef));
};
