export default {
  /* 기안 */
  GIAN: { text: '기안', type: 'user_approval', subType: '', resourceCode: 'st_first' },
  /* 상신 */
  SANGSIN: { text: '상신', type: 'user_draft', subType: '', resourceCode: 'st_user_draft' }, // 1번 기안자가 없을때
  /* 접수 */
  JEOBSU: { text: '접수', type: 'user_draft', subType: 'draft_recdept', resourceCode: 'sanction_receipt' }, // 1번 접수자가 없을때
  /* 검토 */
  GEOMTO: { text: '검토', type: 'user_approval', subType: '', resourceCode: 'st_other' },
  /* 결재 */
  KYULJAE: { text: '결재', type: 'user_approval', subType: '', resourceCode: 'st_current' },
  /* 전결 */
  JEONKYUL: { text: '전결', type: 'user_jeonkyul', subType: '', resourceCode: 'st_user_jeonkyul' },
  /* 대결 */
  DAEKYUL: { text: '대결', type: 'user_daekyul', subType: '', resourceCode: 'st_user_daekyul' },
  /* 순차협조 */
  HYEOBJO_S: { text: '순차협조', type: 'user_agree_s', subType: '', resourceCode: 'st_user_agree_s' },
  /* 병렬협조 */
  HYEOBJO_P: { text: '병렬협조', type: 'user_agree_p', subType: '', resourceCode: 'st_user_agree_p' },
  /* 확인 */
  HWAGIN: { text: '확인', type: 'user_nosign', subType: '', resourceCode: 'st_user_nosign' },
  /* 참조 */
  REFER: { text: '참조', type: 'user_refer', subType: '', resourceCode: 'st_user_refer' },
  /* 공석 */
  GONGSEOG: { text: '공석', type: 'user_noapproval', subType: '', resourceCode: 'cmsg_1004' },
  /* 결재안함 */
  KYULJAE_ANHAM: { text: '결재안함', type: 'user_noapproval', subType: '', resourceCode: 'st_user_noapproval' },
  /* 후열 */
  HUYEOL: { text: '후열', type: 'user_hooyul', subType: 'hooyul_nosign', resourceCode: 'st_user_hooyul' },
  /* 후결 */
  HUKYUL: { text: '후결', type: 'user_hooyul', subType: 'hooyul_sign', resourceCode: 'st_user_post_approval' },
  /** 후열안함 */
  HUYEOL_ANHAM: { text: '후열안함', type: 'user_noapproval', subType: 'hooyul_nosanc', resourceCode: 'hsappr_0231' },

  /** 전결(후열) */
  JEONKYUL_HUYEOL: { text: '전결(후열)', type: 'user_hooyul', subType: 'jeonhooyul_nosign', resourceCode: 'st_jeonhooyul_nosign' },
  /** 전결(후결) */
  JEONKYUL_HUKYUL: { text: '전결(후결)', type: 'user_hooyul', subType: 'jeonhooyul_sign', resourceCode: 'st_jeonhooyul_sign' },
  /** 전결(후열안함) */
  JEONKYUL_HUYEOL_ANHAM: { text: '전결(후열안함)', type: 'user_jeonhoo', subType: 'jeonhooyul_nosanc', resourceCode: 'st_jeonhooyul_nosanc' },

  /* 부서순차협조 */
  DEPT_HYEOBJO_S: { text: '부서순차협조', type: 'dept_agree_s', subType: '', resourceCode: 'st_dept_agree_s' },
  /* 부서병렬협조 */
  DEPT_HYEOBJO_P: { text: '부서병렬협조', type: 'dept_agree_p', subType: '', resourceCode: 'st_dept_agree_p' },
};
