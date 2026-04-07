export const HOLD_STATUSES = ['ACTIVE', 'READY', 'FULFILLED', 'CANCELLED'] as const;
export type HoldStatus = typeof HOLD_STATUSES[number];

export interface Hold {
    id: string;
    userId: string;
    bookId: string;
    placedAt: string;
    status: HoldStatus;
    readyExpiresAt: string | null;
    queuePosition: number;
}

export interface CreateHoldInput {
    userId: string;
    bookId: string;
}

export interface UpdateHoldStatusInput {
    status: HoldStatus;
    readyExpiresAt?: string | null;
}
