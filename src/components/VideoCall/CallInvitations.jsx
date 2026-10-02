import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callApi } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';
import { useToast } from '../../hooks/useToast';
import { VIDEO_DEMO } from '../../services/videoCall/config';

function ServerInvitations() {
  const [revision, setRevision] = useState(0), [pending, setPending] = useState(null);
  const resource = useApiResource(callApi.invitations, revision, { keepPrevious: true });
  const navigate = useNavigate(), toast = useToast();
  useEffect(() => { const timer = setInterval(() => setRevision(value => value + 1), 10000); return () => clearInterval(timer); }, []);
  async function decide(id, action) {
    setPending(id);
    try {
      await callApi.decide(id, action);
      if (action === 'accept') navigate(`/video?call=${encodeURIComponent(id)}&step=devices`);
      else { toast({ type: 'info', message: 'Đã từ chối lời mời gọi video.' }); setRevision(value => value + 1); }
    } catch (error) { toast({ type: 'error', message: error.message }); }
    finally { setPending(null); }
  }
  return <section className="vc-panel" aria-label="Lời mời gọi video trực tiếp">
    <h2 className="text-h2">Lời mời gọi video</h2>
    {resource.error ? <div role="alert"><p>{resource.error.message}</p><button className="vc-button" onClick={() => setRevision(value => value + 1)}>Thử lại</button></div>
      : !resource.data ? <p role="status">Đang tải lời mời…</p>
      : resource.data.length === 0 ? <p>Chưa có lời mời gọi video. Bạn có thể gọi một người bạn đang online.</p>
      : resource.data.map(call => <article key={call.id}><p><strong>{call.name}</strong> · {call.topic}</p><div className="vc-actions">
        <button className="vc-button" disabled={pending !== null} onClick={() => decide(call.id, 'accept')}>Chấp nhận</button>
        <button className="vc-button vc-secondary" disabled={pending !== null} onClick={() => decide(call.id, 'reject')}>Từ chối</button>
      </div></article>)}
  </section>;
}
export default function CallInvitations() { return VIDEO_DEMO ? null : <ServerInvitations />; }
