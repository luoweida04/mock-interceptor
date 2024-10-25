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
 * chrome local keys
*/
export enum INTERCEPTOR {
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

export interface IGroups {
  [key: string]: IRule[];
}

export interface IGroupActive {
  [key: string]: boolean;
}

export interface IMockSetting {
  [INTERCEPTOR.IS_ACTIVE]: boolean;
  [INTERCEPTOR.GROUPS_ACTIVE]: IGroupActive;
  [INTERCEPTOR.RULES]: IGroups;
}
