import { INTERCEPTOR, IMockSetting, IRule, IGroups, IGroupActive } from '@/types/interceptor';

export class ChromeStorage {
  rulesCache: IGroups = {};
  groupsActive: IGroupActive = {};
  isActive: boolean = false;

  constructor() {}

  initData() {
    return new Promise((resolve) => {
      this.getData().then(res => {
        console.log('ChromeStorage constructor', res);
        this.isActive = !!res[INTERCEPTOR.IS_ACTIVE];
        // local中没有初始化过数据
        if (!res[INTERCEPTOR.GROUPS_ACTIVE]) {
          this.groupsActive = {};
          this.rulesCache = {};
          this.initStorage();
          return resolve(res);
        }
        for(const groupName in res[INTERCEPTOR.RULES]) {
          this.rulesCache[groupName] = [...res[INTERCEPTOR.RULES][groupName]];
        }
        this.groupsActive = {...res[INTERCEPTOR.GROUPS_ACTIVE]};
        resolve(res);
      });
    })
  }

  private async initStorage() {
    await chrome.storage?.local.set({
      [INTERCEPTOR.IS_ACTIVE]: false,
      [INTERCEPTOR.GROUPS_ACTIVE]: {},
      [INTERCEPTOR.RULES]: {},
    });
  }

  private updateGroupsActive() {
    chrome.storage?.local.set({
      [INTERCEPTOR.GROUPS_ACTIVE]: this.groupsActive,
    });
  }

  async updateRules() {
    await chrome.storage?.local.set({
      [INTERCEPTOR.RULES]: this.rulesCache,
    });
  }

  addGroup(groupName: string) {
    if (groupName in this.groupsActive) return false;
    this.groupsActive[groupName] = false;
    this.updateGroupsActive();
    this.rulesCache[groupName] = [];
    this.updateRules();
    return true;
  }

  deleteGroup(groupName: string) {
    if (!(groupName in this.groupsActive)) return false;
    delete this.groupsActive[groupName];
    this.updateGroupsActive();
    delete this.rulesCache[groupName];
    this.updateRules();
    return true;
  }

  reviseGroupName(oldGroupName: string, newGroupName: string) {
    if (newGroupName in this.groupsActive) return false;
    this.groupsActive[newGroupName] = this.groupsActive[oldGroupName];
    delete this.groupsActive[oldGroupName];
    this.updateGroupsActive();
    this.rulesCache[newGroupName] = this.rulesCache[oldGroupName];
    delete this.rulesCache[oldGroupName];
    this.updateRules();
    return true;
  }

  changeGroupActive(groupName: string, active: boolean) {
    this.groupsActive[groupName] = active;
    this.updateGroupsActive();
  }

  setIsActive(switchOn: boolean) {
    chrome.storage?.local.set({
      [INTERCEPTOR.IS_ACTIVE]: switchOn
    });
  }

  async modifyRule(rule: IRule) {
    let oldRule = this.rulesCache[rule.groupName]?.find(r => r.name === rule.name);
    // 新增规则
    if (!oldRule) this.rulesCache[rule.groupName].push({...rule});
    else oldRule = {...rule};
    await this.updateRules();
  }

  getData(): Promise<IMockSetting> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage?.local.get([INTERCEPTOR.IS_ACTIVE, INTERCEPTOR.RULES, INTERCEPTOR.GROUPS_ACTIVE], (res: IMockSetting) => {
          resolve(res);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

// 单例
let instance: ChromeStorage | null = null;
// 避免异步重复调用
let initPromise: Promise<ChromeStorage> | null = null;

function getInstance(): Promise<ChromeStorage> {
  if (initPromise) return initPromise;
  initPromise = new Promise((resolve) => {
    if (instance) return resolve(instance);
    instance = new ChromeStorage();
    instance.initData().then(() => {
      resolve(instance!);
    });
  });
  return initPromise;
}

export default getInstance;
