export enum EMethod {
  ALL = 'ALL',
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  HEAD = 'HEAD',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

export enum EMode {
  NORMAL = 'normal',
  REGEXP = 'regexp',
}

/**
 * name即id
 * groupName即组id
*/
export interface IRule {
  groupName: string;
  name: string;
  method: EMethod;
  mode: EMode;
  url: string;
  isActive: boolean;
  replaceReponse: any;
};

/**
 * 用于chrome配置存储相关的
*/
export enum INTERCEPTOR {
  /**
   * 是否启用拦截器
  */
  IS_ACTIVE = 'mockInterceptorActive',
  /**
   * 拦截器规则
  */
  RULES = 'mockRules',
}

export interface IGroups {
  [key: string]: IRule[];
}

export interface IMockSetting {
  [INTERCEPTOR.IS_ACTIVE]: boolean;
  [INTERCEPTOR.RULES]: IGroups;
}
