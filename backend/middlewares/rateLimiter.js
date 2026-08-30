import rateLimit from 'express-rate-limit';

// Limitador específico para el endpoint de login.
// Objetivo: frenar ataques de fuerza bruta (probar muchas contraseñas seguidas).
//
// - windowMs: ventana de tiempo que se analiza (15 minutos)
// - max: cantidad máxima de intentos permitidos dentro de esa ventana, por IP
// - Pasado el límite, responde 429 (Too Many Requests) con el mensaje definido
//
// Nota: esto limita por IP. Si en el futuro necesitás también bloquear
// por usuario (independientemente de la IP), eso se maneja a nivel de
// auth.service.js con un contador de intentos fallidos en el modelo Usuario.
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 intentos de login por IP cada 15 minutos
    standardHeaders: true, // devuelve info de límite en headers RateLimit-*
    legacyHeaders: false, // desactiva los headers X-RateLimit-* (deprecados)
    message: {
        message: 'Demasiados intentos de inicio de sesión. Intentá nuevamente en unos minutos.'
    }
});