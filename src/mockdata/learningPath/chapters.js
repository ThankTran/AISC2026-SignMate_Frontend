import {deriveProgress,initialProgress} from '../../utils/progress.js';
export const CHAPTERS=deriveProgress(initialProgress()).chapters;
export const SON_CHUONG_LABEL={completed:'Hoàn thành',active:'Đang học',locked:'Bị khóa'};
export const getChapterById=id=>CHAPTERS.find(row=>row.id===Number(id));
export const getLastLessonStatus=chapter=>chapter?.lessons?.at(-1)?.status||null;
export const canAccessChapterQuiz=id=>getChapterById(id)?.quiz.status==='unlocked';
