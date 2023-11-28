import { getText } from '../../utils/hoxUtils';
import ATO from '../flowInfo/ApprovalTypeOptions';
import FeParticipant from './FeParticipant';

/**
 *
 * @param {XMLDocument} hox
 * @param {array} feParticipantNodeList
 * @param {object} detail 이벤트 디테일
 */
export const decideApprovalType = (hox, feParticipantNodeList, detail) => {
  // 기안자
  let drafterId = getText(hox, 'docInfo drafter ID');

  // 최종 결재자 인덱스 구하기
  let indexLastUser = getLastIndexByApprovalType(feParticipantNodeList, 0, 'user_approval', 'user_jeonkyul', 'user_daekyul');

  console.log(` ****************************************************************

      decideApprovalType.  indexLastUser: ${indexLastUser}
    `);

  if (detail === null) {
    // 기본 결재선 설정
    console.log(`
      기본 결재선 설정
    `);

    let isSetJeonkyul = false;
    let isSetDaekyul = false;

    for (let i = 0; i < feParticipantNodeList.length; i++) {
      let feParticipant = feParticipantNodeList[i];

      feParticipant.setIndex(i);

      let isFirst = i === 0 && feParticipant.id === drafterId;
      let isMiddle = !isFirst && indexLastUser > i;
      let isLast = indexLastUser === i;

      let type = feParticipant.approvalType;
      let subType = feParticipant.approvalSubType;

      console.log(i, `type=${type}, subType=${subType}`, 'isFirst:', isFirst, 'isMiddle:', isMiddle, 'isLast:', isLast);

      if (feParticipant.type === 'dept') {
        // 부서는 [순차협조, 병렬협조]
        feParticipant.setApprovalTypes([ATO.DEPT_HYEOBJO_S, ATO.DEPT_HYEOBJO_P]);
      } else {
        // 사용자
        // 전결, 대결, 후열, 전후열 먼저 고려

        if (type === 'user_jeonkyul') {
          // 전결
          isSetJeonkyul = true;
          if (isFirst) {
            feParticipant.setApprovalTypes([ATO.GIAN, ATO.JEONKYUL, ATO.HWAGIN]);
          } else if (isMiddle) {
            feParticipant.setApprovalTypes([ATO.GEOMTO, ATO.JEONKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM]);
          } else {
            feParticipant.setApprovalTypes([ATO.KYULJAE, ATO.JEONKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM]);
          }
        } else if (type === 'user_daekyul') {
          // 대결
          isSetDaekyul = true;
          if (isFirst) {
            feParticipant.setApprovalTypes([ATO.GIAN, ATO.JEONKYUL, ATO.DAEKYUL, ATO.HWAGIN]);
          } else if (isMiddle) {
            feParticipant.setApprovalTypes([ATO.GEOMTO, ATO.JEONKYUL, ATO.DAEKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM]);
          } else {
            feParticipant.setApprovalTypes([ATO.KYULJAE, ATO.JEONKYUL, ATO.DAEKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM]);
          }
        } else if (type === 'user_hooyul' && subType === 'hooyul_nosign') {
          // 후열
          feParticipant.setApprovalTypes([ATO.HUYEOL, ATO.HUKYUL, ATO.HUYEOL_ANHAM]);
        } else if (type === 'user_hooyul' && subType === 'hooyul_sign') {
          // 후결
          feParticipant.setApprovalTypes([ATO.HUYEOL, ATO.HUKYUL, ATO.HUYEOL_ANHAM]);
        } else if (type === 'user_noapproval' && subType === 'hooyul_nosanc') {
          // 후열안함
          feParticipant.setApprovalTypes([ATO.HUYEOL, ATO.HUKYUL, ATO.HUYEOL_ANHAM]);
        } else if (type === 'user_hooyul' && subType === 'jeonhooyul_nosign') {
          // 전결(후열)
          feParticipant.setApprovalTypes([ATO.JEONKYUL_HUYEOL, ATO.JEONKYUL_HUKYUL, ATO.JEONKYUL_HUYEOL_ANHAM]);
        } else if (type === 'user_hooyul' && subType === 'jeonhooyul_sign') {
          // 전결(후결)
          feParticipant.setApprovalTypes([ATO.JEONKYUL_HUYEOL, ATO.JEONKYUL_HUKYUL, ATO.JEONKYUL_HUYEOL_ANHAM]);
        } else if (type === 'user_jeonhoo' && subType === 'jeonhooyul_nosanc') {
          // 전결(후열안함)
          feParticipant.setApprovalTypes([ATO.JEONKYUL_HUYEOL, ATO.JEONKYUL_HUKYUL, ATO.JEONKYUL_HUYEOL_ANHAM]);
        } else {
          // 그외
          if (isSetDaekyul) {
            // 대결 이후에 설정가는 한
            feParticipant.setApprovalTypes([ATO.REFER, ATO.KYULJAE_ANHAM, ATO.HYEOBJO_S, ATO.HYEOBJO_P]);
          } else if (isSetJeonkyul) {
            // 전결 이후에 설정 가능한
            feParticipant.setApprovalTypes([ATO.REFER, ATO.KYULJAE_ANHAM, ATO.HYEOBJO_S, ATO.HYEOBJO_P]);
          } else {
            if (isFirst) {
              // 첫번째 + 기안자이면 = [기안, 전결, 확인]
              feParticipant.setApprovalTypes([ATO.GIAN, ATO.JEONKYUL, ATO.HWAGIN]);
            } else if (isMiddle) {
              // 중간결재 = [검토, 전결, 협조, 병렬협조, 확인, 참조, 결재안함]
              feParticipant.setApprovalTypes([ATO.GEOMTO, ATO.JEONKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM]);
            } else {
              // 최종결재 = [결재, 전결, 협조, 병렬협조, 확인, 참조, 결재안함]
              feParticipant.setApprovalTypes([ATO.KYULJAE, ATO.JEONKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM]);
            }
          }
        }
      }
    }
  }

  // (Event)
  // 전결이 설정 또는 해제됬을때
  //  - 전결 설정시 그 후 [검토, 결재] 결재선: [결재안함, 협조, 병렬협조, 참조]
  //  - 전결 해제시 그 후 [결재안함] 결재선: 기본 결재선으로
  if (detail !== null) {
    let isSetJeonkyul = false; // 전결이 설정되었는지
    let isUnsetJeonkyul = false; // 전결이 해제되었는지
    let indexJeonkyul = -1; // 전결의 인덱스

    // 변경 원인
    if (detail.next.type === 'user_jeonkyul') {
      // 전결을 선택
      isSetJeonkyul = true;
      indexJeonkyul = detail.index;
    } else if (detail.curr.type === 'user_jeonkyul') {
      // 전결에서 다른걸 선텍. 전결 해제
      isUnsetJeonkyul = true;
      indexJeonkyul = detail.index;
    }

    if (isSetJeonkyul || isUnsetJeonkyul) {
      console.log(`Event
        전결이 설정 또는 해제됬을때
          isSetJeonkyul   = ${isSetJeonkyul}
          isUnsetJeonkyul = ${isUnsetJeonkyul}
          indexJeonkyul   = ${indexJeonkyul}
      `);

      if (isSetJeonkyul) {
        if (indexJeonkyul === 0) {
          //
          let feParticipant = feParticipantNodeList[0];
          feParticipant.setApprovalTypes([ATO.GIAN, ATO.JEONKYUL, ATO.HWAGIN]);
        }
        for (let i = indexJeonkyul + 1; i < feParticipantNodeList.length; i++) {
          let feParticipant = feParticipantNodeList[i];
          if (['user_approval', 'user_jeonkyul'].includes(feParticipant.approvalType)) {
            feParticipant.setApprovalTypes([ATO.REFER, ATO.KYULJAE_ANHAM, ATO.HYEOBJO_S, ATO.HYEOBJO_P], 1);
          }
        }
      } else if (isUnsetJeonkyul) {
        let lastIndex = getLastIndexByApprovalType(feParticipantNodeList, indexJeonkyul, 'user_noapproval');
        for (let i = indexJeonkyul; i < feParticipantNodeList.length; i++) {
          let feParticipant = feParticipantNodeList[i];
          if (['user_approval', 'user_noapproval'].includes(feParticipant.approvalType)) {
            if (i === 0 && feParticipant.id === drafterId) {
              feParticipant.setApprovalTypes([ATO.GIAN, ATO.JEONKYUL, ATO.HWAGIN], 0);
            } else if (lastIndex === i) {
              feParticipant.setApprovalTypes([ATO.KYULJAE, ATO.JEONKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM], 0);
            } else {
              feParticipant.setApprovalTypes([ATO.GEOMTO, ATO.JEONKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM], 0);
            }
          }
        }
      }
    }
  }

  // 대결이 가능하면, 옵션에 추가
  //  - 대결가능 조건: 최종 결재가 [결재, 전결]일때 그 직전 결재선
  let isCanDaekyul = false; // 대결 선택 조건이 되는지. lastUserIndex - 1 이 사용자이면 가능
  let indexDaekyul = -1; // 대결을 선택할수 있는 결재자 인덱스

  indexLastUser = getLastIndexByApprovalType(feParticipantNodeList, 0, 'user_approval', 'user_jeonkyul');
  if (indexLastUser > 0) {
    let prevFeParticipant = feParticipantNodeList[indexLastUser - 1];
    if (prevFeParticipant.approvalType === 'user_approval') {
      isCanDaekyul = true;
      indexDaekyul = indexLastUser - 1;
    }
  }

  console.log(`
    대결이 가능하면, 옵션에 추가
      isCanDaekyul = ${isCanDaekyul}
      indexDaekyul = ${indexDaekyul}
  `);

  if (isCanDaekyul) {
    let prevFeParticipant = feParticipantNodeList[indexDaekyul];
    if (indexDaekyul === 0 && prevFeParticipant.id === drafterId) {
      prevFeParticipant.setApprovalTypes([ATO.GIAN, ATO.JEONKYUL, ATO.DAEKYUL, ATO.HWAGIN]);
    } else {
      prevFeParticipant.setApprovalTypes([ATO.GEOMTO, ATO.JEONKYUL, ATO.DAEKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM]);
    }
  }

  // (Event)
  // 대결이 설정됬을때
  //  - 대결 다음이 [결재]: [후열, 후결, 후열안함]
  //  - 대결 다음이 [전결]: [전결(후열), 전결(후결), 전결(후열안함)]
  // 대결이 해제됬을때
  //  - 다음을 최종 결재 타입으로

  let isSetDaekyul = false; // 대결이 설정되었는지
  let isUnsetDaekyul = false; // 대결이 해제되었는지
  indexDaekyul = -1;

  if (detail !== null) {
    if (detail.next.type === 'user_daekyul') {
      isSetDaekyul = true;
      indexDaekyul = detail.index;
    } else if (detail.curr.type === 'user_daekyul') {
      isUnsetDaekyul = true;
      indexDaekyul = detail.index;
    }

    if (isSetDaekyul || isUnsetDaekyul) {
      console.log(`Event
        대결이 설정 또는 해제됬을때
          isSetDaekyul   = ${isSetDaekyul}
          isUnsetDaekyul = ${isUnsetDaekyul}
          indexDaekyul   = ${indexDaekyul}
      `);

      if (isSetDaekyul) {
        let currFeParticipant = feParticipantNodeList[indexDaekyul];
        if (indexDaekyul === 0 && currFeParticipant.id === drafterId) {
          currFeParticipant.setApprovalTypes([ATO.GIAN, ATO.JEONKYUL, ATO.DAEKYUL, ATO.HWAGIN], 2);
        } else {
          currFeParticipant.setApprovalTypes([ATO.GEOMTO, ATO.JEONKYUL, ATO.DAEKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM], 2);
        }

        let nextFeParticipant = feParticipantNodeList[indexDaekyul + 1];
        if (nextFeParticipant.approvalType === 'user_approval') {
          nextFeParticipant.setApprovalTypes([ATO.HUYEOL, ATO.HUKYUL, ATO.HUYEOL_ANHAM]);
        } else if (nextFeParticipant.approvalType === 'user_jeonkyul') {
          nextFeParticipant.setApprovalTypes([ATO.JEONKYUL_HUYEOL, ATO.JEONKYUL_HUKYUL, ATO.JEONKYUL_HUYEOL_ANHAM]);
        }
      } else if (isUnsetDaekyul) {
        indexLastUser = getLastIndexByApprovalType(feParticipantNodeList, 0, 'user_approval', 'user_noapproval', 'user_hooyul', 'user_jeonhoo');
        for (let i = indexDaekyul + 1; i < feParticipantNodeList.length; i++) {
          let feParticipant = feParticipantNodeList[i];
          if (['user_approval', 'user_noapproval', 'user_hooyul', 'user_jeonhoo'].includes(feParticipant.approvalType)) {
            if (i === 0 && feParticipant.id === drafterId) {
              feParticipant.setApprovalTypes([ATO.GIAN, ATO.JEONKYUL, ATO.HWAGIN], 0);
            } else if (indexLastUser === i) {
              feParticipant.setApprovalTypes([ATO.KYULJAE, ATO.JEONKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM], 0);
            } else {
              feParticipant.setApprovalTypes([ATO.GEOMTO, ATO.JEONKYUL, ATO.HYEOBJO_S, ATO.HYEOBJO_P, ATO.HWAGIN, ATO.REFER, ATO.KYULJAE_ANHAM], 0);
            }
          }
        }
      }
    }
  }
};

/**
 *
 * @param {FeParticipant[]} feParticipantNodeList
 * @param {number} i
 * @param  {...string} approvalTypes
 * @returns
 */
function getLastIndexByApprovalType(feParticipantNodeList, i, ...approvalTypes) {
  let lastIndex = -1;
  for (; i < feParticipantNodeList.length; i++) {
    let feParticipant = feParticipantNodeList[i];
    if (approvalTypes.includes(feParticipant.approvalType)) {
      lastIndex = i;
    }
  }
  return lastIndex;
}
