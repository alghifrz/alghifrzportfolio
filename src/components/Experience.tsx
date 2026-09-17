import React, { useEffect, useRef, useState } from "react";
import content from "@/data/content.json";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useMotionTemplate,
  type MotionValue,
} from "framer-motion";

const steps = content.experience.step;
const CARD_GAP = 96;

function CardBody({
  step,
  index,
  maxBullets,
  maxSkills,
}: {
  step: (typeof steps)[number];
  index: number;
  maxBullets: number;
  maxSkills: number;
}) {
  const current = step.date.toLowerCase().includes("present");

  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,85,212,0.14),transparent_42%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-2xl text-white md:text-4xl">
                {step.title.trim()}
              </h3>
              <p className="mt-1.5 text-sm text-[var(--muted)]">{step.company}</p>
            </div>
            <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]">
              {step.date}
            </span>
        </div>

      </div>

      <ul className="relative mt-4 space-y-2 text-sm leading-relaxed text-zinc-300">
        {step.description.slice(0, maxBullets).map((desc) => (
          <li key={desc} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span>{desc}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-4 flex flex-wrap gap-2">
        {step.skill.slice(0, maxSkills).map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-zinc-300"
          >
            {skill}
          </span>
        ))}
      </div>
    </>
  );
}

function DesktopStepCard({
  step,
  index,
  total,
  progress,
}: {
  step: (typeof steps)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const span = Math.max(total - 1, 1);
  const start = (index - 1) / span;
  const mid = index / span;
  const end = (index + 1) / span;
  const inStart = start + (mid - start) * 0.42;
  const inEnd = mid + (end - mid) * 0.58;

  const scale = useTransform(
    progress,
    [start, inStart, mid, inEnd, end],
    [0.9, 1.06, 1.08, 1.06, 0.9]
  );
  const opacity = useTransform(
    progress,
    [start, inStart, mid, inEnd, end],
    [0.55, 1, 1, 1, 0.55]
  );
  const blur = useTransform(
    progress,
    [start, inStart, mid, inEnd, end],
    [10, 0, 0, 0, 10]
  );
  const filter = useMotionTemplate`blur(${blur}px)`;
  const zIndex = useTransform(progress, (value) => {
    const dist = Math.abs(value - mid);
    return Math.round((1 - Math.min(dist * span, 1)) * 20);
  });

  return (
    <motion.article
      style={{ scale, opacity, filter, zIndex }}
      className="relative flex w-[min(40rem,calc(100vw-3rem))] shrink-0 flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#111] p-7 origin-center will-change-transform"
    >
      <CardBody step={step} index={index} maxBullets={4} maxSkills={8} />
    </motion.article>
  );
}

function MobileExperience() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16 md:hidden">
      <div className="mb-8">
        <p className="nf-eyebrow mb-2">Work Experience</p>
        <h2 className="font-display text-3xl text-white">From change to production</h2>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          A compact timeline of roles and what shipped along the way.
        </p>
      </div>

      <div className="relative space-y-4">
        <span className="absolute bottom-6 left-[1.15rem] top-6 w-px bg-white/10" aria-hidden />
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.2) }}
            className="relative grid grid-cols-[2.3rem_1fr] gap-3"
          >
            <div className="relative z-10 flex justify-center pt-6">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold ${
                  step.date.toLowerCase().includes("present")
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-white/15 bg-[#0c0c0c] text-zinc-400"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <article className="relative flex w-full flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#111] p-5">
              <CardBody step={step} index={index} maxBullets={4} maxSkills={8} />
            </article>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function DesktopExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [travel, setTravel] = useState(0);
  const [pad, setPad] = useState(0);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const glowX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const card = viewport.querySelector("article");
      if (!(card instanceof HTMLElement)) return;
      const cardWidth = card.offsetWidth;
      const pitch = cardWidth + CARD_GAP;
      setPad(Math.max(0, (viewport.clientWidth - cardWidth) / 2));
      setTravel((steps.length - 1) * pitch);
    };

    measure();
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(
      steps.length - 1,
      Math.max(0, Math.round(value * (steps.length - 1)))
    );
    setActive(next);
  });

  const scrollToProgress = (progress: number) => {
    const container = containerRef.current;
    if (!container) return;
    const clamped = Math.min(1, Math.max(0, progress));
    const start = window.scrollY + container.getBoundingClientRect().top;
    const range = Math.max(1, container.offsetHeight - window.innerHeight);
    window.scrollTo({ top: start + clamped * range });
  };

  const progressFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return (clientX - rect.left) / rect.width;
  };

  const onTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    scrollToProgress(progressFromClientX(event.clientX));
  };

  const onTrackPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    scrollToProgress(progressFromClientX(event.clientX));
  };

  const onTrackPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="relative hidden md:block">
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${steps.length * 52}vh` }}
      >
        <div className="sticky top-0 flex h-dvh flex-col overflow-hidden pt-24 pb-6">
          <div className="mx-auto mb-8 w-full max-w-6xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="nf-eyebrow mb-2">Work Experience</p>
                <h2 className="font-display text-5xl text-white">From change to production</h2>
                <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
                  Scroll to travel the timeline. Stop scrolling, and it holds.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <span className="font-medium text-white">
                  {String(active + 1).padStart(2, "0")}
                </span>
                <span>/</span>
                <span>{String(steps.length).padStart(2, "0")}</span>
              </div>
            </div>

            <div
              ref={trackRef}
              role="slider"
              aria-label="Experience timeline"
              aria-valuemin={1}
              aria-valuemax={steps.length}
              aria-valuenow={active + 1}
              aria-valuetext={steps[active]?.title}
              tabIndex={0}
              onPointerDown={onTrackPointerDown}
              onPointerMove={onTrackPointerMove}
              onPointerUp={onTrackPointerUp}
              onPointerCancel={onTrackPointerUp}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                event.preventDefault();
                const span = Math.max(steps.length - 1, 1);
                const next =
                  event.key === "ArrowRight"
                    ? Math.min(1, (active + 1) / span)
                    : Math.max(0, (active - 1) / span);
                scrollToProgress(next);
              }}
              className={`relative mt-5 h-5 touch-none select-none ${
                dragging ? "cursor-grabbing" : "cursor-ew-resize"
              }`}
            >
              <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 rounded-full bg-white/10">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                  style={{ width: progressWidth }}
                />
              </div>
              <motion.div
                className={`pointer-events-none absolute top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent)] ${
                  dragging ? "scale-125" : ""
                }`}
                style={{ left: glowX }}
              />
            </div>
          </div>

          <div ref={viewportRef} className="relative flex flex-1 items-center overflow-hidden">
            <motion.div
              style={{ x, paddingLeft: pad, paddingRight: pad, gap: CARD_GAP }}
              className="flex items-center will-change-transform"
            >
              {steps.map((step, index) => (
                <DesktopStepCard
                  key={step.title}
                  step={step}
                  index={index}
                  total={steps.length}
                  progress={scrollYProgress}
                />
              ))}
            </motion.div>
          </div>

          <motion.p
            style={{ opacity: hintOpacity }}
            className="mt-3 text-center text-[11px] uppercase tracking-[0.22em] text-zinc-500"
          >
            Scroll to move
          </motion.p>
          <div className="mx-auto mt-4 flex w-full max-w-6xl gap-2 px-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= active ? "bg-[var(--accent)]" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Roadmap() {
  return (
    <div id="experience">
      <MobileExperience />
      <DesktopExperience />
    </div>
  );
}
