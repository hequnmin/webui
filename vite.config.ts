import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    host: "0.0.0.0", // 允许局域网访问
    port: 5173, // 可选（默认就是5173）
  },
});
