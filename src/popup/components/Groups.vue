<script setup lang="ts">
import { EMethod, EMode, IGroupActive, IGroups, IRule } from '@/types/interceptor';
import { ElMessage } from 'element-plus';
import { ChromeStorage } from '@/utils/chromeStorage';

interface ITree {
  groupName: string;
  rules: IRule[];
};

const props = defineProps<{
  groups: IGroups;
  groupsActive: IGroupActive;
  chromeStorage: ChromeStorage;
}>();
const { chromeStorage } = props;
const { groups, groupsActive } = toRefs(props);
const defaultProps = {
  children: 'rules',
  label: 'groupName',
};
const groupData: Ref<ITree[]> = ref([]);
let revisingGroupName = ref(false);
let newGroupName = ref('');

for(const groupName in groupsActive.value) {
  const node: ITree = {
    groupName,
    rules: groups.value[groupName] ?? [],
  }
  groupData.value.push(node);
}

const addGroup = (groupName: string) => {
  groupData.value.push({
    groupName,
    rules: [],
  } as ITree);
}
defineExpose({ addGroup });

function reviseGroupName() {
  revisingGroupName.value = true
}

function confirmReviseGroupName(originGroupName: string) {
  revisingGroupName.value = false;
  if (!chromeStorage.changeGroupName(originGroupName, newGroupName.value)) {
    ElMessage('该组已存在！');
    return;
  }
  const idx = groupData.value.findIndex(g => g.groupName === originGroupName);
  groupData.value[idx].groupName = newGroupName.value;
  newGroupName.value = '';
}

function cancelReviseGroupName() {
  revisingGroupName.value = false;
  newGroupName.value = '';
}

function addRule(groupName: string) {
  const idx = groupData.value.findIndex(g => g.groupName === groupName);
  groupData.value[idx].rules.push({
    groupName,
    name: '',
    method: EMethod.ALL,
    mode: EMode.NORMAL,
    url: '',
    isActive: false,
    replaceReponse: '',
  } as IRule);
}

function groupActiveChange(groupName: string) {
  chromeStorage.changeGroupActive(groupName, groupsActive.value[groupName]);
}

function ruleSwitchChange(rule: any) {
  chromeStorage.modifyRule(rule);
}

function save(newRule: IRule) {
  chromeStorage.modifyRule(newRule);
}
</script>

<template>
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
          <template v-if="revisingGroupName">
            <el-input v-model="newGroupName" style="width: 100px;"/>
            <span class="btn btn-left" @click.stop="confirmReviseGroupName(data.groupName)">comfirm</span>
            <span class="btn btn-left" @click.stop="cancelReviseGroupName">cancel</span>
          </template>
          <template v-else>
            <span class="group-name">{{ data.groupName }}</span>
            <span class="btn btn-left" @click.stop="reviseGroupName">ReviseName</span>
          </template>
        </div>
        <div>
          <span class="btn" @click.stop="addRule(data.groupName)">addRule</span>
          <el-switch v-model="groupsActive[data.groupName]" @change="groupActiveChange(data.groupName)"/>
        </div>
      </div>
      <ul v-else class="rule">
        <li v-if="data.name">{{ data.name }}</li>
        <li v-else>
          <el-input v-model="data.name" style="width: 100px;"/>
        </li>
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
          <el-input v-model="data.url" style="width: 100px" placeholder="eg: example/getData"/>
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
        <li><el-button type="primary" @click="save(data)">delete</el-button></li>
        <li><el-button type="primary" @click="save(data)">save</el-button></li>
        <li><el-switch v-model="data.isActive" @change="ruleSwitchChange(data)"/></li>
      </ul>
    </template>
  </el-tree>
</template>

<style lang="scss" scoped>
:deep(.el-tree-node) {
  &:hover, &:visited, &.is-current, &.is-selected {
    background-color: transparent !important;
  }
  background-color: transparent !important;
} 

:deep(.el-tree-node__content) {
  height: 50px !important;
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
