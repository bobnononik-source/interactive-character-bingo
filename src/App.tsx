import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import InkSlider from "./components/InkSlider";
import CheckItem from "./components/CheckItem";
import StatFigure from "./components/StatFigure";
import { exportPng, type PngData } from "./utils/exportPng";
import { SLIDERS, CHECKS, FIGURES } from "./data/content";

const RED = "#d33f2e";
const TOTAL_FIELDS = SLIDERS.length + CHECKS.length + FIGURES.length;
const CONFETTI_COLORS = [RED, "#2f6fdb", "#f3efe4", "#e8a13a", "#16a34a"];

function SectionHead({ n, title, note }: { n: string; title: string; note: string }) {
  return (
    <div className="mb-5 mt-14 flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b-[3px] border-[#1c1a17] pb-3">
      <h2 className="font-marker text-2xl text-[#1c1a17] md:text-3xl">
        <span className="text-[#c22f22]">{n}</span> - {title}
      </h2>
      <p className="font-hand text-base text-[#1c1a17]/60 md:text-lg">{note}</p>
    </div>
  );
}

export default function App() {
  const [name, setName] = useState("");
  const [sliders, setSliders] = useState<(number | null)[]>(() => SLIDERS.map(() => null));
  const [checks, setChecks] = useState<boolean[]>(() => CHECKS.map(() => false));
  const [figs, setFigs] = useState<number[]>(() => FIGURES.map(() => 0));
  const [saving, setSaving] = useState(false);
  const celebrated = useRef(false);

  /* прогресс */
  const done = useMemo(() => {
    const s = sliders.filter((v) => v != null).length;
    const c = checks.filter(Boolean).length;
    const f = figs.filter((v) => v > 0).length;
    return s + c + f;
  }, [sliders, checks, figs]);
  const pct = Math.round((done / TOTAL_FIELDS) * 100);

  /* экспорт в png: обязательны 01 (склонности) и 03 (фигурки) */
  const canSave = sliders.every((v) => v != null) && figs.every((v) => v > 0);

  const pngData: PngData = {
    name,
    sliders: SLIDERS.map((s, i) => ({ left: s.left, right: s.right, value: sliders[i] })),
    checks,
    figs: FIGURES.map((f, i) => ({ ...f, value: figs[i] })),
  };

  const savePng = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await exportPng(pngData);
    } finally {
      setTimeout(() => setSaving(false), 400);
    }
  };

  /* конфетти при полном досье */
  useEffect(() => {
    if (pct === 100 && !celebrated.current) {
      celebrated.current = true;
      const t = setTimeout(() => {
        confetti({ particleCount: 130, spread: 80, origin: { y: 0.25 }, colors: CONFETTI_COLORS });
        setTimeout(
          () => confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.4 }, colors: CONFETTI_COLORS }),
          250
        );
        setTimeout(
          () => confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.4 }, colors: CONFETTI_COLORS }),
          450
        );
      }, 350);
      return () => clearTimeout(t);
    }
  }, [pct]);

  return (
    <div className="relative min-h-screen">
      {/* фильтр «шероховатых» линий для всего документа */}
      <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id="rough" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
          </filter>
        </defs>
      </svg>

      {/* тихий фон с виньеткой */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-72 w-[min(880px,92vw)] -translate-x-1/2 rounded-full bg-[#2b251c]/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#2f6fdb]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#d33f2e]/10 blur-3xl" />
      </div>

      {/* прогресс */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#16130f]/90 backdrop-blur">
        <div className="mx-auto flex w-[min(880px,92vw)] items-center gap-3 py-2.5">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#d33f2e] via-[#e8a13a] to-[#2f6fdb]"
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 20 }}
            />
          </div>
          <span className="font-hand text-sm text-[#f3efe4]/80 md:text-base">досье: {pct}%</span>
        </div>
      </div>

      {/* лист досье */}
      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mx-auto mb-24 mt-24 w-[min(880px,92vw)] md:mt-28"
      >
        <div className="paper-texture relative rounded-[5px] px-5 py-10 shadow-[0_35px_90px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/40 md:px-14 md:py-16">
          {/* штампы */}
          <header className="relative text-center">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="mt-6 font-marker text-4xl leading-[1.05] text-[#1c1a17] md:text-6xl"
            >
              ИНФОРМАЦИЯ
              <br />
              О ПЕРСОНАЖЕ
            </motion.h1>

            <svg viewBox="0 0 300 14" className="mx-auto mt-3 h-4 w-64 overflow-visible md:w-80">
              <motion.path
                d="M4 8 Q 40 2 78 7 T 152 7 T 226 7 T 296 6"
                fill="none"
                stroke={RED}
                strokeWidth={4}
                strokeLinecap="round"
                filter="url(#rough)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
              />
            </svg>

            {/* имя персонажа */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mx-auto mt-8 max-w-md"
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="имя персонажа"
                maxLength={40}
                className="w-full border-b-[3px] border-dashed border-[#1c1a17]/50 bg-transparent pb-2 text-center font-hand text-2xl text-[#1c1a17] outline-none transition-colors placeholder:text-[#1c1a17]/35 focus:border-[#c22f22] md:text-3xl"
              />
            </motion.div>
          </header>

          {/* 01 — склонности */}
          <section>
            <SectionHead n="01" title="Склонности" note="потяни кружок — таков он по твоему мнению" />
            <div className="space-y-5">
              {SLIDERS.map((s, i) => (
                <motion.div
                  key={s.left + s.right}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: i * 0.03 }}
                >
                  <InkSlider
                    leftLabel={s.left}
                    rightLabel={s.right}
                    value={sliders[i]}
                    onSet={(v) => setSliders((prev) => prev.map((x, k) => (k === i ? v : x)))}
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* 02 — галочки */}
          <section>
            <SectionHead n="02" title="Галочки" note="если у персонажа совпало — клик по пустому квадратику" />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="divide-y divide-dashed divide-[#1c1a17]/20"
            >
              {CHECKS.map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <CheckItem
                    text={c}
                    checked={checks[i]}
                    onToggle={() =>
                      setChecks((prev) => prev.map((v, k) => (k === i ? !v : v)))
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* 03 — сколько в нём */}
          <section>
            <SectionHead n="03" title="Сколько в нём..." note="кликай по фигуркам, чтобы заполнить" />
            <div className="grid grid-cols-5 gap-1 md:gap-3">
              {FIGURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 14, rotate: i % 2 ? 4 : -4 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="flex justify-center"
                >
                  <StatFigure
                    label={f.label}
                    color={f.color}
                    value={figs[i]}
                    index={i}
                    onBump={() =>
                      setFigs((prev) => prev.map((v, k) => (k === i ? (v + 1) % 6 : v)))
                    }
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* скачать png */}
          {canSave && (
            <section className="mt-16 text-center">
              <div className="mx-auto max-w-md border-t-2 border-dashed border-[#1c1a17]/30 pt-8">
                <motion.button
                  initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={savePng}
                  disabled={saving}
                  className="inline-flex items-center gap-2.5 rounded-md bg-[#1c1a17] px-7 py-3 font-marker text-base text-[#f3efe4] shadow-[4px_5px_0_rgba(28,26,23,0.35)] transition-opacity hover:opacity-90 disabled:opacity-60 md:text-lg"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v12" />
                    <path d="M6 11l6 6 6-6" />
                    <path d="M4 21h16" />
                  </svg>
                  {saving ? "прочитал = гей" : "скачать PNG"}
                </motion.button>
              </div>
            </section>
          )}

        </div>
      </motion.main>
    </div>
  );
}
