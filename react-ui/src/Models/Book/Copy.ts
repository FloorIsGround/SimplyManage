export type ConditionStatusString = 'AVAILABLE' | 'LOST' | 'DAMAGED' | 'MAINTENANCE';

export interface Copy {
  id: string;
  bookId: string;
  barcode: string;
  conditionStatus: ConditionStatusString;
  branchId: number;
  createdAt: Date;
}

// Changed temporarily until database/backend update
export enum ConditionStatusEnum {
  AVAILABLE = 0,
  LOST = 1,
  DAMAGED = 2,
  MAINTENANCE = 3
}

// Created temporarily until database/backend update
export function conditionStatusEnumToString(status: ConditionStatusEnum): ConditionStatusString {
  switch (status) {
    case ConditionStatusEnum.AVAILABLE: return 'AVAILABLE';
    case ConditionStatusEnum.LOST: return 'LOST';
    case ConditionStatusEnum.DAMAGED: return 'DAMAGED';
    case ConditionStatusEnum.MAINTENANCE: return 'MAINTENANCE';
  }
}