// src/theme/animations.ts
export const pageTransitions = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

export const cardHover = {
  hover: { 
    y: -4, 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    y: 0, 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};