import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // 1. Obtener el token del header
    const authHeader = req.headers['authorization'];
    
    // El formato suele ser "Bearer TOKEN", así que separamos por espacio
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "No se proporcionó un token" });
    }

    try {
        // 2. Verificar el token con la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Guardar los datos del usuario en el objeto request (req)
        // Esto permite que el siguiente controlador sepa quién es el usuario
        req.user = decoded;

        // 4. Continuar al siguiente paso (el controlador)
        next();
    } catch (error) {
        console.error(error);
        // Si el token expiró o es inválido, devolvemos 401
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};