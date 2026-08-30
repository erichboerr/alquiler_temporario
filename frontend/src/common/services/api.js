import axios from 'axios';

// Instancia principal de axios para toda la app.
// La baseURL se lee del .env — nunca hardcodeada acá.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Las fotos se sirven como estáticas en /uploads (fuera de /api),
// así que armamos la base sacando el sufijo "/api" de VITE_API_URL.
// Ej: "http://localhost:4000/api" → "http://localhost:4000"
const SERVER_BASE_URL = API_URL.replace(/\/api\/?$/, '');

// urlRelativa viene del backend como "/uploads/propiedad/xxx.jpg"
export const getFotoUrl = (urlRelativa) => `${SERVER_BASE_URL}${urlRelativa}`;

// Interceptor de request: adjunta el token JWT en cada llamada automáticamente.
// Si el token no existe, la request sale igual (el backend responderá 401 o 403).
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Configura los interceptores de respuesta.
//
// IMPORTANTE: devuelve una función de cleanup que eyecta los interceptores.
// El useEffect en App.jsx la llama en su return para evitar acumulación:
//
//   useEffect(() => {
//     const eject = setupInterceptors(addToast, logout);
//     return () => eject(); // ← limpia antes de re-ejecutar o desmontar
//   }, [addToast, logout]);
//
// Sin esto, cada vez que logout o addToast cambian se agrega un interceptor
// nuevo sin eliminar el anterior → múltiples respuestas al mismo error.
export const setupInterceptors = (addToast, logout) => {
    const interceptorId = api.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response?.status;
            const message = error.response?.data?.message || 'Error inesperado en el servidor';

            if (status === 401) {
                // Solo avisamos si no estamos en /login — ahí el error lo muestra el form
                if (!window.location.pathname.includes('/login')) {
                    addToast('Sesión expirada. Por favor, reingresá.', 'error');
                }
                logout();
            } else if (status === 403) {
                addToast('No tenés permisos para esta acción.', 'warning');
            } else if (status === 429) {
                // Rate limit del backend — demasiados intentos de login
                addToast('Demasiados intentos. Esperá unos minutos.', 'warning');
            } else if (status >= 500) {
                addToast('Error interno del servidor.', 'error');
            } else if (status === 400) {
                addToast(message, 'warning');
            }

            return Promise.reject(error);
        }
    );

    // Devolvemos la función de cleanup: eyecta este interceptor específico por su ID
    return () => api.interceptors.response.eject(interceptorId);
};

export default api;