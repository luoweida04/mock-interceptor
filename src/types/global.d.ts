import { IMockSetting } from "@/types/interceptor";

declare global {
  interface Window {
    mockSetting: IMockSetting; // 添加自定义属性
  }
}

