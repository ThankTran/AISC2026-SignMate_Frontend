import { useEffect, useState } from "react";
export function useMediaQuery(query) { const [matches,setMatches]=useState(()=>window.matchMedia(query).matches);useEffect(()=>{const m=window.matchMedia(query);const change=()=>setMatches(m.matches);m.addEventListener('change',change);return()=>m.removeEventListener('change',change);},[query]);return matches; }
