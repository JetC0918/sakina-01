import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animation-utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition component wraps page content to provide smooth
 * entry/exit animations during route changes.
 *
 * Usage:
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <PageTransition>
 *       <div>Page content</div>
 *     </PageTransition>
 *   );
 * }
 * ```
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
