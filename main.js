// ===== UTILITIES =====
const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => [...parent.querySelectorAll(sel)];

// ===== THEME TOGGLE =====
const themeToggle = $('#themeToggle');
if (themeToggle) {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'light') document.documentElement.classList.add('light');
  themeToggle.textContent = document.documentElement.classList.contains('light') ? '🌞' : '🌙';
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
    themeToggle.textContent = isLight ? '🌞' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

// ===== YEAR & COUNTERS =====
if ($('#year')) {
  $('#year').textContent = new Date().getFullYear();
}
const START_YEAR = 2020; // ← change this
if ($('#yearsExp')) {
  $('#yearsExp').textContent = (new Date().getFullYear() - START_YEAR) + '+';
}

// ===== PROJECT DATA =====
const PROJECTS = [
  {
    id: 1,
    title: 'Sige Talong - MiniGame',
    kind: 'Design',
    tags: ['Gogot','Design System','MiniGame'],
    desc: 'A lightweight Godot minigame with replayability and accessibility built in',
    live: '#',
    code: '#',
    thumb: 'banner.jpg', // <-- Independent thumbnail image
    images: [
      'Ui.jpg',
      '1.jpg',
      '2.jpg',
      '3.jpg'
    ],
    video: 'game.mp4'
  }
  // Add more projects here if needed
];

