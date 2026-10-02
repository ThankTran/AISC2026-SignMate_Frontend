import {act,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {AuthContext} from '../src/hooks/useAuth';
import {useCurrentUser} from '../src/hooks/useCurrentUser';
import {CurrentUserProvider} from '../src/contexts/CurrentUserProvider';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
let current;
function Probe(){current=useCurrentUser();return <p>{current.displayName}</p>;}
try {
 await act(async()=>createRoot(document.getElementById('root')).render(<StrictMode><AuthContext.Provider value={{user:null,authRevision:0}}><CurrentUserProvider><Probe/></CurrentUserProvider></AuthContext.Provider></StrictMode>));
 if(current._profileStatus!=='ready'||!current.displayName)throw Error('Signed-out profile did not become ready');
 document.title='PASS signed-out startup';document.getElementById('results').textContent='PASS: real CurrentUserProvider renders signed-out state under StrictMode without reading null.data.';
} catch(error){document.title='FAIL signed-out startup';document.getElementById('results').textContent=error.stack;}
