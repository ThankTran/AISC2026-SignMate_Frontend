import { useEffect, useState } from "react";
// The supplied loader must be stable (an exported function or useCallback).
export function useApiResource(loader) {
  const [resource, setResource] = useState({ data: null, error: null });
  useEffect(() => {
    let active = true;
    loader().then(
      (data) => { if (active) setResource({ loader, data, error: null }); },
      (error) => { if (active) setResource({ loader, data: null, error }); },
    );
    return () => { active = false; };
  }, [loader]);
  return resource.loader === loader ? resource : { data: null, error: null };
}
