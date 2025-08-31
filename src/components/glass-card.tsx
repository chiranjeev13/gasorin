"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  duration?: number;
}

export function GlassCard({ 
  children, 
  className = "", 
  hover = true, 
  delay = 0, 
  duration = 0.3 
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-effect ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      whileHover={hover ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedGlassCard({ 
  children, 
  className = "", 
  delay = 0 
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-effect ${className}`}
      initial={{ opacity: 0, rotateX: -15, y: 50 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      whileHover={{
        rotateY: 2,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {children}
    </motion.div>
  );
}

export function FloatingGlassCard({ 
  children, 
  className = "" 
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-effect ${className}`}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
}
