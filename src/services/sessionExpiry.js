let handler=null,inFlight=null;
export function onSessionExpired(callback){handler=callback;return()=>{if(handler===callback)handler=null;};}
export async function notifySessionExpired(uid){
 if(!handler)return;
 if(!inFlight)inFlight=Promise.resolve().then(()=>handler?.(uid)).finally(()=>{inFlight=null;});
 return inFlight;
}
export async function withTokenRetry(send,onExpired){
 let response=await send(false);
 if(response.status===401){response=await send(true);if(response.status===401)await onExpired();}
 return response;
}
