import TopicSelection from "../../components/VideoCall/TopicSelection";
import MatchingScreen from "../../components/VideoCall/MatchingScreen";
import PartnerMatch from "../../components/VideoCall/PartnerMatch";
import CallRoom from "../../components/VideoCall/CallRoom";
import CallReview from "../../components/VideoCall/CallReview";
import CallRewards from "../../components/VideoCall/CallRewards";
import SafetyDialog from "../../components/VideoCall/SafetyDialog";
import CallNotice from "../../components/VideoCall/CallNotice";
import VideoCallHeader from "../../components/VideoCall/VideoCallHeader";
import { useVideoCallFlow } from "../../hooks/videoCall/useVideoCallFlow";
import { useBodyScrollLock } from "../../hooks/videoCall/useBodyScrollLock";
import "./VideoCallPage.css";

export default function VideoCallPage() {
  const flow = useVideoCallFlow();
  useBodyScrollLock(flow.stage === "call" || Boolean(flow.safetyAction));

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
            onStartCall={flow.startCall}
            onFindAnother={() => flow.search(true)}
            onEditTopics={flow.showTopics}
          />
        );
      case "call":
        return (
          <CallRoom
            partner={flow.partner}
            duration={flow.duration}
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
        return <CallRewards onContinue={flow.showTopics} />;
      default:
        return null;
    }
  }

  return (
    <div className={`vc-page vc-stage-${flow.stage}`}>
      {flow.notice && (
        <CallNotice message={flow.notice} onDismiss={flow.dismissNotice} />
      )}
      {!["call", "search"].includes(flow.stage) && <VideoCallHeader />}
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
