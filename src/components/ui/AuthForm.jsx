import { useState } from 'react';
import { Link,useLocation,useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword,signInWithEmailAndPassword,updateProfile,signOut,sendEmailVerification } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import FormField from './FormField';
import { signInWithGoogle } from '../../services/googleAuth';
import { authErrorMessage,validateAuthField } from '../../services/authValidation';
export default function AuthForm({register=false}) {
 const [values,setValues]=useState({name:'',email:'',password:'',confirmPw:''}),[errors,setErrors]=useState({}),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const {setRegistering}=useAuth(),toast=useToast(),navigate=useNavigate(),location=useLocation();
 const fields=register?['name','email','password','confirmPw']:['email','password'];
 const validate=name=>validateAuthField(name,values[name],values.password);
 const afterLogin=()=>navigate(location.state?.from || '/dashboard',{replace:true});
 const submit=async event=>{event.preventDefault();if(busy)return;const next=Object.fromEntries(fields.map(name=>[name,validate(name)]));setErrors(next);if(Object.values(next).some(Boolean))return;setBusy(true);setError('');if(register)setRegistering(true);
 try { if(register){const {user}=await createUserWithEmailAndPassword(auth,values.email.trim(),values.password);await updateProfile(user,{displayName:values.name.trim()});await sendEmailVerification(user,{url:window.location.origin+'/verify-email'}).catch(()=>toast({type:'info',message:'Bạn có thể gửi lại email xác minh sau khi đăng nhập.'}));await signOut(auth);toast({type:'success',message:'Tạo tài khoản thành công, hãy đăng nhập'});navigate('/login',{replace:true});}else{await signInWithEmailAndPassword(auth,values.email.trim(),values.password);afterLogin();} }catch(err){setError(authErrorMessage(err));}finally{setBusy(false);if(register)setRegistering(false);} };
 const google=async()=>{if(busy)return;setBusy(true);setError('');try{await signInWithGoogle();afterLogin();}catch(err){setError(authErrorMessage(err));}finally{setBusy(false);}};
 const strength=[values.password.length>=8,/[a-z]/.test(values.password)&&/[A-Z]/.test(values.password),/\d/.test(values.password),/[^\w\s]/.test(values.password)].filter(Boolean).length;
 const labels={name:'Họ và tên',email:'Email',password:'Mật khẩu',confirmPw:'Xác nhận mật khẩu'};
 return <form className="auth-form" onSubmit={submit} noValidate aria-busy={busy}><h1 className="text-h1">{register?'Tạo tài khoản':'Đăng nhập'}</h1><p>{register?'Bắt đầu hành trình của bạn!':'Đăng nhập để tiếp tục hành trình học tập của bạn.'}</p>
 {fields.map(name=><FormField key={name} id={`auth-${name}`} label={labels[name]} type={name==='email'?'email':['password','confirmPw'].includes(name)?'password':'text'} autoComplete={name==='name'?'name':name==='email'?'email':register?'new-password':'current-password'} value={values[name]} required disabled={busy} onChange={e=>setValues(v=>({...v,[name]:e.target.value}))} onBlur={()=>setErrors(v=>({...v,[name]:validate(name)}))} error={errors[name]}/>)}
 {register&&<div><label htmlFor="password-strength">Độ mạnh mật khẩu: {['Chưa nhập','Yếu','Trung bình','Khá','Mạnh'][strength]}</label><meter id="password-strength" min="0" max="4" value={strength} low="2" high="3" optimum="4"/></div>}
 {error&&<p role="alert" className="auth-field-error">{error}</p>}<button className="auth-submit" type="submit" disabled={busy}>{busy?'Đang xử lý…':register?'Tạo tài khoản':'Đăng nhập'}</button><span className="auth-divider">hoặc</span><button type="button" className="auth-google" onClick={google} disabled={busy}>Tiếp tục với Google</button><p>{register?'Bạn đã có tài khoản?':'Chưa có tài khoản?'} <Link to={register?'/login':'/register'}>{register?'Đăng nhập':'Đăng ký miễn phí'}</Link></p>
 {!register&&<Link to="/forgot-password">Quên mật khẩu?</Link>}{register&&<p>Đọc <Link to="/terms">Điều khoản sử dụng</Link> và <Link to="/privacy">Chính sách bảo mật</Link> trước khi tạo tài khoản.</p>}
 </form>;
}
