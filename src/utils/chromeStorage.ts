import { INTERCEPTOR, IMockSetting, IRule, IGroups, IGroupActive } from '@/types/interceptor';

export class ChromeStorage {
  rulesCache: IGroups = {};
  groupsActive: IGroupActive = {};
  isActive: boolean = false;

  constructor() {}

  async initData() {
    await this.getData().then(res => {
      console.log('ChromeStorage constructor', res);
      this.isActive = !!res[INTERCEPTOR.IS_ACTIVE];
      // local中没有初始化过数据
      if (!res[INTERCEPTOR.GROUPS_ACTIVE]) {
        this.groupsActive = {};
        this.rulesCache = {};
        this.initStorage();
        return;
      }
      for(const groupName in res[INTERCEPTOR.RULES]) {
        this.rulesCache[groupName] = [...res[INTERCEPTOR.RULES][groupName]];
      }
      this.groupsActive = {...res[INTERCEPTOR.GROUPS_ACTIVE]};
    });
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

  addGroup(groupName: string) {
    if (groupName in this.groupsActive) return false;
    this.groupsActive[groupName] = false;
    this.updateGroupsActive();
    return true;
  }

  changeGroupName(oldGroupName: string, newGroupName: string) {
    if (newGroupName in this.groupsActive) return false;
    const groupRules = this.rulesCache[oldGroupName];
    this.rulesCache[newGroupName] = groupRules;
    delete this.rulesCache[oldGroupName];
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

  private updateRules() {
    chrome.storage?.local.set({
      [INTERCEPTOR.RULES]: this.rulesCache,
    });
  }

  modifyRule(rule: IRule) {
    // @ts-ignore
    let oldRule = this.rulesCache[rule.groupName].find(r => r.name === rule.name);
    oldRule = {...rule};
    this.updateRules();
  }

  addRule(rule: IRule) {
    const { groupName, name } = rule;
    if (this.rulesCache[groupName].find(r => r.name === name)) return false;
    this.rulesCache[groupName].push(rule);
    this.updateRules();
  }

  deleteRule(rule: IRule) {
    const idx = this.rulesCache[rule.groupName].findIndex(r => r.name === rule.name);
    if (idx === -1) return false;
    this.rulesCache[rule.groupName].splice(idx, 1);
    this.updateRules();
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

let instance: ChromeStorage | null = null;

async function getInstance(): Promise<ChromeStorage> {
  if (instance) return instance;
  instance = new ChromeStorage();
  await instance.initData();
  return instance;
}

export default getInstance;
