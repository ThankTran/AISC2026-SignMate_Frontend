export function dateKey(value) {const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function statsHistory(history=[],days=30,today=new Date()) {
 const end=new Date(`${dateKey(today)}T12:00:00`),byDate=new Map(history.map(row=>[row.date,row]));
 return Array.from({length:days},(_,index)=>{const date=new Date(end);date.setDate(date.getDate()-days+1+index);const key=dateKey(date);return {date:key,xp:0,studySeconds:0,...byDate.get(key)};});
}
export function weeklyXp(history) {
 const weeks=new Map();
 for(const row of history){const day=new Date(`${row.date}T12:00:00`);day.setDate(day.getDate()-(day.getDay()+6)%7);const key=dateKey(day);weeks.set(key,(weeks.get(key)||0)+Math.max(0,Number(row.xp)||0));}
 return Array.from(weeks,([date,xp])=>({date,xp}));
}
export function learnedLessons(chapters=[]) {return chapters.reduce((sum,chapter)=>sum+Math.max(0,Math.min(Number(chapter.done)||0,Number(chapter.total)||0)),0);}
export function formatStudyTime(seconds=0) {const minutes=Math.floor(Math.max(0,seconds)/60);return `${Math.floor(minutes/60)} giờ ${minutes%60} phút`;}
