export interface Loan {
    id: string;
    userId: string;
    copyId: string;
    checkoutAt: string;
    dueAt: string;
    returnedAt: string | null;
    renewalCount: number;
}

export interface CreateLoanInput {
    userId: string;
    copyId: string;
    dueAt: string;
}
