import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig((context) => {
  process.env = loadEnv(context.mode, process.cwd());

  return {
    build: {
      outDir: "./dist",
    },
    define: {
      "process.env": process.env,
    },
    resolve: {
      alias: {
        "~antd": "antd",
        path: "path-browserify",
        app: resolve(__dirname, "./src/app/"),

        assets: resolve(__dirname, "./src/assets/"),
        custom: resolve(__dirname, "./src/assets/scss/custom"),
        icons: resolve(__dirname, "./src/assets/scss/custom/plugins/icons/"),

        common: resolve(__dirname, "./src/common/"),
        components: resolve(__dirname, "./src/components/"),
        config: resolve(__dirname, "./src/config/"),
        helpers: resolve(__dirname, "./src/helpers/"),
        i18n: resolve(__dirname, "./src/i18n/"),
        locales: resolve(__dirname, "./src/locales/"),
        pages: resolve(__dirname, "./src/pages/"),
        services: resolve(__dirname, "./src/services/"),
      },
    },
    plugins: [react()],
  };
});
