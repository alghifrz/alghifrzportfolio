# Alghif Rz — Portfolio

Personal portfolio for **Alghifari Rasyid Zola** (AI & Automation Engineer | Software Engineer).  
Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

**Live:** [alghifrz.vercel.app](https://alghifrz.vercel.app)

---

## Features

- Dark, Nexflow-inspired UI with scroll-driven motion
- Hero with pinned intro fade + 3D mock window (tilt → flat on scroll)
- Profile photo slider and highlights
- Work experience: horizontal coverflow on desktop, vertical timeline on mobile
- Activities: organizations, education, interactive skill globe (toggle list), certifications
- Featured projects on the homepage + full project catalog and detail pages
- Contact form via EmailJS, plus email / WhatsApp / social links

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | [Next.js](https://nextjs.org/) 16 (Pages Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| Icons | react-icons |
| Forms | @emailjs/browser, react-hot-toast |
| Content | `src/data/content.json` |
| Deploy | Vercel |

---

## Getting started

### 1. Clone

```bash
git clone https://github.com/alghifrz/alghifrzportfolio.git
cd alghifrzportfolio
```

### 2. Install

```bash
npm install
```

### 3. Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
```

Get these from the [EmailJS dashboard](https://dashboard.emailjs.com/).  
If the Gmail service shows `Invalid grant`, reconnect the email service there.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
```

---

## Project structure

```text
src/
  components/     # Hero, Profile, Experience, Activities, Projects, Contact, …
  data/
    content.json  # Site copy, experience, skills, projects, contact info
  pages/
    index.tsx             # Home
    projects/index.tsx    # Project catalog
    projects/[...project].tsx  # Project detail + preview gallery
    api/preview-images.ts # Lists preview screenshots per project
  styles/         # globals.css design tokens & utilities
public/
  fotoME.png, me*.jpg, project images, previews/, …
```

Most text and project data live in `src/data/content.json` — edit there to update the site without hunting through components.

---

## Sections (homepage)

1. **Home / Hero** — name, CTAs, socials, interactive profile mock
2. **Profile** — photo carousel + bio
3. **Experience** — work timeline
4. **Activities** — orgs, education, skills globe, badges
5. **Featured projects** — selected work
6. **Contact** — FAQ + message form

Full project list: `/projects`

---

## Notes

- Project detail pages load screenshots from `public/previews/<preview-folder>/` via `/api/preview-images`.
- Remote certification badge images (Badgr) are loaded as plain `<img>` because Next Image optimization can fail on those URLs.
- Keep EmailJS Gmail (or other) service connected so the contact form works in production.

---

## Author

**Alghifari Rasyid Zola**  
Computer Science · Pertamina University · GPA 3.92/4.00

- Portfolio: [alghifrz.vercel.app](https://alghifrz.vercel.app)
- GitHub: [@alghifrz](https://github.com/alghifrz)
- LinkedIn: [alghifarirasyidzola](https://www.linkedin.com/in/alghifarirasyidzola)

Questions or collaboration — use the contact form on the site, or reach out via email / WhatsApp from the Contact section.
