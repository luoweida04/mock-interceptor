<script setup lang="ts">
import { EMethod, EMode, IGroupActive, IGroups, IRule } from '@/types/interceptor';
import { ElMessage } from 'element-plus';
import getChromeStorage from '@/utils/chromeStorage';
import { ChromeStorage } from '@/utils/chromeStorage';
import MonacoEditor from './MonacoEditor.vue';

interface ITree {
  groupName: string;
  rules: IRule[];
};

let chromeStorage: ChromeStorage;
const defaultProps = {
  children: 'rules',
  label: 'groupName',
};
const groupData: Ref<ITree[]> = ref([]);
let revisingGroupName: Ref<Record<string, boolean>> = ref({});
let curRevising = '';
let newGroupName = ref('');

let groups: Ref<IGroups> = ref({});
let groupsActive: Ref<IGroupActive> = ref({});

let dialogVisiable = ref(false);
let toDelGroupIdx: Ref<number> = ref(-1);

onBeforeMount(() => {
  getChromeStorage().then(res => {
    chromeStorage = res;
    groups.value = chromeStorage.rulesCache;
    groupsActive.value = chromeStorage.groupsActive;
    groupData.value = [];
    for(const groupName in groupsActive.value) {
      const node: ITree = {
        groupName,
        rules: groups.value[groupName] ?? [],
      }
      groupData.value.push(node);
      revisingGroupName.value[groupName] = false;
    }
  });
});

const addGroup = (groupName: string) => {
  groupsActive.value[groupName] = false;
  groups.value[groupName] = [];
  groupData.value.push({
    groupName,
    rules: [],
  } as ITree);
}
defineExpose({ addGroup });

function deleteGroup(groupName: string) {
  toDelGroupIdx.value = groupData.value.findIndex(g => g.groupName === groupName);
  dialogVisiable.value = true;
}

function closeDialog() {
  toDelGroupIdx.value = -1;
  dialogVisiable.value = false;
}

function confirmDeleteGroup() {
  const groupName = groupData.value[toDelGroupIdx.value].groupName;
  groupData.value.splice(toDelGroupIdx.value, 1);
  chromeStorage.deleteGroup(groupName);
  closeDialog();
}

function reviseGroupName(groupName: string) {
  revisingGroupName.value[curRevising] = false;
  revisingGroupName.value[groupName] = true;
  curRevising = groupName;
}

function confirmReviseGroupName(originGroupName: string) {
  revisingGroupName.value[originGroupName] = false;
  if (newGroupName.value === '' || originGroupName === newGroupName.value) return newGroupName.value = '';
  if (!chromeStorage.reviseGroupName(originGroupName, newGroupName.value)) {
    ElMessage('该组已存在！');
    return;
  }
  const idx = groupData.value.findIndex(g => g.groupName === originGroupName);
  groupData.value[idx].groupName = newGroupName.value;
  delete revisingGroupName.value[originGroupName];
  revisingGroupName.value[newGroupName.value] = false;
  newGroupName.value = '';
}

function cancelReviseGroupName(originGroupName: string) {
  revisingGroupName.value[originGroupName] = false;
  newGroupName.value = '';
}

function addRule(groupName: string) {
  const rules = groupData.value.find(g => g.groupName === groupName)?.rules;
  if (!rules) return;
  const lastRule = rules.at(-1);
  if (lastRule && (lastRule.name === '' || lastRule.url === '')) {
    ElMessage({
      message: '请先填写空规则',
      type: 'info',
    });
    return;
  }
  rules.push({
    groupName,
    name: '',
    method: EMethod.ALL,
    mode: EMode.NORMAL,
    url: '',
    isActive: false,
    replaceReponse: '',
  } as IRule);
  chromeStorage.updateRules();
}

function groupActiveChange(groupName: string) {
  chromeStorage.changeGroupActive(groupName, groupsActive.value[groupName]);
}

function ruleSwitchChange(rule: any) {
  chromeStorage.modifyRule(rule);
}

function editorContentChange({ responseJson, rule } : {
  responseJson: string,
  rule: IRule,
}) {
  rule.replaceReponse = responseJson;
  chromeStorage.modifyRule(rule);
  ElMessage({
    message: 'response保存成功',
    type: 'success'
  });
}

async function save(rule: IRule) {
  const { name, url } = rule;
  if (name === '' || url === '') {
    ElMessage({
      message: '规则名 & 匹配接口 必填',
      type: 'error',
    });
    return;
  }
  await chromeStorage.modifyRule(rule);
  ElMessage({
    message: '保存成功',
    type: 'success',
  });
}

