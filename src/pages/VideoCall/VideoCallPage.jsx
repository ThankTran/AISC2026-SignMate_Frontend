import FirstCallGuide from "../../components/VideoCall/FirstCallGuide";
import CallInvitations from '../../components/VideoCall/CallInvitations';
import DeviceCheck from "../../components/VideoCall/DeviceCheck";
import TopicSelection from "../../components/VideoCall/TopicSelection";
import MatchingScreen from "../../components/VideoCall/MatchingScreen";
import PartnerMatch from "../../components/VideoCall/PartnerMatch";
import CallRoom from "../../components/VideoCall/CallRoom";
import CallReview from "../../components/VideoCall/CallReview";
import CallRewards from "../../components/VideoCall/CallRewards";
import SafetyDialog from "../../components/VideoCall/SafetyDialog";
import { useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import VideoCallHeader from "../../components/VideoCall/VideoCallHeader";
import { useVideoCallFlow } from "../../hooks/videoCall/useVideoCallFlow";
import { useBodyScrollLock } from "../../hooks/videoCall/useBodyScrollLock";
import "./VideoCallPage.css";

export default function VideoCallPage() {
  const flow = useVideoCallFlow();
  const toast = useToast();
  const { notice, dismissNotice } = flow;
  useEffect(() => { if (notice) { toast({ message: notice }); dismissNotice(); } }, [notice, dismissNotice, toast]);
  useBodyScrollLock(flow.stage === "call");

  function renderStage() {
    switch (flow.stage) {
      case "topics":
        if (flow.call?.status === 'invited') return <section className="vc-centered vc-panel" aria-live="polite">
          <h1 className="text-h1">{flow.call.direction === 'incoming' ? 'Lời mời gọi video' : 'Đang chờ chấp nhận'}</h1>
          <p>{flow.partner.name} · {flow.call.topic}</p>
          {flow.call.direction === 'incoming' && <div className="vc-actions">
            <button className="vc-button" disabled={flow.busy} onClick={() => flow.decideInvitation('accept')}>Chấp nhận</button>
            <button className="vc-button vc-secondary" disabled={flow.busy} onClick={() => flow.decideInvitation('reject')}>Từ chối</button>
          </div>}
          <button className="vc-text-button" disabled={flow.busy} onClick={flow.showTopics}>Hủy lời mời</button>
        </section>;
        return (
          <TopicSelection
            selected={flow.selected}
            prompt={flow.prompt}
            onToggleTopic={flow.toggleTopic}
            onAddTopic={flow.addTopic}
            onPromptChange={flow.setPrompt}
            onSearch={() => flow.search()}
          />
        );
      case "search":
        return (
          <MatchingScreen elapsed={flow.elapsed} onCancel={flow.showTopics} />
        );
      case "match":
        return (
          <PartnerMatch
            partner={flow.partner}
            selected={flow.selected}
            prompt={flow.prompt}
            onStartCall={flow.checkDevices}
            onFindAnother={() => flow.search(true)}
            onEditTopics={flow.showTopics}
          />
        );
      case "devices":
        return <DeviceCheck onReady={flow.startCall} onBack={flow.showMatch} />;
      case "call":
        return (
          <CallRoom
            key={flow.call?.id || 'demo'}
            call={flow.call}
            partner={flow.partner}
            duration={flow.duration}
            mediaOptions={flow.mediaOptions}
            onEndCall={flow.endCall}
            onSafetyAction={flow.openSafetyDialog}
            onNotice={flow.showNotice}
          />
        );
      case "review":
        return (
          <CallReview
            partner={flow.partner}
            selected={flow.selected}
            duration={flow.duration}
            isBlocked={flow.isPartnerBlocked}
            onSafetyAction={flow.openSafetyDialog}
            onSubmit={flow.submitReview}
          />
        );
      case "thanks":
        return <CallRewards partner={flow.partner} onContinue={flow.showTopics} />;
      default:
        return null;
    }
  }

  return (
    <div className={`vc-page vc-stage-${flow.stage}`}>
      {!["call", "search"].includes(flow.stage) && <VideoCallHeader />}
      {flow.stage==='topics'&&<FirstCallGuide/>}
      {flow.stage==='topics'&&!flow.call&&<CallInvitations/>}
      {flow.busy && <p role="status">Đang kết nối máy chủ…</p>}
      {flow.error && <div role="alert"><p>{flow.error}</p><button className="vc-button vc-secondary" onClick={flow.showTopics}>Thử lại</button></div>}
      {renderStage()}
      {flow.safetyAction && (
        <SafetyDialog
          action={flow.safetyAction}
          partner={flow.partner}
          onClose={flow.closeSafetyDialog}
          onConfirm={flow.confirmSafetyAction}
        />
      )}
    </div>
  );
}
