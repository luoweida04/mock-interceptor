import { defineConfig } from 'vite';
import { dirname, resolve, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import VueDevTools from 'vite-plugin-vue-devtools';
import copy from 'rollup-plugin-copy';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5500,
  },
  root: 'src/',
  build: {
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        content: resolve(__dirname, 'src/content.ts'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        mockInterceptor: resolve(__dirname, 'src/mockInterceptor.ts'),
      },
      output: [
        {
          assetFileNames: 'assets/[name]-[hash].[ext]', // 静态资源
          chunkFileNames: 'js/[name]-[hash].js', // 代码分割中产生的 chunk
          entryFileNames: (chunkInfo) => {
            const baseName = basename(chunkInfo.facadeModuleId!, extname(chunkInfo.facadeModuleId!))
            const saveArr = ['content', 'service-worker']
            return `[name]/${saveArr.includes(baseName) ? baseName : chunkInfo.name}.js`;
          },
          name: '[name].js',
          format: 'esm',
        },
      ],
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  plugins: [
    vue(),
    copy({
      targets: [
        { src: 'manifest.json', dest: 'dist'}
      ]
    }),
    AutoImport({
      imports: ['vue'],
      dts: './src/types/auto-imports.d.ts',
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    VueDevTools(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "src/styles/var.scss" as *;
          @use "src/styles/mixin.scss" as *;
        `,
      },
    },
  },
});
