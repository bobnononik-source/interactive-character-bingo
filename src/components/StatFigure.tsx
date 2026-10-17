import { useId } from "react";
import { motion } from "framer-motion";

const HEAD = <circle cx="30" cy="12" r="8.5" />;
// человечек с руками на бёдрах — чётче, чем набросок
const BODY =
  "M30 21 C24 21 20 25 19 30 L11 38 C9 40 10 43 13 43 L20 41 C19 47 19 52 20 57 L17 88 L25 88 L29 64 L31 64 L35 88 L43 88 L40 57 C41 52 41 47 40 41 L47 43 C50 43 51 40 49 38 L41 30 C40 25 36 21 30 21 Z";

const TILTS = [-2, 1.5, -1, 2, -1.5];

type Props = {
  label: string;
  color: string;
  value: number; // 0..5
  index: number;
  onBump: () => void;
};

export default function StatFigure({ label, color, value, index, onBump }: Props) {
  const clipId = `fig-${useId().replace(/:/g, "")}`;
  const rot = TILTS[index % TILTS.length];
  const fillH = (value / 5) * 96;

  return (
    <button
      onClick={onBump}
      aria-label={`${label}: ${value} из 5`}
      className="group flex flex-col items-center gap-1"
    >
      <motion.svg
        viewBox="0 0 60 96"
        initial={{ rotate: rot }}
        whileHover={{ rotate: rot * 2.2, y: -4 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
        className="h-24 w-14 overflow-visible md:h-28 md:w-16"
      >
        <defs>
          <clipPath id={clipId}>
            {HEAD}
            <path d={BODY} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {value > 0 && (
            <rect
              x="0"
              y={96 - fillH}
              width="60"
              height={fillH}
              fill={color}
              opacity="0.9"
              filter="url(#rough)"
            />
          )}
        </g>
        <g
          filter="url(#rough)"
          stroke="#1c1a17"
          strokeWidth="2.6"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {HEAD}
          <path d={BODY} />
        </g>
      </motion.svg>
      <span className="font-hand text-center text-sm leading-tight text-[#1c1a17] md:text-lg">
        {label}
      </span>
      <span className="font-mono text-[10px] text-[#1c1a17]/50">{value}/5</span>
    </button>
  );
}
