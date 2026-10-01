import {useEffect,useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {useToast} from '../hooks/useToast';
import {errorMessage} from '../services/errorMessages';
export default function LearningAccessGuard({children,error}) {
 const navigate=useNavigate(),toast=useToast(),notified=useRef(false);
 const locked=error?.status===403&&['LESSON_LOCKED','LESSON_UNPUBLISHED'].includes(error.code);
 useEffect(()=>{if(locked&&!notified.current){notified.current=true;toast({type:'info',message:errorMessage(error)});navigate('/learning-path',{replace:true});}},[locked,error,toast,navigate]);
 return locked?null:children;
}
