import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    envDir: "..",  // read .env from repo root (b:\DEV\KMS)
    server: {
        port: 5173,
        open: true,
    },
});
