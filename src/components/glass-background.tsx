"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function GlassBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated glass orbs */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-white/5 backdrop-blur-xl rounded-full border border-white/10"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-40 right-32 w-24 h-24 bg-white/3 backdrop-blur-xl rounded-full border border-white/8"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      <motion.div
        className="absolute bottom-32 left-1/4 w-20 h-20 bg-white/4 backdrop-blur-xl rounded-full border border-white/6"
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-20 w-28 h-28 bg-white/2 backdrop-blur-xl rounded-full border border-white/5"
        animate={{
          x: [0, -40, 0],
          y: [0, 80, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />

      {/* Floating glass rectangles */}
      <motion.div
        className="absolute top-1/3 left-10 w-16 h-16 bg-white/3 backdrop-blur-xl rounded-lg border border-white/8 rotate-45"
        animate={{
          rotate: [45, 225, 45],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-16 w-12 h-12 bg-white/2 backdrop-blur-xl rounded-lg border border-white/6 -rotate-12"
        animate={{
          rotate: [-12, 348, -12],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
          delay: 5
        }}
      />
    </div>
  );
}