const grid = $('#projectGrid');
function renderProjects(list) {
  if (!grid) return;
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open details for ${p.title}`);
    card.innerHTML = `
      <div class="thumb" aria-hidden="true">
        ${p.thumb ? `<img src="${p.thumb}" alt="${p.title} thumbnail" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
          : (p.images && p.images.length ? `<img src="${p.images[0]}" alt="${p.title} thumbnail" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">` : p.title[0])}
      </div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="tags">${p.tags.map(t=>`<span class='chip'>${t}</span>`).join('')}</div>
      <div class="tiny" style="margin-top:8px">${p.kind}</div>
    `;
    card.addEventListener('click', ()=> openProject(p));
    card.addEventListener('keypress', (e)=>{ if(e.key==='Enter') openProject(p); });
    grid.appendChild(card);
  });
}
renderProjects(PROJECTS);

// Search & Filter
const searchInput = $('#searchInput');
const filterChips = $$('.filters .chip');
let activeFilter = 'all';

function applyFilters() {
  const q = searchInput && searchInput.value ? searchInput.value.toLowerCase().trim() : '';
  const filtered = PROJECTS.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.kind === activeFilter;
    const matchesText = !q || [p.title, p.desc, ...(p.tags||[])].join(' ').toLowerCase().includes(q);
    return matchesFilter && matchesText;
  });
  renderProjects(filtered);
}

if (searchInput) {
  searchInput.addEventListener('input', applyFilters);
}
filterChips.forEach(chip => chip.addEventListener('click', () => {
  filterChips.forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  activeFilter = chip.dataset.filter;
  applyFilters();
}));

// Modal
const modal = $('#projectModal');
const modalTitle = $('#modalTitle');
const modalThumb = $('#modalThumb');
const modalDesc = $('#modalDesc');
const modalTags = $('#modalTags');
const modalLive = $('#modalLive');
const modalCode = $('#modalCode');

function openProject(p) {
  if (!modal || !modalTitle || !modalDesc || !modalTags || !modalLive || !modalCode) return;
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc;
  modalTags.innerHTML = (p.tags||[]).map(t=>`<span class='chip active'>${t}</span>`).join('');
  modalLive.href = p.live || '#';
  modalCode.href = p.code || '#';

  // Video
  const modalVideo = $('#modalVideo');
  if (modalVideo) {
    modalVideo.innerHTML = p.video ? `<video src="${p.video}" controls></video>` : '';
  }

  // Images
  const modalMainImg = $('#modalMainImg');
  const modalThumbs = $('#modalThumbs');
  let currentImg = 0;

  function showImg(idx) {
    currentImg = idx;
    if (modalMainImg) {
      modalMainImg.innerHTML = `<img src="${p.images[idx]}" alt="${p.title} screenshot">`;
    }
    // Highlight active thumb
    if (modalThumbs) {
      $$('.thumbs-row img').forEach((img, i) => {
        img.classList.toggle('active', i === idx);
      });
    }
  }

  if (modalThumbs && p.images && p.images.length) {
    modalThumbs.innerHTML = p.images.map((src, i) =>
      `<img src="${src}" alt="Screenshot ${i+1}" ${i===0?'class="active"':''} />`
    ).join('');
    showImg(0);
    // Add click event to thumbs
    $$('.thumbs-row img').forEach((img, i) => {
      img.onclick = () => showImg(i);
    });
  } else if (modalMainImg && modalThumbs) {
    modalMainImg.innerHTML = '';
    modalThumbs.innerHTML = '';
  }

  modal.showModal();
}

// ===== SKILLS BARS =====
const SKILLS = [
  { name: 'HTML', level: 85 },
  { name: 'CSS', level: 82 },
  { name: 'JavaScript', level: 80 },
  { name: 'Flutter', level: 85 },
  { name: 'Accessibility', level: 88 },
  { name: 'Performance', level: 86 }
];

const skillsList = $('#skills');
if (skillsList) {
  SKILLS.forEach(s => {
    const el = document.createElement('div');
    el.className = 'skill';
    el.innerHTML = `<div style="display:flex; justify-content:space-between"><strong>${s.name}</strong><span class="tiny">${s.level}%</span></div><div class='bar'><i style='width:0%'></i></div>`;
    skillsList.appendChild(el);
  });
  // animate on intersection
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.bar > i', entry.target).forEach((i, idx) => {
          i.style.width = SKILLS[idx].level + '%';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .2 });
  const aboutSection = $('#about');
  if (aboutSection) observer.observe(aboutSection);
}

// ===== EXPERIENCE TIMELINE =====
const ROLES = [
  { when: '2024 — Present', title: 'Front‑end Engineer', org: 'Acme Corp', bullets: ['Built component library adopted across 5 teams','Improved LCP by 43% via code‑splitting & image optimization','Led accessibility audit to WCAG 2.2 AA'] },
  { when: '2022 — 2024', title: 'UI Developer', org: 'Startup XYZ', bullets: ['Shipped 12+ features with 0 regressions','Designed and implemented design tokens system','Mentored 3 junior devs'] },
  { when: '2020 — 2022', title: 'Web Developer', org: 'Freelance', bullets: ['Delivered sites for SMEs with 98+ Lighthouse','Integrated Stripe & CMS workflows','Automated deployments with CI/CD'] }
];

const timeline = $('#timeline');
if (timeline) {
  ROLES.forEach(r => {
    const item = document.createElement('div');
    item.className = 'titem';
    item.innerHTML = `<div class='tiny' style='color:var(--muted)'>${r.when}</div><h3 style='margin:.2rem 0'>${r.title} · ${r.org}</h3><ul>${r.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`;
    timeline.appendChild(item);
  });
}

// ===== CONTACT FORM (client-side only) =====
const form = $('#contactForm');
const statusEl = $('#formStatus');
if (form && statusEl) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.email || !data.subject || !data.message) {
      statusEl.textContent = 'Please complete all fields.';
      return;
    }
    statusEl.textContent = 'Sending…';
    setTimeout(() => {
      statusEl.textContent = 'Thanks! I will get back to you shortly.';
      form.reset();
    }, 800);
  });
}

// ===== NAV ACTIVE STATE ON SCROLL =====
const sections = ['home','projects','about','experience','contact']
  .map(id=>document.getElementById(id))
  .filter(Boolean);
const links = $$('header nav a');
const onScroll = () => {
  const y = window.scrollY + 120;
  let current = sections.length ? sections[0].id : '';
  sections.forEach(sec => { if (sec.offsetTop <= y) current = sec.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();
