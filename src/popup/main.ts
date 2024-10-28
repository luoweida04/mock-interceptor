import { createApp } from "vue";
import * as monaco from 'monaco-editor';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

import App from './App.vue';

// @ts-ignore
globalThis.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new JsonWorker();
    }
  },
};
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

const app = createApp(App);
app.mount('#app');
