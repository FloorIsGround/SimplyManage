import { jwtDecode } from "jwt-decode";
import type { User } from "../Models/User/User";
import { Role, UserStatus } from "../Models/User/User";

export function getUserRole(): string | undefined {
  try {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded: any = jwtDecode(token);

      return decoded.role?.toLowerCase?.() || decoded.role;
    }
  } catch {
    // empty
  }

  return undefined;
}

export function hasStaffAccess(): boolean {
  const role = getUserRole();

  return role === "admin" || role === "librarian";
}

export function getCurrentUser(): User | null {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const decoded: any = jwtDecode(token);

    return {
      id: decoded.id || '',
      email: decoded.email || '',
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || '',
      dateOfBirth: decoded.dateOfBirth || '',
      password: '',
      role: decoded.role || Role.patron,
      status: UserStatus.active,
      createdAt: new Date(),
      borrowedBooks: [],
    };
  } catch {
    return null;
  }
}