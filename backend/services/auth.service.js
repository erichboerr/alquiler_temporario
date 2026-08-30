import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createError } from '../utils/createError.js';
import { normalizeUser } from '../utils/normalize.js';
import logger from '../utils/logger.js';

const login = async (username, password) => {
    // Normalizamos el username: trim + lowercase
    // Así "  Root " y "root" y "ROOT" son el mismo usuario
    const userNormalizado = normalizeUser(username);

    // 1. Buscar usuario e incluir su Rol
    const usuario = await db.Usuario.findOne({
        where: { user: userNormalizado },
        include: [{ model: db.Rol, as: 'rol' }]
    });

    // Mismo mensaje para "no existe" y "password incorrecta"
    // Evita que un atacante sepa si el usuario existe o no (enumeración de usuarios)
    if (!usuario) {
        logger.warn({
            message: 'Intento de login con usuario inexistente',
            userIntentado: userNormalizado,
            timestamp: new Date().toISOString()
        });
        throw createError('Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS');
    }

    // 2. Verificar si la cuenta está habilitada ANTES de verificar la password
    // Así no le damos pistas: si está deshabilitada, que sepa que lo está
    if (!usuario.flagHabilitado) {
        logger.warn({
            message: 'Intento de login en cuenta deshabilitada',
            userId: usuario.id,
            user: usuario.user,
            timestamp: new Date().toISOString()
        });
        throw createError('Tu cuenta está deshabilitada. Contactá al administrador.', 403, 'ACCOUNT_DISABLED');
    }

    // 3. Verificar password
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
        logger.warn({
            message: 'Intento de login con contraseña incorrecta',
            userId: usuario.id,
            user: usuario.user,
            timestamp: new Date().toISOString()
        });
        // Mismo mensaje que "usuario no existe" — no damos pistas
        throw createError('Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS');
    }

    // 4. Generar JWT con información mínima necesaria
    // No incluir datos sensibles en el payload (el JWT es decodificable sin la clave)
    const token = jwt.sign(
        {
            id: usuario.id,
            user: usuario.user,
            rol: usuario.rol.nombre
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    // 5. Log de auditoría — login exitoso
    logger.info({
        message: 'Login exitoso',
        userId: usuario.id,
        user: usuario.user,
        rol: usuario.rol.nombre,
        timestamp: new Date().toISOString()
    });

    return {
        token,
        user: {
            id: usuario.id,
            user: usuario.user,
            rol: usuario.rol.nombre
        }
    };
};

const verifyUser = async (id) => {
    // Buscamos el usuario por ID y verificamos que siga habilitado
    // Esto se ejecuta cada vez que el frontend recarga la página
    const usuario = await db.Usuario.findByPk(id, {
        include: [{ model: db.Rol, as: 'rol' }]
    });

    // Si el usuario fue eliminado (paranoid) o deshabilitado después de loguear,
    // esta verificación lo detecta y fuerza el cierre de sesión en el frontend
    if (!usuario || !usuario.flagHabilitado) {
        throw createError('No autorizado', 401, 'UNAUTHORIZED');
    }

    return {
        id: usuario.id,
        user: usuario.user,
        rol: usuario.rol.nombre
    };
};

export default { login, verifyUser };
