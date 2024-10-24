<script setup lang="ts">
import { IRule } from '@/types/interceptor';

const props = defineProps<{
  rule: IRule;
}>();
console.log(props.rule);
</script>

<template>
  <div class="rule">

  </div>
</template>

<style scoped>

</style>
