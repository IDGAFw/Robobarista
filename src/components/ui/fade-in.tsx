'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }} // Анимируется, когда доскроллили
      viewport={{ once: true, margin: "-10% 0px" }} // Сработает один раз
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}