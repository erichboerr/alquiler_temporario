import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { uploadFoto } from '../middlewares/upload.middleware.js';
import {
    getPropiedad,
    updatePropiedad,
    addFoto,
    deleteFoto,
    reordenarFotos,
    addMes,
    updateMes,
    deleteMes,
    addPeriodo,
    updatePeriodo,
    deletePeriodo,
} from '../controllers/propiedad.controller.js';

const router = Router();

// --- Pública (landing) ---
// GET /api/propiedad — trae propiedad + fotos ordenadas + meses con sus períodos
router.get('/', getPropiedad);

// --- Protegidas (panel admin) — todas pasan por verifyToken primero ---

// Datos generales
router.put('/', verifyToken, updatePropiedad);

// Fotos
router.post('/fotos', verifyToken, uploadFoto.single('foto'), addFoto);
router.put('/fotos/orden', verifyToken, reordenarFotos);
router.delete('/fotos/:id', verifyToken, deleteFoto);

// Tarjetas de mes
router.post('/meses', verifyToken, addMes);
router.put('/meses/:id', verifyToken, updateMes);
router.delete('/meses/:id', verifyToken, deleteMes);

// Períodos (renglones dentro de una tarjeta de mes)
router.post('/meses/:mesId/periodos', verifyToken, addPeriodo);
router.put('/periodos/:id', verifyToken, updatePeriodo);
router.delete('/periodos/:id', verifyToken, deletePeriodo);

export default router;
