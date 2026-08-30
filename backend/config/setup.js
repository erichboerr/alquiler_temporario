import pg from 'pg';
import dotenv from 'dotenv-flow';

dotenv.config();

export const ensureDatabaseExists = async () => {
    // Conectamos a la base 'postgres' (que siempre existe) para poder crear la nuestra
    const client = new pg.Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        database: 'postgres', // Base de datos por defecto
    });

    try {
        await client.connect();
        
        // Verificamos si nuestra base de datos ya existe
        const res = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`
        );

        if (res.rowCount === 0) {
            console.log(`⚠️ La base de datos ${process.env.DB_NAME} no existe. Creándola...`);
            await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`✅ Base de datos ${process.env.DB_NAME} creada con éxito.`);
        }
    } catch (err) {
        console.error('❌ Error al verificar/crear la base de datos:', err);
    } finally {
        await client.end();
    }
};