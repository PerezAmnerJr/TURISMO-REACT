import { motion } from "framer-motion";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export default function BlurText({
  text,
  delay = 0,
  className = "",
}: BlurTextProps) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + index * 0.08,
          }}
          style={{ display: "inline-block", marginRight: "6px" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
