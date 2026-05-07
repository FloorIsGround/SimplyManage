export const DEFAULT_OVERDUE_FEE_CENTS_PER_DAY = 25;

export function parseInitialOverdueFeeRate(envValue: string | undefined): number {
    if (envValue === undefined || envValue === "") {
        return DEFAULT_OVERDUE_FEE_CENTS_PER_DAY;
    }

    const parsed = Number(envValue);
    if (!Number.isInteger(parsed) || parsed < 0) {
        return DEFAULT_OVERDUE_FEE_CENTS_PER_DAY;
    }

    return parsed;
}

let overdueFeeCentsPerDay: number = parseInitialOverdueFeeRate(
    process.env.OVERDUE_FEE_CENTS_PER_DAY
);

export function getOverdueFeeCentsPerDay(): number {
    return overdueFeeCentsPerDay;
}

export function setOverdueFeeCentsPerDay(value: number): number {
    if (!Number.isInteger(value) || value < 0) {
        throw new Error("overdueFeeCentsPerDay must be a nonnegative integer.");
    }
    overdueFeeCentsPerDay = value;
    return overdueFeeCentsPerDay;
}
