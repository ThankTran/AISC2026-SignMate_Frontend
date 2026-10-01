import {CheckCircle2,Circle} from 'lucide-react';
export default function PasswordStrength({password,id='password-strength',showRules=false}) {
 const rules=[{met:password.length>=8,label:'Tối thiểu 8 ký tự'},
  {met:/[a-z]/.test(password)&&/[A-Z]/.test(password),label:'Có chữ hoa và chữ thường (gợi ý)'},
  {met:/\d/.test(password),label:'Có chữ số (gợi ý)'},
  {met:/[^\w\s]/.test(password),label:'Có ký tự đặc biệt (gợi ý)'}];
 const strength=rules.filter(rule=>rule.met).length;
 return <div><label htmlFor={id}>Độ mạnh mật khẩu: {['Chưa nhập','Yếu','Trung bình','Khá','Mạnh'][password?strength:0]}</label><meter id={id} min="0" max="4" value={strength} low="2" high="3" optimum="4"/>{showRules&&<ul className="auth-password-rules">{rules.map(rule=><li key={rule.label} className={rule.met?'is-met':''}>{rule.met?<CheckCircle2 size={16} aria-label="Đã đạt"/>:<Circle size={16} aria-label="Chưa đạt"/>}{rule.label}</li>)}</ul>}</div>;
}
