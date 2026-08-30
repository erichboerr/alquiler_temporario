import { Sequelize } from 'sequelize';
import dotenv from 'dotenv-flow';

dotenv.config();

// 1. Objeto de configuración (para la CLI y para instanciar)
export const development = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

// 2. Creamos la instancia de conexión
const sequelize = new Sequelize(
    development.database,
    development.username,
    development.password,
    development
);

// 3. EXPORTACIONES CLAVE:
// Exportamos la instancia como default para que 'models/index.js' funcione
export default sequelize; 
