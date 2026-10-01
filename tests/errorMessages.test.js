import test from 'node:test';
import assert from 'node:assert/strict';
import {errorMessage,ERROR_MESSAGES} from '../src/services/errorMessages.js';
import {withTokenRetry,onSessionExpired,notifySessionExpired} from '../src/services/sessionExpiry.js';
test('known API codes prefer friendly Vietnamese copy over raw server detail',()=>{
 for(const code of ['LESSON_LOCKED','QUIZ_LOCKED','ATTEMPT_CLOSED','ALREADY_ANSWERED','NOT_FRIENDS','CALL_BUSY','NOT_FOUND'])
  assert.equal(errorMessage({code,message:'sensitive internal detail'},{dev:true}),ERROR_MESSAGES[code]);
 assert.match(errorMessage({status:401},{dev:false}),/đăng nhập/);
});
test('production does not expose unmapped backend messages',()=>{
 assert.doesNotMatch(errorMessage({code:'NEW_CODE',message:'SQL schema secret'},{dev:false}),/SQL|secret/);
 assert.equal(errorMessage({code:'NEW_CODE',message:'debug detail'},{dev:true}),'debug detail');
 assert.equal(errorMessage({code:'TIMEOUT',status:0}),ERROR_MESSAGES.TIMEOUT);
});
test('second 401 expires session once and refresh cannot loop',async()=>{
 const calls=[];let expired=0;
 const result=await withTokenRetry(async force=>{calls.push(force);return {status:401};},async()=>{expired++;});
 assert.deepEqual(calls,[false,true]);assert.equal(result.status,401);assert.equal(expired,1);
});
test('a successful refresh or forbidden request does not log out',async()=>{
 let expired=0;await withTokenRetry(async force=>({status:force?200:401}),()=>expired++);
 let requests=0;await withTokenRetry(async()=>{requests++;return {status:403};},()=>expired++);
 assert.equal(expired,0);assert.equal(requests,1);
});
test('concurrent session failures share one logout',async()=>{
 let calls=0;const unsubscribe=onSessionExpired(async uid=>{assert.equal(uid,'user-1');calls++;});
 await Promise.all([notifySessionExpired('user-1'),notifySessionExpired('user-1')]);unsubscribe();
 assert.equal(calls,1);
});
