# MockInterceptor
chrome浏览器mock插件

## 主要功能：
- 规则分组，组启用/关闭
- 匹配规则url，可自动补全url
- 正式表达式匹配
- 匹配请求方法
- 允许其他脚本再次修改XMLHttpRequest

## todo
- 可配置等待其他脚本执行完成再加载mockInterceptor（让其他脚本先行修改xhr、fetch对象），可能导致有些请求在加载之前的，无法拦截
- iframe
- 自动获取接口列表
- 默认200返回码，可修改
- mock.js

### 技术实现
项目搭建（自定义脚手架）：https://github.com/luoweida04/create-weidaluo-template

vue3 + vite + proxy + monaco + element-plus

### 本地开发

```bash
pnpm run dev
http://127.0.0.1:5500/popup/index.html
```
