import { jwtDecode } from "jwt-decode";

export function getUserRole(): string | undefined {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.role?.toLowerCase?.() || decoded.role;
    }
  } catch { /* empty */ }
  return undefined;
}

export function hasStaffAccess(): boolean {
  const role = getUserRole();
  return role === "admin" || role === "librarian";
}
