import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
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
