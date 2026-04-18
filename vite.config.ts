import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    minify: "terser",
    target: "es2020",
    cssMinify: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    drop: ["console", "debugger"],
    legalComments: "none",
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    sourcemap: false,
  },
});