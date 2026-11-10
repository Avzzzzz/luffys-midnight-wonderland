import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { content } from "@/universe/content";
import { setMuted, startMusic } from "@/universe/audio";
import { Cat } from "@/universe/ui";
import { CakeScene, ConfessionScene, IntroScene, KeysScene, LetterScene, MemoryScene, StarsScene } from "@/universe/scenes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Little Universe for Luffy 🌙" },
      { name: "description", content: "A tiny, magical birthday universe made with love for Arshmeet." },
      { property: "og:title", content: "A Little Universe for Luffy 🌙" },
      { property: "og:description", content: "A tiny, magical birthday universe made with love for Arshmeet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Universe,
});

const SCENES = ["intro", "keys", "stars", "memory", "confession", "cake", "letter"] as const;
const LABELS = ["invitation", "keys", "stars", "memory", "secret", "cake", "letter"];

function Universe() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [muted, setMute] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  useEffect(() => setMounted(true), []);

  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0 });
  };
  const next = () => go(Math.min(step + 1, SCENES.length - 1));

  if (!mounted) return <div className="min-h-screen bg-night" />;

  const scene = SCENES[step];
  return (
    <main className="relative min-h-[100dvh] bg-night font-body">
      <AnimatePresence mode="wait">
        <motion.div key={scene} initial={{ opacity: 0, filter: "blur(10px)", scale: 1.03 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} exit={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }} transition={{ duration: 0.8 }}>
          {scene === "intro" && (
            <IntroScene
              onNext={next}
              onFirstTap={() => {
                startMusic();
                setMuted(muted);
                setMusicStarted(true);
              }}
            />
          )}
          {scene === "keys" && <KeysScene onNext={next} />}
          {scene === "stars" && <StarsScene onNext={next} />}
          {scene === "memory" && <MemoryScene onNext={next} />}
          {scene === "confession" && <ConfessionScene onNext={next} />}
          {scene === "cake" && <CakeScene onNext={next} />}
          {scene === "letter" && <LetterScene onReplay={() => go(0)} />}
        </motion.div>
      </AnimatePresence>

      {step > 0 && <Progress step={step} light={scene === "cake"} />}

      <button
        aria-label={muted ? "Unmute music" : "Mute music"}
        onClick={() => {
          if (!musicStarted) {
            startMusic();
            setMusicStarted(true);
          }
          setMute(!muted);
          setMuted(!muted);
        }}
        className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-lavender/50 bg-night/70 text-moonlight shadow-glow backdrop-blur hover:bg-night"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      {step > 0 && <Companion />}
    </main>
  );
}

function Progress({ step, light }: { step: number; light: boolean }) {
  const total = SCENES.length - 1;
  return (
    <div className="fixed left-1/2 top-5 z-30 flex -translate-x-1/2 flex-col items-center gap-1">
      <div className="flex items-center gap-1.5 rounded-full bg-night/60 px-3 py-2 backdrop-blur">
        {Array.from({ length: total }).map((_, i) => (
          <motion.span key={i} className="block h-1.5 rounded-full" animate={{ width: i + 1 === step ? 22 : 8, backgroundColor: i < step ? "var(--gold)" : "color-mix(in oklab, var(--moonlight) 30%, transparent)" }} />
        ))}
        <span className="ml-1 text-xs">🌙</span>
      </div>
      <span className={`font-hand text-sm ${light ? "text-night/60" : "text-lavender/80"}`}>{LABELS[step]}</span>
    </div>
  );
}

/** Tiny cat that follows the cursor (desktop) or floats in a corner (mobile), sleeps & chats. */
function Companion() {
  const x = useMotionValue(typeof window !== "undefined" ? window.innerWidth - 90 : 0);
  const y = useMotionValue(typeof window !== "undefined" ? window.innerHeight - 110 : 0);
  const sx = useSpring(x, { stiffness: 40, damping: 14 });
  const sy = useSpring(y, { stiffness: 40, damping: 14 });
  const [fine, setFine] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [sleep, setSleep] = useState(false);

  useEffect(() => {
    const isFine = window.matchMedia("(pointer: fine)").matches;
    setFine(isFine);
    let idle: number;
    const wake = () => {
      setSleep(false);
      clearTimeout(idle);
      idle = window.setTimeout(() => setSleep(true), 9000);
    };
    const move = (e: PointerEvent) => {
      x.set(e.clientX + 24);
      y.set(e.clientY + 18);
      wake();
    };
    if (isFine) window.addEventListener("pointermove", move);
    else {
      x.set(16);
      y.set(window.innerHeight - 96);
    }
    wake();
    const talk = window.setInterval(() => {
      setMsg(content.catLines[Math.floor(Math.random() * content.catLines.length)]!);
      setTimeout(() => setMsg(null), 3500);
    }, 14000);
    return () => {
      window.removeEventListener("pointermove", move);
      clearInterval(talk);
      clearTimeout(idle);
    };
  }, [x, y]);

  return (
    <motion.div className={`fixed left-0 top-0 z-30 w-12 sm:w-14 ${fine ? "pointer-events-none" : ""}`} style={{ x: sx, y: sy }}>
      <motion.button
        className="block w-full"
        animate={fine ? {} : { y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        onClick={() => {
          setSleep(false);
          setMsg(content.catLines[Math.floor(Math.random() * content.catLines.length)]!);
          setTimeout(() => setMsg(null), 3000);
        }}
        aria-label="cat companion"
      >
        <Cat variant={sleep ? "sleep" : "sit"} />
      </motion.button>
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={`absolute bottom-full mb-2 w-max max-w-[11rem] rounded-xl bg-cream px-3 py-1.5 font-hand text-base leading-tight text-night shadow-soft ${fine ? "right-0" : "left-0"}`}>
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
