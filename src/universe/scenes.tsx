import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, Mic, RotateCcw, Sparkles } from "lucide-react";
import { content, PHOTO_URL } from "./content";
import { listenForBlow, sfx } from "./audio";
import { Cat, Cloud, Confetti, FloatingHearts, GlowButton, Moon, Petals, Popup, Secret, Starfield } from "./ui";
import { cn } from "@/lib/utils";

type SceneProps = { onNext: () => void };

export function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("relative min-h-[100dvh] w-full overflow-hidden", className)}>{children}</section>;
}

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const } });

/* ───────────── 1. Intro ───────────── */
export function IntroScene({ onNext, onFirstTap }: SceneProps & { onFirstTap: () => void }) {
  const [leaving, setLeaving] = useState(false);
  return (
    <Shell className="flex items-center justify-center bg-night">
      <Starfield count={90} scatter={leaving} />
      <Cloud className="bottom-[8%] left-[-4%] w-44 opacity-80 sm:w-64"><Cat variant="sleep" tone="var(--blush)" /></Cloud>
      <Cloud className="right-[-6%] top-[14%] w-36 opacity-60 sm:w-52" />
      <Secret index={4} className="right-[12%] top-[62%] text-xl text-lavender">✦</Secret>
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <Moon size={170} glow={leaving} withCat />
        <motion.h1 {...fadeUp(0.3)} className="mt-8 font-display text-5xl font-semibold italic text-moonlight sm:text-7xl">{content.intro.greeting}</motion.h1>
        <motion.p {...fadeUp(0.7)} className="mt-4 max-w-md font-hand text-2xl text-lavender sm:text-3xl">{content.intro.line}</motion.p>
        <motion.div {...fadeUp(1.1)} className="mt-10">
          <GlowButton
            onClick={() => {
              if (leaving) return;
              onFirstTap();
              sfx.whoosh();
              setLeaving(true);
              setTimeout(onNext, 1300);
            }}
            className="animate-pulse-glow"
          >
            {content.intro.button}
          </GlowButton>
        </motion.div>
      </div>
    </Shell>
  );
}

