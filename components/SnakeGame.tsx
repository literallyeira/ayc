"use client";

// Mini oyun: Yılan 🐍 — mola arası küçük bir kaçamak.
// Dokunmatikte kaydırarak, klavyede ok tuşları / WASD ile oynanır.
// Rekor (snakeBest) cihazlar arası senkronize edilir.

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

const N = 15; // ızgara boyutu (N×N)
const BASE_MS = 170; // başlangıç hızı
const MIN_MS = 80; // en yüksek hız

type Dir = "up" | "down" | "left" | "right";
type Pt = { x: number; y: number };

const OPP: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };
const DELTA: Record<Dir, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const KEY_DIR: Record<string, Dir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
  W: "up", S: "down", A: "left", D: "right",
};

const FOODS = ["🍓", "💜", "🍇", "🫐", "🍒", "🌸"];

// Tema renkleri (tailwind.config.ts ile aynı)
const C = {
  cellA: "#f9f8fe",
  cellB: "#f4f2fb",
  snakeHead: "#7763d8",
  snakeTail: "#cabffa",
  eye: "#ffffff",
  pupil: "#26233a",
};

interface Game {
  snake: Pt[];
  dir: Dir;
  nextDir: Dir;
  food: Pt;
  foodEmoji: string;
  score: number;
}

function randFood(snake: Pt[]): Pt {
  const free: Pt[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y });
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

function freshGame(): Game {
  const snake: Pt[] = [
    { x: 7, y: 7 },
    { x: 6, y: 7 },
    { x: 5, y: 7 },
  ];
  return {
    snake,
    dir: "right",
    nextDir: "right",
    food: randFood(snake),
    foodEmoji: FOODS[Math.floor(Math.random() * FOODS.length)],
    score: 0,
  };
}

type Phase = "idle" | "play" | "over";

