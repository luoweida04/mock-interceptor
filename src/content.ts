enum EMsgType {
  MockInterceptor = 'MockInterceptor',
}

enum EMsgTo {
  MockInterceptor = 'MockInterceptor',
  Content = 'Content',
  Background = 'Background',
  Client = 'Client',
}

interface IBaseMsg {
  type: EMsgType,
  to: EMsgTo,
}

/**
 * 具体定义见types，content引入其他文件会报错
*/
interface IMockInterceptorMsg extends IBaseMsg {
  isActive: boolean,
  groups: any,
  groupsActive: any,
}

/**
 * chrome local keys
*/
enum INTERCEPTOR {
  /**
   * 是否启用拦截器
  */
  IS_ACTIVE = 'mockInterceptorActive',
  /**
   * 是否启用组
  */
  GROUPS_ACTIVE = 'groupsActive',
  /**
   * 拦截器规则
  */
  RULES = 'mockRules',
}

const init = () => {
  chrome.storage.local.get(Object.values(INTERCEPTOR), res => {
    const msg: IMockInterceptorMsg = {
      type: EMsgType.MockInterceptor,
      to: EMsgTo.MockInterceptor,
      isActive: res[INTERCEPTOR.IS_ACTIVE],
      groups: res[INTERCEPTOR.RULES],
      groupsActive: res[INTERCEPTOR.GROUPS_ACTIVE],
    }
    if (!msg.isActive) return;
    console.log('插入mockInterceptor脚本');
    const script: HTMLScriptElement = document.createElement('script');
    script.setAttribute('type', 'module');
    script.setAttribute('src', chrome.runtime.getURL('mockInterceptor/mockInterceptor.js'));
    document.documentElement.appendChild(script);
    script.addEventListener('load', () => {
      postMessage(msg);
    });
    script.addEventListener('error', (event) => {
      alert(`mock拦截器加载出错: ${event}`);
    });

    chrome.runtime.onMessage.addListener((msg: IMockInterceptorMsg): any => {
      if (msg.type !== EMsgType.MockInterceptor || msg.to !== EMsgTo.Content) return;
      postMessage({...msg, to: EMsgTo.MockInterceptor} as IMockInterceptorMsg);
    });
  });
}

init();