/* ───────────── 2. Keys + 3. Cards ───────────── */
function KeyArt({ kind }: { kind: number }) {
  return (
    <svg viewBox="0 0 60 130" className="h-full w-full overflow-visible">
      <rect x="27" y="50" width="6" height="70" rx="3" fill="var(--cream)" />
      <rect x="33" y="98" width="12" height="6" rx="2" fill="var(--cream)" />
      <rect x="33" y="110" width="8" height="6" rx="2" fill="var(--cream)" />
      {kind === 0 && (
        <g>
          <circle cx="30" cy="28" r="24" fill="var(--moonlight)" />
          <circle cx="40" cy="22" r="20" fill="var(--night)" />
          <circle cx="38" cy="40" r="2" fill="var(--gold)" />
        </g>
      )}
      {kind === 1 && <path d="M30 52 C-6 30 6 0 30 16 C54 0 66 30 30 52 Z" fill="var(--blush)" />}
      {kind === 2 && (
        <g>
          <path d="M8 22 L10 0 L24 12 M36 12 L50 0 L52 22" fill="var(--lavender)" />
          <circle cx="30" cy="28" r="23" fill="var(--lavender)" />
          <circle cx="22" cy="27" r="2.5" fill="var(--night)" />
          <circle cx="38" cy="27" r="2.5" fill="var(--night)" />
          <path d="M27 33 q3 3 6 0" stroke="var(--night)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

export function KeysScene({ onNext }: SceneProps) {
  const [unlocked, setUnlocked] = useState<number[]>([]);
  const [unlocking, setUnlocking] = useState<number | null>(null);
  const [openCard, setOpenCard] = useState<number | null>(null);
  const all = unlocked.length === 3;

  const tap = (i: number) => {
    if (unlocking !== null) return;
    if (unlocked.includes(i)) return setOpenCard(i);
    sfx.unlock();
    setUnlocking(i);
    setTimeout(() => {
      setUnlocked((u) => [...u, i]);
      setUnlocking(null);
      setOpenCard(i);
    }, 1000);
  };

  return (
    <Shell className="flex flex-col items-center justify-center bg-night px-5 py-20">
      <Starfield count={60} />
      <Secret index={0} className="left-[8%] top-[20%] text-lg text-blush">✿</Secret>
      <motion.h2 {...fadeUp(0.1)} className="relative z-10 max-w-2xl text-center font-display text-3xl italic text-moonlight sm:text-5xl">{content.keys.heading}</motion.h2>
      <motion.p {...fadeUp(0.4)} className="relative z-10 mt-3 font-hand text-xl text-lavender">{content.keys.hint}</motion.p>
      <div className="relative z-10 mt-14 flex flex-wrap items-end justify-center gap-8 sm:gap-16">
        {[0, 1, 2].map((i) => {
          const done = unlocked.includes(i);
          const isUnlocking = unlocking === i;
          return (
            <motion.button
              key={i}
              onClick={() => tap(i)}
              className="group flex flex-col items-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
            >
              <motion.div
                className="relative h-32 w-16 sm:h-40 sm:w-20"
                animate={isUnlocking ? { rotate: [0, -25, 90], scale: [1, 1.2, 1.1] } : { y: [0, -12, 0], rotate: [-4, 4, -4] }}
                transition={isUnlocking ? { duration: 0.9 } : { duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: done || isUnlocking ? "drop-shadow(0 0 18px var(--gold))" : "drop-shadow(0 0 10px color-mix(in oklab, var(--lavender) 70%, transparent))" }}
                whileHover={{ scale: 1.1 }}
              >
                <KeyArt kind={i} />
                {isUnlocking && (
                  <motion.span className="absolute inset-0 rounded-full" initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 0.9 }} style={{ boxShadow: "0 0 0 3px var(--gold)" }} />
                )}
              </motion.div>
              <span className={cn("mt-4 font-hand text-xl transition-colors", done ? "text-gold" : "text-moonlight/80")}>
                {done ? "✓ " : ""}{content.keys.labels[i]}
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="relative z-10 mt-12 h-14">
        <AnimatePresence>{all && openCard === null && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}><GlowButton onClick={onNext}>{content.keys.continue}</GlowButton></motion.div>}</AnimatePresence>
      </div>
      <AnimatePresence>{openCard !== null && <StoryCard index={openCard} onClose={() => setOpenCard(null)} />}</AnimatePresence>
    </Shell>
  );
}

function Crosshair() {
  return (
    <motion.svg viewBox="0 0 40 40" className="h-12 w-12" animate={{ rotate: [0, 90, 90, 0], scale: [1, 0.85, 1] }} transition={{ duration: 3, repeat: Infinity }}>
      {[[20, 4, 20, 14], [20, 26, 20, 36], [4, 20, 14, 20], [26, 20, 36, 20]].map(([a, b, c, d], i) => (
        <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="var(--crosshair)" strokeWidth="3" strokeLinecap="round" />
      ))}
      <circle cx="20" cy="20" r="2" fill="var(--crosshair)" />
    </motion.svg>
  );
}

function PixelHeart({ delay = 0 }: { delay?: number }) {
  const g = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];
  return (
    <motion.svg viewBox="0 0 7 6" className="h-6 w-7" style={{ shapeRendering: "crispEdges" }} animate={{ y: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay }}>
      {g.flatMap((row, y) => row.split("").map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="var(--pixel)" /> : null)))}
    </motion.svg>
  );
}

function AnimeTile({ title, image, variant }: { title: string; image: string; variant: number }) {
  return (
    <div className="rounded-lg bg-cream p-2 shadow-soft" style={{ rotate: variant ? "2deg" : "-2deg" }}>
      <img src={image} alt={title} className="aspect-[8/5] w-full rounded object-cover" />
      <p className="mt-2 text-center font-hand text-lg leading-tight text-night">{title}</p>
    </div>
  );
}

function StoryCard({ index, onClose }: { index: number; onClose: () => void }) {
  const card = content.cards[index]!;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-night/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      {index === 2 && <Petals count={20} />}
      <motion.article
        onClick={(e) => e.stopPropagation()}
        className={cn("paper relative my-8 w-full max-w-lg rounded-2xl p-7 text-night shadow-soft sm:p-10", index === 1 && "paper-blush")}
        initial={{ rotateY: 90, scale: 0.8, opacity: 0 }}
        animate={{ rotateY: 0, scale: 1, opacity: 1, rotate: index === 1 ? 1 : -1 }}
        exit={{ rotateY: -90, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        style={{ transformPerspective: 1000 }}
      >
        <div className="tape" />
        <p className="font-hand text-lg text-night/50">little card {index + 1} / 3</p>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-3xl font-semibold italic leading-tight sm:text-4xl">{card.title}</h3>
          {index === 0 && <Crosshair />}
          {index === 1 && <motion.span className="text-3xl text-blush-deep" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>♡</motion.span>}
          {index === 2 && <span className="text-3xl">🌸</span>}
        </div>
        {index === 0 && <div className="mt-3 flex gap-2">{[0, 1, 2].map((i) => <PixelHeart key={i} delay={i * 0.2} />)}</div>}
        {"shows" in card && card.shows && (
          <div className="mt-5 grid grid-cols-2 gap-4">
            {card.shows.map((show, i) => <AnimeTile key={show.title} {...show} variant={i} />)}
          </div>
        )}
        <div className="mt-5 space-y-4">
          {card.body.map((p, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * (index === 1 ? 0.9 : 0.35) }} className={cn("font-body leading-relaxed", index === 1 && i === card.body.length - 1 && "font-hand text-2xl text-blush-deep", index === 2 && "font-hand text-2xl leading-snug")}>
              {p}
            </motion.p>
          ))}
        </div>
        <button onClick={onClose} className="mt-7 font-hand text-xl text-night/60 hover:text-night">tuck it away ♡</button>
      </motion.article>
    </motion.div>
  );
}

/* ───────────── 5. Constellation ───────────── */
const STAR_POS = [
  [50, 30], [30, 18], [14, 32], [22, 56], [50, 82], [78, 56], [86, 32], [70, 18],
];

export function StarsScene({ onNext }: SceneProps) {
  const [found, setFound] = useState<number[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const msgs = content.stars.messages;
  return (
    <Shell className="flex flex-col items-center bg-night px-4 pb-16 pt-20">
      <Starfield count={70} />
      <Secret index={1} className="bottom-[10%] left-[8%] text-lg text-lavender">✧</Secret>
      <Secret index={5} className="right-[6%] top-[14%] text-lg text-blush">✿</Secret>
      <motion.h2 {...fadeUp()} className="relative z-10 max-w-xl text-center font-display text-3xl italic text-moonlight sm:text-5xl">{content.stars.heading}</motion.h2>
      <p className="relative z-10 mt-2 font-hand text-xl text-lavender">{content.stars.hint} · {found.length}/{msgs.length}</p>
      <div className="relative z-10 mt-6 aspect-square w-full max-w-md">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {STAR_POS.map(([x, y], i) => {
            const [x2, y2] = STAR_POS[(i + 1) % STAR_POS.length]!;
            const show = found.includes(i) && found.includes((i + 1) % STAR_POS.length);
            return <motion.line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke="var(--lavender)" strokeWidth=".4" strokeDasharray="1 1" initial={{ pathLength: 0 }} animate={{ pathLength: show ? 1 : 0, opacity: show ? 0.8 : 0 }} transition={{ duration: 0.8 }} />;
          })}
        </svg>
        {STAR_POS.slice(0, msgs.length).map(([x, y], i) => {
          const f = found.includes(i);
          return (
            <motion.button
              key={i}
              aria-label={`star ${i + 1}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 p-2"
              style={{ left: `${x}%`, top: `${y}%` }}
              animate={{ scale: f ? 1.1 : [1, 1.25, 1] }}
              transition={{ duration: 2 + (i % 3), repeat: f ? 0 : Infinity }}
              whileHover={{ scale: 1.4 }}
              onClick={() => {
                sfx.chime();
                setFound((s) => (s.includes(i) ? s : [...s, i]));
                setOpen(i);
              }}
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-9 sm:w-9" style={{ filter: `drop-shadow(0 0 ${f ? 10 : 5}px var(--${f ? "gold" : "moonlight"}))` }}>
                <path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z" fill={f ? "var(--gold)" : "var(--moonlight)"} />
              </svg>
            </motion.button>
          );
        })}
        <AnimatePresence>
          {found.length === msgs.length && (
            <motion.div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 font-hand text-2xl text-blush" initial={{ scale: 0 }} animate={{ scale: 1 }}>all of you ♡</motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="relative z-10 mt-4 h-14">{found.length === msgs.length && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><GlowButton onClick={onNext}>{content.stars.continue}</GlowButton></motion.div>}</div>
      <Popup open={open !== null} onClose={() => setOpen(null)}>
        <p className="font-hand text-lg text-night/50">things I love about you #{(open ?? 0) + 1}</p>
        <p className="mt-2 font-display text-3xl italic leading-snug">{open !== null && msgs[open]}</p>
      </Popup>
    </Shell>
  );
}

/* ───────────── 6. Memory ───────────── */
export function MemoryScene({ onNext }: SceneProps) {
  const [photo, setPhoto] = useState<string>(PHOTO_URL);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!PHOTO_URL) {
      const saved = localStorage.getItem("our-photo");
      if (saved) setPhoto(saved);
    }
  }, []);
  const pick = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      setPhoto(url);
      try { localStorage.setItem("our-photo", url); } catch { /* too big to save, still shows */ }
    };
    r.readAsDataURL(f);
  };
  return (
    <Shell className="flex flex-col items-center justify-center bg-lavender-night px-5 py-20">
      <Starfield count={40} />
      <FloatingHearts count={12} />
      <Secret index={2} className="left-[10%] top-[30%] text-2xl">🌷</Secret>
      <motion.h2 {...fadeUp()} className="relative z-10 text-center font-display text-3xl italic text-moonlight sm:text-5xl">{content.memory.heading}</motion.h2>
      <motion.div
        className="relative z-10 mt-10 w-72 bg-cream p-4 pb-20 shadow-soft sm:w-80"
        initial={{ opacity: 0, y: 60, rotate: -14 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ type: "spring", stiffness: 60, damping: 12, delay: 0.3 }}
        whileHover={{ rotate: 0, scale: 1.03 }}
      >
        <div className="tape" />
        <button onClick={() => input.current?.click()} className="group relative block aspect-square w-full overflow-hidden bg-night/90">
          {photo ? (
            <img src={photo} alt="Our hidden-face picture" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 border-2 border-dashed border-lavender/50 p-6 text-center text-lavender">
              <Camera className="h-10 w-10" />
              <span className="font-hand text-xl">{content.memory.placeholder}</span>
              <span className="font-body text-xs opacity-70">tap to add the photo</span>
            </div>
          )}
        </button>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <p className="absolute bottom-5 left-0 right-0 px-4 text-center font-hand text-2xl leading-tight text-night">{content.memory.caption}</p>
      </motion.div>
      <motion.p {...fadeUp(1.2)} className="relative z-10 mt-10 max-w-md text-center font-hand text-2xl leading-snug text-blush sm:text-3xl">{content.memory.hope}</motion.p>
      <motion.div {...fadeUp(1.8)} className="relative z-10 mt-8"><GlowButton onClick={onNext}>{content.memory.continue}</GlowButton></motion.div>
    </Shell>
  );
}

/* ───────────── 7. Confession ───────────── */
function Envelope({ open, onOpen, label, seal = false, tone = "var(--blush)" }: { open: boolean; onOpen: () => void; label: string; seal?: boolean; tone?: string }) {
  return (
    <motion.button onClick={onOpen} className="relative block h-48 w-72 sm:h-56 sm:w-80" animate={open ? {} : { y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} whileHover={open ? {} : { scale: 1.04, rotate: -1 }} style={{ perspective: 800 }}>
      <div className="absolute inset-0 rounded-lg shadow-soft" style={{ background: tone }} />
      <svg viewBox="0 0 320 224" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 224 L160 110 L320 224 Z" fill="color-mix(in oklab, var(--cream) 70%, transparent)" />
        <path d="M0 0 L140 120 M320 0 L180 120" stroke="color-mix(in oklab, var(--night) 15%, transparent)" strokeWidth="2" />
      </svg>
      <motion.div className="absolute left-0 right-0 top-0 h-1/2 origin-top" animate={{ rotateX: open ? 180 : 0 }} transition={{ duration: 0.7 }} style={{ transformStyle: "preserve-3d" }}>
        <svg viewBox="0 0 320 112" preserveAspectRatio="none" className="h-full w-full">
          <path d="M0 0 L160 112 L320 0 Z" fill="color-mix(in oklab, var(--night) 12%, var(--cream))" />
        </svg>
      </motion.div>
      {seal && !open && (
        <motion.div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-wax text-2xl text-cream shadow-soft" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>♥</motion.div>
      )}
      {!open && <span className="absolute -bottom-12 left-0 right-0 text-center font-hand text-2xl text-moonlight">{label}</span>}
    </motion.button>
  );
}

export function ConfessionScene({ onNext }: SceneProps) {
  const [open, setOpen] = useState(false);
  return (
    <Shell className="flex flex-col items-center justify-center bg-night px-5 py-20">
      <Starfield count={50} />
      <Secret index={3} className="right-[10%] top-[18%] text-xl text-gold">☾</Secret>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div key="env" exit={{ y: 40, opacity: 0 }} className="relative z-10">
            <Envelope open={false} label={content.confession.envelope} onOpen={() => { sfx.paper(); setOpen(true); }} />
          </motion.div>
        ) : (
          <motion.div key="note" className="paper relative z-10 w-full max-w-lg rounded-xl p-7 text-night shadow-soft sm:p-10" initial={{ y: 120, scaleY: 0.2, opacity: 0 }} animate={{ y: 0, scaleY: 1, opacity: 1, rotate: -1 }} transition={{ type: "spring", stiffness: 80, damping: 14 }} style={{ originY: 1 }}>
            <div className="tape" />
            <p className="font-hand text-xl text-night/50">a little secret…</p>
            <div className="mt-3 space-y-4">
              {content.confession.body.map((p, i) => (
                <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.8 }} className="font-hand text-2xl leading-snug">{p}</motion.p>
              ))}
            </div>
            <motion.div className="mt-6 flex items-center justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}>
              <div className="w-14"><Cat variant="sit" tone="var(--blush)" /></div>
              <GlowButton variant="paper" onClick={onNext}>{content.confession.continue}</GlowButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

/* ───────────── 8. Cake ───────────── */
function Balloon({ x, color, delay }: { x: string; color: string; delay: number }) {
  return (
    <motion.div className="pointer-events-none absolute bottom-0 w-12 sm:w-16" style={{ left: x }} initial={{ y: "100%" }} animate={{ y: ["10vh", "-8vh", "-2vh", "-8vh"] }} transition={{ duration: 8, delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}>
      <svg viewBox="0 0 40 90"><ellipse cx="20" cy="20" rx="16" ry="20" fill={color} /><ellipse cx="14" cy="13" rx="4" ry="6" fill="var(--cream)" opacity=".5" /><path d="M20 40 Q15 60 22 90" stroke="var(--night)" strokeOpacity=".4" fill="none" /></svg>
    </motion.div>
  );
}

function Candle({ lit, onBlow, i }: { lit: boolean; onBlow: () => void; i: number }) {
  return (
    <button onClick={onBlow} aria-label="blow out candle" className="relative flex w-6 flex-col items-center sm:w-7">
      <div className="relative h-10 w-6">
        <AnimatePresence>
          {lit ? (
            <motion.div key="f" className="absolute bottom-0 left-1/2 -translate-x-1/2" exit={{ scaleY: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
              <motion.div className="h-8 w-4 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ background: "radial-gradient(circle at 50% 70%, var(--cream) 0 25%, var(--gold) 45%, var(--flame) 80%)", boxShadow: "0 0 18px 6px color-mix(in oklab, var(--gold) 55%, transparent)", transformOrigin: "bottom" }} animate={{ scaleY: [1, 1.15, 0.92, 1.08, 1], rotate: [-3, 3, -2, 2, -3], scaleX: [1, 0.9, 1.05, 1] }} transition={{ duration: 0.9 + i * 0.1, repeat: Infinity }} />
            </motion.div>
          ) : (
            <motion.div key="s" className="absolute bottom-0 left-1/2 h-3 w-1 -translate-x-1/2 rounded-full bg-night/30" initial={{ y: 0, opacity: 0.8 }} animate={{ y: -30, opacity: 0, scaleX: 3 }} transition={{ duration: 1.4 }} />
          )}
        </AnimatePresence>
      </div>
      <div className="h-1 w-px bg-night" />
      <div className="h-12 w-4 rounded-sm" style={{ background: `repeating-linear-gradient(135deg, var(--cream) 0 5px, ${i % 2 ? "var(--lavender)" : "var(--blush-deep)"} 5px 9px)` }} />
    </button>
  );
}

export function CakeScene({ onNext }: SceneProps) {
  const N = 5;
  const [lit, setLit] = useState<boolean[]>(Array(N).fill(true));
  const [burst, setBurst] = useState(0);
  const [micOn, setMicOn] = useState(false);
  const stopMic = useRef<(() => void) | null>(null);
  const out = lit.every((l) => !l);

  useEffect(() => {
    if (out && !burst) {
      sfx.celebrate();
      setBurst(1);
      setTimeout(() => setBurst(2), 900);
      stopMic.current?.();
    }
  }, [out, burst]);
  useEffect(() => () => stopMic.current?.(), []);

  const blow = (i: number) => {
    if (!lit[i]) return;
    sfx.pop();
    setLit((l) => l.map((v, j) => (j === i ? false : v)));
  };
  const useMic = async () => {
    try {
      setMicOn(true);
      stopMic.current = await listenForBlow(() => {
        lit.forEach((_, i) => setTimeout(() => setLit((l) => l.map((v, j) => (j === i ? false : v))), i * 120));
        setMicOn(false);
      });
    } catch {
      setMicOn(false);
    }
  };

  return (
    <Shell className="flex flex-col items-center justify-center bg-party px-4 py-16 text-night">
      <Moon size={110} className="absolute right-[6%] top-[5%] opacity-90" />
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span key={i} className="absolute text-lavender" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 50}%` }} animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2 + (i % 3), repeat: Infinity }}>✦</motion.span>
      ))}
      <Balloon x="3%" color="var(--blush-deep)" delay={0} />
      <Balloon x="14%" color="var(--lavender)" delay={1} />
      <Balloon x="80%" color="var(--blush-deep)" delay={0.5} />
      <Balloon x="90%" color="var(--lavender)" delay={1.5} />
      <Secret index={4} className="bottom-[6%] right-[30%] text-2xl">🌸</Secret>

      <motion.h2 {...fadeUp()} className="relative z-10 text-center font-display text-4xl font-bold tracking-wide sm:text-6xl">{content.cake.title}</motion.h2>
      <motion.p {...fadeUp(0.4)} className="relative z-10 mt-3 max-w-lg text-center font-hand text-2xl leading-snug text-night/80">{content.cake.line}</motion.p>

      <div className="relative z-10 mt-8 flex items-end gap-2 sm:gap-6">
        <motion.div className="w-16 sm:w-20" animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 2, repeat: Infinity }}><Cat variant="party" /></motion.div>
        <div className="flex flex-col items-center">
          <div className="flex gap-3 sm:gap-4">{lit.map((l, i) => <Candle key={i} i={i} lit={l} onBlow={() => blow(i)} />)}</div>
          <svg viewBox="0 0 240 170" className="-mt-1 w-60 sm:w-72">
            <rect x="40" y="0" width="160" height="60" rx="10" fill="var(--blush)" />
            <path d="M40 14 Q60 30 80 14 T120 14 T160 14 T200 14 V8 Q200 0 190 0 H50 Q40 0 40 8Z" fill="var(--cream)" />
            {[60, 100, 140, 180].map((x) => <circle key={x} cx={x} cy="40" r="4" fill="var(--blush-deep)" />)}
            <rect x="15" y="60" width="210" height="80" rx="12" fill="var(--lavender)" />
            <path d="M15 74 Q40 96 65 74 T115 74 T165 74 T225 74 V70 Q225 60 213 60 H27 Q15 60 15 72Z" fill="var(--cream)" />
            {[45, 90, 135, 180].map((x) => <path key={x} d={`M${x} 115 c-6 -8 6 -12 6 -4 c0 -8 12 -4 6 4 l-6 6z`} fill="var(--blush-deep)" />)}
            <ellipse cx="120" cy="150" rx="118" ry="14" fill="var(--cream)" stroke="var(--night)" strokeOpacity=".15" />
          </svg>
        </div>
        <motion.div className="w-16 sm:w-20" animate={{ rotate: [4, -4, 4] }} transition={{ duration: 2.4, repeat: Infinity }}><Cat variant="party" tone="var(--blush)" /></motion.div>
      </div>

      <div className="relative z-10 mt-6 flex min-h-24 flex-col items-center gap-3 text-center">
        {!out ? (
          <>
            <p className="font-display text-2xl italic">{content.cake.instruction}</p>
            <p className="font-body text-sm text-night/60">tap each flame{typeof navigator !== "undefined" && navigator.mediaDevices ? "" : ""}</p>
            {typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && (
              <button onClick={useMic} disabled={micOn} className="inline-flex items-center gap-2 rounded-full border border-night/20 px-4 py-1.5 font-body text-sm hover:bg-night/5 disabled:opacity-60">
                <Mic className="h-4 w-4" /> {micOn ? "listening… blow!" : content.cake.mic}
              </button>
            )}
          </>
        ) : (
          <>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-hand text-2xl">{content.cake.done}</motion.p>
            {burst === 2 && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}><GlowButton variant="paper" onClick={onNext}><Sparkles className="mr-2 inline h-4 w-4" />{content.cake.button}</GlowButton></motion.div>}
          </>
        )}
      </div>
      <Confetti fire={burst ? 1 : 0} />
    </Shell>
  );
}