export function SnakeGame() {
  const { state, mutate } = useStore();
  const best = state.games?.snakeBest ?? 0;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const game = useRef<Game>(freshGame());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchFrom = useRef<{ x: number; y: number } | null>(null);

  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [newBest, setNewBest] = useState(false);
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;
  const bestRef = useRef(best);
  bestRef.current = best;

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = cv.width / dpr;
    const cell = size / N;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    // yumuşak dama tahtası zemin
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? C.cellA : C.cellB;
        ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5);
      }
    }

    const g = game.current;

    // yem
    ctx.font = `${cell * 0.78}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(g.foodEmoji, (g.food.x + 0.5) * cell, (g.food.y + 0.56) * cell);

    // yılan: baştan kuyruğa lavanta degrade, yuvarlatılmış kareler
    const len = g.snake.length;
    g.snake.forEach((p, i) => {
      const t = len === 1 ? 0 : i / (len - 1);
      ctx.fillStyle = lerpColor(C.snakeHead, C.snakeTail, t);
      const pad = cell * 0.08;
      const r = cell * 0.32;
      roundRect(ctx, p.x * cell + pad, p.y * cell + pad, cell - pad * 2, cell - pad * 2, r);
      ctx.fill();
    });

    // gözler (yöne göre)
    const head = g.snake[0];
    const d = DELTA[g.dir];
    const cx = (head.x + 0.5) * cell;
    const cy = (head.y + 0.5) * cell;
    const off = cell * 0.18;
    const side = cell * 0.16;
    const ex = d.x === 0 ? side : 0;
    const ey = d.y === 0 ? side : 0;
    const fx = d.x * off;
    const fy = d.y * off;
    for (const s of [-1, 1]) {
      ctx.fillStyle = C.eye;
      ctx.beginPath();
      ctx.arc(cx + fx + s * ex, cy + fy + s * ey, cell * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.pupil;
      ctx.beginPath();
      ctx.arc(cx + fx * 1.3 + s * ex, cy + fy * 1.3 + s * ey, cell * 0.055, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const endGame = useCallback(() => {
    setPhase("over");
    const s = game.current.score;
    if (s > bestRef.current) {
      setNewBest(true);
      mutate((d) => {
        d.games = { snakeBest: s };
      });
    } else {
      setNewBest(false);
    }
  }, [mutate]);

  const step = useCallback(() => {
    const g = game.current;
    g.dir = g.nextDir;
    const d = DELTA[g.dir];
    const head = { x: g.snake[0].x + d.x, y: g.snake[0].y + d.y };

    const hitWall = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N;
    const hitSelf = g.snake.some((p, i) => i < g.snake.length - 1 && p.x === head.x && p.y === head.y);
    if (hitWall || hitSelf) {
      endGame();
      return;
    }

    g.snake.unshift(head);
    if (head.x === g.food.x && head.y === g.food.y) {
      g.score += 1;
      setScore(g.score);
      g.food = randFood(g.snake);
      g.foodEmoji = FOODS[Math.floor(Math.random() * FOODS.length)];
    } else {
      g.snake.pop();
    }

    draw();
    const speed = Math.max(MIN_MS, BASE_MS - g.score * 4);
    timer.current = setTimeout(() => {
      if (phaseRef.current === "play") step();
    }, speed);
  }, [draw, endGame]);

  const start = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    game.current = freshGame();
    setScore(0);
    setNewBest(false);
    setPhase("play");
    draw();
    timer.current = setTimeout(step, BASE_MS);
  }, [draw, step]);

  const turn = useCallback((dir: Dir) => {
    const g = game.current;
    if (dir !== OPP[g.dir]) g.nextDir = dir;
  }, []);

  // Canvas'ı kapsayıcı genişliğine göre boyutla (retina keskin)
  useEffect(() => {
    const fit = () => {
      const wrap = wrapRef.current;
      const cv = canvasRef.current;
      if (!wrap || !cv) return;
      const w = wrap.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      cv.width = w * dpr;
      cv.height = w * dpr;
      cv.style.width = `${w}px`;
      cv.style.height = `${w}px`;
      draw();
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [draw]);

  // Klavye
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIR[e.key];
      if (!dir) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      e.preventDefault();
      if (phaseRef.current !== "play") start();
      else turn(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start, turn]);

  // Sekme gizlenince duraklat (geri dönünce baştan başlatmak yerine "over" değil,
  // basitçe oyunu bitir — yarıda kalan oyun kafa karıştırmasın)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible" && phaseRef.current === "play") {
        if (timer.current) clearTimeout(timer.current);
        endGame();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [endGame]);

  // Dokunmatik: kaydırarak yön ver
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchFrom.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchFrom.current || phaseRef.current !== "play") return;
    const t = e.touches[0];
    const dx = t.clientX - touchFrom.current.x;
    const dy = t.clientY - touchFrom.current.y;
    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    touchFrom.current = { x: t.clientX, y: t.clientY };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="font-display text-[20px] text-ink">Yılan 🐍</h2>
          <p className="text-[12.5px] text-ink-faint">Mola arası küçük bir kaçamak</p>
        </div>
        <div className="flex gap-2 text-center">
          <div className="rounded-xl bg-paper-sunk px-3 py-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Skor</div>
            <div className="font-display text-[17px] leading-tight text-ink">{score}</div>
          </div>
          <div className="rounded-xl bg-lav-100 px-3 py-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-lav-600">Rekor</div>
            <div className="font-display text-[17px] leading-tight text-lav-700">{Math.max(best, score)}</div>
          </div>
        </div>
      </div>

      <div ref={wrapRef} className="card relative overflow-hidden p-0 shadow-soft">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onClick={() => {
            if (phaseRef.current !== "play") start();
          }}
        />
        {phase !== "play" && (
          <div className="absolute inset-0 grid place-items-center bg-paper/70 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              {phase === "over" ? (
                <>
                  <div className="text-[34px] leading-none">{newBest ? "🎉" : "🐍"}</div>
                  <div>
                    <div className="font-display text-[19px] text-ink">
                      {newBest ? "Yeni rekor!" : "Oyun bitti"}
                    </div>
                    <div className="mt-0.5 text-[13px] text-ink-muted">
                      {score} puan {newBest ? "— harikasın 💜" : `· rekor ${Math.max(best, score)}`}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[34px] leading-none">🐍</div>
                  <div className="text-[13.5px] text-ink-muted">
                    Kaydırarak yön ver, meyveleri topla!
                  </div>
                </>
              )}
              <button
                onClick={start}
                className="rounded-full bg-lav-500 px-5 py-2.5 text-[14px] font-semibold text-white shadow-soft transition-transform active:scale-95"
              >
                {phase === "over" ? "Tekrar oyna" : "Başla"}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="px-1 text-center text-[11.5px] text-ink-faint">
        Telefonda parmağını kaydır · bilgisayarda ok tuşları
      </p>
    </div>
  );
}

// — küçük çizim yardımcıları —

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * t);
  const g = Math.round(((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * t);
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * t);
  return `rgb(${r},${g},${bl})`;
}
