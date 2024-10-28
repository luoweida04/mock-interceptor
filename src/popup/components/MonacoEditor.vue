<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { defineEmits, defineProps } from 'vue';
import { IRule } from '@/types/interceptor';

const emit = defineEmits<{
  (event: 'editorContentChange', message: { responseJson: string | undefined }): void;
}>();
const props = defineProps<{
  value: any;
  rule: IRule;
}>();

const editorContainer = ref<any>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;;
const createEditor = () => {
  editor = monaco.editor.create(editorContainer.value, {
    value: props.value,
    language: 'json',
    theme: 'vs-dark',
    tabSize: 2,
    automaticLayout: true,
    scrollBeyondLastLine: true,
  });

  editor.onDidChangeModelContent(() => {
    const newValue = editor?.getValue();
    console.log(newValue);
    emit('editorContentChange', { responseJson: newValue });
  });
};

onMounted(() => {
  createEditor();
});

onBeforeUnmount(() => {
  editor?.dispose();
});
</script>

<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<style scoped>
.editor-container {
  height: 300px;
  width: 100%;
}
</style>
