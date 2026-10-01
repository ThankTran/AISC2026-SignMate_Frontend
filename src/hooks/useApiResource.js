import { useEffect, useState } from "react";
// The supplied loader must be stable (an exported function or useCallback).
export function useApiResource(loader, refreshKey = 0, {keepPrevious=false} = {}) {
  const [resource, setResource] = useState({ data: null, error: null });
  useEffect(() => {
    let active = true;
    loader().then(
      (data) => { if (active) setResource({ loader, refreshKey, data, error: null }); },
      (error) => { if (active) setResource({ loader, refreshKey, data: null, error }); },
    );
    return () => { active = false; };
  }, [loader, refreshKey]);
  if(resource.loader===loader&&resource.refreshKey===refreshKey)return resource;
  if(keepPrevious&&resource.loader===loader&&resource.data)return {...resource,error:null,refreshing:true};
  return { data: null, error: null };
}
