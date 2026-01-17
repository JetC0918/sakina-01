import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api/ai": {
          target: "https://generativelanguage.googleapis.com/v1beta",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ai/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              const url = new URL(proxyReq.path || "", "https://generativelanguage.googleapis.com");
              url.searchParams.set("key", env.GEMINI_API_KEY || "");
              proxyReq.path = url.pathname + url.search;
            });
          },
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
