import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaGithub,
  FaPause,
  FaPlay,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

export interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github: string;
  demo: string;
  featured: boolean;
  cat: string;
}

interface FeaturedProjectsProps {
  projects: Project[];
}

const CYCLE_MS = 7000;
const MAX_PROJECTS = 3;
const SWIPE_THRESHOLD = 48;

/* ---------- helpers ---------- */

// Slug output is identical to the original (encoded, lowercase, dashes),
// so existing /projects/[slug] routes keep working.
const toSlug = (title: string) => title.toLowerCase().trim().replace(/\s+/g, "-");
const slugify = (title: string) => encodeURIComponent(toSlug(title));

const shortTitle = (title: string) => title.split(" - ")[0];

const imageSrc = (image: string) => (image.startsWith("/") ? image : `/${image}`);

function displayUrl(demo: string, title: string) {
  const fallback = `alghifrz.dev/projects/${toSlug(title)}`;
  if (!demo?.trim()) return fallback;
  try {
    const url = new URL(demo.trim());
    const path = url.pathname.replace(/\/$/, "");
    return `${url.host}${path}`;
  } catch {
    return demo.trim();
  }
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

const controlBtn = `inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-colors hover:border-white/25 hover:text-white ${focusRing}`;

/* ---------- component ---------- */

const FeaturedProjects = ({ projects }: FeaturedProjectsProps) => {
  const featured = useMemo(
    () => projects.filter((p) => p.featured).slice(0, MAX_PROJECTS),
    [projects]
  );
  const count = featured.length;

  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const index = count ? Math.min(active, count - 1) : 0;
  const project = featured[index];
  const paused = hovering || focusWithin || userPaused;
  const autoplay = !reduceMotion && count > 1;

  /* progress (0 → 1) drives both autoplay and the vertical rail */
  const progress = useMotionValue(0);

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      progress.set(0);
      setActive(((next % count) + count) % count);
    },
    [count, progress]
  );

  useEffect(() => {
    if (!autoplay || paused) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // cap dt so a background tab doesn't skip ahead when it wakes up
      const dt = Math.min(now - last, 100);
      last = now;
      const next = progress.get() + dt / CYCLE_MS;
      if (next >= 1) {
        progress.set(0);
        setActive((i) => (i + 1) % count);
      } else {
        progress.set(next);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, paused, count, progress]);

  /* glare on the screen follows the cursor; the laptop itself stays still */
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(20);
  const shine = useTransform(
    [shineX, shineY],
    ([x, y]: number[]) =>
      `radial-gradient(380px circle at ${x}% ${y}%, rgba(255,255,255,0.14), transparent 55%)`
  );

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    shineX.set(((event.clientX - rect.left) / rect.width) * 100);
    shineY.set(((event.clientY - rect.top) / rect.height) * 100);
  };

  const onLeave = () => {
    shineX.set(50);
    shineY.set(20);
  };

  /* swipe */
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    goTo(dx < 0 ? index + 1 : index - 1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    }
  };

  if (!project) return null;

  return (
    <section id="projects" className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
      {/* header */}
      <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm text-[var(--muted)]">Selected work</p>
          <h2 className="font-display text-3xl leading-[1.1] text-white md:text-5xl">
            Systems that already ran in the wild
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Pick a project on the right, or swipe the screen. Each one opens on the laptop.
          </p>
        </div>
        <Link href="/projects" className="nf-btn-secondary self-start md:self-auto">
          View all projects <FaArrowRight className="text-xs" />
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setFocusWithin(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFocusWithin(false);
          }
        }}
      >
        {/* ---------- laptop ---------- */}
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Featured projects"
          tabIndex={0}
          onKeyDown={onKeyDown}
          className={`relative px-3 outline-none md:px-6 ${focusRing} rounded-3xl`}
        >
          {/* ambient glow: the one decorative element, tinted by the accent */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[85%] -translate-y-1/2 blur-2xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 24%, transparent), transparent)",
            }}
          />

          <div>
            <div onMouseMove={onMove} onMouseLeave={onLeave} className="relative">
              {/* lid */}
              <div className="relative rounded-[20px] bg-[#0a0a0b] p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_30px_60px_-20px_rgba(0,0,0,0.7)] md:p-3">
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-700 md:top-1.5"
                />
                <div
                  className="relative aspect-[16/10] w-full cursor-grab touch-pan-y overflow-hidden rounded-lg bg-black active:cursor-grabbing"
                  onPointerDown={onPointerDown}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => (dragStart.current = null)}
                >
                  {featured.map((item, i) => {
                    const isActive = i === index;
                    return (
                      <motion.div
                        key={item.title}
                        aria-hidden={!isActive}
                        initial={false}
                        animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 1.035 }}
                        transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
                        style={{ zIndex: isActive ? 1 : 0 }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={imageSrc(item.image)}
                          alt={isActive ? `${shortTitle(item.title)} preview` : ""}
                          fill
                          draggable={false}
                          className="select-none object-cover object-top"
                          sizes="(max-width: 1024px) 100vw, 680px"
                          priority={i === 0}
                        />
                      </motion.div>
                    );
                  })}
                  <motion.div
                    aria-hidden
                    style={{ background: shine }}
                    className="pointer-events-none absolute inset-0 z-10"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-10 rounded-lg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  />
                </div>
              </div>

              {/* base */}
              <div className="relative -ml-[4%] h-3.5 w-[108%] rounded-b-[18px] rounded-t-[3px] bg-gradient-to-b from-[#34343a] to-[#131315] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] md:h-4">
                <span
                  aria-hidden
                  className="absolute left-1/2 top-0 h-1 w-[16%] -translate-x-1/2 rounded-b-md bg-[#0a0a0b]/90 md:h-1.5"
                />
              </div>
              <div
                aria-hidden
                className="mx-auto mt-1 h-6 w-[80%] rounded-full bg-black/60 blur-xl"
              />
            </div>
          </div>

          {/* controls */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="flex min-w-0 items-center gap-2 text-xs text-zinc-500">
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
              />
              <span className="truncate">{displayUrl(project.demo, project.title)}</span>
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className={controlBtn}
                aria-label="Previous project"
              >
                <FaChevronLeft className="text-[10px]" />
              </button>
              <span className="min-w-[3rem] text-center text-xs tabular-nums text-zinc-400">
                {index + 1} of {count}
              </span>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className={controlBtn}
                aria-label="Next project"
              >
                <FaChevronRight className="text-[10px]" />
              </button>
              {autoplay && (
                <button
                  type="button"
                  onClick={() => setUserPaused((v) => !v)}
                  className={`${controlBtn} ml-1`}
                  aria-label={userPaused ? "Resume autoplay" : "Pause autoplay"}
                  aria-pressed={userPaused}
                >
                  {userPaused ? (
                    <FaPlay className="text-[9px]" />
                  ) : (
                    <FaPause className="text-[9px]" />
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            Showing project {index + 1} of {count}: {shortTitle(project.title)}
          </p>
        </div>

        {/* ---------- project list ---------- */}
        <ul className="relative">
          {featured.map((item, i) => {
            const selected = i === index;
            const panelId = `featured-panel-${i}`;
            return (
              <li key={item.title} className="relative border-l border-white/10 pl-6 md:pl-8">
                {/* vertical progress rail on the selected project */}
                {selected && (
                  <motion.span
                    aria-hidden
                    className="absolute -left-px top-0 h-full w-[2px] origin-top bg-[var(--accent)]"
                    style={{ scaleY: reduceMotion ? 1 : progress }}
                  />
                )}

                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-expanded={selected}
                  aria-controls={panelId}
                  className={`group flex w-full items-baseline justify-between gap-4 py-5 text-left ${focusRing} rounded-sm`}
                >
                  <h3
                    className={`font-display text-xl leading-tight transition-colors md:text-2xl ${
                      selected ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    {shortTitle(item.title)}
                  </h3>
                  <span
                    className={`shrink-0 text-xs transition-colors ${
                      selected ? "text-[var(--muted)]" : "text-zinc-600"
                    }`}
                  >
                    {item.cat}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {selected && (
                    <motion.div
                      id={panelId}
                      key="panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-7">
                        <p className="line-clamp-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                          {item.description}
                        </p>

                        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
                          {item.technologies.slice(0, 6).map((tech) => (
                            <li
                              key={tech}
                              className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-zinc-400"
                            >
                              {tech}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                          <Link
                            href={`/projects/${slugify(item.title)}`}
                            className="nf-btn-primary !px-4 !py-2 !text-sm"
                          >
                            Read case study <FaArrowRight className="text-[10px]" />
                          </Link>
                          {item.demo?.trim() && (
                            <a
                              href={item.demo.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 text-sm text-zinc-300 transition-colors hover:text-white ${focusRing} rounded-sm`}
                            >
                              <FaExternalLinkAlt className="text-[10px]" /> Live site
                            </a>
                          )}
                          {item.github?.trim() && (
                            <a
                              href={item.github.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 text-sm text-zinc-300 transition-colors hover:text-white ${focusRing} rounded-sm`}
                            >
                              <FaGithub /> Source
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
};

export default FeaturedProjects;