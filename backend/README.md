# 🔐 Sistema de Autenticación — Backend

Backend de autenticación seguro listo para usar como base en nuevos proyectos.  
Construido con **Node.js**, **Express**, **Sequelize** y **PostgreSQL**.

---

## 📋 Tabla de contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y primer arranque](#-instalación-y-primer-arranque)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts disponibles](#-scripts-disponibles)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Flujo de autenticación](#-flujo-de-autenticación)
- [Cómo agregar rutas nuevas](#-cómo-agregar-rutas-nuevas)
- [Seguridad implementada](#-seguridad-implementada)
- [Despliegue en producción](#-despliegue-en-producción)

---

## ✅ Características

- Login con JWT (JSON Web Token)
- Verificación de sesión al recargar el frontend
- Roles de usuario (`Root`, `Administrador`)
- Baja lógica de usuarios (`paranoid`) y flag de habilitación
- Protección contra fuerza bruta (rate limiting)
- Manejo centralizado de errores
- Logging de auditoría (Winston) — registra logins exitosos y fallidos
- Carga automática de rutas con `glob` — sin tocar `app.js` al agregar rutas
- Configuración por ambiente (`dotenv-flow`)

---

## 🛠 Tecnologías

| Paquete | Uso |
|---|---|
| `express` | Framework HTTP |
| `sequelize` | ORM para PostgreSQL |
| `pg` | Driver de PostgreSQL |
| `jsonwebtoken` | Generación y verificación de JWT |
| `bcryptjs` | Hash de contraseñas |
| `helmet` | Headers de seguridad HTTP |
| `cors` | Control de orígenes permitidos |
| `express-rate-limit` | Límite de intentos de login |
| `morgan` | Logging de requests HTTP |
| `winston` | Logging de auditoría y errores |
| `dotenv-flow` | Variables de entorno por ambiente |
| `glob` | Carga dinámica de archivos de rutas |
| `uuid` | Generación de IDs únicos (disponible para uso futuro) |
| `multer` | Manejo de subida de archivos (fotos de la propiedad) |

---

## 📁 Estructura del proyecto

```
backend/
├── config/
│   ├── db.js              # Instancia de Sequelize (conexión a la DB)
│   ├── config.cjs         # Configuración para sequelize-cli (migraciones)
│   └── setup.js           # Crea la base de datos si no existe al arrancar
│
├── controllers/
│   ├── auth.controller.js      # Recibe la request, llama al service, responde
│   └── propiedad.controller.js # Propiedad, fotos, meses y períodos
│
├── middlewares/
│   ├── auth.middleware.js  # Verifica y decodifica el JWT en cada request
│   ├── errorHandler.js     # Manejo centralizado de errores (último en app.js)
│   ├── rateLimiter.js      # Limita intentos de login por IP
│   └── upload.middleware.js # multer — subida de fotos a /uploads/propiedad
│
├── migrations/
│   ├── 1-create-Rol.cjs      # Crea la tabla roles
│   ├── 2-create-Usuario.cjs  # Crea la tabla usuarios
│   ├── 3-create-Propiedad.cjs # Crea la tabla propiedades
│   ├── 4-create-Foto.cjs      # Crea la tabla fotos
│   ├── 5-create-MesCard.cjs   # Crea la tabla meses (tarjetas de mes)
│   └── 6-create-Periodo.cjs   # Crea la tabla periodos
│
├── models/
│   ├── index.js           # Carga todos los modelos dinámicamente
│   ├── Rol.js              # Modelo Rol
│   ├── Usuario.js          # Modelo Usuario (con hooks de bcrypt)
│   ├── Propiedad.js        # Modelo Propiedad (datos generales, una sola fila)
│   ├── Foto.js              # Modelo Foto (galería, con orden)
│   ├── MesCard.js           # Modelo tarjeta de mes
│   └── Periodo.js           # Modelo período (fecha desde/hasta + precio)
│
├── routes/
│   ├── auth.routes.js       # Define las rutas de /api/auth
│   └── propiedad.routes.js  # Define las rutas de /api/propiedad
│
├── seeders/
│   └── initial-rol-user.cjs # Datos iniciales: roles + usuario Root
│
├── services/
│   ├── auth.service.js      # Lógica de negocio: login, verificación
│   └── propiedad.service.js # Lógica de negocio: propiedad, fotos, meses, períodos
│
├── utils/
│   ├── createError.js     # Crea errores tipados con httpStatus y code
│   ├── logger.js          # Configuración de Winston
│   └── normalize.js       # Normaliza el username (trim + lowercase)
│
├── logs/
│   └── combined.log       # Log generado en runtime (ignorado por git)
│
├── app.js                 # Configura Express, middlewares y carga de rutas
├── server.js              # Punto de entrada: conecta DB y levanta el servidor
├── .env                   # Variables locales (NO se commitea)
├── .env.example           # Template de variables sin credenciales (sí se commitea)
├── .env.production        # Variables de producción (NO se commitea)
└── .sequelizerc           # Le indica a sequelize-cli dónde están las carpetas
```

---

## 📦 Requisitos previos

- Node.js v18 o superior
- PostgreSQL v14 o superior
- npm v9 o superior

---

## 🚀 Instalación y primer arranque

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tuusuario/sistema-auth.git
cd sistema-auth/backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editá `.env` con tus datos reales. Como mínimo:

```
DB_NAME=auth_db
DB_USER=postgres
DB_PASS=tu_password
JWT_SECRET=    ← generalo con: openssl rand -hex 64
CORS_ORIGIN=http://localhost:5173
```

### 3. Opción A — Arranque rápido (dev local con DB_SYNC)

Activá `DB_SYNC` y `DB_SEED` en tu `.env`:

```
DB_SYNC=true
```

Esto crea las tablas y los datos iniciales automáticamente al arrancar.

```bash
npm run dev
```

> ⚠️ Una vez que arrancó correctamente, volvé a poner `DB_SYNC=false` y `DB_SEED=false`.  
> No dejes `DB_SYNC=true` corriendo — puede alterar columnas en cada reinicio.

### 4. Opción B — Arranque con migraciones (recomendado)

```bash
# Crear las tablas
npm run migrate

# Cargar roles y usuario inicial
npm run seed

# Levantar el servidor
npm run dev
```

### 5. Credenciales del usuario inicial

```
Usuario:    root
Contraseña: Root123
```

> ⚠️ Cambiá esta contraseña apenas inicies sesión por primera vez.

---

## 🔑 Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `NODE_ENV` | ✅ | `development` o `production` |
| `PORT` | ✅ | Puerto del servidor (default: 4000) |
| `DB_NAME` | ✅ | Nombre de la base de datos |
| `DB_USER` | ✅ | Usuario de PostgreSQL |
| `DB_PASS` | ✅ | Contraseña de PostgreSQL |
| `DB_HOST` | ✅ | Host de PostgreSQL (default: localhost) |
| `DB_PORT` | ✅ | Puerto de PostgreSQL (default: 5432) |
| `JWT_SECRET` | ✅ | Clave secreta para firmar tokens. Generar con `openssl rand -hex 64` |
| `CORS_ORIGIN` | ✅ | Origen(es) permitidos. Separados por coma si son varios |
| `DB_SYNC` | ❌ | `true` solo en dev local para crear/alterar tablas automáticamente |
| `DB_SEED` | ❌ | `true` solo en el primer arranque para crear roles y usuario Root |

---

## 📜 Scripts disponibles

```bash
npm run dev      # Levanta el servidor en modo desarrollo con nodemon
npm run start    # Levanta el servidor en modo producción
npm run migrate  # Ejecuta las migraciones pendientes (usa cross-env NODE_ENV=development)
npm run seed     # Ejecuta los seeders (datos iniciales, usa cross-env NODE_ENV=development)
```

---

## 🌐 Endpoints de la API

### `POST /api/auth/login`

Autentica un usuario y devuelve un JWT.

**Body:**
```json
{
  "user": "root",
  "password": "Root123"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "user": "root",
    "rol": "Root"
  }
}
```

**Errores posibles:**

| Código | Causa |
|---|---|
| `400` | Faltan campos requeridos |
| `401` | Usuario o contraseña incorrectos |
| `403` | Cuenta deshabilitada |
| `429` | Demasiados intentos (rate limit) |

---

### `GET /api/auth/verify`

Verifica que el JWT sigue siendo válido y devuelve los datos actualizados del usuario.  
Se usa al recargar el frontend para restaurar la sesión.

**Header requerido:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "user": "root",
  "rol": "Root"
}
```

**Errores posibles:**

| Código | Causa |
|---|---|
| `401` | Token inválido, expirado o usuario deshabilitado |
| `403` | No se proporcionó token |

---

### `GET /api/propiedad`

Pública — trae todo lo que necesita la landing en una sola llamada.

**Respuesta exitosa (200):**
```json
{
  "propiedad": { "id": 1, "nombre": "...", "direccion": "...", "caracteristicas": ["Living comedor y cocina", "Patio con parrilla"], "whatsappNumero": "5492255..." },
  "fotos": [{ "id": 1, "url": "/uploads/propiedad/xxx.jpg", "orden": 0 }],
  "meses": [{ "id": 1, "titulo": "Diciembre", "orden": 0, "periodos": [{ "fechaDesde": "2026-12-01", "fechaHasta": "2026-12-15", "precio": null, "disponible": false }] }]
}
```

### `PUT /api/propiedad` 🔒

Admin — actualiza los datos generales (acepta actualización parcial).

### `POST /api/propiedad/fotos` 🔒

Admin — sube una foto. `multipart/form-data`, campo `foto`. Máx 5MB, formatos JPG/PNG/WEBP.

### `PUT /api/propiedad/fotos/orden` 🔒

Admin — reordena fotos. **Body:** `[{ "id": 1, "orden": 0 }, ...]`

### `DELETE /api/propiedad/fotos/:id` 🔒

Admin — borra la foto (registro + archivo físico en disco).

### `POST /api/propiedad/meses` 🔒

Admin — crea una tarjeta de mes. **Body:** `{ "titulo": "Diciembre" }`

### `PUT /api/propiedad/meses/:id` 🔒 · `DELETE /api/propiedad/meses/:id` 🔒

Admin — edita o borra una tarjeta de mes (borrarla borra sus períodos en cascada).

### `POST /api/propiedad/meses/:mesId/periodos` 🔒

Admin — agrega un período a una tarjeta. **Body:** `{ "fechaDesde": "2026-12-01", "fechaHasta": "2026-12-15", "precio": 150000, "disponible": true }`

### `PUT /api/propiedad/periodos/:id` 🔒 · `DELETE /api/propiedad/periodos/:id` 🔒

Admin — edita o borra un período.

> 🔒 = requiere `Authorization: Bearer <token>`

---

## 🔄 Flujo de autenticación

```
Frontend                        Backend
   │                               │
   │  POST /api/auth/login         │
   │──────────────────────────────►│
   │                               │ rateLimiter (máx 10 intentos / 15 min)
   │                               │ normalizeUser (trim + lowercase)
   │                               │ busca usuario en DB
   │                               │ verifica flagHabilitado
   │                               │ compara password con bcrypt
   │                               │ genera JWT (8 horas)
   │◄──────────────────────────────│
   │  { token, user }              │
   │                               │
   │  (guarda token en memoria)    │
   │                               │
   │  GET /api/auth/verify         │
   │  Authorization: Bearer token  │
   │──────────────────────────────►│
   │                               │ verifyToken middleware
   │                               │ verifica JWT con JWT_SECRET
   │                               │ busca usuario en DB (datos frescos)
   │                               │ verifica que siga habilitado
   │◄──────────────────────────────│
   │  { id, user, rol }            │
```

---

## ➕ Cómo agregar rutas nuevas

Gracias a la carga dinámica con `glob`, agregar rutas es muy simple.

1. Crear el archivo en `/routes` siguiendo la convención de nombres:

```
routes/usuarios.routes.js   → se monta en /api/usuarios
routes/reportes.routes.js   → se monta en /api/reportes
```

2. El archivo debe exportar un `Router` de Express como `default`:

```js
// routes/usuarios.routes.js
import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/usuarios
router.get('/', verifyToken, (req, res) => {
    res.json({ message: 'Lista de usuarios' });
});

export default router;
```

3. Listo — sin tocar `app.js`.

---

## 🛡 Seguridad implementada

| Medida | Descripción |
|---|---|
| **Helmet** | Headers HTTP de seguridad automáticos |
| **CORS restringido** | Solo orígenes definidos en `CORS_ORIGIN` |
| **Rate limiting** | Máximo 10 intentos de login por IP cada 15 minutos |
| **bcrypt** | Contraseñas hasheadas con salt de 10 rondas |
| **JWT** | Tokens firmados con `HS256`, expiran en 8 horas |
| **Sin enumeración de usuarios** | Mismo mensaje para "usuario no existe" y "contraseña incorrecta" |
| **Baja lógica** | `paranoid: true` — los usuarios nunca se borran físicamente |
| **Flag de habilitación** | Un usuario puede deshabilitarse sin borrarse |
| **Verificación en cada sesión** | `/verify` consulta la DB — detecta usuarios deshabilitados post-login |
| **Logging de auditoría** | Registra todos los intentos de login (exitosos y fallidos) con timestamp |

---

## 🖥 Despliegue en producción

```bash
# 1. Clonar y instalar
git clone ...
cd backend
npm install --omit=dev

# 2. Configurar variables de entorno
cp .env.production .env.production
# → editar .env.production con las credenciales reales del servidor

# 3. Ejecutar migraciones
npm run migrate

# 4. Levantar con PM2
pm2 start ecosystem.config.cjs --env production
pm2 save
```

> ⚠️ En producción: `DB_SYNC=false` y `DB_SEED=false` siempre.  
> Usar migraciones para cualquier cambio de esquema.

---

## 📝 Notas de desarrollo

- El username se normaliza a **lowercase** al hacer login (`normalizeUser`). Al crear usuarios hay que guardarlos también en lowercase para que coincida.
- Los logs de runtime se guardan en `/logs/combined.log` (ignorado por git).
- `dotenv-flow` carga automáticamente `.env` y `.env.{NODE_ENV}` — el segundo sobreescribe al primero.
- Los scripts `migrate` y `seed` corren con `cross-env NODE_ENV=development` explícito (igual que `dev`/`start`), para que `dotenv-flow` sepa qué archivo `.env.*` cargar.
