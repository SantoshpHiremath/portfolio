/* =========================================================
   1. MOBILE NAV TOGGLE
   ========================================================= */
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  navToggle.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
  });
});

/* =========================================================
   2. DARK MODE TOGGLE
   Flips one class on <body>; every color is a CSS variable
   redefined under body.dark-mode in styles.css. State lives
   in a JS variable only (no localStorage), per this
   project's rule against browser storage APIs — so it
   resets on reload. That's a deliberate, documented
   trade-off, not an oversight.
   ========================================================= */
const themeToggle = document.getElementById("theme-toggle");
let isDarkMode = false;

themeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark-mode", isDarkMode);
  themeToggle.querySelector(".icon-moon").textContent = isDarkMode ? "☀️" : "🌙";
});

/* =========================================================
   3. STICKY HEADER — add a border/shadow once the page has
   scrolled past the hero, so the header reads clearly against
   whatever content is behind it.
   ========================================================= */
const siteHeader = document.getElementById("site-header");

function updateHeaderState() {
  siteHeader.classList.toggle("scrolled", window.scrollY > 40);
}
window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

/* =========================================================
   4. SCROLL PROGRESS BAR
   Sets the width of a fixed top bar to the percentage of
   total page height the user has scrolled through.
   ========================================================= */
const scrollProgress = document.getElementById("scroll-progress");

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + "%";
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

/* =========================================================
   5. HERO TEXT REVEAL (staggered, on page load)
   Each element with .reveal has a --d custom property used
   as an animation-delay multiplier in CSS, so they cascade
   in one after another instead of all appearing at once.
   ========================================================= */
window.addEventListener("load", () => {
  document.querySelectorAll(".hero .reveal").forEach((el) => {
    el.classList.add("play");
  });
});

/* =========================================================
   6. SCROLL-TRIGGERED SECTION REVEALS
   Uses IntersectionObserver so sections fade/slide in as they
   enter the viewport, instead of a scroll-event listener
   (better for performance — the browser handles the checks).
   ========================================================= */
const sectionsToReveal = document.querySelectorAll(".section-reveal");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  sectionsToReveal.forEach((el) => sectionObserver.observe(el));
} else {
  sectionsToReveal.forEach((el) => el.classList.add("visible"));
}

/* =========================================================
   7. PROJECT CARD REVEAL (separate observer, cards animate
   individually as the grid scrolls into view)
   ========================================================= */
const projectCards = document.querySelectorAll(".project-card");

if ("IntersectionObserver" in window) {
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  projectCards.forEach((el) => cardObserver.observe(el));
} else {
  projectCards.forEach((el) => el.classList.add("visible"));
}

// Safety net: reveal everything after a short delay regardless,
// so a missed observer trigger (short page, JS quirk) never
// leaves content permanently invisible. A blank section is a
// worse failure than a slightly-early animation.
window.addEventListener("load", () => {
  setTimeout(() => {
    document.querySelectorAll(".section-reveal, .project-card").forEach((el) => {
      el.classList.add("visible");
    });
  }, 2500);
});

/* =========================================================
   8. ANIMATED STAT COUNTERS
   Each .stat-number has data-target (the final number). When
   the stats section scrolls into view, count up from 0 to
   the target using requestAnimationFrame for smooth timing.
   ========================================================= */
const statNumbers = document.querySelectorAll(".stat-number");

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400; // ms
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic for a natural deceleration
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current.toLocaleString("en-US");

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toLocaleString("en-US");
    }
  }
  requestAnimationFrame(tick);
}

const statsSection = document.getElementById("stats");
if (statsSection && "IntersectionObserver" in window) {
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statNumbers.forEach(animateCounter);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  statsObserver.observe(statsSection);
} else {
  statNumbers.forEach(animateCounter);
}

/* =========================================================
   9. PROJECT FILTERING BY TAG + LIVE SEARCH
   ========================================================= */
const filterButtons = document.querySelectorAll(".tag-btn");
const searchBox = document.getElementById("project-search");
const noResultsMsg = document.getElementById("no-results");

let activeFilter = "all";

function applyFilters() {
  const searchTerm = searchBox.value.trim().toLowerCase();
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const tags = card.dataset.tags.split(" ");
    const matchesFilter = activeFilter === "all" || tags.includes(activeFilter);
    const cardText = card.textContent.toLowerCase();
    const matchesSearch = searchTerm === "" || cardText.includes(searchTerm);

    const shouldShow = matchesFilter && matchesSearch;
    card.classList.toggle("hidden", !shouldShow);

    if (shouldShow) visibleCount++;
  });

  noResultsMsg.classList.toggle("hidden", visibleCount !== 0);
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

searchBox.addEventListener("input", applyFilters);

/* =========================================================
   10. PROJECT DETAIL MODAL
   Clicking a card opens a modal with a longer write-up.
   Content lives in this projectData object, keyed by the
   card's data-modal attribute — keeps HTML light and content
   easy to edit in one place.
   ========================================================= */
