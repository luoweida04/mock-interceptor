import { IGroupActive, IGroups, EMethod, IRule, EMode } from './types/interceptor';
import { EMsgTo, EMsgType, IMockInterceptorMsg } from "./types/msg";

const originXHR = window.XMLHttpRequest;

interface openArgs {
  method: string;
  url: URL;
}

interface IXHRProxy extends XMLHttpRequest {
  response: any;
  responseText: string;
  status: number;
  statusText: string;
  openArgs?: openArgs;
  mockMatchRule: IRule | null;
}

class MockInterceptor {
  isActive: boolean = false;
  groups: IGroups = {};
  groupsActive: IGroupActive = {};

  constructor() {}
}

const instance = new MockInterceptor();

const modifyResponse = (xhr: IXHRProxy) => {
  if (!xhr.openArgs || !xhr.mockMatchRule) return;
  // const { method, url } = xhr.openArgs;
  const { replaceReponse } = xhr.mockMatchRule;
  // todo 检查json合法？
  if (!replaceReponse) return;
  xhr.response = replaceReponse;
  xhr.responseText = replaceReponse;
  xhr.status = 200;
  xhr.statusText = 'OK';
}

function matchRule({ requestMethod, requestUrl }: { requestMethod: string, requestUrl: URL }): IRule | null {
  for(const groupName in instance.groups) {
    if (!instance.groupsActive[groupName]) continue;
    const rules = instance.groups[groupName];
    const rule = rules.find(rule => {
      const { mode, method, url, isActive } = rule;
      const matchMethod = method === EMethod.ALL || requestMethod === method;
      const matchRequest = mode === EMode.REGEXP && new RegExp(url).test(requestUrl.href) ||
        mode === EMode.NORMAL && requestUrl.href.includes(url);
      return isActive && matchMethod && matchRequest;
    });
    if (rule) return rule;
  }
  return null;
}

function getWholeUrl(url: string | URL) {
  if (url instanceof URL) return url;
  url = url.trim();
  try {
    new URL(url);
  } catch (e) {
    const proto = window.location.protocol;
    const host = window.location.host;
    const pageHref = window.location.href;
    if (url.startsWith('./') || url.startsWith('../')) url = new URL(url, pageHref).href;
    else if (url.startsWith('//')) url = `${ proto }url`;
    else url = `${ proto }//${ host }${ url.startsWith('/') ? '' : '/'}${ url }`
  }
  return new URL(url);
}

const XHRProxy = new Proxy(originXHR, {
  construct(target, args) {
    // @ts-ignore
    const xhr: IXHRProxy = new target(...args);
    // 由于原生属性readonly，用新属性替代原生属性
    const readonlyProps = ['response', 'responseText', 'status', 'statusText'];
    const proxyXhr = new Proxy(xhr, {
      get(target, prop) {
        if (!(typeof prop === 'symbol') && readonlyProps.includes(prop)) {
          return Reflect.get(target, `_${prop}`);
        }
        const value = Reflect.get(target, prop);
        if (typeof value !== 'function') return value;
        switch (prop) {
          case 'open':
            const proxyOpen = (method: string, url: string | URL) => {
              const requestUrl = getWholeUrl(url);
              xhr.openArgs = {
                method: method.toUpperCase(),
                url: requestUrl,
              };
              xhr.mockMatchRule = matchRule({ requestMethod: method, requestUrl });
              value?.apply(target, [method, url]);
            }
            return proxyOpen.bind(target);
          default:
            break;
        }
        return value.bind(target);
      },
      // @ts-ignore
      set(target, prop, newValue) {
        if (!(typeof prop === 'symbol') && readonlyProps.includes(prop)) {
          Reflect.set(target, `_${prop}`, newValue);
          return true;
        }

        switch (prop) {
          case 'onreadystatechange':
          case 'onload':
            const originFunc = newValue;
            const proxyFunc = (...args: any) => {
              if (prop === 'onload' || xhr.readyState === 4) modifyResponse(proxyXhr);
              originFunc?.apply(target, args);
              Reflect.set(target, prop, null);
            }
            Reflect.set(target, prop, proxyFunc);
            break;
          default:
            Reflect.set(target, prop, newValue);
            break;
        }
        return true;
      }
    });
    return proxyXhr;
  },
});

// const test = () => {
//   Object.defineProperty(window, 'XMLHttpRequest', {
//     value: XHRProxy,
//     writable: false, // 禁止修改
//     configurable: false // 禁止删除或重新定义
//   });

//   const xhr = new window.XMLHttpRequest();
//   xhr.open('get', 'http://www.baidu.com/');
//   xhr.send();
//   xhr.onreadystatechange = () => {
//     const { response, responseText, status, statusText } = xhr;
//     console.log('onreadystatechange example:', response, responseText, status, statusText);
//   }
// }

window.addEventListener('message', (event) => {
  const { type, to, isActive, groups, groupsActive }: IMockInterceptorMsg = event.data;
  if (type !== EMsgType.MockInterceptor || to !== EMsgTo.MockInterceptor) return;
  instance.isActive = isActive;
  instance.groups = groups;
  instance.groupsActive = groupsActive;

  if (isActive) {
    // 防止其他脚本冲突修改代理对象 如aegis等埋点监控sdk
    Object.defineProperty(window, 'XMLHttpRequest', {
      value: XHRProxy,
      writable: false,
      configurable: false
    });
  } else {
    window.XMLHttpRequest = originXHR;
  }
});

