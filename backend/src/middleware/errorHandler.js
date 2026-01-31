function isPgError(err) {
    return err && typeof err === "object" && typeof err.code === "string";
}

function mapPgError(err) {
  // Postgres error codes:
    switch (err.code) {
        case "23505": // unique 
            return { status: 409, message: "Duplicate value violates a unique constraint." };
        case "23503": // foreign key 
            return { status: 409, message: "Record does not exist." };
        case "23502": // not null
            return { status: 400, message: "Missing required field." };
        case "23514": // value
            return { status: 400, message: "Invalid Value." };
        default: //default error
            return { status: 500, message: "Database error." };
    }
}

export function notFoundHandler(req, res) {
    res.status(404).json({ error: "Not Found" });
}

export function errorHandler(err, req, res, next) {
    if (err && typeof err === "object" && typeof err.status === "number") {
    return res.status(err.status).json({ error: err.message || "Error" });
    }

  // Map errors to responses
    if (isPgError(err)) {
        const mapped = mapPgError(err);
        return res.status(mapped.status).json({
            error: mapped.message,
            detail: process.env.NODE_ENV === "development" ? err.detail : undefined,
        });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
}
