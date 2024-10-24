<script setup lang="ts">
import { IGroups } from '@/types/interceptor';
import Rule from './Rule.vue';

const props = defineProps<{
  groups: IGroups;
}>();

console.log(props.groups);

</script>

<template>
  <div class="groups">
    <div v-for="(group, id) in groups" class="group-item" :key="id">
      <Rule v-for="(rule, i) in group" :rule="rule" :key="rule.name"/>
    </div>
  </div>
</template>

<style scoped>

</style>
