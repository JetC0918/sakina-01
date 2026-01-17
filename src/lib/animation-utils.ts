import { Variants } from 'framer-motion';

/**
 * Standard page transition variants for route changes.
 * Usage: Apply to page wrapper with AnimatePresence.
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Container variants for staggered children animations.
 * Usage: Apply to parent container of list items.
 */
export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Item variants for staggered children animations.
 * Usage: Apply to child elements within containerVariants parent.
 */
export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * Card hover/tap variants for interactive elements.
 * Usage: Apply to card components with whileHover/whileTap props.
 */
export const cardInteractionProps = {
  whileHover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  whileTap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Button tap variant for tactile feedback.
 * Usage: Apply to button components with whileTap prop.
 */
export const buttonTapProps = {
  whileTap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Fade in/out variants for simple visibility toggles.
 * Usage: Apply to modal overlays or conditional UI elements.
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Slide up variants for bottom sheet or drawer animations.
 * Usage: Apply to Sheet components or mobile menus.
 */
export const slideUpVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};
