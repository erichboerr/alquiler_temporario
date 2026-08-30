# 🖥️ Sistema de Autenticación — Frontend

Frontend de autenticación listo para usar como base en nuevos proyectos.  
Construido con **React 19**, **Vite**, **Tailwind CSS** y **React Router**.

---

## 📋 Tabla de contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y primer arranque](#-instalación-y-primer-arranque)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts disponibles](#-scripts-disponibles)
- [Arquitectura de estado](#-arquitectura-de-estado)
- [Cómo agregar páginas nuevas](#-cómo-agregar-páginas-nuevas)
- [Cómo usar los Toasts](#-cómo-usar-los-toasts)
- [Protección de rutas por rol](#-protección-de-rutas-por-rol)
- [Despliegue en producción](#-despliegue-en-producción)

---

## ✅ Características

- Login con JWT — token guardado en sessionStorage
- Verificación automática de sesión al recargar la página
- Loader de pantalla completa mientras verifica la sesión (sin flash de login)
- Interceptores de Axios centralizados con cleanup (sin acumulación de listeners)
- Sistema de notificaciones Toast global (success, error, warning, info)
- Rutas protegidas por autenticación y por rol
- Sidebar colapsable con soporte para grupos de navegación
- Layout responsivo con header y sidebar fijos
- Variables de entorno por ambiente (dev / prod)
- Proxy de desarrollo hacia el backend (sin problemas de CORS en dev)
- Landing pública (`/`) para el alquiler temporario: hero, características, galería de fotos en acordeón y tarjetas de disponibilidad por mes con contacto directo por WhatsApp

---

## 🛠 Tecnologías

| Paquete | Uso |
|---|---|
| react | UI declarativa con hooks |
| react-dom | Renderizado en el navegador |
| react-router-dom | Navegación y rutas protegidas |
| axios | Cliente HTTP con interceptores centralizados |
| lucide-react | Íconos SVG consistentes |
| react-icons | Íconos complementarios (FA, etc.) |
| tailwindcss | Estilos utilitarios |
| vite | Build tool y servidor de desarrollo |

---

## 📁 Estructura del proyecto

```
frontend/
├── public/
│   └── favicon.png
│
├── src/
│   ├── common/                      # Todo lo compartido entre páginas
│   │   ├── components/
│   │   │   ├── MainLayout.jsx       # Layout principal: sidebar + header + outlet
│   │   │   ├── NavItem.jsx          # Componente NavGroup para submenús colapsables
│   │   │   ├── ProtectedRoute.jsx   # Guarda de ruta: verifica auth y rol
│   │   │   ├── Sidebar.jsx          # Barra lateral fija con navegación
│   │   │   └── ToastItem.jsx        # Ítem individual de notificación
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.js       # Contexto de autenticación (createContext)
│   │   │   ├── AuthProvider.jsx     # Estado global de sesión: user, login, logout
│   │   │   ├── ToastContext.js      # Contexto de toasts (createContext)
│   │   │   └── ToastProvider.jsx    # Estado global de notificaciones
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js           # Hook para consumir AuthContext
│   │   │   └── useToast.js          # Hook para consumir ToastContext
│   │   │
│   │   ├── services/
│   │   │   ├── api.js               # Instancia de Axios + interceptores + getFotoUrl()
│   │   │   └── propiedad.service.js # Llamadas a /api/propiedad (pública + admin)
│   │   │
│   │   └── utils/
│   │       └── format.js            # formatPrecio, formatRangoFechas (usados en la landing)
│   │
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx        # Página de inicio post-login
│   │   ├── Login/
│   │   │   ├── Login.jsx            # UI del formulario de login
│   │   │   └── hooks/
│   │   │       └── useLoginForm.js  # Lógica del formulario (submit, estado)
│   │   └── Publica/                 # Landing pública — sin login, ruta "/"
│   │       ├── Landing.jsx          # Página: fetch a /api/propiedad y composición de secciones
│   │       └── components/
│   │           ├── PropiedadHero.jsx         # Foto de portada + nombre/dirección + chips
│   │           ├── PropiedadCaracteristicas.jsx # Descripción + lista de características
│   │           ├── GaleriaAcordeon.jsx       # Panel colapsable con la galería de fotos
│   │           ├── MesesDisponibilidad.jsx   # Grilla de tarjetas de mes (períodos + precio)
│   │           └── WhatsappButton.jsx        # Botón reutilizable, arma el link wa.me
│   │
│   ├── App.jsx                      # Rutas, providers y setup de interceptores
│   ├── main.jsx                     # Punto de entrada de React
│   └── index.css                    # Estilos globales + directivas de Tailwind
│
├── .env                             # Variables locales (NO se commitea)
├── .env.example                     # Template sin credenciales (sí se commitea)
├── .env.production                  # Variables de producción (NO se commitea)
├── vite.config.js                   # Configuración de Vite + proxy de desarrollo
├── tailwind.config.js               # Configuración de Tailwind
└── package.json
```

---

## 📦 Requisitos previos

- Node.js v18 o superior
- npm v9 o superior
- El backend corriendo en http://localhost:4000 (ver README del backend)

---

## 🚀 Instalación y primer arranque

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editá .env con los valores de tu entorno:

```
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=Mi App
```

### 3. Levantar en modo desarrollo

```bash
npm run dev
```

El frontend queda disponible en http://localhost:5173.
Las llamadas a /api se redirigen automáticamente al backend via proxy (sin CORS).

### 4. Credenciales del usuario inicial

```
Usuario:    root
Contraseña: Root123
```

> Estas credenciales las crea el seeder del backend. Ver README del backend.

---

## 🔑 Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| VITE_API_URL | Sí | URL base del backend. En dev: http://localhost:4000/api |
| VITE_APP_NAME | Sí | Nombre de la app — aparece en el login y en el sidebar |

> En Vite, solo las variables que empiezan con VITE_ son accesibles desde el código (import.meta.env.VITE_*). El resto queda invisible por seguridad.

---

## 📜 Scripts disponibles

```bash
npm run dev      # Levanta el servidor de desarrollo con HMR
npm run build    # Genera el bundle de producción en /dist
npm run preview  # Previsualiza el build de producción localmente
npm run lint     # Corre ESLint sobre todo el proyecto
```

---

## 🏗 Arquitectura de estado

El estado global se maneja con React Context dividido en dos providers independientes:

```
<BrowserRouter>
  <ToastProvider>       — notificaciones globales (funciona aunque falle el auth)
    <AuthProvider>      — sesión del usuario (verifica token al montar)
      <AppContent />    — rutas + interceptores de Axios
    </AuthProvider>
  </ToastProvider>
</BrowserRouter>
```

### AuthProvider

Al montar, verifica automáticamente si hay un token en sessionStorage y lo valida
contra el backend (GET /api/auth/verify). Mientras verifica muestra un loader.

Expone via useAuth():

```js
const { user, login, logout, loading } = useAuth();
// user    — { id, user, rol } | null
// login   — async (user, password) guarda token y actualiza estado
// logout  — limpia sessionStorage y resetea estado
// loading — true mientras verifica la sesión inicial
```

### ToastProvider

Sistema de notificaciones apilables con auto-cierre a los 5 segundos.
Expone via useToast():

```js
const { addToast } = useToast();

addToast('Operación exitosa', 'success');
addToast('No tenés permisos', 'warning');
addToast('Error del servidor', 'error');
addToast('Información importante', 'info');
```

### Interceptores de Axios

Configurados en App.jsx con cleanup automático para evitar acumulación:

```js
useEffect(() => {
    const eject = setupInterceptors(addToast, logout);
    return () => eject(); // limpia antes de re-ejecutar o desmontar
}, [addToast, logout]);
```

Respuestas manejadas automáticamente:

| Status | Acción |
|---|---|
| 401 | Toast de sesión expirada + logout() (excepto en /login) |
| 403 | Toast de sin permisos |
| 429 | Toast de demasiados intentos |
| 500+ | Toast de error del servidor |
| 400 | Toast con el mensaje del backend |

---

## ➕ Cómo agregar páginas nuevas

### 1. Crear la página

```
src/pages/Usuarios/
  Usuarios.jsx
  hooks/
    useUsuarios.js
```

### 2. Agregar la ruta en App.jsx

```jsx
import Usuarios from './pages/Usuarios/Usuarios';

// Dentro de <Route element={<MainLayout />}>:
<Route path="/usuarios" element={<Usuarios />} />
```

### 3. Agregar el link en Sidebar.jsx

```jsx
import { Users } from 'lucide-react';

<Link to="/usuarios" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
    <Users size={20} className="shrink-0" />
    {!isCollapsed && <span>Usuarios</span>}
</Link>
```

---

## 🔔 Cómo usar los Toasts

Desde cualquier componente dentro de ToastProvider:

```jsx
import { useToast } from '../common/hooks/useToast';

const MiComponente = () => {
    const { addToast } = useToast();

    const handleGuardar = async () => {
        try {
            await api.post('/recursos', datos);
            addToast('Guardado correctamente', 'success');
        } catch {
            // Los errores de red (401, 500, etc.) ya los maneja el interceptor
            // Solo agregás toasts para errores de negocio específicos
            addToast('El nombre ya está en uso', 'warning');
        }
    };
};
```

---

## 🛡 Protección de rutas por rol

ProtectedRoute acepta allowedRoles con los roles que pueden acceder:

```jsx
// Solo Root puede entrar a /admin
<Route element={<ProtectedRoute allowedRoles={['Root']} />}>
    <Route element={<MainLayout />}>
        <Route path="/admin" element={<Admin />} />
    </Route>
</Route>

// Cualquier usuario autenticado (sin allowedRoles)
<Route element={<ProtectedRoute />}>
    <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
    </Route>
</Route>
```

Si el usuario no tiene el rol requerido, es redirigido a /dashboard.

> La protección por rol en el frontend es solo UX. La autorización real debe
> estar en el backend con el middleware authorize() por ruta.

---

## 🏖 Landing pública (`/`)

Página de una sola vista, sin login, en `src/pages/Publica/Landing.jsx`. Trae todo con una sola llamada a `GET /api/propiedad` y arma las secciones:

1. **`PropiedadHero`** — foto de portada (la primera del array `fotos`), nombre, dirección y chips de habitaciones/baños. Si todavía no hay fotos cargadas, muestra un degradé en vez de un espacio vacío.
2. **`PropiedadCaracteristicas`** — descripción libre + lista de características (`propiedad.caracteristicas`, array de strings que carga el admin).
3. **`GaleriaAcordeon`** — panel colapsable (abierto por defecto) con la grilla de fotos en el orden que definió el admin.
4. **`MesesDisponibilidad`** — una tarjeta por cada `mes` devuelto por el backend, con sus `periodos` (fecha + precio, o "No disponible"), y un botón de WhatsApp al pie que arma el link `wa.me` con `propiedad.whatsappNumero` y un mensaje que incluye el título del mes.

Cada sección se auto-oculta u ofrece un placeholder razonable si todavía no hay datos cargados (propiedad recién creada) — no hace falta "poblar" nada a mano antes de mostrarla.

**Fotos:** el backend las sirve como estáticas fuera de `/api` (`/uploads/propiedad/...`). `getFotoUrl()` en `api.js` arma la URL absoluta a partir de `VITE_API_URL` sacándole el sufijo `/api`.

**Diseño:** paleta e identidad propia definida en `index.css` con `@theme` de Tailwind v4 — tokens `landing-arena`, `landing-marino`, `landing-marea`, tipografías Fraunces (display) + Inter (texto). No usa los mismos tokens que el panel admin a propósito, son públicos con distinta audiencia.

> Pendiente: el panel admin para editar la propiedad/fotos/meses/períodos desde `/admin` todavía no está armado — por ahora esos datos se cargan a través de la API directamente.

---

## 🖥 Despliegue en producción

### 1. Configurar variables de producción

Editá .env.production con los valores reales del servidor:

```
VITE_API_URL=https://tudominio.com/api
VITE_APP_NAME=Mi App
```

### 2. Generar el build

```bash
npm run build
```

Genera la carpeta /dist con los archivos estáticos listos para servir.

### 3. Configurar Nginx

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/mi-app/dist;
    index index.html;

    # React Router — redirige todo al index.html para que maneje las rutas
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy al backend para las llamadas a /api
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> En producción el proxy de Vite no aplica — Nginx se encarga de redirigir /api al backend.
