import {Navigate,useParams} from 'react-router-dom';
import {useProgress} from '../../hooks/useProgress';
import ApiState from '../../components/ApiState';
export default function QuizRouteGuard({children}){const {quizId}=useParams(),{chapters,status,error,retry}=useProgress();if(status!=='ready'||error)return <ApiState error={error} retry={retry}/>;const chapter=chapters.find(row=>String(row.id)===quizId);return chapter&&chapter.total>0&&chapter.done===chapter.total?children:<Navigate to="/learning-path" replace/>;}
