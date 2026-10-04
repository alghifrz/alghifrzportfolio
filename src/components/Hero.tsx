import Image from "next/image";
import content from "@/data/content.json";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type MouseEvent } from "react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

const stack = ["ReactJS", "Golang", "RESTful API", "TypeScript", "TailwindCSS", "PostgreSQL", "Redis", "Docker", "Git", "GitHub", "GitLab"];

const Hero = () => {
  const { hero, projects, experience } = content;
  const featured = projects.featured.slice(0, 3);
  const latest = experience.step[0];
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const mockY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  // Smaller at rest, grow into focus as it flattens on scroll.
  const mockScale = useTransform(scrollYProgress, [0, 0.22], [0.86, 1]);
  const mockOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.9]);
  // Intro stays put and fades so attention moves to the mock below.
  const titleOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const titlePointer = useTransform(scrollYProgress, (value) =>
    value > 0.14 ? "none" : "auto"
  );
  // Mild tip at rest; flat while still inside the hero (not after leaving it).
  const baseRotateX = useTransform(scrollYProgress, [0, 0.22], [8, 0]);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothX = useSpring(rotateX, { stiffness: 180, damping: 20 });
  const smoothY = useSpring(rotateY, { stiffness: 180, damping: 20 });
  const combinedRotateX = useTransform(
    [baseRotateX, smoothX],
    ([base, mouse]) => Number(base) + Number(mouse)
  );

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(py * -10);
    rotateY.set(px * 12);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative pt-28 pb-10 md:pt-36 md:pb-48"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="nf-grid absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(98,186,245,0.12),transparent_46%)]" />
        <motion.div
          className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--accent)]/20 blur-[90px]"
          animate={{ opacity: [0.25, 0.5, 0.25], scale: [0.9, 1.08, 0.9] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Keeps document flow while the real intro is pinned to the viewport. */}
      <div className="pointer-events-none invisible mx-auto max-w-4xl px-4 text-center" aria-hidden>
        <div className="nf-badge mb-5">AVAILABLE</div>
        <p className="nf-eyebrow mb-5">AI & AUTOMATION ENGINEER | SOFTWARE ENGINEER</p>
        <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl md:text-7xl">
          Alghifari Rasyid Zola
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm md:text-lg">
          {hero.description} <br /> I build AI workflows, automation, and software that actually ship.
        </p>
        <div className="mt-8 h-11" />
        <div className="mt-6 h-10" />
      </div>

      <motion.div
        style={{ opacity: titleOpacity, pointerEvents: titlePointer }}
        className="fixed inset-x-0 top-[max(5.5rem,12vh)] z-20 mx-auto max-w-4xl px-4 text-center md:top-[max(6.5rem,14vh)]"
      >
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7 }}
          className="nf-badge mb-5 inline-flex"
        >
          <span className="nf-badge-dot" />
          AVAILABLE
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="nf-eyebrow mb-5"
        >
          AI & AUTOMATION ENGINEER | SOFTWARE ENGINEER
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.12 }}
          className="font-display text-4xl leading-[1.05] text-white sm:text-5xl md:text-7xl"
        >
          Alghifari Rasyid Zola
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[var(--muted)] md:text-lg"
        >
          {hero.description} <br /> I build AI workflows, automation, and software that actually ship.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.a
            href={hero.buttons.cv.link}
            target="_blank"
            rel="noopener noreferrer"
            className="nf-btn-primary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {hero.buttons.cv.text}
          </motion.a>
          <motion.a
            href={hero.buttons.portfolio.link}
            target="_blank"
            rel="noopener noreferrer"
            className="nf-btn-secondary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {hero.buttons.portfolio.text}
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.38 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { platform: "Instagram", username: "agifrz", href: hero.socialMedia.find((s) => s.platform === "Instagram")?.link, Icon: FaInstagram },
            { platform: "LinkedIn", username: "alghifarirasyidzola", href: hero.socialMedia.find((s) => s.platform === "LinkedIn")?.link, Icon: FaLinkedin },
            { platform: "Github", username: "alghifrz", href: hero.socialMedia.find((s) => s.platform === "Github")?.link, Icon: FaGithub },
          ].map(({ platform, username, href, Icon }) => (
            <motion.a
              key={platform}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={platform}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Icon className="text-base" />
              <span>@{username}</span>
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: mockY, scale: mockScale, opacity: mockOpacity }}
        className="relative mx-auto mt-10 max-w-6xl px-4 md:mt-18 mb-10 [perspective:1200px] z-50"
      >
        <motion.div
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{
            rotateX: combinedRotateX,
            rotateY: smoothY,
            transformPerspective: 1200,
            transformOrigin: "center top",
          }}
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.38 }}
          className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-transparent shadow-[0_40px_120px_rgba(0,0,0,0.55)] will-change-transform"
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 bg-[#111]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 truncate text-xs text-[var(--muted)]">alghifrz portfolio</span>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-[0.9fr_1.1fr] md:gap-8 md:p-8">
            <div className="relative mx-auto h-[320px] w-full max-w-[280px] md:mx-0 md:h-[540px] md:max-w-none">
              <Image
                src="/fotoME.png"
                alt={hero.title.name}
                width={420}
                height={620}
                priority
                className="hero-photo h-full w-full object-contain object-bottom"
              />
              <div className="hero-pattern pointer-events-none absolute inset-0" />
            </div>

            <div className="flex flex-col justify-center text-left">
              <span className="nf-badge w-fit">
                <span className="nf-badge-dot" />
                OPEN TO WORK
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">{hero.title.name}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{hero.title.highlight}</p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "GPA", value: "3.92" },
                  { label: "Focus", value: "AI & SE" },
                  { label: "Projects", value: `${projects.featured.length}+` },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/4 px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{stat.label}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Currently</p>
                <p className="mt-2 text-sm font-medium text-white">{latest.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {latest.company} · {latest.date}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {stack.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>


              {/* <div className="mt-5 hidden gap-2 md:grid md:grid-cols-3">
                {featured.map((project) => (
                  <div key={project.title} className="overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={`/${project.image}`}
                      alt={project.title}
                      width={180}
                      height={90}
                      className="h-16 w-full object-cover"
                    />
                  </div>
                ))}
              </div> */}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
