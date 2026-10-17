import { motion } from "framer-motion";

type Props = {
  text: string;
  checked: boolean;
  onToggle: () => void;
};

export default function CheckItem({ text, checked, onToggle }: Props) {
  return (
    <button onClick={onToggle} className="group flex w-full items-center gap-3 py-1 text-left">
      <motion.span
        whileTap={{ scale: 0.82, rotate: -8 }}
        style={{ rotate: "-2deg" }}
        className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-[4px] border-[2.5px] transition-colors ${
          checked
            ? "border-[#1c1a17] bg-[#fdfaf1]"
            : "border-[#1c1a17]/60 bg-white/50 group-hover:border-[#1c1a17] group-hover:bg-white/80"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 overflow-visible">
          <motion.path
            d="M4 12.5 L10 18 L20 5.5"
            fill="none"
            stroke="#d33f2e"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          />
        </svg>
      </motion.span>
      <span
        className={`font-hand text-lg leading-snug transition-colors md:text-xl ${
          checked
            ? "text-[#1c1a17]/40 line-through decoration-[#d33f2e]/80 decoration-[3px]"
            : "text-[#1c1a17]"
        }`}
      >
        {text}
      </span>
    </button>
  );
}
