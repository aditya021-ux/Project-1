/* =========================================================
   FreshHire · App logic
   ========================================================= */

const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected'];
const MAX_RESUME_BYTES = 2 * 1024 * 1024; // 2 MB

const routes = {
  jobs: renderJobs,
  applications: renderApplications,
  profile: renderProfile,
  about: renderAbout
};

const filters = { query: '', category: 'All', type: 'All' };

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);

const esc = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

function updateBadge() {
  $('#appCount').textContent = Store.getApplications().length;
}

function currentRoute() {
  const name = location.hash.replace('#/', '');
  return routes[name] ? name : 'jobs';
}

/* ---------- Router ---------- */
function router() {
  const route = currentRoute();
  document.querySelectorAll('[data-route]').forEach((a) => {
    const active = a.dataset.route === route;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  routes[route]();
  closeNav();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ---------- Mobile navigation ---------- */
function toggleNav() {
  const nav = $('#nav');
  const open = nav.classList.toggle('open');
  $('#menuBtn').setAttribute('aria-expanded', String(open));
}

function closeNav() {
  $('#nav').classList.remove('open');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
}

/* ---------- Modal ---------- */
function openModal(html) {
  $('#modalContent').innerHTML = html;
  $('#modal').classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeModal() {
  $('#modal').classList.remove('open');
  document.body.classList.remove('no-scroll');
}

/* =========================================================
   JOBS PAGE
   ========================================================= */
function renderJobs() {
  const categories = ['All', ...new Set(JOBS.map((j) => j.category))];
  const types = ['All', ...new Set(JOBS.map((j) => j.type))];

  $('#app').innerHTML = `
    <section class="hero">
      <span class="eyebrow">Built for fresh graduates</span>
      <h1>Find your first <span class="grad">job</span> with confidence</h1>
      <p>Search entry-level roles, build your profile, upload your resume and track every application in one place.</p>
    </section>

    <section class="toolbar" aria-label="Job filters">
      <input id="search" type="search" placeholder="Search roles, companies or skills" value="${esc(filters.query)}" aria-label="Search jobs" />
      <select id="fCategory" aria-label="Category">
        ${categories.map((c) => `<option ${c === filters.category ? 'selected' : ''}>${esc(c)}</option>`).join('')}
      </select>
      <select id="fType" aria-label="Job type">
        ${types.map((t) => `<option ${t === filters.type ? 'selected' : ''}>${esc(t)}</option>`).join('')}
      </select>
    </section>

    <p class="muted" id="resultCount"></p>
    <section class="job-grid" id="jobGrid"></section>
  `;

  $('#search').addEventListener('input', (e) => { filters.query = e.target.value; drawJobs(); });
  $('#fCategory').addEventListener('change', (e) => { filters.category = e.target.value; drawJobs(); });
  $('#fType').addEventListener('change', (e) => { filters.type = e.target.value; drawJobs(); });

  drawJobs();
}

function filteredJobs() {
  const q = filters.query.trim().toLowerCase();
  return JOBS.filter((job) => {
    const haystack = [job.title, job.company, job.location, job.category, ...job.skills].join(' ').toLowerCase();
    const matchesQuery = !q || haystack.includes(q);
    const matchesCategory = filters.category === 'All' || job.category === filters.category;
    const matchesType = filters.type === 'All' || job.type === filters.type;
    return matchesQuery && matchesCategory && matchesType;
  });
}

function drawJobs() {
  const list = filteredJobs();
  $('#resultCount').textContent = `${list.length} job${list.length === 1 ? '' : 's'} found`;
  $('#jobGrid').innerHTML = list.length
    ? list.map(jobCard).join('')
    : `<div class="empty card full">No jobs match your search. Try different keywords or filters.</div>`;
}

function jobCard(job) {
  const applied = Store.hasApplied(job.id);
  return `
    <article class="card job-card" data-action="open-job" data-id="${esc(job.id)}" tabindex="0">
      <div class="job-top">
        <div class="logo-sm">${esc(job.company.charAt(0))}</div>
        <div>
          <h3>${esc(job.title)}</h3>
          <p class="muted">${esc(job.company)} · ${esc(job.location)}</p>
        </div>
      </div>
      <div class="chips">
        <span class="chip">${esc(job.type)}</span>
        <span class="chip">${esc(job.experience)}</span>
        <span class="chip">${esc(job.salary)}</span>
      </div>
      <div class="skills">
        ${job.skills.slice(0, 4).map((s) => `<span>${esc(s)}</span>`).join('')}
      </div>
      <div class="job-bottom">
        <small class="muted">Posted ${job.posted} day${job.posted === 1 ? '' : 's'} ago</small>
        ${applied ? '<span class="status applied">Applied</span>' : '<span class="muted">View details →</span>'}
      </div>
    </article>`;
}

function openJob(id) {
  const job = JOBS.find((j) => j.id === id);
  if (!job) return;
  const applied = Store.hasApplied(job.id);

  openModal(`
    <button class="icon-btn modal-close" data-action="close-modal" aria-label="Close">✕</button>
    <span class="eyebrow">${esc(job.category)}</span>
    <h2 id="modalTitle">${esc(job.title)}</h2>
    <p class="muted">${esc(job.company)} · ${esc(job.location)} · ${esc(job.type)}</p>

    <div class="chips">
      <span class="chip">${esc(job.experience)}</span>
      <span class="chip">${esc(job.salary)}</span>
    </div>

    <h4>About the role</h4>
    <p>${esc(job.description)}</p>

    <h4>Requirements</h4>
    <ul>${job.requirements.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>

    <h4>Skills</h4>
    <div class="skills">${job.skills.map((s) => `<span>${esc(s)}</span>`).join('')}</div>

    <div class="modal-actions">
      ${applied
        ? '<button class="btn btn-ghost" disabled>Already applied</button>'
        : `<button class="btn btn-primary" data-action="apply" data-id="${esc(job.id)}">Apply now</button>`}
    </div>
  `);
}

function applyTo(id) {
  const job = JOBS.find((j) => j.id === id);
  if (!job) return;

  if (!Store.getProfile()) {
    closeModal();
    toast('Create your profile first, then you can apply');
    location.hash = '#/profile';
    return;
  }

  Store.addApplication(job);
  closeModal();
  updateBadge();
  toast(`Applied to ${job.title} at ${job.company}`);
  if (currentRoute() === 'jobs') drawJobs();
}

/* =========================================================
   PROFILE PAGE
   ========================================================= */
function renderProfile() {
  const p = Store.getProfile() || {};
  const years = [2024, 2025, 2026, 2027, 2028];

  $('#app').innerHTML = `
    <section class="page-head">
      <h1>My profile</h1>
      <p class="muted">Recruiters see this when you apply. Keep it up to date.</p>
    </section>

    <form id="profileForm" class="card form-grid" novalidate>
      <label>Full name *
        <input name="name" required value="${esc(p.name)}" placeholder="e.g. Priya Sharma" />
      </label>
      <label>Email *
        <input name="email" type="email" required value="${esc(p.email)}" placeholder="you@example.com" />
      </label>
      <label>Phone
        <input name="phone" type="tel" value="${esc(p.phone)}" placeholder="+91 98765 43210" />
      </label>
      <label>Graduation year
        <select name="gradYear">
          ${years.map((y) => `<option ${Number(p.gradYear) === y ? 'selected' : ''}>${y}</option>`).join('')}
        </select>
      </label>
      <label>College / University *
        <input name="college" required value="${esc(p.college)}" placeholder="Your college name" />
      </label>
      <label>Degree
        <input name="degree" value="${esc(p.degree)}" placeholder="B.Tech CSE, BDes, BBA..." />
      </label>
      <label class="full">Skills (comma separated)
        <input name="skills" value="${esc((p.skills || []).join(', '))}" placeholder="HTML, Figma, Communication" />
      </label>
      <label class="full">Short bio
        <textarea name="bio" rows="4" placeholder="A few lines about you, your interests and what you are looking for">${esc(p.bio)}</textarea>
      </label>
      <label class="full">Resume (PDF or DOCX, max 2 MB)
        <input type="file" name="resume" accept=".pdf,.doc,.docx" />
      </label>
      ${p.resume ? `<p class="muted full">Current resume: <strong>${esc(p.resume.name)}</strong></p>` : ''}
      <div class="full actions">
        <button class="btn btn-primary" type="submit">Save profile</button>
      </div>
    </form>
  `;

  $('#profileForm').addEventListener('submit', saveProfile);
}

async function saveProfile(e) {
  e.preventDefault();
  const form = e.target;
  const get = (name) => form.elements[name].value.trim();

  if (!get('name') || !get('email') || !get('college')) {
    toast('Please fill in name, email and college');
    return;
  }

  const existing = Store.getProfile() || {};
  let resume = existing.resume || null;
  const file = form.elements.resume.files[0];

  if (file) {
    if (file.size > MAX_RESUME_BYTES) {
      toast('Resume must be under 2 MB');
      return;
    }
    try {
      resume = { name: file.name, size: file.size, dataUrl: await readFileAsDataURL(file) };
    } catch {
      toast('Could not read that file. Please try again.');
      return;
    }
  }

  const profile = {
    name: get('name'),
    email: get('email'),
    phone: get('phone'),
    gradYear: get('gradYear'),
    college: get('college'),
    degree: get('degree'),
    skills: get('skills').split(',').map((s) => s.trim()).filter(Boolean),
    bio: get('bio'),
    resume,
    updatedAt: Date.now()
  };

  if (Store.saveProfile(profile)) {
    toast('Profile saved');
    renderProfile();
  } else {
    toast('Could not save. The resume may be too large for browser storage.');
  }
}

/* =========================================================
   APPLICATIONS PAGE
   ========================================================= */
function renderApplications() {
  const apps = Store.getApplications();

  $('#app').innerHTML = `
    <section class="page-head">
      <h1>My applications</h1>
      <p class="muted">Track every role you have applied to in one place.</p>
    </section>

    <section class="stats" aria-label="Application summary">
      ${STATUSES.map((s) => `
        <div class="stat">
          <strong>${apps.filter((a) => a.status === s).length}</strong>
          <span>${s}</span>
        </div>`).join('')}
    </section>

    ${apps.length
      ? `<section class="app-list">
          ${apps.map((a) => `
            <article class="card app-item">
              <div>
                <h3>${esc(a.title)}</h3>
                <p class="muted">${esc(a.company)} · Applied ${fmtDate(a.appliedAt)}</p>
              </div>
              <div class="app-actions">
                <select data-status-id="${esc(a.id)}" aria-label="Status for ${esc(a.title)}">
                  ${STATUSES.map((s) => `<option ${s === a.status ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
                <button class="btn btn-ghost btn-sm" data-action="remove-app" data-id="${esc(a.id)}">Remove</button>
              </div>
            </article>`).join('')}
        </section>`
      : `<div class="empty card">
          You have not applied to any jobs yet.<br />
          <a href="#/jobs" class="link">Browse jobs →</a>
        </div>`}
  `;
}

function removeApplication(id) {
  Store.removeApplication(id);
  updateBadge();
  renderApplications();
  toast('Application removed');
}

/* =========================================================
   ABOUT PAGE (UX case study summary)
   ========================================================= */
function renderAbout() {
  const steps = [
    ['Empathize', 'Talk to fresh graduates about how they search for jobs, what frustrates them and what they wish existed.'],
    ['Define', 'Turn research into a persona and a clear problem statement that guides every design decision.'],
    ['Ideate', 'Map the information architecture and brainstorm features like search, profiles and application tracking.'],
    ['Prototype', 'Build low and high fidelity screens in Figma and connect them into a clickable flow.'],
    ['Test', 'Run usability tests with five or more users, observe where they struggle and iterate.']
  ];

  $('#app').innerHTML = `
    <section class="page-head">
      <span class="eyebrow">UX case study</span>
      <h1>How FreshHire was designed</h1>
      <p class="muted">Built using the UX design process: Empathize, Define, Ideate, Prototype and Test.</p>
    </section>

    <section class="steps">
      ${steps.map(([title, text], i) => `
        <div class="card step">
          <div class="num">${i + 1}</div>
          <h3>${title}</h3>
          <p>${text}</p>
        </div>`).join('')}
    </section>

    <section class="two-col">
      <div class="card">
        <span class="sample-tag">Sample · replace with your research</span>
        <h3>Problem statement</h3>
        <p>Fresh graduates struggle to find entry-level roles that match their skills, and they have no single place to manage applications. They miss opportunities and lose motivation.</p>
      </div>
      <div class="card">
        <span class="sample-tag">Sample · replace with your research</span>
        <h3>Persona</h3>
        <div class="persona">
          <div class="avatar">P</div>
          <div>
            <p><strong>Priya, 22</strong> · B.Tech CSE graduate, Chandigarh</p>
            <p class="muted">Applies to 30+ jobs a month, gets no replies, and keeps her applications in a messy spreadsheet.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="two-col">
      <div class="card">
        <span class="sample-tag">Sample · replace with your research</span>
        <h3>Empathy map</h3>
        <ul class="plain">
          <li>Says: "I just want a job that fits what I learned."</li>
          <li>Thinks: "Am I good enough for this role?"</li>
          <li>Feels: Anxious, impatient, hopeful.</li>
          <li>Does: Applies widely, follows up often, rarely hears back.</li>
        </ul>
      </div>
      <div class="card">
        <span class="sample-tag">Sample · replace with your research</span>
        <h3>Information architecture</h3>
        <ul class="plain">
          <li>Jobs: search, filter, job details, apply</li>
          <li>Applications: status tracker, remove</li>
          <li>Profile: details, skills, resume upload</li>
          <li>About: design case study</li>
        </ul>
      </div>
    </section>
  `;
}

/* ---------- Global event handling (event delegation) ---------- */
document.addEventListener('click', (e) => {
  if (e.target.id === 'modal') return closeModal();
  if (e.target.id === 'menuBtn' || e.target.closest('#menuBtn')) return toggleNav();

  const el = e.target.closest('[data-action]');
  if (!el) return;

  const { action, id } = el.dataset;
  if (action === 'open-job') openJob(id);
  if (action === 'apply') applyTo(id);
  if (action === 'close-modal') closeModal();
  if (action === 'remove-app') removeApplication(id);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  // Open a job card with Enter when focused via keyboard
  if (e.key === 'Enter' && e.target.matches('[data-action="open-job"]')) openJob(e.target.dataset.id);
});

document.addEventListener('change', (e) => {
  if (e.target.matches('[data-status-id]')) {
    Store.updateStatus(e.target.dataset.statusId, e.target.value);
    toast(`Status set to ${e.target.value}`);
  }
});

/* ---------- Boot ---------- */
window.addEventListener('hashchange', router);

window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/jobs';
  updateBadge();
  router();
});
