import { IRule } from "./interceptor";

export enum EMsgType {
  MockInterceptor = 'MockInterceptor',
}

export enum EMsgTo {
  MockInterceptor = 'MockInterceptor',
  Content = 'Content',
  Background = 'Background',
  Client = 'Client',
}

export interface IBaseMsg {
  type: EMsgType,
  to: EMsgTo,
}

export interface IContentMsg extends IBaseMsg {
  contentScriptLoaded: boolean,
}

export interface IMockInterceptorMsg extends IBaseMsg {
  isActive: boolean,
  rules: IRule[],
}
