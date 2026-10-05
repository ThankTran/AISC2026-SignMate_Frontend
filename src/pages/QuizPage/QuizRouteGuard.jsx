import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { errorMessage } from "../../services/errorMessages";
export default function QuizRouteGuard({ children, error }) {
  const navigate = useNavigate(),
    toast = useToast(),
    notified = useRef(false);

  useEffect(() => {
    if (error?.status === 403 && !notified.current) {
      notified.current = true;
      toast({
        type: "info",
        message: errorMessage({ status: 403, code: error.code || "QUIZ_LOCKED" }),
      });
      navigate("/learning-path", { replace: true });
    }
  }, [error, navigate, toast]);

  return error?.status === 403 ? null : children;
}
