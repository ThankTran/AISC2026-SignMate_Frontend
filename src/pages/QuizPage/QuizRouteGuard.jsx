import {useEffect,useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {useToast} from '../../hooks/useToast';
export default function QuizRouteGuard({children,error}) {
 const navigate=useNavigate(),toast=useToast(),notified=useRef(false);
 useEffect(()=>{if(error?.status===403&&!notified.current){notified.current=true;toast({type:'info',message:'Hãy hoàn thành các bài học trong chương trước khi làm bài kiểm tra.'});navigate('/learning-path',{replace:true});}},[error,navigate,toast]);
 return error?.status===403?null:children;
}
