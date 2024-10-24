/** @type {import('eslint').Linter.Config} */
const vueConfig = require('eslint-plugin-vue');
const typescriptConfig = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const eslintImport = require('eslint-plugin-import');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const vueEslintParser = require('vue-eslint-parser');

// 这里是 eslint 9.x 版本，配置规则见官网
module.exports = [
  {
    files: ['src/**/*.{js,ts,jsx,tsx,vue}', 'src/main.ts'],
    ignores: [
      'node_modules/',
      'dist/',
    ],
    languageOptions: {
      parser: vueEslintParser, // 解决 typescriptParser 解析vue文件时的问题 【Parsing error: '>' expected】
      parserOptions: {
        parser: typescriptParser,  // 使用 TypeScript 解析器
        ecmaVersion: 12, // 使用 ES2021
        sourceType: 'module', // 模块导入
      },
    },
    plugins: {
      vueConfig,
      typescriptConfig,
      eslintImport,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "semi": ["error", "always"],
      'simple-import-sort/imports': 'error', // 对导入进行排序
      'simple-import-sort/exports': 'error',  // 对导出进行排序
    },
  },
]