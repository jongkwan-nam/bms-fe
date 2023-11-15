/**
 * 탭 UI 처리
 *
 */

document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
  //
  const tabList = tablist.querySelectorAll('[role="tab"]');
  console.debug('tabNodeList', tabList);
  tabList.forEach((tab) => {
    //
    const target = tab.getAttribute('target');
    const active = tab.hasAttribute('active');
    const targetPanel = document.querySelector(target);
    console.debug('tab', tab, targetPanel, active);

    if (active) {
      activateTab(tab, tabList);
    }

    tab.addEventListener('click', () => {
      activateTab(tab, tabList);
    });
  });
});

function activateTab(selectedTab, tabList) {
  console.log('activateTab', selectedTab);
  tabList.forEach((tab) => {
    //
    const target = tab.getAttribute('target');
    const targetPanel = document.querySelector(target);
    console.debug('tab', selectedTab === tab, tab, targetPanel);

    if (tab === selectedTab) {
      tab.setAttribute('active', true);
      targetPanel.setAttribute('active', true);
      targetPanel.dispatchEvent(new Event('active'));
    } else {
      tab.removeAttribute('active');
      targetPanel.removeAttribute('active');
    }
  });
}
