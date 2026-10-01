import {chapters,lessons,leaderboard,notifications,userStats,quests} from '../mockdata/progress/index.js';
import {rankEntries,xpLevel} from './learningLevels.js';
import {dateKey,statsHistory} from './statsHistory.js';
export const initialProgress=()=>({version:1,userStats:{...userStats},completedLessons:[],lessonResults:{},quizResults:{},notifications:notifications.map(row=>({...row})),events:[]});
export function deriveProgress(state,user={},today=new Date()) {
 const done=new Set(state.completedLessons.map(Number));
 const catalog=chapters.map(chapter=>{const items=lessons.filter(lesson=>lesson.chapterId===chapter.id).map(lesson=>({...lesson,status:done.has(lesson.id)?'completed':lesson.id===1||done.has(lesson.id-1)?'active':'locked'}));const count=items.filter(row=>row.status==='completed').length;return {...chapter,tag:`CHƯƠNG ${chapter.id}`,lessons:items,total:items.length,done:count,status:items.length&&count===items.length?'completed':items.some(row=>row.status==='active')?'active':'locked',quiz:{score:state.quizResults[chapter.id]?.result.score,status:state.quizResults[chapter.id]?.result.score>=70?'completed':items.length&&count===items.length?'unlocked':'locked'}};});
 const history=statsHistory(state.userStats.activityHistory,90,today).map(row=>{const events=state.events.filter(event=>event.date===row.date);return {...row,xp:row.xp+events.reduce((sum,event)=>sum+event.xp,0),studySeconds:row.studySeconds+events.reduce((sum,event)=>sum+event.seconds,0)};});
 const xp=state.userStats.xp+state.events.reduce((sum,event)=>sum+event.xp,0),currentDate=dateKey(today);
 const monday=new Date(today);monday.setDate(monday.getDate()-(monday.getDay()+6)%7);const weekStart=dateKey(monday);
 const weeklyXp=history.filter(row=>row.date>=weekStart).reduce((sum,row)=>sum+row.xp,0);
 let streak=0,bestStreak=0,run=0;for(const row of history){run=row.xp>0?run+1:0;bestStreak=Math.max(bestStreak,run);}const recent=history.at(-1)?.xp>0?history:history.slice(0,-1);for(let i=recent.length-1;i>=0&&recent[i].xp>0;i--)streak++;
 const stats={...state.userStats,xp,xpLevel:xpLevel(xp),level:user.curriculumLevel||state.userStats.curriculumLevel,curriculumLevel:user.curriculumLevel||state.userStats.curriculumLevel,xpTarget:xpLevel(xp)*1000,xpRemaining:xpLevel(xp)*1000-xp,streak:Math.max(streak,state.userStats.streak),bestStreak:Math.max(bestStreak,state.userStats.bestStreak),lessonsLearned:catalog.reduce((sum,chapter)=>sum+chapter.done,0),weeklyXp,xpToday:history.at(-1)?.xp||0,activityHistory:history,weeklyActivity:history.filter(row=>row.date>=weekStart).map(row=>({...row,day:new Date(`${row.date}T12:00:00`).getDay()===0?'CN':`T${new Date(`${row.date}T12:00:00`).getDay()+1}`}))};
 const previousRanks=rankEntries(leaderboard.map(row=>({...row,weeklyXp:row.previousWeeklyXp})));
 const entries=rankEntries([...leaderboard.map(row=>({...row,previousRank:previousRanks.find(previous=>previous.id===row.id)?.rank})),{...user,id:'me',isMe:true,name:user.name||'Bạn',weeklyXp,totalXp:xp,curriculumLevel:stats.curriculumLevel}]);stats.rank=entries.find(row=>row.isMe)?.rank;
 const total=catalog.reduce((sum,row)=>sum+row.total,0),completed=catalog.reduce((sum,row)=>sum+row.done,0);
 return {stats,chapters:catalog,lessons:catalog.flatMap(row=>row.lessons),leaderboard:entries,notifications:state.notifications,totalLessons:total,completedLessons:completed,percent:total?Math.round(completed/total*100):0,nextLesson:catalog.flatMap(row=>row.lessons).find(row=>row.status==='active'),dailyQuests:quests.map(quest=>({...quest,done:state.events.some(event=>event.date===currentDate&&event.type===quest.type&&(quest.type!=='lesson'||event.passed===true)&&(quest.type!=='quiz'||event.score>=80))}))};
}
export function recordProgress(state,type,id,payload,today=new Date()) {
 const result=payload.result||payload,key=`${type}-${id}-${result.id||result.sessionId||JSON.stringify(result)}`;
 if(state.events.some(event=>event.key===key))return state;
 const xp=Math.max(0,Number(result.xp)||0),seconds=Math.max(0,Number(payload.elapsedSeconds??result.durationSeconds)||0);
 return {...state,completedLessons:type==='lesson'&&result.passed===true?[...new Set([...state.completedLessons,Number(id)])]:state.completedLessons,lessonResults:type==='lesson'?{...state.lessonResults,[id]:result}:state.lessonResults,quizResults:type==='quiz'?{...state.quizResults,[id]:payload}:state.quizResults,events:[...state.events,{key,type,date:dateKey(today),xp,seconds,score:result.score,passed:result.passed}],notifications:[{id:key,title:type==='lesson'?(result.passed===true?'Đã hoàn thành bài học':'Đã có kết quả bài học'):'Đã có kết quả kiểm tra',path:type==='quiz'?`/learning-path/quiz/${id}/result`:'/learning-path',time:'Vừa xong',read:false},...state.notifications]};
}
