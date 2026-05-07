const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value: string, fieldName: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`${fieldName} must be a valid date string.`);
    }
    return date;
}

export function calculateDaysOverdue(dueAt: string, returnedAt: string): number {
    const dueDate = parseDate(dueAt, "dueAt");
    const returnedDate = parseDate(returnedAt, "returnedAt");
    const diffMs = returnedDate.getTime() - dueDate.getTime();

    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / ONE_DAY_MS);
}

export function calculateOverdueFeeCents(
    dueAt: string,
    returnedAt: string,
    feeCentsPerDay: number
): number {
    if (!Number.isInteger(feeCentsPerDay) || feeCentsPerDay < 0) {
        throw new Error("feeCentsPerDay must be a nonnegative integer.");
    }

    const daysOverdue = calculateDaysOverdue(dueAt, returnedAt);
    return daysOverdue * feeCentsPerDay;
}
