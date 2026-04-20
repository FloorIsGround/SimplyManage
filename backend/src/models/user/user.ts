export const USER_ROLES = ['PATRON', 'LIBRARIAN', 'ADMIN'] as const;
export type UserRole = typeof USER_ROLES[number];

export const USER_STATUSES = ['ACTIVE', 'SUSPENDED'] as const;
export type UserStatus = typeof USER_STATUSES[number];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  libraryCardNumber: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}
