// Small helper file for common controller validation and error handling.

export function createHttpError(status: number, message: string): Error & { status: number } {
    const error = new Error(message) as Error & { status: number };
    error.status = status;
    return error;
}

// Turns a possible value into a single string if possible.
export function getSingleValue(value: unknown): string | null {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    return null;
}

// Simple UUID check for ids coming from params/body.
export function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

// Parses a positive integer id from params
export function parsePositiveInt(value: string): number | null {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

// Checks rating is an integer from 1 to 5.
export function parseRating(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null;
}

// Makes sure a required uuid field is present and valid.
export function requireUuid(value: unknown, fieldName: string): string {
    const parsed = getSingleValue(value);

    if (!parsed || !isUuid(parsed)) {
        throw createHttpError(400, `${fieldName} must be a valid UUID.`);
    }

    return parsed;
}

// Makes sure a required positive integer id is present and valid.
export function requirePositiveInt(value: unknown, fieldName: string): number {
    const parsed = getSingleValue(value);

    if (!parsed) {
        throw createHttpError(400, `${fieldName} is required.`);
    }

    const id = parsePositiveInt(parsed);

    if (!id) {
        throw createHttpError(400, `${fieldName} must be a valid positive integer.`);
    }

    return id;
}

// Makes sure rating exists and is valid.
export function requireRating(value: unknown): number {
    if (value === undefined) {
        throw createHttpError(400, "rating is required.");
    }

    const parsed = parseRating(value);

    if (parsed === null) {
        throw createHttpError(400, "Rating must be an integer between 1 and 5.");
    }

    return parsed;
}