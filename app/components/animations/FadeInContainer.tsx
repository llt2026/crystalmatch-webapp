import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

type FadeInContainerProps = {
  children: ReactNode;
  className?: string;
};

export function FadeInContainer({ children, className = '' }: FadeInContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
} 