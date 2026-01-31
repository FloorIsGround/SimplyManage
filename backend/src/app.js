import express from "express";
import cors from "cors";

import apiRouter from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const origin = process.env.CORS_ORIGIN || "*";
    app.use(cors({ origin, credentials: true }));

    app.get("/health", (req, res) => {
    res.json({ ok: true });
    });

    app.use("/api", apiRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
