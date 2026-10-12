import { motion, useReducedMotion } from "framer-motion";

/**
 * Các variants cấu hình chuẩn cho hiệu ứng cuộn trang (Scroll Reveal / Fade-up):
 * - Trạng thái ban đầu: Ẩn (opacity: 0), dịch chuyển yOffset (35px, trong khoảng 30px - 40px)
 * - Khi cuộn tới viewport (15% - 20%): mờ dần trồi lên (opacity: 1, y: 0) mượt mà (duration: 0.6s, ease-out)
 * - Chỉ chạy 1 lần duy nhất (once: true)
 * - So le (Stagger): 0.12s (trong khoảng 0.1s - 0.15s) giữa các thẻ
 * - Hỗ trợ chuẩn tiếp cận WCAG (prefers-reduced-motion)
 */
const createContainerVariants = (staggerDelay = 0.12, shouldReduce = false) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: shouldReduce ? 0 : staggerDelay,
      delayChildren: 0.05,
    },
  },
});

const createCardVariants = (yOffset = 35, duration = 0.6, shouldReduce = false) => ({
  hidden: {
    opacity: 0,
    y: shouldReduce ? 0 : yOffset,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      ease: [0.16, 1, 0.3, 1],
    },
  },
});

/**
 * ScrollRevealGrid: Container bọc lưới danh sách thẻ
 */
export const ScrollRevealGrid = ({
  children,
  className = "",
  staggerDelay = 0.12,
  viewportAmount = 0.2,
  as: Component = motion.div,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = createContainerVariants(staggerDelay, shouldReduceMotion);

  return (
    <Component
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: viewportAmount,
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * ScrollRevealCard: Từng thẻ con trong danh sách, trồi lên khi cuộn tới và hỗ trợ hover
 */
export const ScrollRevealCard = ({
  children,
  className = "",
  yOffset = 35,
  duration = 0.6,
  hoverY = -4,
  as: Component = motion.div,
  variants,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const defaultVariants = createCardVariants(yOffset, duration, shouldReduceMotion);

  return (
    <Component
      variants={variants || defaultVariants}
      whileHover={
        shouldReduceMotion || hoverY === 0
          ? undefined
          : {
              y: hoverY,
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }
      className={`will-change-transform ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default ScrollRevealGrid;
