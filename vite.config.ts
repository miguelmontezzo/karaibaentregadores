import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: [
      "react-hook-form",
      "@hookform/resolvers/zod",
      "zod",
      "@radix-ui/react-avatar",
      "@radix-ui/react-switch",
      "@radix-ui/react-progress",
      "@radix-ui/react-dialog",
    ],
    include: [
      "@supabase/supabase-js",
      "react",
      "react-dom",
      "react-dom/client"
    ]
  },
  define: {
    global: "globalThis",
    "process.env": "{}",
  },
}));
