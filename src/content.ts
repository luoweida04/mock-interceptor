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

interface IContentMsg extends IBaseMsg {
  contentScriptLoaded: boolean,
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
  window.onload = () => {
    console.log('load事件后插入mockInterceptor脚本');
    const script: HTMLScriptElement = document.createElement('script');
    // script.setAttribute('type', 'text/javascript');
    script.setAttribute('type', 'module');
    script.setAttribute('src', chrome.runtime.getURL('mockInterceptor/mockInterceptor.js'));
    document.documentElement.appendChild(script);
    script.addEventListener('load', () => {
      chrome.storage.local.get([INTERCEPTOR.IS_ACTIVE, INTERCEPTOR.RULES], res => {
        postMessage({
          type: EMsgType.MockInterceptor,
          to: EMsgTo.MockInterceptor,
          isActive: res[INTERCEPTOR.IS_ACTIVE],
          groups: res[INTERCEPTOR.RULES],
          groupsActive: res[INTERCEPTOR.GROUPS_ACTIVE],
        } as IMockInterceptorMsg);
      });
    });
    script.addEventListener('error', (event) => {
      alert(`mock拦截器加载出错: ${event}`);
    });

    // 接收server-worker传来的信息，转给mockInterceptor
    chrome.runtime.onMessage.addListener((msg: IMockInterceptorMsg): any => {
      console.log('content接收到信息：', msg);
      if (msg.type !== EMsgType.MockInterceptor || msg.to !== EMsgTo.Content) return;
      console.log('接收server-worker传来的信息，转给mockInterceptor');
      postMessage({...msg, to: EMsgTo.MockInterceptor} as IMockInterceptorMsg);
    });
    
    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: EMsgType.MockInterceptor,
      to: EMsgTo.Background,
      contentScriptLoaded: true,
    } as IContentMsg);

    chrome.runtime.sendMessage(chrome.runtime.id, {
      type: EMsgType.MockInterceptor,
      to: EMsgTo.Client,
      contentScriptLoaded: true,
    } as IContentMsg);
  }
}

init();
