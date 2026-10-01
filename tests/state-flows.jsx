import {FriendsProvider} from '../src/contexts/FriendsContext';
import {ConfirmProvider} from '../src/components/ui/ConfirmDialog';
import FriendList from '../src/pages/Friends/FriendListPage';
import FriendRequests from '../src/pages/Friends/FriendRequestsPage';
import Calendar from '../src/pages/Friends/VideoCallInvitesPage';
import Profile from '../src/pages/Profile/Profile';
import {accountApi} from '../src/services/api';
accountApi.me=async()=>({});
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {ProgressContext} from '../src/hooks/useProgress';
import {CurrentUserContext} from '../src/hooks/useCurrentUser';
import {AuthContext} from '../src/hooks/useAuth';
import {initialProgress,deriveProgress} from '../src/utils/progress';
import ProtectedRoute from '../src/routes/ProtectedRoute';
import Dashboard from '../src/pages/Dashboard/Dashboard';
import LearningPath from '../src/pages/LearningPathPage/LearningPathPage';
import Leaderboard from '../src/pages/LeaderboardPage/LeaderboardPage';
import Stats from '../src/pages/Stats/Stats';
import {ToastProvider} from '../src/components/ui/ToastProvider';
import '../src/index.css';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const root=createRoot(document.getElementById('root')),results=[];
const check=(name,ok)=>{results.push(`${ok?'PASS':'FAIL'} ${name}`);document.getElementById('results').textContent=results.join('\n');if(!ok)throw Error(name);};
const profile={uid:'test-only',name:'Test',_profileStatus:'ready',hasSetLevel:true,onboardingComplete:true};
const base=deriveProgress(initialProgress(),profile),retry=()=>{};
try{
 for(const [name,Page] of [['Dashboard',Dashboard],['Learning Path',LearningPath],['Leaderboard',Leaderboard],['Stats',Stats]]){
  for(const status of ['loading','error','empty']){
   const value={...base,status:status==='empty'?'ready':status,error:status==='error'?Error('Test network failure'):null,retry,chapters:status==='empty'?[]:base.chapters,leaderboard:status==='empty'?[]:base.leaderboard};
   await act(async()=>root.render(<MemoryRouter><CurrentUserContext.Provider value={profile}><ProgressContext.Provider value={value}><ToastProvider><Page/></ToastProvider></ProgressContext.Provider></CurrentUserContext.Provider></MemoryRouter>));
   check(`${name} ${status}`,status==='loading'?!!document.querySelector('[aria-busy=true]'):status==='error'?document.body.textContent.includes('Thử lại'):!!document.querySelector('.ui-data-state'));
  }
 }
 for(const [name,Page] of [['Friends',FriendList],['Requests',FriendRequests],['Calendar',Calendar]]){
  for(const status of ['loading','error','empty']){
   const loader=()=>status==='loading'?new Promise(()=>{}):status==='error'?Promise.reject(Error('Test network failure')):Promise.resolve({friends:[],incomingRequests:[],incomingScheduleRequests:[],scheduledSessions:[]});
   await act(async()=>root.render(<MemoryRouter key={`${name}-${status}`}><FriendsProvider loader={loader}><ToastProvider><ConfirmProvider><Page/></ConfirmProvider></ToastProvider></FriendsProvider></MemoryRouter>));
   check(`${name} ${status}`,status==='loading'?!!document.querySelector('[aria-busy=true]'):status==='error'?document.body.textContent.includes('Thử lại'):!!document.querySelector('.ui-data-state'));
  }
 }
 for(const status of ['loading','error','empty']){
  const current={...profile,_profileStatus:status==='empty'?'ready':status,_profileError:status==='error'?Error('Test failure'):null,...(status==='empty'?{name:'',displayName:'',email:''}:{})};
  await act(async()=>root.render(<MemoryRouter key={status}><CurrentUserContext.Provider value={current}><ToastProvider><ConfirmProvider><Profile/></ConfirmProvider></ToastProvider></CurrentUserContext.Provider></MemoryRouter>));
  check(`Profile ${status}`,status==='loading'?!!document.querySelector('[aria-busy=true]'):status==='error'?document.body.textContent.includes('Thử lại'):!!document.querySelector('.ui-data-state'));
 }
 const cases=[['anonymous',null,profile,'login'],['unverified',{emailVerified:false},profile,'verify-email'],['level unset',{emailVerified:true},{...profile,hasSetLevel:false},'level'],['onboarding unfinished',{emailVerified:true},{...profile,onboardingComplete:false},'onboarding'],['ready',{emailVerified:true},profile,'protected']];
 for(const [name,user,current,expected] of cases){await act(async()=>root.render(<MemoryRouter key={name} initialEntries={['/dashboard']}><AuthContext.Provider value={{user,loading:false}}><CurrentUserContext.Provider value={current}><Routes><Route path="/dashboard" element={<ProtectedRoute><p id="destination">protected</p></ProtectedRoute>}/>{['login','verify-email','level','onboarding'].map(path=><Route key={path} path={`/${path}`} element={<p id="destination">{path}</p>}/>)}</Routes></CurrentUserContext.Provider></AuthContext.Provider></MemoryRouter>));check(`auth routing: ${name}`,document.querySelector('#destination')?.textContent===expected);}
 document.title=`PASS ${results.length} state and routing checks`;
}catch(error){document.title='FAIL state checks';document.getElementById('results').textContent+='\n'+error.stack;}
