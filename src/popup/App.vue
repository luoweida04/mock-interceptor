<script setup lang="ts">
import { DEFAULT_MOCK_SETTING } from '@/constant';
import { INTERCEPTOR, IMockSetting } from '@/types/interceptor';
import Groups from './components/Groups.vue';

let setting: Ref<IMockSetting> = ref({...DEFAULT_MOCK_SETTING});
onBeforeMount(() => {
  chrome.storage?.local.get([INTERCEPTOR.IS_ACTIVE, INTERCEPTOR.RULES], (res: IMockSetting) => {
    setting.value = {...res};
  });
});

function switchChange(switchOn: any) {
  chrome.storage?.local.set({
    [INTERCEPTOR.IS_ACTIVE]: switchOn
  });
}
</script>

<template>
  <div class="app">
    <el-switch v-model="setting[INTERCEPTOR.IS_ACTIVE]" @change="switchChange"/>
    <Groups :groups="setting[INTERCEPTOR.RULES]"/>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  height: 300px;
}
</style>
