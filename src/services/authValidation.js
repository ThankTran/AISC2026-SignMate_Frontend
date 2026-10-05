export const authErrorMessage = error => ({
 'auth/requires-recent-login':'Vui lòng xác thực lại tài khoản rồi thử lại.',
 'auth/wrong-password':'Mật khẩu không đúng.', 'auth/user-not-found':'Email này chưa có tài khoản.',
 'auth/invalid-credential':'Email hoặc mật khẩu không đúng.', 'auth/invalid-email':'Email không hợp lệ.',
 'auth/email-already-in-use':'Email này đã được đăng ký.', 'auth/weak-password':'Mật khẩu quá yếu. Hãy dùng ít nhất 8 ký tự.',
 'auth/too-many-requests':'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.', 'auth/network-request-failed':'Mất kết nối mạng. Vui lòng kiểm tra kết nối.',
 'auth/popup-closed-by-user':'Bạn đã đóng cửa sổ đăng nhập Google.', 'auth/popup-blocked':'Trình duyệt chặn cửa sổ đăng nhập. Vui lòng cho phép popup.',
 'auth/user-disabled':'Tài khoản đã bị vô hiệu hóa.', 'auth/account-exists-with-different-credential':'Email đã dùng phương thức đăng nhập khác.'
}[error.code] || error.message || 'Không thể hoàn tất. Vui lòng thử lại.');
export function validateAuthField(name,value,password='') { if(!value.trim())return 'Vui lòng điền trường này.';if(name==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return 'Email không hợp lệ.';if(name==='password'&&value.length<8)return 'Mật khẩu cần ít nhất 8 ký tự.';if(name==='confirmPw'&&value!==password)return 'Mật khẩu xác nhận không khớp.';return ''; }
