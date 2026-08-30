import propiedadService from '../services/propiedad.service.js';

// GET /api/propiedad — público, trae todo lo que necesita la landing
export const getPropiedad = async (req, res, next) => {
    try {
        const data = await propiedadService.getPropiedadCompleta();
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// PUT /api/propiedad — protegido, actualiza los datos generales
export const updatePropiedad = async (req, res, next) => {
    try {
        const propiedad = await propiedadService.actualizarPropiedad(req.body || {});
        return res.status(200).json(propiedad);
    } catch (error) {
        next(error);
    }
};

// --- Fotos ---

// POST /api/propiedad/fotos — protegido, sube una foto (multipart/form-data, campo "foto")
export const addFoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se recibió ningún archivo' });
        }
        // Ruta relativa que se guarda en la DB y se sirve como estática
        const urlRelativa = `/uploads/propiedad/${req.file.filename}`;
        const foto = await propiedadService.agregarFoto(urlRelativa);
        return res.status(201).json(foto);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/propiedad/fotos/:id — protegido
export const deleteFoto = async (req, res, next) => {
    try {
        const resultado = await propiedadService.eliminarFoto(req.params.id);
        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// PUT /api/propiedad/fotos/orden — protegido, body: [{ id, orden }, ...]
export const reordenarFotos = async (req, res, next) => {
    try {
        const fotos = await propiedadService.reordenarFotos(req.body || []);
        return res.status(200).json(fotos);
    } catch (error) {
        next(error);
    }
};

// --- Tarjetas de mes ---

// POST /api/propiedad/meses — protegido
export const addMes = async (req, res, next) => {
    try {
        const mes = await propiedadService.crearMes(req.body || {});
        return res.status(201).json(mes);
    } catch (error) {
        next(error);
    }
};

// PUT /api/propiedad/meses/:id — protegido
export const updateMes = async (req, res, next) => {
    try {
        const mes = await propiedadService.actualizarMes(req.params.id, req.body || {});
        return res.status(200).json(mes);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/propiedad/meses/:id — protegido
export const deleteMes = async (req, res, next) => {
    try {
        const resultado = await propiedadService.eliminarMes(req.params.id);
        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// --- Períodos ---

// POST /api/propiedad/meses/:mesId/periodos — protegido
export const addPeriodo = async (req, res, next) => {
    try {
        const periodo = await propiedadService.crearPeriodo(req.params.mesId, req.body || {});
        return res.status(201).json(periodo);
    } catch (error) {
        next(error);
    }
};

// PUT /api/propiedad/periodos/:id — protegido
export const updatePeriodo = async (req, res, next) => {
    try {
        const periodo = await propiedadService.actualizarPeriodo(req.params.id, req.body || {});
        return res.status(200).json(periodo);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/propiedad/periodos/:id — protegido
export const deletePeriodo = async (req, res, next) => {
    try {
        const resultado = await propiedadService.eliminarPeriodo(req.params.id);
        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};
