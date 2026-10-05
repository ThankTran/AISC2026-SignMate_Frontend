import { VIDEO_DEMO } from "../../services/videoCall/config";
import { useDemoVideoCallFlow } from "./useDemoVideoCallFlow";
import { useServerVideoCallFlow } from "./useServerVideoCallFlow";
export const useVideoCallFlow = VIDEO_DEMO ? useDemoVideoCallFlow : useServerVideoCallFlow;
