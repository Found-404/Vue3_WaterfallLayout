import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin()],
  build: {
    cssCodeSplit: false, // 禁止 CSS 代码分割（强制内联）
    minify: "terser", // 必须明确指定
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true,
      },
      format: {
        comments: false, // 移除注释
      },
    },
    lib: {
      entry: "src/index.js",
      name: "Waterfall-Vue3",
      fileName: "Waterfall-Vue3",
      formats: ["es", "umd"], // 同时生成ES和UMD格式
    },
    rollupOptions: {
      external: ["vue"], // 不打包 Vue
      output: {
        globals: {
          vue: "Vue", // 告诉 Rollup，全局 Vue 变量是 'Vue'
        },
      },
    },
  },
});
