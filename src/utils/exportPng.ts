import { CHECKS } from "../data/content";

export type FigStat = { label: string; color: string; value: number };

export type SliderRow = { left: string; right: string; value: number | null };

export type PngData = {
  name: string;
  sliders: SliderRow[];
  checks: boolean[];
  figs: FigStat[];
};

const INK = "#1c1a17";
const PAPER = "#f3efe4";
const RED = "#c22f22";

// тот же человечек, что на сайте
const HEAD = new Path2D();
HEAD.arc(30, 12, 8.5, 0, Math.PI * 2);
const BODY = new Path2D(
  "M30 21 C24 21 20 25 19 30 L11 38 C9 40 10 43 13 43 L20 41 C19 47 19 52 20 57 L17 88 L25 88 L29 64 L31 64 L35 88 L43 88 L40 57 C41 52 41 47 40 41 L47 43 C50 43 51 40 49 38 L41 30 C40 25 36 21 30 21 Z"
);

type Ctx = CanvasRenderingContext2D;

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (
    typeof (ctx as unknown as { roundRect?: (a: number, b: number, c: number, d: number, e: number) => void }).roundRect ===
    "function"
  ) {
    (ctx as unknown as { roundRect: (a: number, b: number, c: number, d: number, e: number) => void }).roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

function drawPerson(ctx: Ctx, cx: number, top: number, h: number, color: string, value: number) {
  const s = h / 96;
  ctx.save();
  ctx.translate(cx - 30 * s, top);
  ctx.scale(s, s);

  const clip = new Path2D();
  clip.addPath(BODY);
  clip.addPath(HEAD);

  ctx.save();
  ctx.clip(clip);
  if (value > 0) {
    ctx.fillStyle = color;
    ctx.fillRect(-10, 96 - (value / 5) * 96, 80, 96);
  }
  ctx.restore();

  ctx.lineWidth = 2.6 / s;
  ctx.strokeStyle = INK;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke(HEAD);
  ctx.stroke(BODY);
  ctx.restore();
}

function drawCheck(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.strokeStyle = RED;
  ctx.lineWidth = 4 * s;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + 3 * s, y + 9 * s);
  ctx.lineTo(x + 8 * s, y + 14 * s);
  ctx.lineTo(x + 17 * s, y + 3 * s);
  ctx.stroke();
  ctx.restore();
}

