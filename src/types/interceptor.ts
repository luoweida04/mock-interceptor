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

export interface IRule {
  groupName: string;
  name: string;
  method: EMethod;
  mode: EMode;
  url: string;
  isActive: boolean;
  replaceReponse: any;
};
