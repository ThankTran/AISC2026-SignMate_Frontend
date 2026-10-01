import {useProgress} from "../../hooks/useProgress";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Hand, HandHeart, Handshake, HeartHandshake, HeartPulse, Home, Users } from "lucide-react";
import "./LessonPage.css";
import LessonTopNav from "../../components/LessonPage/LessonTopNav";
import MediaView from "../../components/LessonPage/MediaView";
import QuizSection from "../../components/LessonPage/QuizSection";
import LessonFooter from "../../components/LessonPage/LessonFooter";
import LessonResultModal from "../../components/LessonPage/LessonResultModal";
import OutOfHeartsModal from "../../components/LessonPage/OutOfHeartsModal";
import ApiState from "../../components/ApiState";
import { useApiResource } from "../../hooks/useApiResource";
import { learningApi } from "../../services/api";
import { checkLessonAnswer, finishLesson } from "../../services/lessonApi";

const ICONS = { hand: Hand, handHeart: HandHeart, handshake: Handshake,
  heartHandshake: HeartHandshake, heartPulse: HeartPulse, home: Home, users: Users, bookOpen: BookOpen };

function LessonSession({ lesson }) {
 const {recordLesson}=useProgress();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [hearts, setHearts] = useState(lesson.maxHearts);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const busy = useRef(false);
  const [questions] = useState(() => lesson.questions.map(q => { const options = [...q.options]; for (let i=options.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [options[i],options[j]]=[options[j],options[i]]; } return {...q,options}; }));
  const raw = questions[questionIndex];
  const question = { ...raw, icon: ICONS[raw.options[0]?.icon] || Hand,
    question: "Ký hiệu trong video có nghĩa là gì?",
    correctAnswer: result?.correctOptionId,
    options: raw.options.map((option) => ({ ...option, icon: ICONS[option.icon] || Hand })) };
  const isLast = questionIndex === lesson.questions.length - 1;

  async function handleCheck() {
    if (!selected || result || busy.current) return;
    busy.current = true; setChecking(true); setError(null);
    try {
      const answer = await checkLessonAnswer({ lessonId: lesson.id, questionId: raw.id,
        selectedOptionId: selected, userSessionId: sessionId });
      setResult(answer); setHearts(answer.hearts);
    } catch (err) { setError(err); }
    finally { busy.current = false; setChecking(false); }
  }
  async function complete() {
    if (busy.current) return;
    busy.current = true; setChecking(true); setError(null);
    try {
      const completed=await finishLesson({ lessonId: lesson.id, userSessionId: sessionId }); recordLesson(lesson.id,{...completed,sessionId});setSummary(completed);
    } catch (err) { setError(err); }
    finally { busy.current = false; setChecking(false); }
  }
  function advance() {
    if (!result || busy.current) return;
    if (isLast) { complete(); return; }
    setQuestionIndex((i) => i + 1); setSelected(null); setResult(null); setError(null);
  }
  function retake() {
    if (busy.current) return;
    setSessionId(crypto.randomUUID()); setSelected(null); setResult(null);
    setHearts(lesson.maxHearts); setQuestionIndex(0); setSummary(null); setError(null);
  }
  useEffect(() => {
    const keydown = (event) => {
      if (summary || hearts <= 0 || checking || document.querySelector('[role="dialog"]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      const index = 'abcd'.indexOf(event.key.toLowerCase());
      if (index >= 0 && !result && question.options[index]) { event.preventDefault(); setSelected(question.options[index].id); }
      if (event.key === 'Enter' && !event.target.closest('a,.vp-frame,.lesson-topnav')) { event.preventDefault(); if (result) advance(); else handleCheck(); }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  });
  return <div className="lesson">
    <LessonTopNav title={lesson.title} completed={questionIndex + (result ? 1 : 0)} hearts={hearts} currentQuestion={questionIndex + 1} totalQuestions={lesson.questions.length} />
    {error && <p role="alert">{error.message} <button type="button" disabled={checking}
      onClick={result && isLast ? complete : handleCheck}>Thử lại</button></p>}
    <div className="lesson__body">
      <MediaView question={question} />
      <QuizSection question={question} selected={selected} result={result}
        onSelect={(id) => { if (!result && !checking) setSelected(id); }} />
    </div>
    <LessonFooter lessonTitle={lesson.title} selected={selected} result={result} checking={checking}
      questionIndex={questionIndex + 1} totalQuestions={lesson.questions.length}
      remainingQuestions={lesson.questions.length - questionIndex - 1} isLast={isLast}
      correctAnswerName={question.options.find((o) => o.id === result?.correctOptionId)?.title}
      firstTimeCorrect={result?.correct === true} onCheck={handleCheck} onAdvance={advance} />
    {summary && <LessonResultModal lessonId={lesson.id} summary={summary} onClose={() => navigate("/learning-path")} onRetake={retake}
      onNext={() => navigate("/learning-path")} />}
    {hearts <= 0 && !summary && <OutOfHeartsModal />}
  </div>;
}
export default function LessonPage() {
  const { lessonId } = useParams();
  const load = useCallback(() => learningApi.lesson(lessonId), [lessonId]);
  const { data, error } = useApiResource(load);
  if (!data || String(data.id) !== lessonId) return <ApiState error={error} />;
  if (!data.questions?.length) return <p role="status">Bài học đang được cập nhật. Vui lòng quay lại lộ trình để chọn bài khác.</p>;
  return <LessonSession key={lessonId} lesson={data} />;
}
