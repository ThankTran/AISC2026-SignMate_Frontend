import {createRoot} from 'react-dom/client';
import AiAnalyticsCard from '../src/components/AiPractice/AiAnalyticsCard';
import AiFeedbackCard from '../src/components/AiPractice/AiFeedbackCard';
import SignSample from '../src/components/AiPractice/SignSample';
import '../src/index.css';
import '../src/pages/AiPracticePage/AiPracticePage.css';
const result = {status:'correct', form:{score:91.4,status:'excellent',region_scores:{right_hand:94,face:81}},feedback:[{message:'Vùng này đang khớp tốt với các mẫu gần nhất.'}]};
createRoot(document.getElementById('root')).render(<main className="ai-practice"><div className="ai-practice__left"><h1 className="text-h1">Luyện tập ký hiệu · Kiểm thử giao diện</h1><SignSample label="An ủi"/><section className="practice-result"><span className="practice-result__eyebrow">CẦN THỬ LẠI</span><h2>Chưa thể xác nhận động tác</h2><p>Hệ thống chưa ghi nhận động tác khớp với mẫu “An ủi”.</p><p>Hãy giữ tay rõ trong khung hình, thực hiện trọn vẹn động tác và thử lại.</p><div className="practice-actions"><button>Xem động tác mẫu</button><button>Thử lại</button></div></section></div><aside className="ai-practice__right"><AiAnalyticsCard result={result} phase="result"/><AiFeedbackCard feedback={result.feedback[0].message}/><section className="practice-result practice-result--passed"><h2>Động tác đã đạt</h2><div className="practice-actions"><button>Thử lại</button><button className="practice-primary">Tiếp tục</button></div></section></aside></main>);
