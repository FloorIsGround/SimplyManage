export const CONDITION_STATUSES = ['AVAILABLE', 'LOST', 'DAMAGED', 'MAINTENANCE'] as const;
export type ConditionStatus = typeof CONDITION_STATUSES[number];

export interface Copy {
  id: string;
  bookId: string;
  barcode: string | null;
  conditionStatus: ConditionStatus;
  branchId: number;
  createdAt: string;
}