const projectData = {
  ev: {
    title: "EV Charging Station Utilization Dashboard",
    meta: "Python · SQL · Power BI",
    body: `
      <p>Analyzed real electric vehicle charging session data from the City of Boulder,
      Colorado's public charging network — 50 city-owned Level 2 stations, Jan 2018–Nov 2023.</p>
      <ul>
        <li>Removed 62,385 exact-duplicate sessions caused by a reset export ID, verified by matching every substantive field before deduplicating.</li>
        <li>Found and fixed a silent mixed-date-format bug: 7,816 rows switched from <code>M/D/YYYY</code> to ISO format partway through the export.</li>
        <li>Flagged (not silently dropped) 9,969 zero-energy sessions with a boolean column, since discarding them would have inflated utilization numbers.</li>
        <li>Wrote 8 analytical SQL queries (window functions, CTEs) and built a Power BI dashboard covering usage trends, peak demand, and environmental impact.</li>
      </ul>
      <p><strong>Result:</strong> 85,748 verified, de-duplicated sessions, zero remaining nulls.</p>
    `,
    link: "https://github.com/SantoshpHiremath/ev-charging-dashboard",
  },
  rag: {
    title: "RAG & Agentic AI Tool-Routing Demo",
    meta: "Python · LangChain · FAISS · Ollama",
    body: `
      <p>A fully local retrieval-augmented generation pipeline — no hosted API calls, everything
      runs on-device.</p>
      <ul>
        <li>Documents are chunked and indexed with local embeddings (nomic-embed-text).</li>
        <li>Retrieval uses FAISS for semantic vector search.</li>
        <li>A Llama 3.2 model, served locally via Ollama, decides autonomously between retrieval, a calculator tool, or answering directly.</li>
        <li>Validated with a 29-test pytest suite that surfaced one real, previously undetected bug.</li>
      </ul>
      <p>Built to prove a model can be trusted only after it's been tested against real, adversarial cases — not after the first clean run.</p>
    `,
    link: "https://github.com/SantoshpHiremath/rag-tool-agent-demo",
  },
  copilot: {
    title: "Microsoft Copilot Studio — Student FAQ Agent",
    meta: "Copilot Studio · Knowledge Sources",
    body: `
      <p>A knowledge-based low-code AI agent built and tested end-to-end in Microsoft Copilot Studio.</p>
      <ul>
        <li>Configured a real knowledge source and diagnosed a genuine indexing error caused by an unsupported file format.</li>
        <li>Validated through correctly cited answers, correctly declined out-of-scope questions, and a correctly declined off-topic query.</li>
      </ul>
    `,
    link: "https://github.com/SantoshpHiremath/copilot-studio-faq-agent",
  },
  "power-automate": {
    title: "Power Automate — Job Application Tracker",
    meta: "Power Automate · API Connectors",
    body: `
      <p>A low-code workflow that classifies real job-application emails and logs them automatically.</p>
      <ul>
        <li>API-based connectors trigger on new emails and classify them by keyword logic.</li>
        <li>Results are logged into an Excel tracker with dynamic field mapping.</li>
        <li>Diagnosed and fixed a real bug in the run history related to case-sensitivity in keyword matching.</li>
      </ul>
    `,
    link: "https://github.com/SantoshpHiremath/power-automate-job-application-tracker",
  },
  excel: {
    title: "Retail Data Cleaning & Analysis (Excel)",
    meta: "Excel · COUNTIF · SUMIFS · Pivot Tables",
    body: `
      <p>Cleaned and analyzed a raw retail sales dataset entirely in Excel.</p>
      <ul>
        <li>1,240 raw records cleaned into 1,190 verified rows using COUNTIF, AVERAGEIF, and PROPER.</li>
        <li>Built SUMIFS/COUNTIFS/AVERAGEIFS pivot tables and dashboard charts by region, category, and segment.</li>
        <li>Wrote a plain-language walkthrough guide so a non-technical reader can understand and explain the project in five minutes.</li>
      </ul>
    `,
    link: null,
  },
  databricks: {
    title: "Databricks & PySpark ML Notebook",
    meta: "Databricks · PySpark · MLlib · scikit-learn",
    body: `
      <p>A Databricks/PySpark notebook building a regression pipeline with MLlib.</p>
      <ul>
        <li>Trained and evaluated a regression model on the dataset.</li>
        <li>Got back a real, low R² result — and reported it honestly instead of selectively picking a better-looking metric.</li>
      </ul>
      <p>The point of this project wasn't a good score; it was proving I'll report what the model actually says.</p>
    `,
    link: "https://github.com/SantoshpHiremath/databricks-ai-prototyping-demo",
  },
};

const modalOverlay = document.getElementById("modal-overlay");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

function openModal(key) {
  const data = projectData[key];
  if (!data) return;

  const linkHtml = data.link
    ? `<a href="${data.link}" target="_blank" rel="noopener" class="modal-github">
         View on GitHub
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </a>`
    : "";

  modalBody.innerHTML = `
    <h3>${data.title}</h3>
    <p class="modal-meta">${data.meta}</p>
    ${data.body}
    ${linkHtml}
  `;

  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden"; // prevent background scroll while modal is open
}

function closeModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

projectCards.forEach((card) => {
  card.addEventListener("click", () => openModal(card.dataset.modal));
  // Keyboard accessibility: Enter/Space opens the modal too, since cards are tabindex="0"
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(card.dataset.modal);
    }
  });
});

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal(); // click on the dark backdrop, not the modal itself
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("open")) closeModal();
});

/* =========================================================
   11. SMOOTH SCROLL FOR NAV / IN-PAGE LINKS
   (html { scroll-behavior: smooth } in CSS already handles
   most of this natively; this listener just makes sure
   the mobile menu closes and focus lands correctly.)
   ========================================================= */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetId = anchor.getAttribute("href");
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