function delRule(rule: IRule) {
  const { groupName, name } = rule;
  const rules = groupData.value.find(g => g.groupName === groupName)?.rules;
  const idx = rules?.findIndex(r => r.name === name);
  if (!rules || !idx || !(idx >= 0)) return;
  rules.splice(idx, 1);
  chromeStorage.updateRules();
  ElMessage({
    message: '删除成功',
    type: 'success'
  });
}
</script>

<template>
  <div>
    <el-tree
      style="width: 700px;"
      :data="groupData"
      :props="defaultProps"
      :default-expand-all="true"
      empty-text="No Rule Groups"
      class="el-tree"
    >
      <template #default="{ data }">
        <div v-if="data.rules" class="group-node">
          <div>
            <template v-if="revisingGroupName[data.groupName]">
              <el-input v-model.trim="newGroupName" style="width: 100px;"/>
              <span class="btn btn-left" @click.stop="confirmReviseGroupName(data.groupName)">comfirm</span>
              <span class="btn btn-left" @click.stop="cancelReviseGroupName(data.groupName)">cancel</span>
            </template>
            <template v-else>
              <span class="group-name">{{ data.groupName }}</span>
              <span class="btn btn-left" @click.stop="reviseGroupName(data.groupName)">revise</span>
              <span class="btn btn-danger" @click.stop="deleteGroup(data.groupName)">delete</span>
            </template>
          </div>
          <div>
            <span class="btn" @click.stop="addRule(data.groupName)">+ Rule</span>
            <el-switch v-model="groupsActive[data.groupName]" @change="groupActiveChange(data.groupName)" @click.stop="() => {}"/>
          </div>
        </div>
        <div v-else>
          <ul class="rule">
            <li><el-input v-model.trim="data.name" placeholder="rule name" style="width: 100px;"/></li>
            <li>
              <el-select
                v-model="data.mode"
                placeholder="Select"
                style="width: 100px"
              >
                <el-option
                  v-for="mode in EMode"
                  :key="mode"
                  :label="mode"
                  :value="mode"
                />
              </el-select>
            </li>
            <li>
              <el-input v-model.trim="data.url" style="width: 100px" placeholder="eg: example/getData"/>
            </li>
            <li>
              <el-select
                v-model="data.method"
                placeholder="Select"
                style="width: 100px"
              >
                <el-option
                  v-for="method in EMethod"
                  :key="method"
                  :label="method"
                  :value="method"
                />
              </el-select>
            </li>
            <li><el-button type="danger" @click="delRule(data)">delete</el-button></li>
            <li><el-button type="primary" @click="save(data)">save</el-button></li>
            <li><el-switch v-model="data.isActive" @change="ruleSwitchChange(data)"/></li>
          </ul>
          <MonacoEditor
            @editorContentChange="({ responseJson }: any) => editorContentChange({ responseJson, rule: data })"
            :value="data.replaceReponse"
            :rule="data"
          />
        </div>
      </template>
    </el-tree>
    <el-dialog
      v-model="dialogVisiable"
      :title="`即将删除规则: ${groupData[toDelGroupIdx]?.groupName}`"
    >
      <span>此规则组下的规则将全部清空</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="closeDialog">Cancel</el-button>
          <el-button type="danger" @click="confirmDeleteGroup">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-tree-node) {
  &:hover, &:visited, &.is-current, &.is-selected {
    background-color: transparent !important;
  }
  background-color: transparent !important;
} 

:deep(.el-tree-node__content) {
  height: auto !important;
  background-color: transparent !important;
  &:hover, &:visited, &.is-current, &.is-selected {
    background-color: transparent !important;
  }
}

.group-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  .group-name {
    font-size: 18px;
    font-weight: bold;
  }
  .btn {
    cursor: pointer;
    color: #409EFF;
    margin-right: 10px;
  }
  .btn-left {
    margin-left: 10px;
  }
  .btn-danger {
    color: rgb(245, 108, 108);
  }
}

.rule {
  display: flex;
  height: 50px;
  list-style-type: none;
  padding: 0;
  margin: 0;
  li {
    display: block;
    display: flex;
    box-sizing: border-box;
    justify-content: space-around;
    align-items: center;
    cursor: auto;
    margin: 0;
    margin-right: 10px;
  }
}
</style>
