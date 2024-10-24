import { IRule } from "./types/interceptor";
import { EMsgTo, EMsgType, IMockInterceptorMsg } from "./types/msg";

const originXHR = window.XMLHttpRequest;

const modifyResponse = (xhr: XMLHttpRequest) => {
  // @ts-ignore
  xhr.response = 'modify-response';
}

const XHRProxy = new Proxy(originXHR, {
  construct(target, args) {
    // @ts-ignore
    const xhr = new target(...args);
    // 由于原生属性readonly，用新属性替代原生属性
    const readonlyProps = ['response', 'responseText', 'status', 'statusText'];
    const proxyXhr = new Proxy(xhr, {
      get(target, prop) {
        if (!(typeof prop === 'symbol') && readonlyProps.includes(prop)) {
          return Reflect.get(target, `_${prop}`);
        }
        const value = Reflect.get(target, prop);
        return typeof value === 'function' ? value.bind(target) : value;
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

const test = () => {
  Object.defineProperty(window, 'XMLHttpRequest', {
    value: XHRProxy,
    writable: false, // 禁止修改
    configurable: false // 禁止删除或重新定义
  });

  const xhr = new window.XMLHttpRequest();
  xhr.open('get', 'http://127.0.0.1:5500');
  xhr.send();
  xhr.onreadystatechange = () => {
    console.log('onreadystatechange example:', xhr.response);
  }
}

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

  test();
});

