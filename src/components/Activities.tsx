import React, { useMemo, useState } from "react";
import content from "@/data/content.json";
import Image from "next/image";
import {
  FaReact,
  FaNodeJs,
  FaPython,
  FaGitAlt,
  FaFigma,
  FaJava,
  FaPhp,
  FaGithub,
  FaExternalLinkAlt,
  FaGlobe,
} from "react-icons/fa";
import {
  SiCplusplus,
  SiJavascript,
  SiTypescript,
  SiTailwindcss,
  SiNextdotjs,
  SiLaravel,
  SiRedis,
  SiMysql,
  SiMongodb,
  SiTableau,
  SiN8N,
  SiPostgresql,
  SiDocker,
  SiJira,
  SiAnaconda,
  SiTensorflow,
  SiLooker,
} from "react-icons/si";
import { BsListUl } from "react-icons/bs";
import { IconType } from "react-icons";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeader from "./ui/SectionHeader";
import SkillGlobe from "./SkillGlobe";

interface Skill {
  name: string;
  icon: IconType;
  color: string;
}

const iconComponents: Record<string, IconType> = {
  FaPython,
  FaJava,
  FaPhp,
  FaReact,
  FaNodeJs,
  FaGitAlt,
  FaFigma,
  FaGithub,
  SiJavascript,
  SiTypescript,
  SiTailwindcss,
  SiNextdotjs,
  SiLaravel,
  SiRedis,
  SiMysql,
  SiMongodb,
  SiTableau,
  SiCplusplus,
  SiN8N,
  SiPostgresql,
  SiDocker,
  SiJira,
  SiAnaconda,
  SiTensorflow,
  SiLooker,
};

function splitOrg(name: string) {
  const [org, extra] = name.split(" | ");
  return { org: org.trim(), extra: extra?.trim() ?? "" };
}

function certTitle(name: string) {
  return {
    gold: name.includes("(Gold)"),
    title: name.replace(" (Gold)", ""),
  };
}

