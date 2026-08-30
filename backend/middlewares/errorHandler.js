import logger from '../utils/logger.js';

// Middleware de manejo centralizado de errores.
// Express lo identifica como error handler porque recibe 4 parámetros (err, req, res, next).
// Se registra ÚLTIMO en app.js, después de todas las rutas.
//
// Flujo:
//   1. Un controller hace next(error)
//   2. Express lo deriva acá automáticamente
//   3. Según si el error es "custom" (creado con createError) o no,
//      responde con el status/mensaje apropiado
export function errorHandler(err, req, res, next) {

    // Extraemos contexto de la request para incluirlo en el log
    const segments = req.originalUrl.split('/').filter(Boolean);
    const controller = segments.length > 0 ? `/${segments[0]}` : 'unknown';
    const action = req.route?.path || 'unknown';

    const logContext = {
        method: req.method,
        route: req.originalUrl,
        controller,
        action,
        timestamp: new Date().toISOString()
    };

    // --- Error de CORS ---
    // Cuando un origen no está permitido, Express tira un Error normal
    // con el mensaje que definimos en app.js. Lo tratamos aparte para
    // responder 403 en vez de 500.
    if (err.message?.startsWith('Origen no permitido por CORS')) {
        logger.warn({ message: err.message, code: 'CORS_BLOCKED', ...logContext });
        return res.status(403).json({ error: 'Acceso no permitido' });
    }

    // --- Error custom (creado con createError) ---
    // Estos errores los lanza el service intencionalmente con un status y código definidos.
    // Ejemplos: credenciales inválidas (401), cuenta deshabilitada (403), no autorizado (401)
    if (err.isCustom) {
        logger.warn({
            message: err.message,
            code: err.code || null,
            httpStatus: err.httpStatus || 400,
            ...logContext
        });
        return res.status(err.httpStatus || 400).json({ message: err.message });
    }

    // --- Error inesperado (bug, fallo de DB, etc.) ---
    // No exponemos detalles internos al cliente — solo logueamos el stack completo
    // para que quede en los logs del servidor y se pueda debuggear.
    logger.error({
        message: err.message,
        code: 'INTERNAL_ERROR',
        stack: err.stack,
        ...logContext
    });

    return res.status(500).json({ error: 'Error interno del servidor' });
}