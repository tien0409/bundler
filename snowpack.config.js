const { resolve } = require("path");

module.exports = {
  mount: {
    public: { url: "/", static: true },
    src: { url: "/dist" },
  },
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
  packageOptions: {
    polyfillNode: true,
  },
  env: {
    PUBLIC_URL: "",
  },
  routes: [{ match: "routes", src: ".*", dest: "/index.html" }],
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    "@snowpack/plugin-babel",
    "@snowpack/plugin-sass",
  ],
};
