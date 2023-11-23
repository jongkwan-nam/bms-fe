const XXX = {
  user: [
    {
      // 결재
      type: 'user_approval',
      subType: [],
      resourceCode: ['@@st_first@@', '@@st_other@@', '@@st_current@@'],
    },
    {
      // 전결
      type: 'user_jeonkyul',
      subType: [],
      resourceCode: ['@@W3059@@'],
    },
    {
      // 대결
      type: 'user_daekyul',
      subType: [],
      resourceCode: ['@@st_user_daekyul@@'],
    },
    {
      // 협조
      type: 'user_agree_s',
      subType: [],
      resourceCode: ['@@st_user_agree_s@@'],
    },
    {
      // 병렬협조
      type: 'user_agree_p',
      subType: [],
      resourceCode: ['@@W2636@@'],
    },
    {
      // 확인
      type: 'user_nosign',
      subType: [],
      resourceCode: ['@@st_user_nosign@@'],
    },
    {
      // 참조
      type: 'user_refer',
      subType: [],
      resourceCode: ['@@W3086@@'],
    },
    {
      // 공석
      type: 'user_noapproval',
      subType: [],
      resourceCode: ['@@cmsg.1004@@'],
    },
  ],
  dept: [
    {
      // 부서순차협조
      type: 'dept_agree_s',
      subType: [],
      resourceCode: ['@@st_dept_agree_s@@'],
    },
    {
      // 부서병렬협조
      type: 'dept_agree_p',
      subType: [],
      resourceCode: ['@@st_dept_agree_p@@'],
    },
  ],
};

export const user = new Map([
  ['user_approval', { subType: [], resourceCode: ['@@st_first@@', '@@st_other@@', '@@st_current@@'] }],
  ['user_jeonkyul', { subType: [], resourceCode: ['@@W3059@@'] }],
  ['user_daekyul', { subType: [], resourceCode: ['@@st_user_daekyul@@'] }],
  ['user_agree_s', { subType: [], resourceCode: ['@@st_user_agree_s@@'] }],
  ['user_agree_p', { subType: [], resourceCode: ['@@W2636@@'] }],
  ['user_nosign', { subType: [], resourceCode: ['@@st_user_nosign@@'] }],
  ['user_refer', { subType: [], resourceCode: ['@@W3086@@'] }],
  ['user_noapproval', { subType: [], resourceCode: ['@@cmsg.1004@@'] }],
  ['user_hooyul', { subType: ['hooyul_sign', 'hooyul_nosign', 'hooyul_nossanc', 'jeonhooyul_nosign', 'jeonhooyul_sign', 'jeonhooyul_nosanc'], resourceCode: ['@@st_user_post_approval@@'] }],
]);

export const dept = new Map([
  ['dept_agree_s', { subType: [], resourceCode: ['@@st_dept_agree_s@@'] }],
  ['dept_agree_p', { subType: [], resourceCode: ['@@st_dept_agree_p@@'] }],
]);
