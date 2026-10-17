import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";

type Props = {
  leftLabel: string;
  rightLabel: string;
  value: number | null;
  onSet: (v: number) => void;
};

/** Шкала-склонность: одна линия, один кружочек для отметки */
export default function InkSlider({ leftLabel, rightLabel, value, onSet }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pct = (clientX: number) => {
    const el = track.current;
    if (!el) return 50;
    const r = el.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    onSet(pct(e.clientX));
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* перетаскивание и так работает */
    }
  };

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    onSet(pct(e.clientX));
  };

  const up = () => {
    dragging.current = false;
  };

  return (
    <div className="select-none">
      <div className="flex items-start justify-between gap-4">
        <span className="max-w-[46%] font-hand text-base leading-tight text-[#1c1a17] md:text-xl">
          {leftLabel}
        </span>
        <span className="max-w-[46%] text-right font-hand text-base leading-tight text-[#1c1a17] md:text-xl">
          {rightLabel}
        </span>
      </div>

      <div
        ref={track}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="slider"
        aria-label={`${leftLabel} — ${rightLabel}`}
        aria-valuenow={value ?? undefined}
        className="relative mt-0.5 h-10 cursor-ew-resize touch-none"
      >
        {/* чёрная линия с торцевыми чёрточками, как в оригинале */}
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded bg-[#1c1a17]/85" />
        <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded bg-[#1c1a17]/85" />
        <div className="absolute right-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded bg-[#1c1a17]/85" />

        {value != null && (
          <div className="absolute top-1/2" style={{ left: `${value}%` }}>
            <motion.div
              style={{ x: "-50%", y: "-50%" }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 1.45 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="h-5 w-5 cursor-ew-resize rounded-full border-[3px] border-[#f3efe4] bg-[#1c1a17] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
