/**
 * 已经执行content脚本的tab
*/
const tabIds = new Set();
const ROOT_SCRIPT = {
  ID: 'root-conetnt-script',
  JS_NAME: 'content.js',
  PATH: 'content/content.js',
}

chrome.scripting.getRegisteredContentScripts({ ids: [ROOT_SCRIPT.ID] }, async (scripts) => {
  console.log('scripts', scripts);
  if (scripts?.length) {
    await chrome.scripting.unregisterContentScripts({
      ids: [ROOT_SCRIPT.ID],
    });
  }
  console.log(ROOT_SCRIPT);
  await chrome.scripting.registerContentScripts([{
    id: ROOT_SCRIPT.ID,
    js: [ROOT_SCRIPT.PATH],
    matches: ['<all_urls>'],
    runAt: 'document_start',
    allFrames: true,
  }]).then(res => {
    console.log('res', res);
  }).catch(err => {
    console.log('err', err);
  });
});

// chrome.action.onClicked.addListener((tab: any) => {
//   console.log('chrome.action.onClick', tab);
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     sendDataToTabContentJS(tabs[0], 'click');
//   });
// });

chrome.tabs.onRemoved.addListener(function (tabId: number | undefined) {
  console.log('chrome.tabs.onRemoved');
  tabIds.delete(tabId);
});

// function sendDataToTabContentJS(tab: chrome.tabs.Tab, data: any) {
//   const tabId = tab.id;
//   if (!tabId) return;
//   if (tabIds.has(tabId)) {
//     chrome.tabs.sendMessage(tabId, data);
//     return;
//   }
//   chrome.scripting.executeScript({
//     target: { tabId, allFrames: true},
//     files: [ROOT_SCRIPT.JS_NAME],
//   }).then(() => {
//     chrome.tabs.sendMessage(tabId, data);
//   })
// }

chrome.runtime.onMessage.addListener((msg: any): any => {
  console.log('service-worker接收到信息：', msg);
  if ('contentScriptLoaded' in msg) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      tabIds.add(tabs[0]?.id);
    });
  }
})
