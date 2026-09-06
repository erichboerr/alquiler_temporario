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

// PUT /api/propiedad/fotos/:id/portada — protegido, marca esa foto como portada (orden 0)
export const marcarFotoPortada = async (req, res, next) => {
    try {
        const fotos = await propiedadService.marcarFotoPortada(req.params.id);
        return res.status(200).json(fotos);
    } catch (error) {
        next(error);
    }
};

// --- Características ---

// GET /api/propiedad/caracteristicas — protegido
export const getCaracteristicas = async (req, res, next) => {
    try {
        const caracteristicas = await propiedadService.listarCaracteristicas();
        return res.status(200).json(caracteristicas);
    } catch (error) {
        next(error);
    }
};

// POST /api/propiedad/caracteristicas — protegido, body: { descripcion }
export const addCaracteristica = async (req, res, next) => {
    try {
        const caracteristica = await propiedadService.crearCaracteristica(req.body || {});
        return res.status(201).json(caracteristica);
    } catch (error) {
        next(error);
    }
};

// PUT /api/propiedad/caracteristicas/:id — protegido, body: { descripcion?, orden? }
export const updateCaracteristica = async (req, res, next) => {
    try {
        const caracteristica = await propiedadService.actualizarCaracteristica(req.params.id, req.body || {});
        return res.status(200).json(caracteristica);
    } catch (error) {
        next(error);
    }
};

// PUT /api/propiedad/caracteristicas/orden — protegido, body: [{ id, orden }, ...]
export const reordenarCaracteristicas = async (req, res, next) => {
    try {
        const caracteristicas = await propiedadService.reordenarCaracteristicas(req.body || []);
        return res.status(200).json(caracteristicas);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/propiedad/caracteristicas/:id — protegido
export const deleteCaracteristica = async (req, res, next) => {
    try {
        const resultado = await propiedadService.eliminarCaracteristica(req.params.id);
        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// --- Temporadas ---

// GET /api/propiedad/temporadas — protegido, lista para el selector del admin
export const getTemporadas = async (req, res, next) => {
    try {
        const temporadas = await propiedadService.listarTemporadas();
        return res.status(200).json(temporadas);
    } catch (error) {
        next(error);
    }
};

// GET /api/propiedad/temporadas/:id — protegido, trae la temporada con meses/períodos
// para precargar la plantilla del admin al seleccionarla
export const getTemporada = async (req, res, next) => {
    try {
        const temporada = await propiedadService.getTemporadaConDetalle(req.params.id);
        return res.status(200).json(temporada);
    } catch (error) {
        next(error);
    }
};

// POST /api/propiedad/temporadas — protegido, body: { etiqueta }
export const addTemporada = async (req, res, next) => {
    try {
        const temporada = await propiedadService.crearTemporada(req.body || {});
        return res.status(201).json(temporada);
    } catch (error) {
        next(error);
    }
};

// PUT /api/propiedad/temporadas/:id/activar — protegido
export const activarTemporada = async (req, res, next) => {
    try {
        const temporada = await propiedadService.activarTemporada(req.params.id);
        return res.status(200).json(temporada);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/propiedad/temporadas/:id — protegido
export const deleteTemporada = async (req, res, next) => {
    try {
        const resultado = await propiedadService.eliminarTemporada(req.params.id);
        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// --- Tarjetas de mes ---

// POST /api/propiedad/temporadas/:temporadaId/meses — protegido
export const addMes = async (req, res, next) => {
    try {
        const mes = await propiedadService.crearMes(req.params.temporadaId, req.body || {});
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
