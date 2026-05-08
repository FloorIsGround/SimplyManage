import { useEffect, useState } from 'react';
import type { User } from '../../../Models/User/User';
import axios from '../../../utils/axios-api';
import { jwtDecode } from 'jwt-decode';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const safeSet = (fn: () => void) => {
      Promise.resolve().then(fn);
    };
    if (!token) {
      safeSet(() => {
        setUser(null);
        setLoadingUser(false);
      });
      return;
    }
    let userId: string | undefined;
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.id || decoded.userId || decoded._id;
    } catch {
      safeSet(() => {
        setUser(null);
        setLoadingUser(false);
      });
      return;
    }
    if (!userId) {
      safeSet(() => {
        setUser(null);
        setLoadingUser(false);
      });
      return;
    }
    axios
      .get(`/users/${userId}`)
      .then((res: any) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);
  return { user, loadingUser };
}