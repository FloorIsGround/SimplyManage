import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

async function importReceiptService() {
    vi.resetModules();
    return import("../services/receipt_service.js");
}

function mockJsonResponse(status: number, body: unknown, ok = status >= 200 && status < 300) {
    return {
        ok,
        status,
        json: vi.fn().mockResolvedValue(body),
        text: vi.fn().mockResolvedValue(JSON.stringify(body)),
        headers: new Headers({ "content-type": "application/json" }),
    };
}

function mockPdfResponse(content: string, contentType = "application/pdf") {
    return {
        ok: true,
        status: 200,
        arrayBuffer: vi.fn().mockResolvedValue(Buffer.from(content).buffer),
        headers: new Headers({ "content-type": contentType }),
    };
}

beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.FILING_SERVICE_BASE_URL = "https://documents.example.test/filing/";
    process.env.FILING_SERVICE_API_KEY = "test-api-key";
});

afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...ORIGINAL_ENV };
});

describe("receipt_service", () => {
    it("creates receipt documents through the filing service", async () => {
        const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse(201, {
            id: "a1b2c3d4-e5f6-7890-abcd-000000000002",
            transaction_id: "REC-2026-0001",
        }));
        vi.stubGlobal("fetch", fetchMock);

        const { createReceiptDocument } = await importReceiptService();

        const result = await createReceiptDocument({
            issued_by: "SimplyManage Library",
            issued_to: "Carol Patron",
            paid_date: "2026-05-04T00:00:00.000Z",
            items: [{ description: "Payment for overdue library fees", quantity: 1, unit_price: 7.5 }],
        });

        expect(result).toEqual({
            id: "a1b2c3d4-e5f6-7890-abcd-000000000002",
            transactionId: "REC-2026-0001",
        });
        expect(fetchMock).toHaveBeenCalledWith(
            "https://documents.example.test/filing/receipts",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    Authorization: "Bearer test-api-key",
                    "Content-Type": "application/json",
                }),
            })
        );
        const [, requestInit] = fetchMock.mock.calls[0];
        expect(JSON.parse(String(requestInit.body))).toEqual({
            issued_by: "SimplyManage Library",
            issued_to: "Carol Patron",
            paid_date: "2026-05-04T00:00:00.000Z",
            currency: "$",
            items: [{ description: "Payment for overdue library fees", quantity: 1, unit_price: 7.5 }],
        });
    });

    it("fetches receipt PDFs through the filing service", async () => {
        const fetchMock = vi.fn().mockResolvedValue(mockPdfResponse("fake-pdf"));
        vi.stubGlobal("fetch", fetchMock);

        const { fetchReceiptPdf } = await importReceiptService();

        const result = await fetchReceiptPdf("a1b2c3d4-e5f6-7890-abcd-000000000002");

        expect(result.content).toBeInstanceOf(Buffer);
        expect(result.contentType).toBe("application/pdf");
        expect(fetchMock).toHaveBeenCalledWith(
            "https://documents.example.test/filing/receipts/a1b2c3d4-e5f6-7890-abcd-000000000002",
            expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({ Authorization: "Bearer test-api-key" }),
            })
        );
    });

    it("throws a useful error when receipt creation fails", async () => {
        const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse(403, { message: "Forbidden" }, false));
        vi.stubGlobal("fetch", fetchMock);

        const { createReceiptDocument } = await importReceiptService();

        await expect(createReceiptDocument({
            issued_by: "SimplyManage Library",
            issued_to: "Carol Patron",
            paid_date: "2026-05-04T00:00:00.000Z",
            items: [{ description: "Payment for overdue library fees", quantity: 1, unit_price: 7.5 }],
        })).rejects.toThrow("Filing service receipt creation failed with status 403: Forbidden");
    });

    it("requires filing service configuration", async () => {
        delete process.env.FILING_SERVICE_API_KEY;
        vi.stubGlobal("fetch", vi.fn());

        const { fetchReceiptPdf } = await importReceiptService();

        await expect(fetchReceiptPdf("a1b2c3d4-e5f6-7890-abcd-000000000002")).rejects.toThrow(
            "FILING_SERVICE_API_KEY is required."
        );
    });
});
