// vite.config.ts
import { defineConfig } from "file:///C:/Users/Pradeep%20Aswani/Downloads/IEEE-SOU-SB-17-main/IEEE-SOU-SB-17-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Pradeep%20Aswani/Downloads/IEEE-SOU-SB-17-main/IEEE-SOU-SB-17-main/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Pradeep%20Aswani/Downloads/IEEE-SOU-SB-17-main/IEEE-SOU-SB-17-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Pradeep Aswani\\Downloads\\IEEE-SOU-SB-17-main\\IEEE-SOU-SB-17-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add history API fallback for SPA routing
    historyApiFallback: true
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    // Generate a 404.html file that redirects to index.html for SPA routing
    rollupOptions: {
      output: {
        manualChunks: void 0
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQcmFkZWVwIEFzd2FuaVxcXFxEb3dubG9hZHNcXFxcSUVFRS1TT1UtU0ItMTctbWFpblxcXFxJRUVFLVNPVS1TQi0xNy1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQcmFkZWVwIEFzd2FuaVxcXFxEb3dubG9hZHNcXFxcSUVFRS1TT1UtU0ItMTctbWFpblxcXFxJRUVFLVNPVS1TQi0xNy1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9QcmFkZWVwJTIwQXN3YW5pL0Rvd25sb2Fkcy9JRUVFLVNPVS1TQi0xNy1tYWluL0lFRUUtU09VLVNCLTE3LW1haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIC8vIEFkZCBoaXN0b3J5IEFQSSBmYWxsYmFjayBmb3IgU1BBIHJvdXRpbmdcbiAgICBoaXN0b3J5QXBpRmFsbGJhY2s6IHRydWUsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICAvLyBHZW5lcmF0ZSBhIDQwNC5odG1sIGZpbGUgdGhhdCByZWRpcmVjdHMgdG8gaW5kZXguaHRtbCBmb3IgU1BBIHJvdXRpbmdcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJaLFNBQVMsb0JBQW9CO0FBQ3hiLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxJQUVOLG9CQUFvQjtBQUFBLEVBQ3RCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUNULGdCQUFnQjtBQUFBLEVBQ2xCLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBQUEsSUFFTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
