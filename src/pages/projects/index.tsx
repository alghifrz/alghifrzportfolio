import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import content from "@/data/content.json";
import {
  FaArrowRight,
  FaBrain,
  FaCode,
  FaDatabase,
  FaExternalLinkAlt,
  FaFolderOpen,
  FaGamepad,
  FaGithub,
  FaLayerGroup,
  FaMobile,
  FaRobot,
  FaThLarge,
  FaTools,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import { useMemo } from "react";
import SectionHeader from "@/components/ui/SectionHeader";

const ALL = "All";

const categoryIcons: Record<string, IconType> = {
  [ALL]: FaThLarge,
  "Web Development": FaCode,
  "Data Science": FaDatabase,
  "Machine Learning": FaBrain,
  "Mobile Development": FaMobile,
  "Game Development": FaGamepad,
  DevOps: FaTools,
  "UI/UX Design": FaLayerGroup,
  "Artificial Intelligence": FaRobot,
};

// Same slug output as before, so /projects/[slug] routes keep working.
const slugify = (title: string) =>
  encodeURIComponent(title.toLowerCase().trim().replace(/\s+/g, "-"));

const imageSrc = (image: string) => (image.startsWith("/") ? image : `/${image}`);

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

const Projects = () => {
  const { meta, projects } = content;
  const allProjects = projects.featured;
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(allProjects.map((project) => project.cat)))],
    [allProjects]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { [ALL]: allProjects.length };
    allProjects.forEach((project) => {
      map[project.cat] = (map[project.cat] ?? 0) + 1;
    });
    return map;
  }, [allProjects]);

  // The URL is the single source of truth for the selected category.
  const queryCategory = router.query.category;
  const selected =
    typeof queryCategory === "string" && categories.includes(queryCategory) ? queryCategory : ALL;

  const filtered = useMemo(
    () => (selected === ALL ? allProjects : allProjects.filter((project) => project.cat === selected)),
    [allProjects, selected]
  );

  const handleCategoryChange = (next: string) => {
    if (next === selected) return;
    const query = { ...router.query };
    if (next === ALL) delete query.category;
    else query.category = next;
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
  };

  return (
    <>
      <Head>
        <title>{`Projects | ${meta.title}`}</title>
        <meta name="description" content={meta.description} />
      </Head>

      <section className="px-4 pb-24 pt-28 text-white md:px-8 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Projects"
            title="Systems I've shipped across AI, web, data and mobile"
            description="Filter by category, then open a project to read how it was built."
          />

          {/* category filter */}
          <div
            role="group"
            aria-label="Filter projects by category"
            className="-mx-4 mb-12 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0"
          >
            {categories.map((cat) => {
              const Icon = categoryIcons[cat] ?? FaFolderOpen;
              const isActive = selected === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  aria-pressed={isActive}
                  className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${focusRing} ${
                    isActive
                      ? "border-white bg-white text-black"
                      : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <Icon className="text-xs" aria-hidden />
                  {cat}
                  <span
                    className={`text-xs tabular-nums ${isActive ? "text-black/55" : "text-zinc-600"}`}
                  >
                    {counts[cat]}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="sr-only" aria-live="polite">
            Showing {filtered.length} {filtered.length === 1 ? "project" : "projects"}
            {selected === ALL ? "" : ` in ${selected}`}
          </p>

          {/* grid */}
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {filtered.map((project) => (
                <motion.li
                  key={project.title}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/25 focus-within:border-white/30"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                    <Image
                      src={imageSrc(project.image)}
                      alt=""
                      fill
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs text-[var(--muted)]">{project.cat}</p>

                    <h3 className="mt-2 font-display text-xl leading-snug text-white">
                      {/* stretched link: the whole card opens the case study */}
                      <Link
                        href={`/projects/${slugify(project.title)}`}
                        className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline focus-visible:underline-offset-4"
                      >
                        {project.title}
                      </Link>
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">
                      {project.description}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <li
                          key={tech}
                          className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-zinc-400"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex items-center justify-between pt-6">
                      <div className="relative z-10 flex items-center gap-4">
                        {project.demo?.trim() && (
                          <a
                            href={project.demo.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} live site`}
                            className={`inline-flex items-center gap-2 rounded-sm text-sm text-zinc-300 transition-colors hover:text-white ${focusRing}`}
                          >
                            <FaExternalLinkAlt className="text-[10px]" aria-hidden /> Live
                          </a>
                        )}
                        {project.github?.trim() && (
                          <a
                            href={project.github.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} source code`}
                            className={`inline-flex items-center gap-2 rounded-sm text-sm text-zinc-300 transition-colors hover:text-white ${focusRing}`}
                          >
                            <FaGithub aria-hidden /> Source
                          </a>
                        )}
                      </div>
                      <span
                        aria-hidden
                        className="inline-flex items-center gap-2 text-sm text-white transition-colors group-hover:text-[var(--accent)]"
                      >
                        Read case study
                        <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                      </span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </section>
    </>
  );
};

export default Projects;