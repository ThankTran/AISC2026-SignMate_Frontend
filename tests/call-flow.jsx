import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { useServerVideoCallFlow } from '../src/hooks/videoCall/useServerVideoCallFlow';
import { callApi, socialApi } from '../src/services/api';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const root = createRoot(document.getElementById('root')), results = [], calls = [];
const active = { id: 'call-1', status: 'active', role: 'caller', direction: 'outgoing', partner: { id: 'friend-1', name: 'Bạn thử nghiệm', avatar: 'B' }, commonTopics: ['Gia đình'], durationSeconds: 12, wasConnected: true };
let current, server = active;
Object.assign(callApi, {
  match: async topics => { calls.push(['match', topics]); return { status: 'matched', call: active }; },
  cancelMatch: async () => { calls.push(['cancel']); },
  ping: async () => ({}), get: async () => server,
  end: async () => { calls.push(['end']); return { ...server, status: 'ended' }; },
  invite: async id => { calls.push(['invite', id]); server = { ...active, status: 'invited' }; return server; },
  review: async (id, value) => { calls.push(['review', id, value]); },
});
socialApi.profile = async id => { calls.push(['profile', id]); return active.partner; };
const check = (name, ok) => { results.push(`${ok ? 'PASS' : 'FAIL'} ${name}`); document.getElementById('results').textContent = results.join('\n'); if (!ok) throw Error(name); };
function Probe() { current = useServerVideoCallFlow(); return <p>{current.stage} / {current.call?.status}</p>; }
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 40)); });
async function mount(path) { await act(async () => root.render(<StrictMode><MemoryRouter key={path} initialEntries={[path]}><Probe /></MemoryRouter></StrictMode>)); await settle(); }
try {
  await mount('/video?step=call');
  check('invalid call URL renders topics without a partner', current.stage === 'topics' && current.partner === null);
  check('StrictMode mount does not cancel a server session', calls.length === 0);
  await act(async () => current.search()); await settle();
  check('matching sends topic list and adopts server role', Array.isArray(calls.find(item => item[0] === 'match')[1]) && current.call.role === 'caller');
  check('matched session waits for device check', current.stage === 'match');
  await act(async () => current.checkDevices()); check('device screen precedes call', current.stage === 'devices');
  await act(async () => current.startCall({ mic: false })); check('call begins with selected device settings', current.stage === 'call' && current.mediaOptions.mic === false);
  await act(async () => current.endCall()); check('end uses server result and duration', current.stage === 'review' && current.duration === 12);
  await act(async () => current.submitReview({ rating: 4, tags: ['Dễ hiểu'], note: 'Cảm ơn' }));
  check('review is persisted before thanks', current.stage === 'thanks' && calls.at(-1)[0] === 'review');
  await mount('/video?friend=friend-1');
  check('friend deep link loads profile before inviting', calls.findIndex(item => item[0] === 'profile') < calls.findIndex(item => item[0] === 'invite'));
  check('direct invite waits for acceptance', current.call.status === 'invited' && current.stage === 'topics');
  await act(async () => root.unmount()); await settle();
  document.title = `PASS ${results.length} Call flow checks`;
} catch (error) { document.title = 'FAIL Call flow checks'; document.getElementById('results').textContent += '\n' + error.stack; }
