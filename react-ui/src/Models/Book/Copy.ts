export interface Copy {
  id: number;
  bookId: number;
  barcode: string;
  conditionStatus: ConditionStatus;
  location: string;
  createdAt: Date;
}

export enum ConditionStatus {
  available,
  lost, 
  damaged,
  maintenance
}