import FirstCallGuide from "../../components/VideoCall/FirstCallGuide";
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
