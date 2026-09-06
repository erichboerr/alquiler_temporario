import api from './api';

// --- Pública ---

// Trae todo lo que necesita la landing en una sola llamada:
// { propiedad, fotos, meses: [{ ...mes, periodos: [...] }] } de la temporada ACTIVA
export const getPropiedadPublica = () => api.get('/propiedad').then((res) => res.data);

// --- Admin (requieren sesión — el interceptor de api.js ya adjunta el token) ---

export const updatePropiedad = (data) => api.put('/propiedad', data).then((res) => res.data);

// FormData con un campo "foto" (archivo)
export const subirFoto = (formData) =>
    api.post('/propiedad/fotos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);

export const eliminarFoto = (id) => api.delete(`/propiedad/fotos/${id}`).then((res) => res.data);

// ordenNuevo: [{ id, orden }, ...]
export const reordenarFotos = (ordenNuevo) =>
    api.put('/propiedad/fotos/orden', ordenNuevo).then((res) => res.data);

// Marca una foto ya existente como portada (orden 0), sin borrar ninguna
export const marcarFotoPortada = (id) => api.put(`/propiedad/fotos/${id}/portada`).then((res) => res.data);

// --- Características ---

export const getCaracteristicas = () => api.get('/propiedad/caracteristicas').then((res) => res.data);
export const crearCaracteristica = (descripcion) =>
    api.post('/propiedad/caracteristicas', { descripcion }).then((res) => res.data);
export const actualizarCaracteristica = (id, data) =>
    api.put(`/propiedad/caracteristicas/${id}`, data).then((res) => res.data);
// ordenNuevo: [{ id, orden }, ...]
export const reordenarCaracteristicas = (ordenNuevo) =>
    api.put('/propiedad/caracteristicas/orden', ordenNuevo).then((res) => res.data);
export const eliminarCaracteristica = (id) =>
    api.delete(`/propiedad/caracteristicas/${id}`).then((res) => res.data);

// --- Temporadas ---

export const getTemporadas = () => api.get('/propiedad/temporadas').then((res) => res.data);

// Trae la temporada puntual con sus meses y períodos — precarga de la plantilla admin
export const getTemporada = (id) => api.get(`/propiedad/temporadas/${id}`).then((res) => res.data);

export const crearTemporada = (etiqueta) =>
    api.post('/propiedad/temporadas', { etiqueta }).then((res) => res.data);

export const activarTemporada = (id) =>
    api.put(`/propiedad/temporadas/${id}/activar`).then((res) => res.data);

export const eliminarTemporada = (id) =>
    api.delete(`/propiedad/temporadas/${id}`).then((res) => res.data);

// --- Meses (dentro de una temporada) ---

export const crearMes = (temporadaId, data) =>
    api.post(`/propiedad/temporadas/${temporadaId}/meses`, data).then((res) => res.data);
export const actualizarMes = (id, data) => api.put(`/propiedad/meses/${id}`, data).then((res) => res.data);
export const eliminarMes = (id) => api.delete(`/propiedad/meses/${id}`).then((res) => res.data);

// --- Períodos (dentro de un mes) ---

export const crearPeriodo = (mesId, data) =>
    api.post(`/propiedad/meses/${mesId}/periodos`, data).then((res) => res.data);
export const actualizarPeriodo = (id, data) => api.put(`/propiedad/periodos/${id}`, data).then((res) => res.data);
export const eliminarPeriodo = (id) => api.delete(`/propiedad/periodos/${id}`).then((res) => res.data);
