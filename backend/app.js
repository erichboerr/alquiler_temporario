import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { glob } from 'glob';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Exportamos una función async en vez del app directamente,
// porque necesitamos await para cargar las rutas con glob.
// server.js llama: const app = await createApp()
export async function createApp() {
    const app = express();

    // --- Seguridad: Helmet ---
    // Setea headers HTTP de seguridad automáticamente:
    // X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.
    // Mitiga ataques comunes: clickjacking, MIME sniffing, etc.
    //
    // crossOriginResourcePolicy: por default Helmet pone "same-origin", lo que hace
    // que el navegador BLOQUEE la carga de las fotos de /uploads cuando el frontend
    // corre en otro origen (ej: localhost:5173 pidiendo una imagen de localhost:4000).
    // La respuesta llega 200 igual, pero el browser no la renderiza — por eso se ven
    // como ícono roto. Como /uploads es contenido público pensado para mostrarse en
    // cualquier origen (el sitio público), lo abrimos a "cross-origin".
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));

    // --- Logging de requests HTTP ---
    // En desarrollo: formato 'dev' (colorido, compacto)
    // En producción: formato 'combined' (Apache-style, más detallado para logs del servidor)
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

    // --- CORS ---
    // CORS_ORIGIN puede tener uno o varios orígenes separados por coma.
    // Ejemplo: "http://localhost:5173,https://miapp.gob.ar"
    // Si no está definido, no se permite ningún origen externo.
    const allowedOrigins = (process.env.CORS_ORIGIN || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.use(cors({
        origin: (origin, callback) => {
            // Sin origin: request desde Postman, curl, o mismo servidor — se permite
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`Origen no permitido por CORS: ${origin}`));
            }
        },
        credentials: true // Permite envío de cookies y headers de auth entre dominios
    }));

    // Parsea el body de las requests entrantes como JSON
    app.use(express.json());

    // --- Archivos estáticos: fotos de la propiedad ---
    // Todo lo que se sube vía multer a /uploads/propiedad queda accesible
    // públicamente en http://.../uploads/propiedad/archivo.jpg
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // --- Carga dinámica de rutas con glob ---
    // Busca todos los archivos que terminen en .routes.js dentro de /routes
    // Convención de nombres: auth.routes.js → /api/auth
    //                        usuarios.routes.js → /api/usuarios
    //                        reportes.routes.js → /api/reportes
    // Para agregar rutas nuevas: solo crear el archivo, sin tocar este archivo.
    const routeFiles = await glob('routes/*.routes.js', { cwd: __dirname });

    for (const file of routeFiles) {
        // Convertimos la ruta del archivo a una URL válida para import() dinámico
        const fileUrl = pathToFileURL(path.join(__dirname, file)).href;
        const { default: router } = await import(fileUrl);

        // Extraemos el nombre de la ruta desde el nombre del archivo
        // Ejemplo: "routes/auth.routes.js" → "auth" → "/api/auth"
        const routeName = path.basename(file, '.routes.js');
        app.use(`/api/${routeName}`, router);

        console.log(`📋 Ruta cargada: /api/${routeName}`);
    }

    // --- Error handler centralizado ---
    // DEBE ir después de todas las rutas.
    // Recibe los errores que los controllers pasan con next(error).
    app.use(errorHandler);

    return app;
}