import { IRule } from "./types/interceptor";
import { EMsgTo, EMsgType, IMockInterceptorMsg } from "./types/msg";

const originXHR = window.XMLHttpRequest;

interface openArgs {
  method: string;
  url: string | URL;
}

interface IXHRProxy extends XMLHttpRequest {
  response: any;
  responseText: string;
  status: number;
  statusText: string;
  openArgs?: openArgs;
}

const modifyResponse = (xhr: IXHRProxy) => {
  if (!xhr.openArgs) return;
  const { url } = xhr.openArgs;
  const targetUrl = url instanceof URL ? url.href : url;
  if (!/baidu/.test(targetUrl)) return;
  xhr.response = 'modify-response';
  xhr.responseText = 'modify-response';
  xhr.status = 200;
  xhr.statusText = 'OK';
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
              xhr.openArgs = {
                method,
                url,
              }
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
              modifyResponse(proxyXhr);
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

class MockInterceptor {
  isActive: boolean = false;
  rules: IRule[] = [];

  constructor() {}
}

const instance = new MockInterceptor();

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
  const { type, to, isActive, rules }: IMockInterceptorMsg = event.data;
  if (type !== EMsgType.MockInterceptor || to !== EMsgTo.MockInterceptor) return;
  instance.isActive = isActive;
  instance.rules = rules;

  if (isActive) {
    // 防止其他脚本冲突修改代理对象 如aegis等埋点监控sdk
    Object.defineProperty(window, 'XMLHttpRequest', {
      value: XHRProxy,
      writable: false, // 禁止修改
      configurable: false // 禁止删除或重新定义
    });
  } else {
    window.XMLHttpRequest = originXHR;
  }
});

