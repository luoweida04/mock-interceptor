# Vue 3 + TypeScript + Vite + scss 模板

service-worker加载content.js，content.js在有新标签页打开且点击了插件的时候执行
content.js向页面插入pageScript脚本，且向它发送信息，包括规则配置、开关等
pageScript负责实现拦截逻辑，包括ajax、fetch

存储配置：chrome.storage.local
由于每个tab都会取出配置，挂在window上面，可能出现两个tab的配置不一致的情况，刷新页面即可

数据传递：iframe->background->content->pageScript更新本页面脚本的配置数据，用新规则处理拦截


## 开发


### 主体逻辑
service-worker加载content.js，content.js在有新标签页打开且点击了插件的时候执行
content.js向页面插入pageScript脚本，且向它发送信息，包括规则配置、开关等
用postmessage向pageScript通信


content.js不能import、require，所以类型定义复制一份
film.qq.video.com aegis在每次页面可见都会修改window.XMLHttpRequest，需要禁止修改


## 功能：
1、分组
2、可配置等待其他脚本执行完成再加载mockInterceptor（让其他脚本先行修改xhr、fetch对象）


  // "content_scripts": [
  //   {
  //     "js": [
  //       "content/content.js"
  //     ],
  //     "type": "module",
  //     "matches": [
  //       "<all_urls>"
  //     ],
  //     "all_frames": true,
  //     "run_at": "document_end",
  //     "match_about_blank": true
  //   }
  // ],

### 本地开发
pnpm run dev
访问： http://127.0.0.1:5500/popup/index.html
