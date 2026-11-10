import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { content } from "./content";
import { sfx } from "./audio";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function Starfield({ count = 70, scatter = false }: { count?: number; scatter?: boolean }) {
  const stars = useMemo(
    () => Array.from({ length: count }, () => ({ x: rand(0, 100), y: rand(0, 100), s: rand(1, 3), d: rand(2, 5), dl: rand(0, 4) })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((st, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-moonlight"
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, boxShadow: "0 0 6px var(--moonlight)" }}
          animate={
            scatter
              ? { x: (st.x - 50) * 30, y: (st.y - 50) * 30, opacity: 0, scale: 2 }
              : { opacity: [0.2, 1, 0.2] }
          }
          transition={scatter ? { duration: 1.2, ease: "easeIn" } : { duration: st.d, delay: st.dl, repeat: Infinity }}
        />
      ))}
      {!scatter && <ShootingStars />}
    </div>
  );
}

function ShootingStars() {
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setK((v) => v + 1), 5200);
    return () => clearInterval(id);
  }, []);
  const top = useMemo(() => rand(5, 40), [k]);
  const left = useMemo(() => rand(10, 70), [k]);
  return (
    <motion.span
      key={k}
      className="absolute h-px w-24 origin-left rounded-full"
      style={{ top: `${top}%`, left: `${left}%`, rotate: 25, background: "linear-gradient(90deg, var(--moonlight), transparent)" }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ x: 260, y: 120, opacity: [0, 1, 0] }}
      transition={{ duration: 1.1, ease: "easeOut" }}
    />
  );
}

export function Moon({ size = 160, glow = false, withCat = false, className }: { size?: number; glow?: boolean; withCat?: boolean; className?: string }) {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      animate={{ y: [0, -8, 0], filter: glow ? "drop-shadow(0 0 60px var(--moonlight))" : "drop-shadow(0 0 22px color-mix(in oklab, var(--moonlight) 60%, transparent))" }}
      transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, filter: { duration: 0.8 } }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <mask id="crescent">
            <rect width="100" height="100" fill="white" />
            <circle cx="64" cy="40" r="38" fill="black" />
          </mask>
        </defs>
        <circle cx="50" cy="50" r="42" fill="var(--moonlight)" mask="url(#crescent)" />
        <circle cx="26" cy="58" r="3" fill="var(--lavender)" opacity=".5" mask="url(#crescent)" />
        <circle cx="34" cy="76" r="2" fill="var(--lavender)" opacity=".5" mask="url(#crescent)" />
      </svg>
      {withCat && (
        <div className="absolute" style={{ left: size * 0.08, top: size * 0.12, width: size * 0.32 }}>
          <Cat variant="sit" />
        </div>
      )}
    </motion.div>
  );
}

/** Cute original cat. variant: sit (blinks) | sleep | party (birthday hat) */
export function Cat({ variant = "sit", tone = "var(--cream)", className }: { variant?: "sit" | "sleep" | "party"; tone?: string; className?: string }) {
  const sleeping = variant === "sleep";
  return (
    <svg viewBox="0 0 60 60" className={cn("h-auto w-full overflow-visible", className)}>
      {variant === "party" && (
        <g>
          <path d="M22 14 L30 -4 L38 14 Z" fill="var(--blush)" stroke="var(--night)" strokeWidth="1.2" />
          <circle cx="30" cy="-5" r="3" fill="var(--lavender)" />
          <path d="M25 8 L35 8" stroke="var(--lavender)" strokeWidth="2" />
        </g>
      )}
      {sleeping ? (
        <>
          <ellipse cx="30" cy="44" rx="24" ry="12" fill={tone} stroke="var(--night)" strokeWidth="1.5" />
          <path d="M8 44 Q2 34 12 34" fill="none" stroke="var(--night)" strokeWidth="1.5" />
          <circle cx="40" cy="38" r="11" fill={tone} stroke="var(--night)" strokeWidth="1.5" />
          <path d="M32 31 L33 23 L38 28 M42 28 L47 23 L48 31" fill={tone} stroke="var(--night)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M35 38 q2 2 4 0 M42 38 q2 2 4 0" fill="none" stroke="var(--night)" strokeWidth="1.3" strokeLinecap="round" />
          <motion.text x="50" y="22" fontSize="8" fill="var(--lavender)" animate={{ opacity: [0, 1, 0], y: [22, 12] }} transition={{ duration: 2.4, repeat: Infinity }}>z</motion.text>
        </>
      ) : (
        <>
          <path d="M44 50 Q58 44 52 32" fill="none" stroke="var(--night)" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="30" cy="44" rx="16" ry="13" fill={tone} stroke="var(--night)" strokeWidth="1.5" />
          <path d="M16 18 L18 6 L26 14 M34 14 L42 6 L44 18" fill={tone} stroke="var(--night)" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="30" cy="24" r="14" fill={tone} stroke="var(--night)" strokeWidth="1.5" />
          <path d="M19 10 L21 15 M41 10 L39 15" stroke="var(--blush)" strokeWidth="2" strokeLinecap="round" />
          <motion.g animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }} style={{ transformOrigin: "30px 23px" }}>
            <circle cx="24.5" cy="23" r="2" fill="var(--night)" />
            <circle cx="35.5" cy="23" r="2" fill="var(--night)" />
          </motion.g>
          <path d="M28 28 q2 2 4 0" fill="none" stroke="var(--night)" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="21" cy="28" rx="2.5" ry="1.4" fill="var(--blush)" />
          <ellipse cx="39" cy="28" rx="2.5" ry="1.4" fill="var(--blush)" />
        </>
      )}
    </svg>
  );
}

