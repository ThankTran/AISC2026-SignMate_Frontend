import { Navigate, useParams } from "react-router-dom";

import { canAccessChapterQuiz } from "../../mockdata";

/* Chỉ cho vào bài kiểm tra khi đã hoàn thành bài học cuối của chương */
const QuizRouteGuard = ({ children }) => {
  const { quizId } = useParams();

  if (!canAccessChapterQuiz(quizId)) {
    return <Navigate to="/learning-path" replace />;
  }

  return children;
};

export default QuizRouteGuard;