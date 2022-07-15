import { defineConfig, UserConfigExport } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
    setupFiles: "./setupVitest.ts",
    // solid needs to be inline to work around
    // a resolution issue in vitest:
    deps: {
      inline: [/solid-js/],
    },
    // if you have few tests, try commenting one
    // or both out to improve performance:
    threads: false,
    isolate: false,
  },
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
  resolve: {
    conditions: ["development", "browser"],
    alias: [
      { find: "@src", replacement: `${process.cwd()}/src` },
      { find: "@util", replacement: `${process.cwd()}/src/util` },
      { find: "@components", replacement: `${process.cwd()}/src/components` },
      { find: "@data", replacement: `${process.cwd()}/processed_data` },
      { find: "@routes", replacement: `${process.cwd()}/src/routes` },
    ],
  },
});
