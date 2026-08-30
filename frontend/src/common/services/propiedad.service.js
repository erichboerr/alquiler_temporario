import api from './api';

// --- Pública ---

// Trae todo lo que necesita la landing en una sola llamada:
// { propiedad, fotos, meses: [{ ...mes, periodos: [...] }] }
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

export const crearMes = (data) => api.post('/propiedad/meses', data).then((res) => res.data);
export const actualizarMes = (id, data) => api.put(`/propiedad/meses/${id}`, data).then((res) => res.data);
export const eliminarMes = (id) => api.delete(`/propiedad/meses/${id}`).then((res) => res.data);

export const crearPeriodo = (mesId, data) =>
    api.post(`/propiedad/meses/${mesId}/periodos`, data).then((res) => res.data);
export const actualizarPeriodo = (id, data) => api.put(`/propiedad/periodos/${id}`, data).then((res) => res.data);
export const eliminarPeriodo = (id) => api.delete(`/propiedad/periodos/${id}`).then((res) => res.data);