export async function exportPng(data: PngData): Promise<void> {
  // ждём, пока подключатся маркерные шрифты
  try {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
    await Promise.all([
      document.fonts.load("64px Underdog"),
      document.fonts.load("30px Underdog"),
      document.fonts.load("26px Neucha"),
    ]).catch(() => undefined);
  } catch {
    /* рисуем и так */
  }

  const W = 1000;
  const M = 72;
  const inner = W - 2 * M;

  // рисуем в длинный временный холст, потом обрежем по факту
  const tmp = document.createElement("canvas");
  tmp.width = W * 2;
  tmp.height = 2400 * 2;
  const ctx = tmp.getContext("2d");
  if (!ctx) return;
  ctx.scale(2, 2);

  // бумага
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, 2400);
  const stain = ctx.createRadialGradient(W - 150, 2280, 40, W - 150, 2280, 480);
  stain.addColorStop(0, "rgba(140,105,55,0.10)");
  stain.addColorStop(1, "rgba(140,105,55,0)");
  ctx.fillStyle = stain;
  ctx.fillRect(0, 0, W, 2400);

  let y = 60;

  /* заголовок */
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = "64px Underdog";
  ctx.fillText("ИНФОРМАЦИЯ", W / 2, y);
  ctx.fillText("О ПЕРСОНАЖЕ", W / 2, y + 72);

  // красная волнистая подчёркивающая линия
  ctx.save();
  ctx.strokeStyle = RED;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  const sqY = y + 92;
  ctx.moveTo(W / 2 - 190, sqY);
  for (let x = -190; x <= 190; x += 4) {
    ctx.lineTo(W / 2 + x, sqY + Math.sin(x / 18) * 5 * Math.abs(Math.sin(x / 60)));
  }
  ctx.stroke();
  ctx.restore();

  y += 136;
  ctx.font = "28px Neucha";
  ctx.fillStyle = "rgba(28,26,23,0.85)";
  ctx.fillText(`персонаж: ${data.name || "—"}`, W / 2, y);

  /* 01 - склонности */
  y += 52;
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = "30px Underdog";
  ctx.fillText("01 - СКЛОННОСТИ", M, y);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(M, y + 14);
  ctx.lineTo(W - M, y + 14);
  ctx.stroke();

  y += 40;
  const rowH = 58;
  for (const s of data.sliders) {
    ctx.font = "23px Neucha";
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.fillText(s.left, M, y + 20);
    ctx.textAlign = "right";
    ctx.fillText(s.right, W - M, y + 20);

    const ly = y + 38;
    ctx.strokeStyle = "rgba(28,26,23,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(M, ly);
    ctx.lineTo(W - M, ly);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(M, ly - 9);
    ctx.lineTo(M, ly + 9);
    ctx.moveTo(W - M, ly - 9);
    ctx.lineTo(W - M, ly + 9);
    ctx.stroke();

    if (s.value != null) {
      const cx = M + (s.value / 100) * inner;
      ctx.beginPath();
      ctx.arc(cx, ly, 10, 0, Math.PI * 2);
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = PAPER;
      ctx.stroke();
    }
    y += rowH;
  }

  /* 02 - галочки: только если есть отмеченные */
  const markedIdx = data.checks
    .map((c, i) => (c ? i : -1))
    .filter((i) => i >= 0);
  if (markedIdx.length > 0) {
    y += 22;
    ctx.fillStyle = INK;
    ctx.font = "30px Underdog";
    ctx.textAlign = "left";
    ctx.fillText("02 - ГАЛОЧКИ", M, y);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(M, y + 14);
    ctx.lineTo(W - M, y + 14);
    ctx.stroke();

    y += 46;
    markedIdx.forEach((ci, k) => {
      const cy2 = y + k * 44;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      rr(ctx, M, cy2 - 18, 20, 20, 4);
      ctx.stroke();
      drawCheck(ctx, M, cy2 - 18, 1);
      ctx.font = "23px Neucha";
      ctx.fillStyle = INK;
      ctx.textAlign = "left";
      ctx.fillText(CHECKS[ci], M + 34, cy2 - 2);
    });
    y += markedIdx.length * 44 + 34;
  }

  /* 03 - сколько в нём */
  y += 16;
  ctx.fillStyle = INK;
  ctx.font = "30px Underdog";
  ctx.textAlign = "center";
  ctx.fillText("03 - СКОЛЬКО В НЁМ...", W / 2, y);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(M, y + 14);
  ctx.lineTo(W - M, y + 14);
  ctx.stroke();
  y += 36;

  const gap = inner / 5;
  data.figs.forEach((f, i) => {
    const cx = M + gap * (i + 0.5);
    drawPerson(ctx, cx, y, 120, f.color, f.value);
    ctx.font = "21px Neucha";
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.fillText(f.label, cx, y + 148);
    ctx.font = "15px monospace";
    ctx.fillStyle = "rgba(28,26,23,0.5)";
    ctx.fillText(`${f.value}/5`, cx, y + 170);
  });
  y += 214;

  /* обрезка и скачивание */
  const H = y;
  const out = document.createElement("canvas");
  out.width = W * 2;
  out.height = H * 2;
  const octx = out.getContext("2d");
  if (!octx) return;
  octx.scale(2, 2);
  octx.drawImage(tmp, 0, 0, W * 2, H * 2, 0, 0, W, H);

  const a = document.createElement("a");
  const safeName = data.name.trim().replace(/[\\/:*?"<>|]/g, "_");
  a.download = `${safeName || "personazh"}-anketa.png`;
  a.href = out.toDataURL("image/png");
  a.click();
}
