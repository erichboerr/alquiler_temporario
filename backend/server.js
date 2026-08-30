import dotenv from 'dotenv-flow';
dotenv.config();

import sequelize from './config/db.js';
import { ensureDatabaseExists } from './config/setup.js';
import { createApp } from './app.js';



const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        // 1. Crear la base de datos si no existe
        await ensureDatabaseExists();

        // 2. Conectar Sequelize y verificar la conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida.');        

        // 3. Crear la app Express con todas las rutas cargadas
        // Va después de la DB porque el import() dinámico de rutas
        // podría necesitar modelos ya inicializados
        const app = await createApp();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1); // Salida con código de error para que PM2 lo detecte y reinicie
    }
}

startServer();