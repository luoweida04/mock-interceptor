<script setup lang="ts">
import { DEFAULT_MOCK_SETTING } from '@/constant';
import { INTERCEPTOR, IMockSetting } from '@/types/interceptor';
import Groups from './components/Groups.vue';
import getChromeStorage from '@/utils/chromeStorage';
import { ChromeStorage } from '@/utils/chromeStorage';

let chromeStorage: ChromeStorage;
let setting: Ref<IMockSetting> = ref({...DEFAULT_MOCK_SETTING});
let dialogVisible = ref(false);
let newGroupName = ref('');
const groupsComp = ref<any>();

getChromeStorage().then(res => {
  chromeStorage = res;
  const storageSetting = {
    [INTERCEPTOR.RULES]: chromeStorage.rulesCache,
    [INTERCEPTOR.GROUPS_ACTIVE]: chromeStorage.groupsActive,
    [INTERCEPTOR.IS_ACTIVE]: chromeStorage.isActive,
  };
  setting.value = { ...storageSetting };
});

function switchChange(switchOn: any) {
  chromeStorage.setIsActive(switchOn);
}

function confirmAddGroup() {
  if (newGroupName.value === '') {
    ElMessage({
      message: '请输入组名',
      type: 'info',
    })
    return;
  }
  if (!chromeStorage.addGroup(newGroupName.value)) {
    ElMessage({
      message: '该组已存在！',
      type: 'info',
    });
    return;
  }
  setting.value[INTERCEPTOR.GROUPS_ACTIVE][newGroupName.value] = false;
  groupsComp.value?.addGroup(newGroupName.value);
  newGroupName.value = '';
  dialogVisible.value = false;
}
</script>

<template>
  <div class="app">
    <div class="top-nav">
      <el-switch v-model="setting[INTERCEPTOR.IS_ACTIVE]" @change="switchChange"/>
      <el-button
        v-show="setting[INTERCEPTOR.IS_ACTIVE]"  
        type="primary"
        @click="dialogVisible = true"
      >
        + Rule Group
      </el-button>
    </div>
    <Groups
      v-show="setting[INTERCEPTOR.IS_ACTIVE]"
      ref="groupsComp"
    />
    <el-dialog
      v-model="dialogVisible"
      title="Add Rule Group"
    >
      <el-input v-model.trim="newGroupName" placeholder="group name"/>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmAddGroup">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 700px;
  height: 600px;
  padding: 20px;
}

.top-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
</style>
