import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {usePracticeSession} from '../src/hooks/usePracticeSession';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const root=createRoot(document.getElementById('root')),results=[],calls=[];
let current,failStart=false,failFinish=false;
const api={start:async body=>{calls.push(['start',body]);if(failStart)throw Error('Mất mạng');return {id:'server-session',aiStatus:'not_configured',accuracy:null,remainingSessions:4};},finish:async id=>{calls.push(['finish',id]);if(failFinish)throw Error('Chưa lưu');return {id,accuracy:null,xp:10,durationSeconds:12};}};
const check=(name,ok)=>{results.push(`${ok?'PASS':'FAIL'} ${name}`);document.getElementById('results').textContent=results.join('\n');if(!ok)throw Error(name);};
function Probe({mock=false}){current=usePracticeSession({api,mock});return <p>{current.status}: {current.session?.aiStatus}</p>;}
try {
 await act(async()=>root.render(<Probe/>));
 await act(async()=>current.start('VSL: A'));
 check('start sends sign and idempotency key',calls[0][1].sign==='VSL: A'&&!!calls[0][1].userSessionId);
 check('unconfigured AI preserves absent accuracy',current.session.aiStatus==='not_configured'&&current.session.accuracy===null);
 await act(async()=>current.start('VSL: A'));check('active session is reused',calls.filter(([type])=>type==='start').length===1);
 failFinish=true;await act(async()=>current.finish());check('finish failure retains session for retry',current.status==='error'&&current.hasOpenSession());
 failFinish=false;await act(async()=>current.finish());check('finish uses server id and actual reward',current.session.xp===10&&current.session.durationSeconds===12&&!current.hasOpenSession());
 const count=calls.length;await act(async()=>current.finish());check('finished session is not submitted again',calls.length===count);
 failStart=true;await act(async()=>current.start('B'));const key=calls.at(-1)[1].userSessionId;
 failStart=false;await act(async()=>current.start('B'));check('start retry reuses same idempotency key',calls.at(-1)[1].userSessionId===key);
 await act(async()=>root.render(<div/>));check('leaving page finishes open session without reopening summary',calls.at(-1)[0]==='finish');
 const beforeMock=calls.length;await act(async()=>root.render(<Probe mock/>));await act(async()=>current.start('A'));await act(async()=>current.finish());check('explicit mock mode never calls backend',calls.length===beforeMock&&current.session.aiStatus==='demo');
 document.title=`PASS ${results.length} Practice API checks`;
}catch(error){document.title='FAIL Practice API checks';document.getElementById('results').textContent+='\n'+error.stack;}