export default function Activities() {
  const [listView, setListView] = useState(false);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const technicalSkills: Skill[] = useMemo(
    () =>
      content.skills.detail
        .map((skill) => {
          const Icon = iconComponents[skill.logo];
          if (!Icon) return null;
          return { name: skill.name, icon: Icon, color: skill.color };
        })
        .filter((skill): skill is Skill => skill !== null),
    []
  );

  const highlighted =
    technicalSkills.find((skill) => skill.name === activeSkill) ?? technicalSkills[0] ?? null;

  const orgs = content.activities.detail;
  const education = content.education.detail;

  return (
    <section id="activities" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <SectionHeader
        eyebrow="Activities"
        title="Organizations, education, and the stack behind the work"
        description={content.activitiessession.subtitle}
      />

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="nf-eyebrow mb-2">Organizations</p>
              <h3 className="font-display text-3xl text-white md:text-4xl">Where I lead</h3>
            </div>
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              {String(orgs.length).padStart(2, "0")} roles
            </span>
          </div>

          <div className="space-y-5">
            {orgs.map((exp, index) => {
              const { org, extra } = splitOrg(exp.name);
              const featured = index === -1;

              if (featured) {
                return (
                  <motion.article
                    key={exp.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111] p-6 md:p-8"
                  >
                    <div className="pointer-events-none absolute -right-8 -top-10 font-display text-[9rem] leading-none text-white/[0.04]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,85,212,0.2),transparent_50%)]" />
                    <div className="relative flex flex-wrap items-center gap-2">
                      <span className="nf-badge">
                        <span className="nf-badge-dot" />
                        Current
                      </span>
                      <span className="text-xs text-zinc-500">{exp.date}</span>
                    </div>
                    <h4 className="relative mt-5 max-w-xl font-display text-3xl leading-tight text-white md:text-5xl">
                      {exp.role}
                    </h4>
                    <p className="relative mt-4 text-base text-zinc-300">{org}</p>
                    {extra && <p className="relative mt-1 text-sm text-[var(--muted)]">{extra}</p>}
                  </motion.article>
                );
              }

              return (
                <motion.article
                  key={exp.name}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group grid grid-cols-[auto_1fr] gap-4 border-l-2 border-white/10 py-2 pl-5 transition hover:border-[var(--accent)] md:grid-cols-[4.5rem_1fr_auto] md:items-baseline"
                >
                  <span className="font-display text-2xl text-zinc-600 transition group-hover:text-[var(--accent)] md:text-3xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="text-lg font-semibold text-white md:text-xl">{exp.role}</h4>
                    <p className="mt-1 text-sm text-zinc-400">{org}</p>
                    {extra && <p className="mt-0.5 text-xs text-[var(--muted)]">{extra}</p>}
                  </div>
                  <p className="col-span-2 text-xs text-zinc-500 md:col-span-1 md:text-right">{exp.date}</p>
                </motion.article>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="flex flex-col"
        >
          <div className="mb-8 border-b border-white/10 pb-4">
            <p className="nf-eyebrow mb-2">Education</p>
            <h3 className="font-display text-3xl text-white md:text-4xl">Academic path</h3>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            {education.map((edu, index) => {
              const current = edu.date.toLowerCase().includes("present");
              const primary = index === 0;

              if (primary) {
                return (
                  <article
                    key={edu.name}
                    className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111] p-6"
                  >
                    <div className="pointer-events-none absolute -right-6 bottom-0 h-40 w-40 opacity-20">
                      <Image src={edu.logo} alt="" fill className="object-contain" sizes="160px" />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(0,85,212,0.16),transparent_55%)]" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white p-2">
                        <Image src={edu.logo} alt={edu.name} fill className="object-contain p-1.5" sizes="64px" />
                      </div>
                      {current && (
                        <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                          Studying
                        </span>
                      )}
                    </div>
                    <div className="relative mt-8">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">University</p>
                      <h4 className="mt-2 font-display text-3xl leading-tight text-white">{edu.name}</h4>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{edu.degree}</p>
                      <p className="mt-4 text-xs text-zinc-500">{edu.date}</p>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={edu.name}
                  className="relative overflow-hidden rounded-[1.4rem] border border-dashed border-white/15 bg-transparent px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white p-1.5">
                      <Image src={edu.logo} alt={edu.name} fill className="object-contain p-1" sizes="48px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Earlier</p>
                      <h4 className="mt-1 font-medium text-white">{edu.name}</h4>
                      <p className="text-sm text-[var(--muted)]">
                        {edu.degree} · {edu.date}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="nf-card relative flex min-h-[26rem] flex-col overflow-hidden p-6 sm:min-h-[28rem] md:p-8 lg:min-h-[32rem]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(0,85,212,0.14),transparent_55%)]" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white md:text-xl">{content.skills.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {listView ? "Scroll the stack as a list." : "Drag or hover the orbiting stack."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setListView((value) => !value)}
              className="shrink-0 rounded-full border border-white/10 p-2.5 text-white transition hover:border-white/20 hover:bg-white/5"
              title={listView ? "Switch to globe" : "Switch to list"}
              aria-label={listView ? "Switch to globe view" : "Switch to list view"}
            >
              {listView ? <FaGlobe className="h-4 w-4" /> : <BsListUl className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative mt-5 min-h-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              {listView ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  <div className="space-y-2">
                    {technicalSkills.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-3 py-2.5"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30"
                          style={{ color: skill.color, boxShadow: `0 0 16px ${skill.color}22` }}
                        >
                          <skill.icon className="text-base" />
                        </span>
                        <span className="text-sm text-zinc-300">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="globe"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                    <SkillGlobe
                      skills={technicalSkills.map((skill) => ({
                        ...skill,
                        group: "Stack",
                      }))}
                      activeName={activeSkill}
                      onActiveChange={setActiveSkill}
                    />
                  </div>
                  {highlighted && (
                    <div className="flex shrink-0 items-center justify-center gap-3 pb-1 pt-2">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40"
                        style={{ color: highlighted.color }}
                      >
                        <highlighted.icon className="text-sm" />
                      </span>
                      <p className="text-sm font-medium text-white">{highlighted.name}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="nf-card flex min-h-[28rem] flex-col p-6 md:min-h-[32rem] md:p-8"
        >
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white md:text-xl">{content.certifications.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Verified credentials, ready to open.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              {content.certifications.detail.length} badges
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {content.certifications.detail.map((cert) => {
              const { gold, title } = certTitle(cert.name);
              return (
                <a
                  key={cert.link}
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:-translate-y-0.5 hover:border-white/16"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cert.logo} alt={cert.name} className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-2 text-sm font-medium leading-snug text-white">{title}</h4>
                      <FaExternalLinkAlt className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600 transition group-hover:text-[var(--accent)]" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {gold && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                          Gold
                        </span>
                      )}
                      <p className="text-[11px] text-[var(--muted)]">
                        {cert.issuer} · {cert.date}
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
