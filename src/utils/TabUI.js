import './TabUI.scss';

/*
 * 탭 UI 처리
 */

/**
 * 탭 초기화및 선택 이벤트 리스너 설정
 * @param {ShadowRoot | Document} root
 * @param {function} listener 타겟 panel이 Element로 전달된다
 */
export const init = (root, listener) => {
  //
  const activateTab = (selectedTab, tabList) => {
    console.log('activateTab', selectedTab);
    tabList.forEach((tab) => {
      //
      const targetId = tab.getAttribute('target');
      const targetPanel = root.querySelector(targetId);
      console.debug('tab', selectedTab === tab, tab, targetPanel);

      if (tab === selectedTab) {
        tab.setAttribute('active', true);
        targetPanel.setAttribute('active', true);

        listener(targetPanel);
      } else {
        tab.removeAttribute('active');
        targetPanel.removeAttribute('active');
      }
    });
  };

  root.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    //
    const tabList = tablist.querySelectorAll('[role="tab"]');
    console.debug('tabNodeList', tabList);
    tabList.forEach((tab) => {
      //
      const target = tab.getAttribute('target');
      const active = tab.hasAttribute('active');
      const targetPanel = root.querySelector(target);
      console.debug('tab', tab, targetPanel, active);

      if (active) {
        activateTab(tab, tabList);
      }

      tab.addEventListener('click', (e) => {
        if (!e.target.disabled) {
          activateTab(tab, tabList);
        }
      });
    });
  });
};

/**
 * 탭 활성/비활성
 * @param {ShadowRoot | Document} root
 * @param {number} nth 탭 순번. (1부터)
 * @param {*} force 활성/비활성 여부
 */
export const active = (root, nth, force) => {
  console.debug('Tab active', nth, force);
  const tab = root.querySelectorAll('[role="tab"]')[nth - 1];
  tab.disabled = !force;
  const panel = root.querySelectorAll('[role="tabpanel"]')[nth - 1];
  panel.classList.toggle('disabled', !force);
};

/**
 * 탭 선택
 * @param {ShadowRoot | Document} root
 * @param {*} nth 탭 순번. (1부터)
 */
export const select = (root, nth) => {
  console.debug('Tab select', nth);
  root.querySelectorAll('[role="tab"]')[nth - 1].click();
};
