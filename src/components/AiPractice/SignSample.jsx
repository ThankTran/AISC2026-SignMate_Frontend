import {useState} from 'react';
import {handSign} from '../../services/handSign';
export default function SignSample({label, videoRef}) {
  const [failed, setFailed] = useState(false);
  return <section className="sign-sample" aria-label={`Video mẫu ${label}`}>
    {failed ? <p role="status">Hiện không có video mẫu phát được cho động tác này.</p> : <video ref={videoRef} src={handSign.sample(label)} controls playsInline preload="metadata" onError={() => setFailed(true)} aria-label={`Động tác mẫu ${label}`}/>}
    <p>Quan sát tay và khuôn mặt, sau đó thực hiện trọn vẹn động tác trong khung hình.</p>
  </section>;
}
