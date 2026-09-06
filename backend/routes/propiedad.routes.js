import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { uploadFoto } from '../middlewares/upload.middleware.js';
import {
    getPropiedad,
    updatePropiedad,
    addFoto,
    deleteFoto,
    reordenarFotos,
    marcarFotoPortada,
    getCaracteristicas,
    addCaracteristica,
    updateCaracteristica,
    reordenarCaracteristicas,
    deleteCaracteristica,
    getTemporadas,
    getTemporada,
    addTemporada,
    activarTemporada,
    deleteTemporada,
    addMes,
    updateMes,
    deleteMes,
    addPeriodo,
    updatePeriodo,
    deletePeriodo,
} from '../controllers/propiedad.controller.js';

const router = Router();

// --- Pública (landing) ---
// GET /api/propiedad — trae propiedad + fotos ordenadas + meses/períodos de la temporada activa
router.get('/', getPropiedad);

// --- Protegidas (panel admin) — todas pasan por verifyToken primero ---

// Datos generales
router.put('/', verifyToken, updatePropiedad);

// Fotos
router.post('/fotos', verifyToken, uploadFoto.single('foto'), addFoto);
router.put('/fotos/orden', verifyToken, reordenarFotos);
router.put('/fotos/:id/portada', verifyToken, marcarFotoPortada);
router.delete('/fotos/:id', verifyToken, deleteFoto);

// Características (van antes de /caracteristicas/:id para que "orden" no se confunda con un id)
router.get('/caracteristicas', verifyToken, getCaracteristicas);
router.post('/caracteristicas', verifyToken, addCaracteristica);
router.put('/caracteristicas/orden', verifyToken, reordenarCaracteristicas);
router.put('/caracteristicas/:id', verifyToken, updateCaracteristica);
router.delete('/caracteristicas/:id', verifyToken, deleteCaracteristica);

// Temporadas (van antes de /meses/:mesId/periodos para que Express no confunda las rutas)
router.get('/temporadas', verifyToken, getTemporadas);
router.get('/temporadas/:id', verifyToken, getTemporada);
router.post('/temporadas', verifyToken, addTemporada);
router.put('/temporadas/:id/activar', verifyToken, activarTemporada);
router.delete('/temporadas/:id', verifyToken, deleteTemporada);

// Tarjetas de mes (cuelgan de una temporada)
router.post('/temporadas/:temporadaId/meses', verifyToken, addMes);
router.put('/meses/:id', verifyToken, updateMes);
router.delete('/meses/:id', verifyToken, deleteMes);

// Períodos (renglones dentro de una tarjeta de mes)
router.post('/meses/:mesId/periodos', verifyToken, addPeriodo);
router.put('/periodos/:id', verifyToken, updatePeriodo);
router.delete('/periodos/:id', verifyToken, deletePeriodo);

export default router;
