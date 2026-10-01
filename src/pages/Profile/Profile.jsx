import DataState from "../../components/ui/DataState";
import { useState, useRef } from 'react';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, reauthenticateWithPopup, GoogleAuthProvider, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import { useApiResource } from '../../hooks/useApiResource';
import { accountApi } from '../../services/api';
import { authErrorMessage } from '../../services/authValidation';
import Avatar from '../../components/ui/Avatar';
import LevelBadges from '../../components/ui/LevelBadges';
import Modal from '../../components/ui/Modal';
import './Profile.css';

function RadioGroup({label, options, value, onChange, disabled}) {
 const [focusValue,setFocusValue]=useState(null);
 return <div role="radiogroup" aria-label={label} className="pf-options">{options.map((option,index)=><button type="button" role="radio" key={option.id} disabled={disabled} aria-checked={value===option.id} tabIndex={(focusValue||value||options[0].id)===option.id?0:-1} onFocus={()=>setFocusValue(option.id)} onClick={()=>onChange(option.id)} onKeyDown={event=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%options.length;else if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+options.length-1)%options.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=options.length-1;else return;event.preventDefault();event.currentTarget.parentElement.children[next].focus();onChange(options[next].id);}}><strong>{option.label}</strong>{option.description&&<span>{option.description}</span>}</button>)}</div>;
}
function EditableField({label,value,onSave,disabled,maxLength}) {
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState(value||'');
 return <form className="pf-field" onSubmit={async event=>{event.preventDefault();if(await onSave(draft.trim()))setEditing(false);}}><span>{label}</span><div>{editing?<input aria-label={label} autoFocus maxLength={maxLength} value={draft} disabled={disabled} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Escape')setEditing(false);}}/>:<p>{value||'Chưa có thông tin'}</p>}{editing?<><button disabled={disabled}>Lưu</button><button type="button" disabled={disabled} onClick={()=>setEditing(false)}>Hủy</button></>:<button type="button" disabled={disabled} onClick={()=>{setDraft(value||'');setEditing(true);}}>Sửa<span className="sr-only"> {label}</span></button>}</div></form>;
}
export default function ProfilePage() {
 const current=useCurrentUser(),toast=useToast(),confirm=useConfirm();
 const {data:storedProfile}=useApiResource(accountApi.me);
 const [saving,setSaving]=useState(false),[dialog,setDialog]=useState(null),[error,setError]=useState('');
 const busy=useRef(false);
 const profile={name:current.displayName,bio:current.bio??storedProfile?.bio??'',userType:current.userType||storedProfile?.userType||'deaf',privacy:current.privacy||storedProfile?.privacy||{profile:'public',friendList:'friends',stats:'public'}};
 async function update(patch) {
  if(busy.current)return false;
  const user=auth.currentUser;if(!user)return false;
  busy.current=true;setSaving(true);setError('');
  try {
   const next={...profile,...patch};if(!next.name.trim())throw new Error('Tên không được để trống.');
   const saved=await accountApi.update(next);
   current._updateProfile(saved);
   await updateProfile(user,{displayName:saved.name});
   toast({type:'success',message:'Đã lưu hồ sơ.'});return true;
  } catch(err){setError(err.message);toast({type:'error',message:'Chưa lưu hoàn tất hồ sơ. Vui lòng thử lại.'});return false;}
  finally{busy.current=false;setSaving(false);}
 }
 async function openDelete() {
  if(await confirm({title:'Xóa tài khoản?',message:'Hồ sơ, tiến độ học, kết nối và lịch sử cuộc gọi liên quan đến bạn sẽ bị xóa. Thao tác này không thể hoàn tác.',confirmationText:current.email||'XÓA TÀI KHOẢN',confirmLabel:'Tiếp tục xóa'}))setDialog('delete');
 }
 if(current._profileStatus==='loading'||current._profileError)return <DataState status={current._profileStatus} error={current._profileError}/>;
 if(!current.displayName&&!current.email)return <DataState empty title="Chưa có thông tin hồ sơ" description="Đăng nhập để tạo hồ sơ của bạn." to="/login" actionLabel="Đăng nhập"/>;
 return <div className="pf"><header><h1 className="text-h1">Hồ sơ</h1><p>Thông tin cá nhân và quyền riêng tư của bạn.</p></header>{error&&<p role="alert">{error}</p>}<p role="status">{saving?'Đang lưu…':''}</p><section className="pf-card"><div className="pf-identity"><Avatar user={current} size="xl"/><div><h2 className="text-h2">{current.displayName}</h2><LevelBadges user={current}/></div></div><EditableField label="Tên người dùng" maxLength={100} value={profile.name} disabled={saving} onSave={name=>update({name})}/><EditableField label="Giới thiệu bản thân" maxLength={500} value={profile.bio} disabled={saving} onSave={bio=>update({bio})}/></section>
 <section className="pf-card"><h2 className="text-h2">Loại người dùng</h2><p>Thông tin giúp cá nhân hóa trải nghiệm kết nối. Mọi người đều có thể học và sử dụng ngôn ngữ ký hiệu.</p><RadioGroup label="Loại người dùng" disabled={saving} value={profile.userType} onChange={userType=>update({userType})} options={[{id:'deaf',label:'Người khiếm thính',description:'Dành cho người điếc hoặc có mức độ nghe suy giảm.'},{id:'hearing',label:'Người nghe',description:'Dành cho người có khả năng nghe, quan tâm đến ngôn ngữ ký hiệu.'}]}/></section>
 <section className="pf-card"><h2 className="text-h2">Quyền riêng tư</h2>{[['profile','Hồ sơ cá nhân'],['friendList','Danh sách bạn bè'],['stats','Thống kê học tập']].map(([id,label])=><div className="pf-field" key={id}><span>{label}</span><RadioGroup label={label} disabled={saving} value={profile.privacy[id]} onChange={value=>update({privacy:{...profile.privacy,[id]:value}})} options={[{id:'public',label:'Công khai'},{id:'friends',label:'Bạn bè'},{id:'private',label:'Riêng tư'}]}/></div>)}</section>
 <section className="pf-card"><h2 className="text-h2">Tài khoản</h2><div className="pf-field"><span>Email (chỉ đọc)</span><p>{current.email}</p></div><div className="pf-account-actions"><button disabled={saving} onClick={()=>setDialog('password')}>Đổi mật khẩu</button><button disabled={saving} className="pf-danger" onClick={openDelete}>Xóa tài khoản</button></div></section>{dialog&&<AccountAction mode={dialog} onClose={()=>setDialog(null)}/>}</div>;
}
function AccountAction({mode,onClose}) {
 const toast=useToast();const [password,setPassword]=useState(''),[next,setNext]=useState(''),[repeat,setRepeat]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const user=auth.currentUser,hasPassword=user?.providerData.some(provider=>provider.providerId==='password');
 async function submit(event) {
  event.preventDefault();if(busy)return;
  if(mode==='password'&&(next.length<8||next!==repeat)){setError('Mật khẩu cần ít nhất 8 ký tự và xác nhận phải khớp.');return;}
  setBusy(true);setError('');
  let deletedBackend=false;
  try {
   if(hasPassword)await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,password));
   else await reauthenticateWithPopup(user,new GoogleAuthProvider());
   if(mode==='password') {await updatePassword(user,next);toast({type:'success',message:'Đã đổi mật khẩu.'});onClose();}
   else {await user.getIdToken(true);await accountApi.deleteAccount();deletedBackend=true;await deleteDoc(doc(db,'users',user.uid));await deleteUser(user);window.location.replace('/');}
  } catch(err){setError(deletedBackend?'Đã xóa dữ liệu trên máy chủ SignMate nhưng chưa xóa xong tài khoản Firebase. Vui lòng giữ cửa sổ này và thử lại.':err.code?authErrorMessage(err):err.message||'Chưa hoàn tất thao tác. Vui lòng thử lại.');}
  finally{setBusy(false);}
 }
 return <Modal labelledBy="pf-account-title" onClose={busy?undefined:onClose} closeOnEscape={!busy} closeOnOutside={!busy}><form className="pf-account-form" onSubmit={submit}><h2 id="pf-account-title" className="text-h2">{mode==='delete'?'Xác thực để xóa tài khoản':'Đổi mật khẩu'}</h2><p>{hasPassword?'Nhập mật khẩu hiện tại để xác thực tài khoản.':'Xác thực lại với Google để tiếp tục.'}</p>{hasPassword&&<label>Mật khẩu hiện tại<input type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)} disabled={busy}/></label>}{mode==='password'&&<><label>Mật khẩu mới<input type="password" autoComplete="new-password" minLength={8} required value={next} onChange={event=>setNext(event.target.value)} disabled={busy}/></label><label>Nhập lại mật khẩu mới<input type="password" autoComplete="new-password" required value={repeat} onChange={event=>setRepeat(event.target.value)} disabled={busy}/></label></>}{error&&<p role="alert">{error}</p>}<div className="ui-dialog-actions"><button type="button" disabled={busy} onClick={onClose}>Hủy</button><button disabled={busy}>{busy?'Đang xử lý…':mode==='delete'?'Xóa tài khoản':'Lưu mật khẩu'}</button></div></form></Modal>;
}
