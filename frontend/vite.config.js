import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Cualquier petición que empiece con '/api' será redirigida
      "/api": {
        target: "http://backend:8000", // La dirección de tu backend de Django
        changeOrigin: true, // Necesario para la redirección
        secure: false, // No verificar certificados SSL ( útil en desarrollo)
      },
    },
  },
});