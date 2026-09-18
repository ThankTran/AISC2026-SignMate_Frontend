import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/* Tự động cuộn lên đầu trang (Khung Main) mỗi khi chuyển Route */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const mainEl = document.querySelector(".main-layout__body");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "instant" });
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;