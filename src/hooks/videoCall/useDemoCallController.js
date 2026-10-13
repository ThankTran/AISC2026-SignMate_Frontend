import { useEffect, useState, useSyncExternalStore } from "react";
import { createDemoCallController } from "../../services/videoCall/demoController.js";

export function useDemoCallController(selfName, scenario = "pre-call") {
  const [controller] = useState(() => createDemoCallController({ selfName }));
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  useEffect(() => {
    controller.actions.scenario(scenario);
    return () => controller.dispose();
  }, [controller, scenario]);
  return { ...state, actions: controller.actions };
}
