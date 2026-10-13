import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { callApi } from "../../services/api";
import { useApiResource } from "../../hooks/useApiResource";
import { useToast } from "../../hooks/useToast";
import { VIDEO_DEMO } from "../../services/videoCall/config";
import { Video } from "lucide-react";
import "./CallInvitations.css";

function ServerInvitations({ hideIfEmpty = false }) {
  const [revision, setRevision] = useState(0),
    [pending, setPending] = useState(null);
  const resource = useApiResource(callApi.invitations, revision, { keepPrevious: true });
  const navigate = useNavigate(),
    toast = useToast();

  useEffect(() => {
    const timer = setInterval(() => setRevision((value) => value + 1), 10000);

    return () => clearInterval(timer);
  }, []);
  async function decide(id, action) {
    setPending(id);

    try {
      await callApi.decide(id, action);

      if (action === "accept") {
        navigate(`/video?call=${encodeURIComponent(id)}&step=devices`);
      } else {
        toast({ type: "info", message: "Đã từ chối lời mời gọi video." });
        setRevision((value) => value + 1);
      }
    } catch (error) {
      toast({ type: "error", message: error.message });
    } finally {
      setPending(null);
    }
  }

  if (hideIfEmpty && (!resource.data || resource.data.length === 0) && !resource.error) {
    return null;
  }

  return (
    <section className="call-invitations" aria-label="Cuộc gọi đến">
      <header className="call-invitations__heading">
        <span className="call-invitations__icon">
          <Video size={22} />
        </span>
        <div>
          <h2 className="text-h2">Cuộc gọi đến</h2>
          <p>Chấp nhận để vào phòng và kiểm tra thiết bị.</p>
        </div>
        {resource.data?.length > 0 && (
          <span className="call-invitations__count">{resource.data.length}</span>
        )}
      </header>
      {resource.error ? (
        <div role="alert">
          <p>{resource.error.message}</p>
          <button
            className="call-invitations__accept"
            onClick={() => setRevision((value) => value + 1)}
          >
            Thử lại
          </button>
        </div>
      ) : !resource.data ? (
        <p role="status">Đang tải lời mời…</p>
      ) : resource.data.length === 0 ? (
        <p className="call-invitations__empty">
          Chưa có cuộc gọi đến. Lời mời từ bạn bè sẽ xuất hiện tại đây.
        </p>
      ) : (
        resource.data.map((call) => (
          <article className="call-invitations__item" key={call.id}>
            <div>
              <strong>{call.name}</strong>
              <p>{call.topic}</p>
            </div>
            <div className="call-invitations__actions">
              <button
                className="call-invitations__accept"
                disabled={pending !== null}
                onClick={() => decide(call.id, "accept")}
              >
                Chấp nhận
              </button>
              <button
                className="call-invitations__decline"
                disabled={pending !== null}
                onClick={() => decide(call.id, "reject")}
              >
                Từ chối
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  );
}

export default function CallInvitations({ hideIfEmpty = false }) {
  if (VIDEO_DEMO) {
    if (hideIfEmpty) {
      return null;
    }
    return (
      <section className="call-invitations">
        <h2 className="text-h2">Cuộc gọi đến</h2>
        <p className="call-invitations__empty">Chưa có cuộc gọi đến trong phiên demo.</p>
      </section>
    );
  }

  return <ServerInvitations hideIfEmpty={hideIfEmpty} />;
}
