import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaExpand,
  FaExternalLinkAlt,
  FaGithub,
  FaHome,
  FaTimes,
} from "react-icons/fa";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import content from "@/data/content.json";

interface ProjectData {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github: string;
  demo: string;
  featured: boolean;
  cat: string;
  preview?: string;
}

const projectList = content.projects.featured as ProjectData[];

/* ---------- helpers ---------- */

// Same slug output as before, so existing links keep working.
const toSlug = (title: string) => title.toLowerCase().trim().replace(/\s+/g, "-");
const slugify = (title: string) => encodeURIComponent(toSlug(title));
const imageSrc = (image: string) => (image.startsWith("/") ? image : `/${image}`);

function displayUrl(demo: string, title: string) {
  const fallback = `alghifrz.dev/projects/${toSlug(title)}`;
  if (!demo?.trim()) return fallback;
  try {
    const url = new URL(demo.trim());
    return `${url.host}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return demo.trim();
  }
}

function hostOf(url: string) {
  try {
    return new URL(url.trim()).host;
  } catch {
    return url.trim();
  }
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

const controlBtn = `inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition-colors hover:border-white/25 hover:text-white ${focusRing}`;

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const SWIPE_THRESHOLD = 48;

/* ---------- page ---------- */

const ProjectDetail = () => {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { meta } = content;

  const slugParam = router.query.project;
  const slug = Array.isArray(slugParam) ? slugParam.join("/") : slugParam;

  const projectIndex = useMemo(
    () => (slug ? projectList.findIndex((p) => toSlug(p.title) === slug.toLowerCase().trim()) : -1),
    [slug]
  );
  const project = projectIndex >= 0 ? projectList[projectIndex] : undefined;

  const total = projectList.length;
  const prevProject =
    project && total > 1 ? projectList[(projectIndex - 1 + total) % total] : undefined;
  const nextProject = project && total > 1 ? projectList[(projectIndex + 1) % total] : undefined;

  /* scroll-linked parallax inside the browser frame */
  const frameRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  /* gallery */
  const previewDir = project?.preview;
  const [files, setFiles] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const swiped = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setFiles([]);
    setIndex(0);
    setLightbox(false);
    if (!previewDir) return;

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/preview-images?project=${encodeURIComponent(previewDir)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setFiles(Array.isArray(data.files) ? data.files : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error fetching preview files:", error);
        }
      }
    })();

    return () => controller.abort();
  }, [previewDir]);

  const step = useCallback(
    (delta: number) => {
      if (!files.length) return;
      setIndex((i) => (i + delta + files.length) % files.length);
    },
    [files.length]
  );

  // keep the active thumbnail in view without scrolling the page
  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [index, reduceMotion]);

  // lightbox: keyboard, scroll lock, focus handling
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [lightbox, step]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    swiped.current = false;
    dragStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    swiped.current = true;
    step(dx < 0 ? 1 : -1);
  };

  /* ---------- states ---------- */

  if (!router.isReady) return <div className="min-h-screen" aria-busy="true" />;

  if (!project) {
    return (
      <>
        <Head>
          <title>{`Project not found | ${meta.title}`}</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="flex min-h-screen items-center justify-center px-4 text-white">
          <div className="max-w-lg text-center">
            <h1 className="mb-4 font-display text-7xl md:text-9xl">404</h1>
            <p className="mb-3 text-xl text-zinc-300">Project not found</p>
            <p className="mb-8 text-sm text-[var(--muted)]">
              This project doesn&rsquo;t exist or has been moved. Pick another one from the list.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
              <Link href="/projects" className="nf-btn-primary">
                <FaHome /> All projects
              </Link>
              <button type="button" onClick={() => router.back()} className="nf-btn-secondary">
                <FaArrowLeft /> Go back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const demo = project.demo?.trim();
  const github = project.github?.trim();
  const galleryAvailable = files.length > 0;
  const currentFile = files[index];
  const fileSrc = (file: string) => `/previews/${project.preview}/${encodeURIComponent(file)}`;

  return (
    <>
      <Head>
        <title>{`${project.title} | ${meta.title}`}</title>
        <meta name="description" content={project.description} />
      </Head>

      <div className="relative px-4 pb-24 pt-28 text-white md:px-6 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/projects"
            className={`group mb-10 inline-flex items-center gap-2 rounded-sm text-sm text-zinc-400 transition-colors hover:text-white ${focusRing}`}
          >
            <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" />
            All projects
          </Link>

          {/* ---------- hero ---------- */}
          <motion.header
            key={project.title}
            variants={heroContainer}
            initial={reduceMotion ? "show" : "hidden"}
            animate="show"
            className="max-w-4xl"
          >
            <motion.p variants={heroItem} className="text-sm text-[var(--muted)]">
              {project.cat}
            </motion.p>
            <motion.h1
              variants={heroItem}
              className="mt-4 font-display text-4xl leading-[1.05] text-white md:text-6xl lg:text-7xl"
            >
              {project.title}
            </motion.h1>
            <motion.p
              variants={heroItem}
              className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg"
            >
              {project.description}
            </motion.p>
            {(demo || github) && (
              <motion.div variants={heroItem} className="mt-8 flex flex-wrap gap-3">
                {demo && (
                  <a href={demo} target="_blank" rel="noopener noreferrer" className="nf-btn-primary">
                    <FaExternalLinkAlt className="text-xs" /> Open live demo
                  </a>
                )}
                {github && (
                  <a href={github} target="_blank" rel="noopener noreferrer" className="nf-btn-secondary">
                    <FaGithub /> View source
                  </a>
                )}
              </motion.div>
            )}
          </motion.header>

          {/* ---------- browser showcase ---------- */}
          <div ref={frameRef} className="relative mt-14 md:mt-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[8%] top-[10%] -z-10 h-[80%] blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 26%, transparent), transparent)",
              }}
            />
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0c] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)]">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <div className="flex w-12 items-center gap-1.5" aria-hidden>
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                </div>
                <div className="mx-auto flex h-6 w-full max-w-sm items-center justify-center rounded-md bg-white/[0.05] px-3 text-[11px] text-zinc-500">
                  <span className="truncate">{displayUrl(project.demo, project.title)}</span>
                </div>
                <div className="w-12" aria-hidden />
              </div>
              <div className="relative aspect-[16/10] overflow-hidden bg-black md:aspect-[16/9]">
                <motion.div
                  className="absolute inset-0"
                  style={reduceMotion ? undefined : { y: parallaxY, scale: 1.1 }}
                >
                  <Image
                    src={imageSrc(project.image)}
                    alt={`${project.title} screenshot`}
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="(max-width: 1152px) 100vw, 1152px"
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* ---------- facts ---------- */}
          <dl className="mt-16 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-zinc-500">Category</dt>
              <dd className="mt-1.5 text-white">{project.cat}</dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Live site</dt>
              <dd className="mt-1.5 text-white">
                {demo ? (
                  <a
                    href={demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-sm underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white ${focusRing}`}
                  >
                    {hostOf(demo)}
                  </a>
                ) : (
                  "Private"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Source code</dt>
              <dd className="mt-1.5 text-white">
                {github ? (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-sm underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white ${focusRing}`}
                  >
                    Public repository
                  </a>
                ) : (
                  "Closed source"
                )}
              </dd>
            </div>
          </dl>

          {/* ---------- stack ---------- */}
          <section
            aria-labelledby="stack-heading"
            className="mt-12 grid gap-6 border-t border-white/10 pt-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
          >
            <h2 id="stack-heading" className="font-display text-2xl text-white md:text-3xl">
              Built with
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li
                  key={tech}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-zinc-200"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </section>

          {/* ---------- gallery ---------- */}
          {galleryAvailable && (
            <section
              aria-labelledby="gallery-heading"
              className="mt-12 border-t border-white/10 pt-10"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 id="gallery-heading" className="font-display text-2xl text-white md:text-3xl">
                  More screens
                </h2>
                <div className="flex items-center gap-2">
                  <span className="mr-2 text-sm tabular-nums text-zinc-500">
                    {index + 1} of {files.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className={controlBtn}
                    aria-label="Previous screen"
                  >
                    <FaArrowLeft className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className={controlBtn}
                    aria-label="Next screen"
                  >
                    <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </div>

              <div
                className="relative aspect-video touch-pan-y overflow-hidden rounded-xl border border-white/10 bg-black"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={() => (dragStart.current = null)}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentFile}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={fileSrc(currentFile)}
                      alt={`${project.title} screen ${index + 1}`}
                      fill
                      draggable={false}
                      className="select-none object-contain"
                      sizes="(max-width: 1152px) 100vw, 1152px"
                    />
                  </motion.div>
                </AnimatePresence>

                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => {
                    if (swiped.current) {
                      swiped.current = false;
                      return;
                    }
                    setLightbox(true);
                  }}
                  className={`group absolute inset-0 z-10 cursor-zoom-in ${focusRing}`}
                  aria-label={`Open screen ${index + 1} full size`}
                >
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-zinc-200 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <FaExpand className="text-[10px]" aria-hidden /> Full size
                  </span>
                </button>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {files.map((file, i) => (
                  <button
                    key={file}
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show screen ${i + 1}`}
                    aria-current={i === index}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition md:h-20 md:w-32 ${focusRing} ${
                      i === index
                        ? "border-white/70"
                        : "border-white/10 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={fileSrc(file)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ---------- prev / next ---------- */}
          {prevProject && nextProject && (
            <nav aria-label="More projects" className="mt-20 grid border-t border-white/10 md:grid-cols-2">
              <Link
                href={`/projects/${slugify(prevProject.title)}`}
                className={`group border-b border-white/10 py-8 md:border-b-0 md:border-r md:pr-8 ${focusRing}`}
              >
                <span className="flex items-center gap-2 text-sm text-zinc-500">
                  <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1 motion-reduce:transition-none" />
                  Previous project
                </span>
                <span className="mt-3 block font-display text-2xl text-white transition-colors group-hover:text-[var(--accent)] md:text-3xl">
                  {prevProject.title}
                </span>
              </Link>
              <Link
                href={`/projects/${slugify(nextProject.title)}`}
                className={`group py-8 md:pl-8 md:text-right ${focusRing}`}
              >
                <span className="flex items-center gap-2 text-sm text-zinc-500 md:justify-end">
                  Next project
                  <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                </span>
                <span className="mt-3 block font-display text-2xl text-white transition-colors group-hover:text-[var(--accent)] md:text-3xl">
                  {nextProject.title}
                </span>
              </Link>
            </nav>
          )}
        </div>
      </div>

      {/* ---------- lightbox ---------- */}
      <AnimatePresence>
        {lightbox && galleryAvailable && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} screens`}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
            onClick={() => setLightbox(false)}
          >
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
              <p className="text-sm tabular-nums text-zinc-400">
                {index + 1} of {files.length}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightbox(false);
                }}
                className={controlBtn}
                aria-label="Close full size view"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="relative mx-4 mb-6 flex-1 md:mx-16">
              <Image
                src={fileSrc(currentFile)}
                alt={`${project.title} screen ${index + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {files.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(-1);
                  }}
                  className={`${controlBtn} absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 md:left-5`}
                  aria-label="Previous screen"
                >
                  <FaArrowLeft className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(1);
                  }}
                  className={`${controlBtn} absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 md:right-5`}
                  aria-label="Next screen"
                >
                  <FaArrowRight className="text-xs" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectDetail;