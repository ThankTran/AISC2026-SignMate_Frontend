import ErrorState from './ui/ErrorState';
import Skeleton from './ui/Skeleton';
export default function ApiState({error,retry}){return error?<ErrorState error={error} onRetry={retry}/>:<Skeleton/>;}
