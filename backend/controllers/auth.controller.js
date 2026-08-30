import authService from '../services/auth.service.js';

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        // req.body puede llegar undefined si el request no mandó
        // Content-Type: application/json (ej: Postman con "Text" en vez de "JSON",
        // o un body vacío). El "|| {}" evita que esto reviente con un 500 feo
        // y lo baja a la validación de abajo, que ya responde 400 con mensaje claro.
        const { user, password } = req.body || {};

        // Validación básica de campos requeridos
        // El service maneja el resto de la lógica de negocio
        if (!user || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
        }

        const result = await authService.login(user, password);

        return res.status(200).json({
            message: 'Login exitoso',
            ...result // Incluye: token y user { id, user, rol }
        });

    } catch (error) {
        // No manejamos el error acá — se lo pasamos al errorHandler centralizado
        // (definido en app.js como último middleware)
        // Él decide el status code y el formato de respuesta según error.isCustom
        next(error);
    }
};

// GET /api/auth/verify
export const verify = async (req, res, next) => {
    try {
        // req.user viene cargado por el middleware verifyToken
        // Solo buscamos los datos frescos del usuario en la DB
        const userData = await authService.verifyUser(req.user.id);
        return res.status(200).json(userData);

    } catch (error) {
        next(error);
    }
};