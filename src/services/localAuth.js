const key='signmate:session';
export function getSession(){try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}}
export function saveSession(session){
  if(session)sessionStorage.setItem(key,JSON.stringify(session));else sessionStorage.removeItem(key);
  window.dispatchEvent(new Event('signmate:auth-changed'));
}
export function clearSession(){saveSession(null);}
