import {useEffect,useState} from 'react';
import {useFriends} from './useFriends';
import {socialApi} from '../services/api';
import {adaptFriend} from '../api/friendsAdapter';
export function useFriendSearch(value){
 const {source,friends}=useFriends(),query=value.trim(),[result,setResult]=useState(null),[revision,setRevision]=useState(0);
 useEffect(()=>{
  if(query.length<2)return;
  let active=true;
  const timer=setTimeout(async()=>{try{
   const rows=source==='mock'?friends.filter(row=>row.name.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))):await socialApi.search(query);
   if(active)setResult({query,revision,data:rows.map(adaptFriend)});
  }catch(error){if(active)setResult({query,revision,error,data:[]});}},300);
  return()=>{active=false;clearTimeout(timer);};
 },[query,revision,source,friends]);
 const current=result?.query===query&&result?.revision===revision?result:null;
 return {data:query.length<2?[]:current?.data||[],status:query.length<2?'idle':current?.error?'error':current?'ready':'loading',error:current?.error,retry:()=>setRevision(value=>value+1)};
}
