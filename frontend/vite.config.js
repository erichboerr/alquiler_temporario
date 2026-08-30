import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
   plugins: [react()],

    // Proxy de desarrollo — redirige las llamadas /api al backend local.
    // Beneficio: evita problemas de CORS en dev sin tocar la configuración del servidor.
    // En producción esto no aplica — Nginx o el servidor se encargan del routing.
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
                // Si en algún momento el backend no tiene el prefijo /api,
                // descomentá la siguiente línea para reescribir la ruta:
                // rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
});