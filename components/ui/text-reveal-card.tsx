// components/text-reveal-card.tsx
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const TextRevealCard = ({
  text,
  revealText,
  className,
}: {
  text: string;
  revealText: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "border border-black/[0.2] dark:border-white/[0.2] p-4 rounded-lg",
        className
      )}
    >
      <motion.div
        className="text-black dark:text-white text-2xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {text}
      </motion.div>
      <motion.div
        className="text-black dark:text-white mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {revealText}
      </motion.div>
    </div>
  );
};