export function Cloud({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <motion.div className={cn("pointer-events-none absolute", className)} animate={{ x: [0, 14, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>
      <div className="relative">
        <svg viewBox="0 0 120 50" className="w-full">
          <path d="M20 45 Q2 45 8 32 Q4 18 22 20 Q28 4 48 12 Q62 0 78 12 Q100 8 100 26 Q118 30 108 45 Z" fill="var(--moonlight)" opacity=".9" />
        </svg>
        {children && <div className="absolute -top-[30%] left-1/2 w-[45%] -translate-x-1/2">{children}</div>}
      </div>
    </motion.div>
  );
}

export function FloatingHearts({ count = 10, className }: { count?: number; className?: string }) {
  const hearts = useMemo(() => Array.from({ length: count }, () => ({ x: rand(0, 100), s: rand(10, 22), d: rand(8, 16), dl: rand(0, 10) })), [count]);
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {hearts.map((h, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 text-blush"
          style={{ left: `${h.x}%`, fontSize: h.s }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: "-110vh", opacity: [0, 0.8, 0.8, 0], x: [0, 20, -20, 0] }}
          transition={{ duration: h.d, delay: h.dl, repeat: Infinity, ease: "linear" }}
        >
          ♡
        </motion.span>
      ))}
    </div>
  );
}

export function Petals({ count = 16 }: { count?: number }) {
  const ps = useMemo(() => Array.from({ length: count }, () => ({ x: rand(0, 100), s: rand(8, 16), d: rand(9, 18), dl: rand(0, 10), r: rand(-180, 180) })), [count]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {ps.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block rounded-[60%_0_60%_0] bg-blush"
          style={{ left: `${p.x}%`, width: p.s, height: p.s * 0.8, opacity: 0.85 }}
          initial={{ y: -30, rotate: 0 }}
          animate={{ y: "110vh", x: [0, 40, -20, 30], rotate: p.r * 4 }}
          transition={{ duration: p.d, delay: p.dl, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

export function GlowButton({ children, onClick, className, variant = "night" }: { children: ReactNode; onClick?: () => void; className?: string; variant?: "night" | "paper" }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "relative rounded-full px-7 py-3 font-body text-base font-semibold tracking-wide transition-shadow",
        variant === "night"
          ? "border border-lavender/60 bg-lavender/15 text-moonlight shadow-glow backdrop-blur-sm hover:bg-lavender/25"
          : "bg-night text-cream shadow-soft hover:shadow-glow",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

export function Popup({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-night/50 p-6 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="paper relative max-w-sm rounded-2xl p-7 text-center text-night shadow-soft"
            initial={{ scale: 0.6, rotate: -6, y: 30 }}
            animate={{ scale: 1, rotate: -1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <div className="tape" />
            {children}
            <button onClick={onClose} className="mt-5 font-hand text-xl text-night/60 hover:text-night">close ♡</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A small object that hides a secret message. */
export function Secret({ index, className, children }: { index: number; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        aria-label="hidden surprise"
        className={cn("absolute z-10 cursor-pointer select-none", className)}
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.4 }}
        whileHover={{ scale: 1.4 }}
        onClick={() => {
          sfx.pop();
          setOpen(true);
        }}
      >
        {children}
      </motion.button>
      <Popup open={open} onClose={() => setOpen(false)}>
        <p className="font-hand text-2xl leading-snug">{content.hidden[index % content.hidden.length]}</p>
      </Popup>
    </>
  );
}

export function Confetti({ fire }: { fire: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 90 }, () => ({
        x: rand(-50, 50),
        y: rand(-90, -30),
        r: rand(0, 720),
        c: ["var(--blush)", "var(--lavender)", "var(--cream)", "var(--gold)", "var(--moonlight)"][Math.floor(rand(0, 5))],
        w: rand(6, 11),
        d: rand(1.6, 3),
      })),
    [fire],
  );
  if (!fire) return null;
  return (
    <div key={fire} className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 block rounded-sm"
          style={{ width: p.w, height: p.w * 0.5, background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: `${p.x}vw`, y: [`0vh`, `${p.y}vh`, `60vh`], rotate: p.r, opacity: [1, 1, 0] }}
          transition={{ duration: p.d, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