/* ───────────── 9. Letter ───────────── */
export function LetterScene({ onReplay }: { onReplay: () => void }) {
  const [open, setOpen] = useState(false);
  const L = content.letter;
  return (
    <Shell className="flex flex-col items-center bg-night px-4 py-20">
      <Starfield count={60} />
      <FloatingHearts count={8} />
      {!open ? (
        <motion.div className="relative z-10 mt-[20vh]" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Envelope open={false} seal tone="var(--cream)" label={L.tapToOpen} onOpen={() => { sfx.paper(); setOpen(true); }} />
        </motion.div>
      ) : (
        <motion.article className="paper relative z-10 w-full max-w-2xl rounded-md px-6 py-10 text-night shadow-soft sm:px-14 sm:py-14" initial={{ scaleY: 0.05, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} style={{ originY: 0 }}>
          <motion.p {...fadeUp(0.8)} className="font-display text-3xl italic sm:text-4xl">{L.greeting}</motion.p>
          <div className="mt-6 space-y-5">
            {L.paragraphs.map((p, i) => (
              <motion.p key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.8 }} className="font-hand text-[1.45rem] leading-snug sm:text-2xl">{p}</motion.p>
            ))}
          </div>
          <div className="mt-10 flex items-end justify-between gap-4">
            <div>
              <p className="font-hand text-2xl">{L.closing}</p>
              <motion.p className="mt-1 overflow-hidden whitespace-nowrap font-signature text-5xl text-blush-deep sm:text-6xl" initial={{ clipPath: "inset(0 100% 0 0)" }} whileInView={{ clipPath: "inset(0 0% 0 0)" }} viewport={{ once: true }} transition={{ duration: 2.4, ease: "easeInOut", delay: 0.3 }}>
                {L.signature}
              </motion.p>
            </div>
            <div className="w-20 shrink-0 sm:w-24"><Cat variant="sleep" tone="var(--lavender)" /></div>
          </div>
        </motion.article>
      )}
      {open && (
        <motion.div className="relative z-10 mt-14 flex flex-col items-center gap-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}>
          <p className="font-display text-3xl italic text-moonlight">{L.end}</p>
          <GlowButton onClick={onReplay}><RotateCcw className="mr-2 inline h-4 w-4" />{L.replay}</GlowButton>
        </motion.div>
      )}
    </Shell>
  );
}
