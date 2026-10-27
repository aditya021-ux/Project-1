# FreshHire · Job Portal for Freshers

A responsive, dark-themed job portal built for fresh graduates. Users can search entry-level jobs, view details, create a profile, upload a resume and track their applications.

Built with plain HTML, CSS and JavaScript. No frameworks, no build step, no backend.

---

## Features

- **Job search** with keyword search, category filter and job-type filter
- **Job details** in a modal (a bottom sheet on phones)
- **Apply** to jobs, with a check to make sure a profile exists first
- **Profile page** with personal details, skills, bio and resume upload (PDF/DOC/DOCX, max 2 MB)
- **Application tracker** with status updates (Applied, Interviewing, Offer, Rejected) and remove
- **About page** that summarises the UX case study
- **Responsive design** for phones, tablets and desktops
- **Dark theme** with design tokens that map directly to Figma variables
- **Accessible basics**: keyboard focus rings, ARIA labels, Escape to close, reduced-motion support

---

## Project structure

```
fresh-hire-job-portal/
├── index.html          # Page shell, navigation and modal container
├── css/
│   └── styles.css      # Design tokens, dark theme and responsive rules
├── js/
│   ├── data.js         # Sample job listings (edit this to add jobs)
│   ├── store.js        # Saves profile and applications in localStorage
│   └── app.js          # Routing, rendering, search, modal and forms
├── README.md
└── .gitignore
```

---

## Run it locally

No install is needed.

**Option 1: double-click**
Open `index.html` in Chrome, Edge or Firefox.

**Option 2: local server (recommended)**
```bash
cd fresh-hire-job-portal
python -m http.server 5500
```
Then open `http://localhost:5500`.

Or with VS Code, install the **Live Server** extension and click *Go Live*.

---

## Put it on GitHub

```bash
cd fresh-hire-job-portal
git init
git add .
git commit -m "Initial commit: FreshHire job portal"
git branch -M main
git remote add origin https://github.com/<your-username>/fresh-hire-job-portal.git
git push -u origin main
```

Create the empty repository on github.com first (no README or .gitignore, since this project already has them).

### Publish it free with GitHub Pages

1. Open your repository on GitHub.
2. Go to **Settings → Pages**.
3. Under *Build and deployment*, set **Source** to *Deploy from a branch*.
4. Choose branch **main** and folder **/ (root)**, then click **Save**.
5. After a minute, your site is live at `https://<your-username>.github.io/fresh-hire-job-portal/`.

---

## Customise it

- **Add or change jobs:** edit the `JOBS` array in `js/data.js`.
- **Change colours or fonts:** edit the variables at the top of `css/styles.css`.
- **Change the brand name:** search for `FreshHire` in `index.html` and `js/app.js`.

---

## Design system (for Figma)

Create these as Figma Variables so your Figma screens match the code.

| Token | Value | Use |
|---|---|---|
| `bg` | `#0B0D14` | App background |
| `surface` | `#141824` | Cards, nav, inputs |
| `surface-2` | `#1B2030` | Chips, hover states |
| `border` | `#262C3D` | Dividers and outlines |
| `text` | `#E8EBF3` | Primary text |
| `muted` | `#8A93A8` | Secondary text |
| `primary` | `#7C5CFF` | Buttons, active states |
| `primary-2` | `#22D3EE` | Accents, links, gradient end |
| `success` | `#34D399` | Applied status |
| `warning` | `#FBBF24` | Sample labels |
| `danger` | `#F87171` | Rejected and errors |

**Typography:** Inter. Headings 800 weight, body 400 and 500, labels 600.
Hero 44px, page title 34px, card title 16–17px, body 15–16px, chips 12px.

**Spacing:** 8pt grid (8, 16, 24, 32).
**Radius:** cards 16px, buttons and inputs 10px, pills 999px.
**Breakpoints:** 720px (mobile nav and layout), 900px (tablet), 480px (small phones).

---

## UX case study (capstone)

The app is the result of the UX design process. Replace the sample content on the About page and in this section with your own research findings before you submit.

1. **Empathize:** Interview fresh graduates about how they search for and track jobs.
2. **Define:** Create a persona, an empathy map and a problem statement from your research.
3. **Ideate:** Map the information architecture (Jobs, Job details, Apply, Applications, Profile, About) and sketch user flows.
4. **Prototype:** Design the screens in Figma (mobile and desktop), then link them into a clickable prototype.
5. **Test:** Run usability tests with at least five people, record where they get stuck, and improve the design.

**Suggested deliverables for the capstone:**
- Research notes, interview summary and empathy map
- Persona and problem statement
- Information architecture diagram (sitemap)
- Figma file with UI screens for mobile and desktop
- Clickable prototype link (Figma prototype mode)
- Link to this GitHub repository and the live GitHub Pages site

---

## Known limits

- Data is stored in each user's browser (`localStorage`). It does not sync across devices and is not shared between users.
- Resume files are stored as data inside the browser, so they are limited to 2 MB.
- Job listings are sample data. To use real jobs, connect an API or a backend later.

## Possible next steps

- Add a sign-in system and a real backend (Firebase or Supabase work well with static sites)
- Connect a real job API
- Add a recruiter view to post jobs
- Add email notifications for status changes

---

## License

Free to use for learning and portfolio projects.
