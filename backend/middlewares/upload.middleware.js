import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Carpeta donde se guardan las fotos de la propiedad.
// Se sirve como estática desde app.js en la ruta pública /uploads.
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'propiedad');

// La creamos si no existe (por ejemplo, en un deploy nuevo antes del primer upload)
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Nombre único para evitar pisar archivos si suben dos fotos con el mismo nombre original
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${extension}`);
    },
});

// Solo permitimos imágenes, y limitamos el tamaño para no llenar el disco del servidor
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.mimetype)) {
        return cb(new Error('Formato de imagen no permitido. Usá JPG, PNG o WEBP.'));
    }
    cb(null, true);
};

export const uploadFoto = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por foto
});
