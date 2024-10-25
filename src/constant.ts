import { INTERCEPTOR, IMockSetting } from "./types/interceptor"

/**
 * 默认配置
*/
export const DEFAULT_MOCK_SETTING: IMockSetting = {
  [INTERCEPTOR.IS_ACTIVE]: false,
  [INTERCEPTOR.GROUPS_ACTIVE]: {},
  [INTERCEPTOR.RULES]: {},
}
