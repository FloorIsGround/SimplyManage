import "dotenv/config";
import express from "express";


import { createApp } from "./app.js";
import { testConnection } from "./config/db.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = createApp();

// test db connection
try {
  const { now } = await testConnection();
  console.log(
    `DB config: host=${process.env.DB_HOST} port=${process.env.DB_PORT} db=${process.env.DB_NAME} user=${process.env.DB_USER} at ${now}`
  );
} catch (error) {
  console.log(error);
  process.exit(1);
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
