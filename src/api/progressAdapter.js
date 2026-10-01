// Convert server DTOs to the existing view model. Never infer completion or XP awards.
const numeric = (value, fallback = 0) => value != null && Number.isFinite(Number(value)) ? Number(value) : fallback;
export function adaptNotifications(rows = []) {
  return rows.map(row => ({...row, title: row.title || row.message || 'Thông báo',
    time: row.time || (row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : ''),
    path: row.path || (row.type?.startsWith('call') ? '/friends/video-call-invites' : row.type?.startsWith('friend') ? '/friends/friend-requests' : row.type?.includes('ai') ? '/practice-ai' : '/learning-path')}));
}
export function adaptLeaderboard(response = {}) {
  return (response.entries || []).map(row => ({...row, weeklyXp: numeric(row.weeklyXp),
    totalXp: numeric(row.totalXp ?? row.xp), xpLevel: numeric(row.xpLevel ?? row.level, 1),
    previousRank: row.previousRank == null ? null : numeric(row.previousRank),
    curriculumLevel: row.curriculumLevel || 'Cơ bản'}));
}
export function adaptProgress({dashboard = {}, stats: detail = {}, leaderboard = {}, notifications = []} = {}) {
  const raw = {...dashboard.stats, ...detail};
  const chapters = (dashboard.chapters || raw.chapters || []).map(chapter => {
    const lessons = (chapter.lessons || []).map(lesson => ({...lesson, chapterId: chapter.id}));
    return {...chapter, lessons, total: numeric(chapter.total, lessons.length), done: numeric(chapter.done),
      quiz: chapter.quiz || {status: 'locked', score: 0}};
  });
  const lessons = chapters.flatMap(chapter => chapter.lessons);
  const totalLessons = chapters.reduce((sum,chapter) => sum + chapter.total,0);
  const completedLessons = chapters.reduce((sum,chapter) => sum + chapter.done,0);
  const xp = numeric(raw.xp), xpLevel = numeric(raw.xpLevel ?? dashboard.xpLevel, Math.floor(xp / 1000) + 1);
  const xpTarget = numeric(raw.xpTarget, xpLevel * 1000);
  const curriculumLevel = raw.curriculumLevel || dashboard.curriculumLevel || 'Cơ bản';
  return {user: dashboard.user, stats: {...raw, xp, xpLevel, curriculumLevel, level: curriculumLevel,
      xpTarget, xpRemaining: numeric(raw.xpRemaining ?? dashboard.xpRemaining, Math.max(0,xpTarget - xp)),
      streak: numeric(raw.streak), bestStreak: numeric(raw.bestStreak), weeklyXp: numeric(raw.weeklyXp),
      xpToday: numeric(raw.xpToday), lessonsLearned: numeric(raw.lessonsLearned, completedLessons),
      activityHistory: raw.activityHistory || [], weeklyActivity: raw.weeklyActivity || [], aiAccuracyHistory: raw.aiAccuracyHistory || []},
    chapters, lessons, leaderboard: adaptLeaderboard(leaderboard), notifications: adaptNotifications(notifications),
    dailyQuests: (dashboard.dailyQuests || raw.dailyQuests || []).map(quest => ({...quest, xp: numeric(quest.xp), done: quest.done === true})),
    totalLessons, completedLessons, percent: totalLessons ? Math.round(completedLessons / totalLessons * 100) : 0,
    nextLesson: lessons.find(lesson => lesson.status === 'active' || lesson.status === 'unlocked')};
}
