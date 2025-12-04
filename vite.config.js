# Kopiraj gornji kod u vite.config.js
# ili ako koristi Windows PowerShell:

Remove-Item vite.config.js
@'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser"
  }
});
'@ | Set-Content vite.config.js
