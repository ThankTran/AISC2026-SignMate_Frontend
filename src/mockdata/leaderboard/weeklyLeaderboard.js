import {deriveProgress,initialProgress} from '../../utils/progress.js';
export const createLeaderboardMock=user=>deriveProgress(initialProgress(),user).leaderboard;
