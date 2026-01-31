import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

import { createApp } from "./app.js";

const { testConnection } = await import('./config/db.js');

const PORT = process.env.PORT || 3000;
const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// test db connection
try {
    const { now } = await testConnection();
    console.log(`DB config: host=${process.env.DB_HOST} port=${process.env.DB_PORT} db=${process.env.DB_NAME} user=${process.env.DB_USER} at ${now}`);

} catch (error) {
    console.log(error);
    process.exit(1);
}

const app = createApp();

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));