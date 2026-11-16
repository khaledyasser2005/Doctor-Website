import { useScroll, motion } from 'motion/react';

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress, transformOrigin: '0% 50%' }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-[#27C2A4] z-[80] pointer-events-none"
    />
  );
}
