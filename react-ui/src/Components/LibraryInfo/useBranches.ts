import { useEffect, useState } from "react";
import axios from "../../utils/axios-api";
import type { Library } from "../../Models/LibraryInfo/Library";

export function useBranches() {
  const [branches, setBranches] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    axios.get("/hourslocations")
      .then(res => {
        if (isMounted) {
          setBranches(Array.isArray(res.data.libraries) ? res.data.libraries : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load library locations.");
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  return { branches, loading, error };
}
