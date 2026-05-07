export type Party = string | {
    entity_name: string;
    location?: string;
    representative?: string;
};

export interface FilingLineItem {
    description: string;
    quantity: number;
    unit_price: number;
}

export interface CreateReceiptPayload {
    issued_by: Party;
    issued_to: Party;
    paid_date: string;
    currency?: string;
    items: FilingLineItem[];
    logo?: string;
}

export interface CreateReceiptResult {
    id: string;
    transactionId: string | null;
}

export interface ReceiptPdfResult {
    content: Buffer;
    contentType: string;
}

const FILING_ENDPOINTS = {
    receipts: "/receipts",
    receiptById: (id: string) => `/receipts/${id}`,
} as const;

export const FILING_DEFAULTS = {
    issuedBy: "SimplyManage Library",
    currency: "$",
} as const;

type FilingReceiptResponse = {
    id?: unknown;
    transaction_id?: unknown;
};

function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is required.`);
    }
    return value;
}

function getBaseUrl(): string {
    return getRequiredEnv("FILING_SERVICE_BASE_URL").replace(/\/+$/, "");
}

function getApiKey(): string {
    return getRequiredEnv("FILING_SERVICE_API_KEY");
}

function buildUrl(path: string): string {
    return `${getBaseUrl()}${path}`;
}

function authHeaders(): Record<string, string> {
    return {
        Authorization: `Bearer ${getApiKey()}`,
    };
}

async function getErrorMessage(response: Response): Promise<string> {
    try {
        const body = await response.json() as { message?: unknown; error?: unknown };
        if (typeof body.message === "string") return body.message;
        if (typeof body.error === "string") return body.error;
    } catch {
        // Fall through to text fallback.
    }

    try {
        const text = await response.text();
        if (text) return text;
    } catch {
        // Fall through to generic fallback.
    }

    return response.statusText || "Unknown error";
}

export async function createReceiptDocument(payload: CreateReceiptPayload): Promise<CreateReceiptResult> {
    const requestPayload: CreateReceiptPayload = {
        ...payload,
        currency: payload.currency ?? FILING_DEFAULTS.currency,
    };

    const response = await fetch(buildUrl(FILING_ENDPOINTS.receipts), {
        method: "POST",
        headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
        const message = await getErrorMessage(response);
        throw new Error(`Filing service receipt creation failed with status ${response.status}: ${message}`);
    }

    const body = await response.json() as FilingReceiptResponse;
    if (typeof body.id !== "string") {
        throw new Error("Filing service receipt creation response is missing id.");
    }

    return {
        id: body.id,
        transactionId: typeof body.transaction_id === "string" ? body.transaction_id : null,
    };
}

export async function fetchReceiptPdf(id: string): Promise<ReceiptPdfResult> {
    const response = await fetch(buildUrl(FILING_ENDPOINTS.receiptById(id)), {
        method: "GET",
        headers: authHeaders(),
    });

    if (!response.ok) {
        const message = await getErrorMessage(response);
        throw new Error(`Filing service receipt PDF fetch failed with status ${response.status}: ${message}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/pdf";

    return {
        content: Buffer.from(arrayBuffer),
        contentType,
    };
}
