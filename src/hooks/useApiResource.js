import { useEffect, useState } from "react";
// The supplied loader must be stable (an exported function or useCallback).
export function useApiResource(loader, refreshKey = 0) {
  const [resource, setResource] = useState({ data: null, error: null });
  useEffect(() => {
    let active = true;
    loader().then(
      (data) => { if (active) setResource({ loader, refreshKey, data, error: null }); },
      (error) => { if (active) setResource({ loader, refreshKey, data: null, error }); },
    );
    return () => { active = false; };
  }, [loader, refreshKey]);
  return resource.loader === loader && resource.refreshKey === refreshKey ? resource : { data: null, error: null };
}
