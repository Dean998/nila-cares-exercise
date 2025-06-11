import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Optimize React plugin for speed
      jsxRuntime: "automatic",
    }),
  ],

  server: {
    port: 5173,
    host: "0.0.0.0",
    hmr: {
      port: 5174,
      // Reduce HMR overlay delay
      overlay: false,
    },
    // Disable file watching for node_modules
    watch: {
      ignored: ["**/node_modules/**", "**/dist/**"],
    },
  },

  // Very aggressive dependency optimization
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "@mantine/core",
      "@mantine/hooks",
      "@mantine/notifications",
      "@mantine/form",
      "react-router",
      "@tanstack/react-query",
      "zustand",
      "lucide-react", // Lucide has better tree-shaking than Tabler
    ],
    // Force re-optimization on every start
    force: true,
    // Pre-bundle everything
    entries: ["./src/index.tsx"],
  },

  build: {
    outDir: "dist",
    sourcemap: mode === "development" ? false : true,
    minify: mode === "development" ? false : "esbuild",
    target: "esnext",
    rollupOptions: {
      output:
        mode === "development"
          ? {
              // No manual chunks in development for speed
              manualChunks: undefined,
            }
          : {
              // Only chunk in production for optimal loading
              manualChunks: (id) => {
                if (id.includes("lucide-react")) {
                  return "icons";
                }
                if (id.includes("node_modules")) {
                  return "vendor";
                }
              },
            },
    },
  },

  // Disable CSS preprocessing completely in dev
  css: {
    devSourcemap: false,
    preprocessorOptions: {},
  },

  // Aggressive caching
  cacheDir: "node_modules/.vite",

  // Disable some features for maximum speed
  define: {
    __DEV__: mode === "development",
  },

  // Disable unnecessary features
  esbuild: {
    // Faster transpilation
    target: "esnext",
    // Disable source maps in development
    sourcemap: mode !== "development",
  },
}));
