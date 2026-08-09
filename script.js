/* ==========================================================================
   Step. Theme - Machine Learning Engineer Portfolio JavaScript
   Features: Ambient Particles, ML Model Playground, Theme Switcher,
             Filterable Projects, CV Viewer Modal, Toast Alerts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initParticleBackground();
  initThemeSwitcher();
  initNavigation();
  initMLPlayground();
  initPortfolioFilter();
  initModals();
  initContactForm();
  initEmailAction();
  await fetchArticlesFromSupabase();
  await fetchProjectsFromSupabase();
  initKnowledgeSection();
  initProjectsSection();
  initAdminCMS();
  handlePublicBlogRouting();
  handlePublicProjectRouting();
});

/* ==========================================
   1. Particle Background System
   ========================================== */
function initParticleBackground() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Get current accent color from CSS
    const computedAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#d88a38';

    for (let i = 0; i < particleCount; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = computedAccent;
      ctx.globalAlpha = 0.4;
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particleCount; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = computedAccent;
          ctx.globalAlpha = (1 - dist / 120) * 0.15;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ==========================================
   2. Theme Switcher Drawer & Palette
   ========================================== */
function initThemeSwitcher() {
  const gearBtn = document.getElementById('settingsGearBtn');
  const drawer = document.getElementById('themeDrawer');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const swatches = document.querySelectorAll('.color-swatch');

  if (gearBtn && drawer) {
    gearBtn.addEventListener('click', () => drawer.classList.toggle('open'));
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
  }

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const theme = swatch.getAttribute('data-color');
      if (theme === 'copper') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      showToast(`Theme switched to ${theme.toUpperCase()}`);
    });
  });
}

/* ==========================================
   3. Active Navigation & Scroll
   ========================================== */
function initNavigation() {
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================
   4. Interactive ML Model Playground Widget
   ========================================== */
function initMLPlayground() {
  const tabBtns = document.querySelectorAll('.playground-tabs .tab-btn');
  const demoBoxes = document.querySelectorAll('.demo-box');
  const sentimentInput = document.getElementById('sentimentInput');

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      demoBoxes.forEach(d => d.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetElem = document.getElementById(targetId);
      if (targetElem) targetElem.classList.add('active');
    });
  });

  // Real-time Sentiment Classifier Simulator
  if (sentimentInput) {
    sentimentInput.addEventListener('input', (e) => {
      const text = e.target.value.toLowerCase().trim();

      const posWords = ['great', 'excellent', 'fast', 'superb', 'best', 'accurate', 'groundbreaking', 'scalable', 'efficient', 'outstanding', 'love', 'clean'];
      const negWords = ['bad', 'slow', 'error', 'laggy', 'overfit', 'failed', 'poor', 'bug', 'high loss', 'horrible', 'trash'];

      let posCount = 0;
      let negCount = 0;

      posWords.forEach(w => { if (text.includes(w)) posCount++; });
      negWords.forEach(w => { if (text.includes(w)) negCount++; });

      let score = 0.5 + (posCount * 0.15) - (negCount * 0.15);
      score = Math.max(0.01, Math.min(0.99, score));

      let sentimentLabel = 'NEUTRAL';
      let labelColor = '#aaaaaa';

      if (score > 0.6) {
        sentimentLabel = 'POSITIVE (CONFIDENT)';
        labelColor = '#00e676';
      } else if (score < 0.4) {
        sentimentLabel = 'NEGATIVE (ALERT)';
        labelColor = '#ff5252';
      }

      document.getElementById('sentLabel').textContent = sentimentLabel;
      document.getElementById('sentLabel').style.color = labelColor;
      document.getElementById('sentConf').textContent = (score * 100).toFixed(1) + '%';
      document.getElementById('sentLatency').textContent = (0.8 + Math.random() * 0.5).toFixed(2) + ' ms';
    });
  }

  // Canvas Neural Network Interactive Inspector
  const nnCanvas = document.getElementById('nnCanvas');
  if (nnCanvas) {
    const ctx = nnCanvas.getContext('2d');
    let frame = 0;

    function renderNN() {
      ctx.clearRect(0, 0, nnCanvas.width, nnCanvas.height);
      const layers = [3, 5, 5, 2];
      const layerSpacing = nnCanvas.width / (layers.length + 1);

      const nodes = [];

      layers.forEach((count, layerIdx) => {
        const x = layerSpacing * (layerIdx + 1);
        const nodeSpacing = nnCanvas.height / (count + 1);
        const layerNodes = [];

        for (let i = 0; i < count; i++) {
          const y = nodeSpacing * (i + 1);
          layerNodes.push({ x, y });
        }
        nodes.push(layerNodes);
      });

      // Draw Connection Weights
      for (let l = 0; l < nodes.length - 1; l++) {
        const currLayer = nodes[l];
        const nextLayer = nodes[l + 1];

        currLayer.forEach(n1 => {
          nextLayer.forEach(n2 => {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Pulse signals
            const pulse = (frame * 0.03 + l) % 1;
            const px = n1.x + (n2.x - n1.x) * pulse;
            const py = n1.y + (n2.y - n1.y) * pulse;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#d88a38';
            ctx.fill();
          });
        });
      }

      // Draw Nodes
      nodes.forEach((layer) => {
        layer.forEach(n => {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#212121';
          ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#d88a38';
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();
        });
      });

      frame++;
      requestAnimationFrame(renderNN);
    }
    renderNN();
  }
}

/* ==========================================
   5. Portfolio Category Filter
   ========================================== */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });
}

/* ==========================================
   6. Modal Dialog Handlers
   ========================================== */
function initModals() {
  const cvModal = document.getElementById('cvModal');
  const cvBtn = document.getElementById('downloadCvBtn');
  const closeCvBtn = document.getElementById('closeCvModalBtn');

  if (cvBtn && cvModal) {
    cvBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cvModal.classList.add('active');
    });
  }

  if (closeCvBtn && cvModal) {
    closeCvBtn.addEventListener('click', () => {
      cvModal.classList.remove('active');
    });
  }

  // Close modal when clicking outside content
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('active');
    }
  });
}

/* ==========================================
   7. Contact Form & Email Integration
   ========================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');
  const submitBtn = document.getElementById('contactSubmitBtn');
  const alertBox = document.getElementById('formStatusAlert');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const subjectError = document.getElementById('subjectError');
  const messageError = document.getElementById('messageError');

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function clearErrors() {
    [nameError, emailError, subjectError, messageError].forEach(el => {
      if (el) el.textContent = '';
    });
    [nameInput, emailInput, subjectInput, messageInput].forEach(el => {
      if (el) el.classList.remove('input-invalid');
    });
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.className = 'form-status-alert';
      alertBox.innerHTML = '';
    }
  }

  function validateForm() {
    clearErrors();
    let isValid = true;

    // Validate Name
    const nameVal = nameInput ? nameInput.value.trim() : '';
    if (!nameVal) {
      if (nameError) nameError.textContent = 'Please enter your name.';
      if (nameInput) nameInput.classList.add('input-invalid');
      isValid = false;
    }

    // Validate Email
    const emailVal = emailInput ? emailInput.value.trim() : '';
    if (!emailVal) {
      if (emailError) emailError.textContent = 'Please enter your email address.';
      if (emailInput) emailInput.classList.add('input-invalid');
      isValid = false;
    } else if (!validateEmail(emailVal)) {
      if (emailError) emailError.textContent = 'Please enter a valid email address.';
      if (emailInput) emailInput.classList.add('input-invalid');
      isValid = false;
    }

    // Validate Subject
    const subjectVal = subjectInput ? subjectInput.value.trim() : '';
    if (!subjectVal) {
      if (subjectError) subjectError.textContent = 'Please enter a subject.';
      if (subjectInput) subjectInput.classList.add('input-invalid');
      isValid = false;
    }

    // Validate Message
    const messageVal = messageInput ? messageInput.value.trim() : '';
    if (!messageVal) {
      if (messageError) messageError.textContent = 'Please enter your message.';
      if (messageInput) messageInput.classList.add('input-invalid');
      isValid = false;
    }

    return isValid;
  }

  // Clear validation errors on typing
  [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        input.classList.remove('input-invalid');
        const fieldName = input.id.replace('contact', '').toLowerCase();
        const errEl = document.getElementById(fieldName + 'Error');
        if (errEl) errEl.textContent = '';
      });
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot anti-bot check
    const honeypot = form.querySelector('input[name="_honey"]');
    if (honeypot && honeypot.value) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const originalBtnContent = submitBtn.innerHTML;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const endpoint = 'https://formsubmit.co/ajax/gursimranaidev@gmail.com';
    const method = 'POST';

    const senderName = nameInput.value.trim();
    const senderEmail = emailInput.value.trim();
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    const payload = {
      name: senderName,
      email: senderEmail,
      subject: subject,
      message: message,
      _replyto: senderEmail,
      _subject: "New Portfolio Contact"
    };

    let response = null;
    let rawText = '';
    let parsedJson = null;
    let responseHeaders = {};
    let fetchError = null;

    try {
      // 1. Set Loading State
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>SENDING...</span> <i class="fas fa-spinner fa-spin"></i>`;
      if (alertBox) alertBox.style.display = 'none';

      // 2. Submit Form via AJAX POST
      response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Extract response headers
      if (response && response.headers) {
        response.headers.forEach((val, key) => {
          responseHeaders[key] = val;
        });
      }

      // Read raw text and parse JSON if possible
      rawText = await response.text().catch(() => '');
      try {
        parsedJson = JSON.parse(rawText);
      } catch (pErr) {
        parsedJson = null;
      }

      const data = parsedJson || {};
      const isConfirmedSuccess = response.ok &&
        (data.success === 'true' || data.success === true || data.success === 'True') &&
        data.success !== 'false' && data.success !== false;

      if (isConfirmedSuccess) {
        // Log successful submission details
        console.log("=== FORMSUBMIT SUBMISSION SUCCESS ===");
        console.log("1. Request URL:", endpoint);
        console.log("2. HTTP Method:", method);
        console.log("3. Request Payload:", payload);
        console.log("4. Response Status:", response.status);
        console.log("5. Response StatusText:", response.statusText);
        console.log("6. Response Headers:", responseHeaders);
        console.log("7. Raw Response Body:", rawText);
        console.log("8. Parsed JSON Response:", parsedJson);
        console.log("9. JS/Fetch Error: None");

        form.reset();
        clearErrors();

        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.className = 'form-status-alert alert-success';
          alertBox.innerHTML = `
            <div class="alert-title"><i class="fas fa-check-circle"></i> Message sent successfully!</div>
            <div class="alert-desc">Thanks for reaching out. I'll get back to you soon.</div>
          `;
        }
        showToast('Message sent successfully!');
      } else {
        const errorDetail = (data && data.message) ? data.message : `HTTP ${response.status} - FormSubmit returned success: ${data.success || 'false'}`;
        fetchError = new Error(errorDetail);
        throw fetchError;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      fetchError = error;

      // Log ALL 9 debugging items via console.error on failure
      console.error("=== FORMSUBMIT SUBMISSION DEBUG ERROR ===");
      console.error("1. Request URL:", endpoint);
      console.error("2. HTTP Method:", method);
      console.error("3. Request Payload:", payload);
      console.error("4. Response Status:", response ? response.status : "N/A (Network / Abort Failure)");
      console.error("5. Response StatusText:", response ? response.statusText : "N/A (Network / Abort Failure)");
      console.error("6. Response Headers:", responseHeaders);
      console.error("7. Raw Response Body:", rawText || "(Empty or Network Error)");
      console.error("8. Parsed JSON Response:", parsedJson || "(Failed to parse JSON or null)");
      console.error("9. JS/Fetch Error:", fetchError ? fetchError.message : "Unknown error");

      const techErrorMsg = (error.name === 'AbortError')
        ? "Request timed out after 15 seconds."
        : (parsedJson && parsedJson.message) || error.message || (response ? `HTTP ${response.status}` : "Network/CORS error");

      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.className = 'form-status-alert alert-error';

        // Development mode check (localhost, 127.0.0.1, file:, or dev environment)
        const isDevMode = window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.protocol === 'file:' ||
          window.location.port !== '';

        const devTechErrorHtml = isDevMode
          ? `<div class="alert-tech-error" style="margin-top: 0.6rem; font-family: monospace; font-size: 0.8rem; color: #ff8a8a; border-top: 1px dashed rgba(255,82,82,0.3); padding-top: 0.4rem; word-break: break-all;">Technical error: ${techErrorMsg}</div>`
          : '';

        alertBox.innerHTML = `
          <div class="alert-title"><i class="fas fa-exclamation-circle"></i> Unable to send your message.</div>
          <div class="alert-desc">
            Please try again or email me directly at <a href="mailto:gursimranaidev@gmail.com" class="alert-email-link">gursimranaidev@gmail.com</a>.
            ${devTechErrorHtml}
          </div>
        `;
      }
    } finally {
      // ALWAYS Reset Loading State
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  });
}

function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

/* ==========================================
   8. Direct Gmail Compose Action & Fallback
   ========================================== */
function initEmailAction() {
  const emailBtn = document.getElementById('sendEmailBtn');
  if (!emailBtn) return;

  const gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=gursimranaidev@gmail.com";

  emailBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Open Gmail Compose directly in a new tab
    const newTab = window.open(gmailUrl, "_blank", "noopener,noreferrer");

    // If browser popup blocker intercepts window.open, show fallback link
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      let fallbackMsg = document.getElementById('gmailFallbackMsg');
      if (!fallbackMsg) {
        fallbackMsg = document.createElement('div');
        fallbackMsg.id = 'gmailFallbackMsg';
        fallbackMsg.className = 'gmail-fallback-container';
        fallbackMsg.innerHTML = `
          <span>Pop-up blocked? </span>
          <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" class="btn-fallback-link">Open Gmail &rarr;</a>
        `;
        emailBtn.parentNode.appendChild(fallbackMsg);
      }
    }
  });
}

/* ==========================================
   9. Centralized Knowledge, Articles & Research System
   ========================================== */
const GITHUB_JOURNEY_URL = "https://github.com/gursimranai";

const KNOWLEDGE_CATEGORIES = [
  "All",
  "AI/ML",
  "Python",
  "Data Science",
  "Machine Learning",
  "Deep Learning",
  "Projects",
  "Research",
  "Tutorials"
];



const DEFAULT_KNOWLEDGE_ITEMS = [
  {
    id: "complete-ai-ml-journey",
    title: "Complete AI & ML Journey",
    slug: "complete-ai-ml-journey",
    description: "A structured and continuously evolving AI & Machine Learning journey covering Python, NumPy, Pandas, data analysis, visualization, statistics, machine learning fundamentals, hands-on notebooks, experiments, and practical projects.",
    author: "Gursimran Singh",
    date: "2026-08-09",
    dateDisplay: "2026",
    updatedDate: "Updated recently",
    category: "AI/ML",
    type: "Learning Repository",
    tags: ["Python", "NumPy", "Pandas", "Data Science", "Machine Learning", "Jupyter Notebook"],
    readTime: "Ongoing Series",
    status: "In Progress",
    featured: true,
    githubUrl: GITHUB_JOURNEY_URL,
    published: true,
    content: `
      <h2>About My AI & ML Learning Journey</h2>
      <p>Welcome to my public learning repository! As a B.Tech student specializing in Artificial Intelligence & Machine Learning, I document my progress, experiments, notebooks, and projects in real time.</p>
      
      <h3>Core Learning Modules</h3>
      <ul>
        <li><strong>Python Core & OOP:</strong> Data structures, functions, modular architecture, and algorithms.</li>
        <li><strong>Data Manipulation with NumPy & Pandas:</strong> Array computing, DataFrame operations, vectorization, and data cleaning pipelines.</li>
        <li><strong>Exploratory Data Analysis (EDA):</strong> Statistical summary, handling missing values, feature correlation analysis, and distributions.</li>
        <li><strong>Data Visualization:</strong> Communicating data insights through Matplotlib & Seaborn visualizations.</li>
        <li><strong>Machine Learning Foundations:</strong> Supervised learning, classification, regression, clustering, and model evaluation metrics with Scikit-Learn.</li>
      </ul>

      <h3>Code Snippet: Exploratory Data Analysis & Scaling</h3>
      <pre><code class="language-python">import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

# Load dataset
df = pd.read_csv("data.csv")

# Clean missing values
df.fillna(df.median(numeric_only=True), inplace=True)

# Feature scaling
scaler = StandardScaler()
numerical_cols = df.select_dtypes(include=[np.number]).columns
df[numerical_cols] = scaler.fit_transform(df[numerical_cols])

print("Data preprocessing completed successfully.")
print(df.head())</code></pre>

      <h3>Journey Roadmap</h3>
      <p>This repository is updated continuously as I complete new modules, Jupyter notebooks, and hands-on ML projects.</p>
    `
  }
];

let KNOWLEDGE_ITEMS = [...DEFAULT_KNOWLEDGE_ITEMS];

// --- Supabase PostgreSQL Data Persistence Engine ---
async function fetchArticlesFromSupabase() {
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        KNOWLEDGE_ITEMS = data.map(row => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          description: row.description || '',
          author: row.author || 'Gursimran Singh',
          date: row.created_at ? row.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
          dateDisplay: row.created_at ? new Date(row.created_at).getFullYear().toString() : '2026',
          updatedDate: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'Recently',
          category: row.category || 'AI/ML',
          type: row.type || 'Article',
          tags: row.tags || [],
          readTime: row.read_time || '5 min read',
          status: row.status || (row.published ? 'Published' : 'Draft'),
          featured: row.slug === 'complete-ai-ml-journey',
          githubUrl: row.slug === 'complete-ai-ml-journey' ? GITHUB_JOURNEY_URL : null,
          published: row.published === true || row.status === 'Published',
          contentMarkdown: row.content,
          content: row.content ? (typeof marked !== 'undefined' ? marked.parse(row.content) : row.content) : ''
        }));
      }
    } catch (err) {
      console.warn("Could not fetch articles from Supabase:", err);
    }
  }
}

function initKnowledgeSection() {
  const catContainer = document.getElementById('knowledgeCategories');
  const gridContainer = document.getElementById('knowledgeGrid');
  const featuredContainer = document.getElementById('knowledgeFeaturedContainer');
  const emptyState = document.getElementById('knowledgeEmptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptyDesc = document.getElementById('emptyDesc');
  const searchInput = document.getElementById('knowledgeSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const sortSelect = document.getElementById('knowledgeSortSelect');
  const researchSection = document.getElementById('futureResearchSection');
  const researchGrid = document.getElementById('futureResearchGrid');

  let activeCategory = 'All';
  let searchQuery = '';
  let activeSort = 'newest';

  // Render Category Filter Pills
  if (catContainer) {
    catContainer.innerHTML = KNOWLEDGE_CATEGORIES.map(cat => `
      <button class="cat-btn ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </button>
    `).join('');

    catContainer.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        catContainer.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-cat');
        renderContent();
      });
    });
  }

  // Search Input Handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      if (searchClearBtn) {
        searchClearBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';
      }
      renderContent();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      renderContent();
    });
  }

  // Sort Select Handler
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderContent();
    });
  }

  function renderContent() {
    // 1. Filter Published Items
    let items = KNOWLEDGE_ITEMS.filter(item => item.published !== false);

    // 2. Category Filter
    if (activeCategory !== 'All') {
      items = items.filter(item =>
        item.category.toLowerCase() === activeCategory.toLowerCase() ||
        (item.tags && item.tags.some(t => t.toLowerCase() === activeCategory.toLowerCase()))
      );
    }

    // 3. Search Filter
    if (searchQuery) {
      items = items.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(searchQuery);
        const descMatch = item.description.toLowerCase().includes(searchQuery);
        const catMatch = item.category.toLowerCase().includes(searchQuery);
        const typeMatch = item.type.toLowerCase().includes(searchQuery);
        const authorMatch = item.author.toLowerCase().includes(searchQuery);
        const tagMatch = item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery));
        return titleMatch || descMatch || catMatch || typeMatch || authorMatch || tagMatch;
      });
    }

    // 4. Sort Items
    items.sort((a, b) => {
      if (activeSort === 'newest') return (b.date || '').localeCompare(a.date || '');
      if (activeSort === 'oldest') return (a.date || '').localeCompare(b.date || '');
      if (activeSort === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    // 5. Separate Featured items
    const featuredItems = items.filter(item => item.featured);
    const regularItems = items.filter(item => !item.featured);

    // Render Featured Container
    if (featuredContainer) {
      if (featuredItems.length > 0 && activeCategory === 'All' && !searchQuery) {
        const feat = featuredItems[0];
        featuredContainer.innerHTML = `
          <div class="featured-card-wrapper">
            <div class="featured-card">
              <span class="featured-badge"><i class="fas fa-star"></i> Featured ${feat.type}</span>
              <h3 class="featured-title">${feat.title}</h3>
              <p class="featured-desc">${feat.description}</p>
              <div class="featured-meta">
                <span style="font-size: 0.85rem; color: var(--text-muted);"><i class="fas fa-user"></i> ${feat.author}</span>
                <span style="font-size: 0.85rem; color: var(--text-muted);"><i class="fas fa-clock"></i> ${feat.readTime}</span>
                <div class="tag-list">
                  ${(feat.tags || []).map(t => `<span class="tag-item">${t}</span>`).join('')}
                </div>
              </div>
              <div class="featured-actions">
                ${feat.githubUrl ? `
                  <a href="${feat.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 0.6rem 1.4rem; font-size: 0.85rem;">
                    View on GitHub &rarr;
                  </a>
                ` : ''}
                ${feat.content ? `
                  <button class="btn btn-outline read-article-btn" data-id="${feat.id}" style="padding: 0.6rem 1.4rem; font-size: 0.85rem;">
                    Explore Journey &rarr;
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
        featuredContainer.style.display = 'block';
      } else {
        featuredContainer.innerHTML = '';
        featuredContainer.style.display = 'none';
      }
    }

    // Combine remaining items for Grid if searching/filtering
    const displayGridItems = (activeCategory !== 'All' || searchQuery) ? items : regularItems;

    // Render Main Grid
    if (gridContainer) {
      if (displayGridItems.length > 0) {
        gridContainer.style.display = 'grid';
        gridContainer.innerHTML = displayGridItems.map(item => `
          <div class="knowledge-card">
            <div>
              <span class="k-card-type">${item.type}</span>
              <h3 class="k-card-title">${item.title}</h3>
              <p class="k-card-desc">${item.description}</p>
              <div class="tag-list" style="margin-bottom: 1rem;">
                ${(item.tags || []).slice(0, 4).map(t => `<span class="tag-item">${t}</span>`).join('')}
              </div>
            </div>
            <div class="k-card-footer">
              <span class="k-status-tag ${item.status === 'In Progress' ? 'in-progress' : ''}">
                <i class="fas ${item.status === 'In Progress' ? 'fa-sync-alt fa-spin' : 'fa-check-circle'}"></i> ${item.status || 'Published'}
              </span>
              ${item.githubUrl ? `
                <a href="${item.githubUrl}" target="_blank" rel="noopener noreferrer" class="k-action-btn">
                  View GitHub &rarr;
                </a>
              ` : `
                <button class="k-action-btn read-article-btn" data-id="${item.id}" style="background:none; border:none; cursor:pointer;">
                  Read Article &rarr;
                </button>
              `}
            </div>
          </div>
        `).join('');
      } else {
        gridContainer.style.display = 'none';
      }
    }

    // Render Empty State if no items at all
    if (emptyState) {
      const hasNoContent = (featuredItems.length === 0 && displayGridItems.length === 0) || items.length === 0;
      if (hasNoContent) {
        emptyState.style.display = 'block';
        if (searchQuery) {
          if (emptyTitle) emptyTitle.textContent = "No articles found.";
          if (emptyDesc) emptyDesc.textContent = "Try a different search term or category.";
        } else {
          if (emptyTitle) emptyTitle.textContent = "No content here yet.";
          if (emptyDesc) emptyDesc.textContent = "More articles and experiments are coming as I continue building.";
        }
      } else {
        emptyState.style.display = 'none';
      }
    }

    // Future Research Section (Displays ONLY if genuine research entries exist)
    const researchItems = KNOWLEDGE_ITEMS.filter(i => i.type === 'Research Paper' || i.type === 'Preprint' || i.type === 'Technical Report');
    if (researchSection) {
      if (researchItems.length > 0) {
        researchSection.style.display = 'block';
        if (researchGrid) {
          researchGrid.innerHTML = researchItems.map(r => `
            <div class="knowledge-card">
              <span class="k-card-type">${r.type}</span>
              <h3 class="k-card-title">${r.title}</h3>
              <p class="k-card-desc">${r.description}</p>
              <div class="k-card-footer">
                <span class="k-status-tag">${r.status}</span>
                <a href="${r.url || '#'}" target="_blank" class="k-action-btn">Read Paper &rarr;</a>
              </div>
            </div>
          `).join('');
        }
      } else {
        researchSection.style.display = 'none';
      }
    }

    // Attach Reader Event Listeners
    document.querySelectorAll('.read-article-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openArticleModal(id);
      });
    });
  }

  // Initial Render
  renderContent();
}

/* Modal Article Reader Handler */
async function openArticleModal(articleIdOrSlug) {
  let item = KNOWLEDGE_ITEMS.find(i => i.id === articleIdOrSlug || i.slug === articleIdOrSlug);

  // If not found in memory (e.g. direct link or fresh refresh), fetch directly from Supabase
  if (!item && typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      const { data } = await supabaseClient
        .from('articles')
        .select('*')
        .or(`id.eq.${articleIdOrSlug},slug.eq.${articleIdOrSlug}`)
        .single();

      if (data) {
        item = {
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          author: data.author || 'Gursimran Singh',
          date: data.created_at ? data.created_at.slice(0, 10) : '2026-08-09',
          dateDisplay: data.created_at ? new Date(data.created_at).getFullYear().toString() : '2026',
          category: data.category || 'AI/ML',
          type: data.type || 'Article',
          tags: data.tags || [],
          readTime: data.read_time || '5 min read',
          status: data.status || 'Published',
          published: data.published,
          content: data.content ? (typeof marked !== 'undefined' ? marked.parse(data.content) : data.content) : ''
        };
      }
    } catch (e) {
      console.warn("Direct article query error:", e);
    }
  }

  if (!item) return;

  const modal = document.getElementById('articleReaderModal');
  const badge = document.getElementById('artBadge');
  const title = document.getElementById('artTitle');
  const author = document.getElementById('artAuthor');
  const date = document.getElementById('artDate');
  const readTime = document.getElementById('artReadTime');
  const tagsWrapper = document.getElementById('artTags');
  const bodyHtml = document.getElementById('artBody');
  const tocNav = document.getElementById('articleTocNav');

  if (badge) badge.textContent = item.type || 'Article';
  if (title) title.textContent = item.title;
  if (author) author.textContent = item.author;
  if (date) date.textContent = item.dateDisplay || item.date;
  if (readTime) readTime.textContent = item.readTime;

  if (tagsWrapper) {
    tagsWrapper.innerHTML = (item.tags || []).map(t => `<span class="tag-item">${t}</span>`).join('');
  }

  if (bodyHtml) {
    bodyHtml.innerHTML = item.content || `<p>${item.description}</p>`;

    // Add Code Copy Buttons to all <pre><code> blocks
    bodyHtml.querySelectorAll('pre').forEach(preBlock => {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      preBlock.appendChild(copyBtn);

      copyBtn.addEventListener('click', () => {
        const codeText = preBlock.querySelector('code')?.innerText || preBlock.innerText;
        navigator.clipboard.writeText(codeText).then(() => {
          copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
          }, 2000);
        });
      });
    });

    // Generate Table of Contents
    if (tocNav) {
      const headings = bodyHtml.querySelectorAll('h2, h3');
      if (headings.length > 0) {
        tocNav.innerHTML = Array.from(headings).map((h, idx) => {
          const hId = `heading-${idx}`;
          h.id = hId;
          const isH3 = h.tagName.toLowerCase() === 'h3';
          return `<a href="#${hId}" class="toc-link" style="${isH3 ? 'padding-left:0.8rem; font-size:0.8rem;' : ''}">${h.textContent}</a>`;
        }).join('');
      } else {
        tocNav.innerHTML = '<span style="color:var(--text-muted); font-size:0.82rem;">No subheadings</span>';
      }
    }
  }

  if (modal) {
    modal.classList.add('active');
  }

  // Social Share Handlers
  const currentUrl = window.location.href;
  const shareLinkedin = document.getElementById('shareLinkedinBtn');
  const shareTwitter = document.getElementById('shareTwitterBtn');
  const copyLinkBtn = document.getElementById('copyArticleLinkBtn');
  const copyTextSpan = document.getElementById('copyTextSpan');

  if (shareLinkedin) {
    shareLinkedin.onclick = () => {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
    };
  }

  if (shareTwitter) {
    shareTwitter.onclick = () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
    };
  }

  if (copyLinkBtn) {
    copyLinkBtn.onclick = () => {
      navigator.clipboard.writeText(currentUrl).then(() => {
        if (copyTextSpan) copyTextSpan.textContent = 'Link copied!';
        showToast('Article link copied to clipboard!');
        setTimeout(() => {
          if (copyTextSpan) copyTextSpan.textContent = 'Copy Link';
        }, 2500);
      });
    };
  }
}

// Close Article Reader Modal
const closeArtBtn = document.getElementById('closeArticleModalBtn');
if (closeArtBtn) {
  closeArtBtn.addEventListener('click', () => {
    const modal = document.getElementById('articleReaderModal');
    if (modal) modal.classList.remove('active');
    if (window.location.hash.startsWith('#blog/') || window.location.hash.startsWith('#article/')) {
      window.location.hash = '#publications';
    }
  });
}

// Direct Public Article URL Router (#blog/:slug or #article/:slug)
async function handlePublicBlogRouting() {
  const hash = window.location.hash || '';
  if (hash.startsWith('#blog/') || hash.startsWith('#article/')) {
    const slug = hash.replace('#blog/', '').replace('#article/', '');
    await openArticleModal(slug);
  }
}
window.addEventListener('hashchange', handlePublicBlogRouting);
handlePublicBlogRouting();

/* ====================================================================
   10. Private Developer CMS / Admin Dashboard System
   ==================================================================== */
function initAdminCMS() {
  // Session & Authentication State
  let currentUserSession = null;
  let activeEditingArticleId = null;
  let activeFilter = 'All';
  let activeSearch = '';
  let autosaveTimer = null;
  let deleteTargetArticleId = null;

  // DOM Elements
  const adminOverlay = document.getElementById('adminOverlay');
  const loginView = document.getElementById('adminLoginView');
  const dashboardView = document.getElementById('adminDashboardView');
  const editorView = document.getElementById('adminEditorView');
  const accessDeniedView = document.getElementById('adminAccessDeniedView');
  const resetPasswordView = document.getElementById('adminResetPasswordView');

  const loginForm = document.getElementById('adminLoginForm');
  const loginErrorAlert = document.getElementById('adminLoginError');
  const loginSuccessAlert = document.getElementById('adminLoginSuccess');
  const loginErrMsg = document.getElementById('loginErrMsg');
  const loginSuccessMsg = document.getElementById('loginSuccessMsg');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const backToPortfolioBtn = document.getElementById('backToPortfolioBtn');
  const deniedBackBtn = document.getElementById('deniedBackBtn');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  // Password Reset Elements
  const adminResetPasswordForm = document.getElementById('adminResetPasswordForm');
  const newPasswordInput = document.getElementById('newPasswordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const adminResetError = document.getElementById('adminResetError');
  const resetErrMsg = document.getElementById('resetErrMsg');
  const adminResetSuccess = document.getElementById('adminResetSuccess');
  const resetToLoginBtn = document.getElementById('resetToLoginBtn');

  // Forgot Password Modal Elements
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const sendResetEmailForm = document.getElementById('sendResetEmailForm');
  const forgotEmailInput = document.getElementById('forgotEmailInput');
  const closeForgotModalBtn = document.getElementById('closeForgotModalBtn');
  const cancelForgotBtn = document.getElementById('cancelForgotBtn');

  // Stats Elements
  const statPublished = document.getElementById('statPublishedCount');
  const statDraft = document.getElementById('statDraftCount');
  const statSched = document.getElementById('statSchedCount');
  const statTotal = document.getElementById('statTotalCount');

  // Table Elements
  const tableBody = document.getElementById('adminTableBody');
  const tableEmptyState = document.getElementById('adminTableEmptyState');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const adminFilterTabs = document.getElementById('adminFilterTabs');
  const activityList = document.getElementById('activityList');

  // Editor Elements
  const edTitle = document.getElementById('edTitle');
  const edSlug = document.getElementById('edSlug');
  const edDescription = document.getElementById('edDescription');
  const edType = document.getElementById('edType');
  const edCategory = document.getElementById('edCategory');
  const edTags = document.getElementById('edTags');
  const edCoverImage = document.getElementById('edCoverImage');
  const edSeoTitle = document.getElementById('edSeoTitle');
  const edSeoDescription = document.getElementById('edSeoDescription');
  const edContentTextarea = document.getElementById('edContentTextarea');
  const autosaveStatus = document.getElementById('autosaveStatus');
  const editorHeaderTitle = document.getElementById('editorHeaderTitle');
  const editorPaneWrapper = document.getElementById('editorPaneWrapper');

  // Editor Buttons
  const saveDraftBtn = document.getElementById('saveDraftBtn');
  const previewArticleBtn = document.getElementById('previewArticleBtn');
  const publishArticleBtn = document.getElementById('publishArticleBtn');
  const scheduleArticleBtn = document.getElementById('scheduleArticleBtn');
  const backToDashboardBtn = document.getElementById('backToDashboardBtn');
  const exportContentBtn = document.getElementById('exportContentBtn');
  const continueDraftBtn = document.getElementById('continueDraftBtn');

  // Preview Elements
  const prevBadge = document.getElementById('prevBadge');
  const prevTitle = document.getElementById('prevTitle');
  const prevAuthor = document.getElementById('prevAuthor');
  const prevReadTime = document.getElementById('prevReadTime');
  const prevTags = document.getElementById('prevTags');
  const prevBody = document.getElementById('prevBody');

  // Metrics
  const metricWords = document.getElementById('metricWords');
  const metricChars = document.getElementById('metricChars');
  const metricReadTime = document.getElementById('metricReadTime');

  // Delete Modal
  const confirmDeleteModal = document.getElementById('confirmDeleteModal');
  const deleteTargetTitle = document.getElementById('deleteTargetTitle');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // Helper: Log CMS Activity
  function logActivity(text) {
    if (!activityList) return;
    const li = document.createElement('li');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    li.innerHTML = `<i class="fas fa-check text-success"></i> <span style="color:var(--text-muted); font-size:0.78rem;">[${timeStr}]</span> ${text}`;
    activityList.prepend(li);
  }

  // --- Real Server-Side Auth & Authorization Verification ---
  async function verifyAdminAuth() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      return { authenticated: false, admin: false, message: 'Supabase backend credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js.' };
    }

    try {
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError || !session || !session.user) {
        return { authenticated: false, admin: false };
      }

      currentUserSession = session.user;

      // Server-side Authorization Check on public.profiles table
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, email, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        if (session.user.email && session.user.email.toLowerCase() === 'gursimranaidev@gmail.com') {
          currentUserProfile = { id: session.user.id, email: session.user.email, role: 'admin' };
          return { authenticated: true, admin: true };
        }
        return { authenticated: true, admin: false };
      }

      currentUserProfile = profile;
      const isAdmin = profile.role === 'admin' && profile.email.toLowerCase() === 'gursimranaidev@gmail.com';
      return { authenticated: true, admin: isAdmin };
    } catch (err) {
      console.error("Auth verification error:", err);
      return { authenticated: false, admin: false };
    }
  }

  // --- Router & Access Protection ---
  async function handleRouting() {
    const hash = window.location.hash || '';
    if (hash === '#admin' || hash === '#admin/login' || hash === '#developer') {
      adminOverlay.style.display = 'block';
      const auth = await verifyAdminAuth();
      if (auth.admin) {
        window.location.hash = '#admin/dashboard';
        showView(dashboardView);
        renderDashboard();
      } else {
        showView(loginView);
      }
    } else if (hash.startsWith('#admin/dashboard')) {
      adminOverlay.style.display = 'block';
      const auth = await verifyAdminAuth();
      if (!auth.authenticated) {
        window.location.hash = '#admin/login';
        showView(loginView);
      } else if (!auth.admin) {
        showView(accessDeniedView);
      } else {
        showView(dashboardView);
        renderDashboard();
      }
    } else if (hash.startsWith('#admin/editor')) {
      adminOverlay.style.display = 'block';
      const auth = await verifyAdminAuth();
      if (!auth.authenticated) {
        window.location.hash = '#admin/login';
        showView(loginView);
      } else if (!auth.admin) {
        showView(accessDeniedView);
      } else {
        showView(editorView);
      }
    } else if (hash.startsWith('#admin/reset-password')) {
      adminOverlay.style.display = 'block';
      showView(resetPasswordView);
    } else {
      adminOverlay.style.display = 'none';
    }
  }

  function showView(viewEl) {
    loginView.style.display = 'none';
    dashboardView.style.display = 'none';
    editorView.style.display = 'none';
    if (accessDeniedView) accessDeniedView.style.display = 'none';
    if (resetPasswordView) resetPasswordView.style.display = 'none';
    if (viewEl) viewEl.style.display = 'block';
  }

  window.addEventListener('hashchange', handleRouting);
  handleRouting();

  // Listen for Supabase Auth Password Recovery Events
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.location.hash = '#admin/reset-password';
        showView(resetPasswordView);
      }
    });
  }

  // --- Real Login Form Handler (Supabase Auth) ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('adminEmailInput').value.trim().toLowerCase();
      const password = document.getElementById('adminPasswordInput').value;

      if (loginErrorAlert) loginErrorAlert.style.display = 'none';
      if (loginSuccessAlert) loginSuccessAlert.style.display = 'none';

      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        if (loginErrMsg) loginErrMsg.textContent = "Supabase backend not connected. Please set SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js.";
        if (loginErrorAlert) loginErrorAlert.style.display = 'flex';
        return;
      }

      // Real Supabase Email + Password Sign-In
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Supabase Auth Error:", error.message, "| Status:", error.status || error.name);
        if (loginErrMsg) loginErrMsg.textContent = error.message || "Invalid email or password.";
        if (loginErrorAlert) loginErrorAlert.style.display = 'flex';
        return;
      }

      currentUserSession = data.user;

      // Verify Admin Authorization Role on PostgreSQL Database
      const authState = await verifyAdminAuth();

      if (!authState.admin) {
        showView(accessDeniedView);
        return;
      }

      logActivity(`Admin authenticated securely (${data.user.email}).`);
      window.location.hash = '#admin/dashboard';
      showView(dashboardView);
      renderDashboard();
    });
  }

  // --- Forgot Password Modal & Reset Link Handler ---
  if (forgotPasswordBtn && forgotPasswordModal) {
    forgotPasswordBtn.onclick = () => {
      forgotPasswordModal.classList.add('active');
    };
  }

  if (closeForgotModalBtn) closeForgotModalBtn.onclick = () => forgotPasswordModal.classList.remove('active');
  if (cancelForgotBtn) cancelForgotBtn.onclick = () => forgotPasswordModal.classList.remove('active');

  if (sendResetEmailForm) {
    sendResetEmailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = forgotEmailInput.value.trim();
      if (!email) return;

      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        alert("Supabase backend not connected. Please add SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js.");
        return;
      }

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#admin/reset-password'
      });

      forgotPasswordModal.classList.remove('active');

      if (error) {
        console.error("Supabase Password Reset Error:", error.message);
        if (loginErrMsg) loginErrMsg.textContent = error.message || "Unable to send password reset email. Please try again.";
        if (loginErrorAlert) loginErrorAlert.style.display = 'flex';
      } else {
        if (loginSuccessMsg) loginSuccessMsg.textContent = `Password reset link sent to ${email}! Check your inbox.`;
        if (loginSuccessAlert) loginSuccessAlert.style.display = 'flex';
      }
    });
  }

  // --- Password Reset Screen Handler (#admin/reset-password) ---
  if (adminResetPasswordForm) {
    adminResetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPass = newPasswordInput.value.trim();
      const confirmPass = confirmPasswordInput.value.trim();

      if (adminResetError) adminResetError.style.display = 'none';
      if (adminResetSuccess) adminResetSuccess.style.display = 'none';

      if (newPass.length < 8) {
        if (resetErrMsg) resetErrMsg.textContent = "Password must be at least 8 characters.";
        if (adminResetError) adminResetError.style.display = 'flex';
        return;
      }

      if (newPass !== confirmPass) {
        if (resetErrMsg) resetErrMsg.textContent = "Passwords do not match.";
        if (adminResetError) adminResetError.style.display = 'flex';
        return;
      }

      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        alert("Supabase backend not connected. Please set SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js.");
        return;
      }

      const { error } = await supabaseClient.auth.updateUser({ password: newPass });

      if (error) {
        if (resetErrMsg) resetErrMsg.textContent = error.message || "Password update failed. Please try again.";
        if (adminResetError) adminResetError.style.display = 'flex';
      } else {
        if (adminResetSuccess) adminResetSuccess.style.display = 'flex';
        showToast("Password updated successfully.");
        setTimeout(() => {
          window.location.hash = '#admin/login';
        }, 2000);
      }
    });
  }

  if (resetToLoginBtn) {
    resetToLoginBtn.onclick = () => {
      window.location.hash = '#admin/login';
    };
  }

  // --- Real Logout Handler ---
  if (adminLogoutBtn) {
    adminLogoutBtn.onclick = async () => {
      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      currentUserSession = null;
      currentUserProfile = null;
      showToast("Logged out successfully.");
      window.location.hash = '#admin/login';
      showView(loginView);
    };
  }

  if (backToPortfolioBtn) {
    backToPortfolioBtn.onclick = () => {
      window.location.hash = '#home';
      adminOverlay.style.display = 'none';
    };
  }

  if (deniedBackBtn) {
    deniedBackBtn.onclick = () => {
      window.location.hash = '#home';
      adminOverlay.style.display = 'none';
    };
  }

  // --- Dashboard Renderer ---
  function renderDashboard() {
    // Calculate Stats
    const total = KNOWLEDGE_ITEMS.length;
    const pubCount = KNOWLEDGE_ITEMS.filter(i => i.status === 'Published' || i.published === true).length;
    const draftCount = KNOWLEDGE_ITEMS.filter(i => i.status === 'Draft').length;
    const schedCount = KNOWLEDGE_ITEMS.filter(i => i.status === 'Scheduled').length;

    if (statPublished) statPublished.textContent = pubCount;
    if (statDraft) statDraft.textContent = draftCount;
    if (statSched) statSched.textContent = schedCount;
    if (statTotal) statTotal.textContent = total;

    // Filter Items for Table
    let filtered = KNOWLEDGE_ITEMS.filter(item => {
      if (activeFilter === 'All') return true;
      return (item.status || 'Draft').toLowerCase() === activeFilter.toLowerCase();
    });

    if (activeSearch) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(activeSearch) ||
        (item.category || '').toLowerCase().includes(activeSearch) ||
        (item.type || '').toLowerCase().includes(activeSearch)
      );
    }

    // Check if there are active drafts to continue editing
    const recentDraft = KNOWLEDGE_ITEMS.find(i => i.status === 'Draft');
    if (continueDraftBtn) {
      if (recentDraft) {
        continueDraftBtn.style.display = 'inline-flex';
        continueDraftBtn.onclick = () => openEditor(recentDraft.id);
      } else {
        continueDraftBtn.style.display = 'none';
      }
    }

    // Render Table Rows
    if (tableBody) {
      if (filtered.length > 0) {
        if (tableEmptyState) tableEmptyState.style.display = 'none';
        tableBody.innerHTML = filtered.map(item => {
          const st = item.status || (item.published ? 'Published' : 'Draft');
          const stClass = st.toLowerCase();
          return `
            <tr>
              <td><strong>${item.title}</strong></td>
              <td><span class="tag-item">${item.type || 'Article'}</span></td>
              <td>${item.category || 'AI/ML'}</td>
              <td><span class="status-badge ${stClass}">${st}</span></td>
              <td>${item.updatedDate || item.dateDisplay || 'Today'}</td>
              <td>${item.published ? (item.dateDisplay || '2026') : '—'}</td>
              <td>
                <button class="table-action-btn edit-art-btn" data-id="${item.id}" title="Edit"><i class="fas fa-edit"></i> Edit</button>
                <button class="table-action-btn prev-art-btn" data-id="${item.id}" title="Preview"><i class="fas fa-eye"></i></button>
                <button class="table-action-btn dup-art-btn" data-id="${item.id}" title="Duplicate"><i class="fas fa-copy"></i></button>
                ${st === 'Published' ? `
                  <button class="table-action-btn unpub-art-btn" data-id="${item.id}" title="Unpublish"><i class="fas fa-eye-slash"></i></button>
                ` : `
                  <button class="table-action-btn pub-art-btn" data-id="${item.id}" title="Publish"><i class="fas fa-paper-plane"></i></button>
                `}
                <button class="table-action-btn btn-del del-art-btn" data-id="${item.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
              </td>
            </tr>
          `;
        }).join('');

        // Table Action Listeners
        tableBody.querySelectorAll('.edit-art-btn').forEach(b => b.onclick = () => openEditor(b.getAttribute('data-id')));
        tableBody.querySelectorAll('.prev-art-btn').forEach(b => b.onclick = () => openArticleModal(b.getAttribute('data-id')));
        tableBody.querySelectorAll('.dup-art-btn').forEach(b => b.onclick = () => duplicateArticle(b.getAttribute('data-id')));
        tableBody.querySelectorAll('.pub-art-btn').forEach(b => b.onclick = () => togglePublish(b.getAttribute('data-id'), true));
        tableBody.querySelectorAll('.unpub-art-btn').forEach(b => b.onclick = () => togglePublish(b.getAttribute('data-id'), false));
        tableBody.querySelectorAll('.del-art-btn').forEach(b => b.onclick = () => confirmDelete(b.getAttribute('data-id')));
      } else {
        tableBody.innerHTML = '';
        if (tableEmptyState) tableEmptyState.style.display = 'block';
      }
    }
  }

  // Dashboard Filters & Search Listeners
  if (adminFilterTabs) {
    adminFilterTabs.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.onclick = () => {
        adminFilterTabs.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderDashboard();
      };
    });
  }

  if (adminSearchInput) {
    adminSearchInput.oninput = (e) => {
      activeSearch = e.target.value.toLowerCase().trim();
      renderDashboard();
    };
  }

  // Action Buttons (+ New Article, + New Note, + New Research Note)
  document.querySelectorAll('.create-art-btn').forEach(btn => {
    btn.onclick = () => {
      const contentType = btn.getAttribute('data-type') || 'Article';
      openEditor(null, contentType);
    };
  });

  // Export Content Choice Modal Handlers
  const exportChoiceModal = document.getElementById('exportChoiceModal');
  const exportJsonChoiceBtn = document.getElementById('exportJsonChoiceBtn');
  const exportMdChoiceBtn = document.getElementById('exportMdChoiceBtn');
  const closeExportChoiceBtn = document.getElementById('closeExportChoiceBtn');

  if (exportContentBtn && exportChoiceModal) {
    exportContentBtn.onclick = () => {
      exportChoiceModal.classList.add('active');
    };
  }

  if (closeExportChoiceBtn) closeExportChoiceBtn.onclick = () => exportChoiceModal.classList.remove('active');

  if (exportJsonChoiceBtn) {
    exportJsonChoiceBtn.onclick = () => {
      exportChoiceModal.classList.remove('active');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(KNOWLEDGE_ITEMS, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `portfolio-cms-export-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Exported catalog as JSON.");
      logActivity("Exported catalog as JSON.");
    };
  }

  if (exportMdChoiceBtn) {
    exportMdChoiceBtn.onclick = () => {
      exportChoiceModal.classList.remove('active');
      KNOWLEDGE_ITEMS.forEach(item => {
        const mdText = `# ${item.title}\n\n**Author:** ${item.author}\n**Category:** ${item.category}\n**Tags:** ${(item.tags || []).join(', ')}\n\n---\n\n${item.contentMarkdown || item.content}`;
        const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(mdText);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${item.slug || 'article'}.md`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
      showToast("Exported content files as Markdown.");
      logActivity("Exported content as Markdown (.md) files.");
    };
  }

  // Insert Image Modal Handlers
  const insertImgBtn = document.querySelector('.fmt-btn[data-fmt="image"]');
  const insertImageModal = document.getElementById('insertImageModal');
  const closeImageModalBtn = document.getElementById('closeImageModalBtn');
  const cancelImageInsertBtn = document.getElementById('cancelImageInsertBtn');
  const confirmImageInsertBtn = document.getElementById('confirmImageInsertBtn');
  const imgAltInput = document.getElementById('imgAltInput');
  const imgUrlInput = document.getElementById('imgUrlInput');
  const imgFileInput = document.getElementById('imgFileInput');

  if (insertImgBtn && insertImageModal) {
    insertImgBtn.onclick = () => {
      insertImageModal.classList.add('active');
      if (imgAltInput) imgAltInput.value = '';
      if (imgUrlInput) imgUrlInput.value = '';
      if (imgFileInput) imgFileInput.value = '';
    };
  }

  if (closeImageModalBtn) closeImageModalBtn.onclick = () => insertImageModal.classList.remove('active');
  if (cancelImageInsertBtn) cancelImageInsertBtn.onclick = () => insertImageModal.classList.remove('active');

  if (confirmImageInsertBtn) {
    confirmImageInsertBtn.onclick = () => {
      const alt = (imgAltInput ? imgAltInput.value.trim() : '') || 'Article Image';
      let url = imgUrlInput ? imgUrlInput.value.trim() : '';

      if (imgFileInput && imgFileInput.files && imgFileInput.files[0]) {
        const file = imgFileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          url = e.target.result;
          insertMarkdownText(`![${alt}](${url})`);
          insertImageModal.classList.remove('active');
        };
        reader.readAsDataURL(file);
      } else if (url) {
        insertMarkdownText(`![${alt}](${url})`);
        insertImageModal.classList.remove('active');
      } else {
        alert("Please provide an Image URL or select an image file.");
      }
    };
  }

  function insertMarkdownText(ins) {
    if (!edContentTextarea) return;
    const start = edContentTextarea.selectionStart;
    const end = edContentTextarea.selectionEnd;
    const text = edContentTextarea.value;
    edContentTextarea.value = text.substring(0, start) + ins + text.substring(end);
    updateEditorMetrics();
    updateLivePreview();
  }

  // --- Article Editor Logic ---
  function openEditor(articleId, defaultType = 'Article') {
    activeEditingArticleId = articleId;
    window.location.hash = '#admin/editor';
    showView(editorView);

    if (articleId) {
      const item = KNOWLEDGE_ITEMS.find(i => i.id === articleId);
      if (item) {
        if (editorHeaderTitle) editorHeaderTitle.textContent = `Edit: ${item.title}`;
        if (edTitle) edTitle.value = item.title;
        if (edSlug) edSlug.value = item.slug;
        if (edDescription) edDescription.value = item.description;
        if (edType) edType.value = item.type || 'Article';
        if (edCategory) edCategory.value = item.category || 'AI/ML';
        if (edTags) edTags.value = (item.tags || []).join(', ');
        if (edCoverImage) edCoverImage.value = item.coverImage || '';
        if (edSeoTitle) edSeoTitle.value = item.seoTitle || '';
        if (edSeoDescription) edSeoDescription.value = item.seoDescription || '';
        if (edContentTextarea) edContentTextarea.value = item.contentMarkdown || item.content || '';
      }
    } else {
      if (editorHeaderTitle) editorHeaderTitle.textContent = `Create New ${defaultType}`;
      if (edTitle) edTitle.value = '';
      if (edSlug) edSlug.value = '';
      if (edDescription) edDescription.value = '';
      if (edType) edType.value = defaultType;
      if (edCategory) edCategory.value = 'AI/ML';
      if (edTags) edTags.value = '';
      if (edCoverImage) edCoverImage.value = '';
      if (edSeoTitle) edSeoTitle.value = '';
      if (edSeoDescription) edSeoDescription.value = '';
      if (edContentTextarea) edContentTextarea.value = '';
    }

    updateEditorMetrics();
    updateLivePreview();
  }

  // Auto-generate Slug on Title input
  if (edTitle) {
    edTitle.oninput = () => {
      if (!activeEditingArticleId && edSlug) {
        edSlug.value = edTitle.value.toLowerCase().trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      updateLivePreview();
    };
  }

  if (edContentTextarea) {
    edContentTextarea.oninput = () => {
      updateEditorMetrics();
      updateLivePreview();
      triggerAutosave();
    };
  }

  function updateEditorMetrics() {
    const text = edContentTextarea ? edContentTextarea.value : '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const minutes = Math.max(1, Math.ceil(words / 200));

    if (metricWords) metricWords.textContent = words.toLocaleString();
    if (metricChars) metricChars.textContent = chars.toLocaleString();
    if (metricReadTime) metricReadTime.textContent = `${minutes} min read`;
  }

  function updateLivePreview() {
    const titleVal = edTitle ? (edTitle.value || 'Article Title Preview') : 'Article Title Preview';
    const typeVal = edType ? edType.value : 'Article';
    const tagsVal = edTags ? edTags.value.split(',').map(t => t.trim()).filter(Boolean) : [];
    const contentVal = edContentTextarea ? edContentTextarea.value : '';

    if (prevTitle) prevTitle.textContent = titleVal;
    if (prevBadge) prevBadge.textContent = typeVal;
    if (prevTags) prevTags.innerHTML = tagsVal.map(t => `<span class="tag-item">${t}</span>`).join('');

    if (prevBody) {
      if (typeof marked !== 'undefined') {
        prevBody.innerHTML = marked.parse(contentVal || '*No content written yet.*');
      } else {
        prevBody.innerHTML = `<p>${contentVal}</p>`;
      }

      // Render KaTeX Math equations if loaded
      if (typeof renderMathInElement !== 'undefined') {
        try {
          renderMathInElement(prevBody, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false }
            ]
          });
        } catch (e) { console.warn(e); }
      }
    }
  }

  // Editor Toolbar Formatting Helpers
  document.querySelectorAll('.fmt-btn').forEach(btn => {
    btn.onclick = () => {
      const fmt = btn.getAttribute('data-fmt');
      if (!edContentTextarea) return;
      const start = edContentTextarea.selectionStart;
      const end = edContentTextarea.selectionEnd;
      const text = edContentTextarea.value;
      const sel = text.substring(start, end);
      let ins = '';

      switch (fmt) {
        case 'h1': ins = `# ${sel || 'Heading 1'}`; break;
        case 'h2': ins = `## ${sel || 'Heading 2'}`; break;
        case 'h3': ins = `### ${sel || 'Heading 3'}`; break;
        case 'bold': ins = `**${sel || 'bold text'}**`; break;
        case 'italic': ins = `*${sel || 'italic text'}*`; break;
        case 'code': ins = `\`${sel || 'code'}\``; break;
        case 'codeblock': ins = `\`\`\`python\n${sel || '# Write code here'}\n\`\`\``; break;
        case 'math': ins = `$$ ${sel || '\\mathcal{L} = -\\sum y \\log(\\hat{y})'} $$`; break;
        case 'quote': ins = `> ${sel || 'Blockquote text'}`; break;
        case 'link': ins = `[${sel || 'Link Text'}](https://example.com)`; break;
        case 'image': ins = `![${sel || 'Alt Text'}](https://example.com/image.jpg)`; break;
        case 'table': ins = `\n| Feature | Value |\n|---------|-------|\n| Model   | ResNet |\n`; break;
        case 'list': ins = `- ${sel || 'List item'}`; break;
      }

      edContentTextarea.value = text.substring(0, start) + ins + text.substring(end);
      updateEditorMetrics();
      updateLivePreview();
    };
  });

  // Editor Mode Selector (Write, Preview, Split)
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');
      if (editorPaneWrapper) {
        editorPaneWrapper.className = `editor-pane-wrapper mode-${mode}`;
      }
    };
  });

  // Autosave Draft
  function triggerAutosave() {
    if (autosaveStatus) {
      autosaveStatus.innerHTML = `<i class="fas fa-sync-alt fa-spin"></i> Saving...`;
    }
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      saveArticle('Draft', true);
      if (autosaveStatus) {
        autosaveStatus.innerHTML = `<i class="fas fa-check-circle"></i> Saved`;
      }
    }, 1500);
  }

  // Save / Publish / Schedule Handlers
  if (saveDraftBtn) saveDraftBtn.onclick = () => saveArticle('Draft');
  if (publishArticleBtn) publishArticleBtn.onclick = () => {
    if (confirm("Publish this article live to the public website?")) {
      saveArticle('Published');
    }
  };
  if (scheduleArticleBtn) scheduleArticleBtn.onclick = () => {
    const time = prompt("Enter scheduled publication date (YYYY-MM-DD):", new Date().toISOString().slice(0, 10));
    if (time) saveArticle('Scheduled');
  };
  if (backToDashboardBtn) backToDashboardBtn.onclick = () => {
    window.location.hash = '#admin/dashboard';
    showView(dashboardView);
    renderDashboard();
  };

  async function saveArticle(status = 'Draft', isAutosave = false) {
    const titleVal = edTitle ? edTitle.value.trim() : '';
    if (!titleVal && !isAutosave) {
      alert("Please enter an article title.");
      return;
    }

    const isEditMode = Boolean(activeEditingArticleId);
    let baseSlug = (edSlug && edSlug.value.trim()) ? edSlug.value.trim() : (titleVal.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') || 'draft-article');
    let finalSlug = baseSlug;

    if (isEditMode) {
      // Check if user changed slug to one already used by ANOTHER article
      const otherItemWithSlug = KNOWLEDGE_ITEMS.find(i => i.slug === finalSlug && i.id !== activeEditingArticleId);
      if (otherItemWithSlug) {
        alert("This slug is already used by another article.");
        return;
      }
    } else {
      // CREATE Mode: Auto-generate unique slug if duplicate exists
      let counter = 2;
      while (KNOWLEDGE_ITEMS.some(i => i.slug === finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const descVal = edDescription ? edDescription.value.trim() : '';
    const typeVal = edType ? edType.value : 'Article';
    const catVal = edCategory ? edCategory.value : 'AI/ML';
    const tagsArr = edTags ? edTags.value.split(',').map(t => t.trim()).filter(Boolean) : [];
    const contentVal = edContentTextarea ? edContentTextarea.value : '';
    const readTimeVal = metricReadTime ? metricReadTime.textContent : '5 min read';
    const wordCountVal = metricWords ? parseInt(metricWords.textContent.replace(/,/g, '')) || 0 : 0;
    const seoTitleVal = edSeoTitle ? edSeoTitle.value.trim() : '';
    const seoDescVal = edSeoDescription ? edSeoDescription.value.trim() : '';

    const payload = {
      title: titleVal || 'Untitled Draft',
      slug: finalSlug,
      description: descVal,
      author: 'Gursimran Singh',
      type: typeVal,
      category: catVal,
      tags: tagsArr,
      content: contentVal,
      read_time: readTimeVal,
      word_count: wordCountVal,
      status: status,
      published: (status === 'Published'),
      seo_title: seoTitleVal,
      seo_description: seoDescVal,
      updated_at: new Date().toISOString()
    };

    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      let res;
      if (isEditMode) {
        // UPDATE existing article in Supabase
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(activeEditingArticleId);
        if (isUuid) {
          res = await supabaseClient.from('articles').update(payload).eq('id', activeEditingArticleId).select().single();
        } else {
          // If non-UUID string ID (e.g. 'complete-ai-ml-journey'), update by slug
          res = await supabaseClient.from('articles').update(payload).eq('slug', activeEditingArticleId).select().single();
          if (res.error && res.error.code === 'PGRST116') {
            res = await supabaseClient.from('articles').insert([payload]).select().single();
          }
        }
      } else {
        // INSERT genuinely new article in Supabase
        res = await supabaseClient.from('articles').insert([payload]).select().single();
      }

      if (res.error) {
        console.error("Supabase Save Error:", res.error);
        if (!isAutosave) {
          alert(`Unable to save article to Supabase: ${res.error.message || "Database permission failure."}`);
        }
        return;
      }

      if (res.data && res.data.id) {
        activeEditingArticleId = res.data.id;
      }
    }

    // Re-fetch all articles from Supabase to guarantee 100% database persistence across refreshes
    await fetchArticlesFromSupabase();
    initKnowledgeSection();
    renderDashboard();

    if (!isAutosave) {
      showToast(`Article successfully saved as ${status}!`);
      logActivity(`Saved "${titleVal}" as ${status}.`);
      window.location.hash = '#admin/dashboard';
      showView(dashboardView);
    }
  }

  // Toggle Publish / Unpublish directly on Supabase
  async function togglePublish(id, shouldPublish) {
    const item = KNOWLEDGE_ITEMS.find(i => i.id === id);
    const title = item ? item.title : 'Article';

    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      const { error } = await supabaseClient
        .from('articles')
        .update({
          published: shouldPublish,
          status: shouldPublish ? 'Published' : 'Unpublished',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        alert(`Unable to update status on Supabase: ${error.message}`);
        return;
      }
    }

    await fetchArticlesFromSupabase();
    initKnowledgeSection();
    renderDashboard();
    showToast(`Article "${title}" is now ${shouldPublish ? 'Published' : 'Unpublished'}.`);
    logActivity(`Changed status of "${title}" to ${shouldPublish ? 'Published' : 'Unpublished'}.`);
  }

  // Duplicate Article
  async function duplicateArticle(id) {
    const item = KNOWLEDGE_ITEMS.find(i => i.id === id);
    if (!item) return;

    const dupPayload = {
      title: `${item.title} (Copy)`,
      slug: `${item.slug}-copy-${Date.now()}`,
      description: item.description,
      author: item.author,
      type: item.type,
      category: item.category,
      tags: item.tags,
      content: item.contentMarkdown || item.content,
      status: 'Draft',
      published: false
    };

    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      const { error } = await supabaseClient.from('articles').insert([dupPayload]);
      if (error) {
        alert(`Duplicate failed: ${error.message}`);
        return;
      }
    }

    await fetchArticlesFromSupabase();
    renderDashboard();
    showToast(`Duplicated draft created.`);
    logActivity(`Duplicated "${item.title}".`);
  }

  // Confirm Delete
  function confirmDelete(id) {
    const item = KNOWLEDGE_ITEMS.find(i => i.id === id);
    if (!item) return;
    deleteTargetArticleId = id;
    if (deleteTargetTitle) deleteTargetTitle.textContent = `"${item.title}"`;
    if (confirmDeleteModal) confirmDeleteModal.classList.add('active');
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.onclick = () => {
      if (confirmDeleteModal) confirmDeleteModal.classList.remove('active');
    };
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = async () => {
      if (deleteTargetArticleId) {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) {
          const { error } = await supabaseClient
            .from('articles')
            .delete()
            .eq('id', deleteTargetArticleId);

          if (error) {
            alert(`Unable to delete article from Supabase: ${error.message}`);
            if (confirmDeleteModal) confirmDeleteModal.classList.remove('active');
            return;
          }
        }

        await fetchArticlesFromSupabase();
        initKnowledgeSection();
        renderDashboard();
        showToast(`Deleted article permanently.`);
        logActivity(`Deleted article from Supabase.`);
      }
      if (confirmDeleteModal) confirmDeleteModal.classList.remove('active');
    };
  }

  initProjectsAdminCMS();
}

/* ==========================================================================
   SUPABASE BACKED PROJECT MANAGEMENT CMS & PUBLIC PORTFOLIO
   ========================================================================== */

let PROJECTS_ITEMS = []; // Default state is empty! Real projects loaded from Supabase.
let activeEditingProjectId = null;
let activeProjFilterCategory = 'All';
let activeProjFilterStatus = 'All';
let projMetricsState = [];

// 1. Fetch Projects from Supabase
async function fetchProjectsFromSupabase() {
  if (typeof supabaseClient === 'undefined' || !supabaseClient) {
    PROJECTS_ITEMS = [];
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data) {
      PROJECTS_ITEMS = data.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        shortDescription: p.short_description || '',
        description: p.description || '',
        category: p.category || 'AI / Machine Learning',
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
        coverImage: p.cover_image || '',
        githubUrl: p.github_url || '',
        liveDemoUrl: p.live_demo_url || '',
        documentationUrl: p.documentation_url || '',
        paperUrl: p.paper_url || '',
        demoVideoUrl: p.demo_video_url || '',
        featured: Boolean(p.featured),
        published: Boolean(p.published),
        status: p.status || 'Draft',
        displayOrder: p.display_order || 0,
        metrics: Array.isArray(p.metrics) ? p.metrics : [],
        content: p.content || '',
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));
    } else if (error) {
      console.warn("Supabase projects query warning:", error.message);
    }
  } catch (err) {
    console.error("fetchProjectsFromSupabase error:", err);
  }
}

// 2. Handle Public Routing for Projects (#project/:slug)
function handlePublicProjectRouting() {
  const hash = window.location.hash;
  if (hash.startsWith('#project/')) {
    const slug = hash.replace('#project/', '');
    if (slug) {
      openProjectModal(slug);
    }
  }
}

window.addEventListener('hashchange', () => {
  handlePublicProjectRouting();
});

// 3. Render Public Projects Section
function initProjectsSection() {
  const container = document.getElementById('projectGrid');
  const emptyState = document.getElementById('projectEmptyState');
  const categoriesNav = document.getElementById('projectCategories');
  if (!container) return;

  // Render Public Categories
  if (categoriesNav) {
    const categories = ['All Projects', 'LLMs & RAG', 'Computer Vision', 'MLOps & Infra', 'NLP', 'Data Science', 'Deep Learning', 'Other'];
    categoriesNav.innerHTML = categories.map(cat => {
      const catKey = cat === 'All Projects' ? 'All' : cat;
      const isActive = activeProjFilterCategory === catKey;
      return `<button class="category-btn ${isActive ? 'active' : ''}" data-projcat="${catKey}">${cat}</button>`;
    }).join('');

    categoriesNav.querySelectorAll('.category-btn').forEach(btn => {
      btn.onclick = () => {
        categoriesNav.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeProjFilterCategory = btn.getAttribute('data-projcat');
        renderPublicProjectsGrid();
      };
    });
  }

  renderPublicProjectsGrid();
}

function renderPublicProjectsGrid() {
  const container = document.getElementById('projectGrid');
  const emptyState = document.getElementById('projectEmptyState');
  if (!container) return;

  let filtered = PROJECTS_ITEMS.filter(p => p.published && p.status === 'Published');

  if (activeProjFilterCategory !== 'All') {
    filtered = filtered.filter(p => {
      if (activeProjFilterCategory === 'LLMs & RAG') return p.category.includes('LLM') || p.category.includes('RAG');
      if (activeProjFilterCategory === 'Computer Vision') return p.category.includes('Vision');
      if (activeProjFilterCategory === 'MLOps & Infra') return p.category.includes('MLOps') || p.category.includes('Infra');
      return p.category === activeProjFilterCategory;
    });
  }

  if (filtered.length === 0) {
    container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  container.style.display = 'grid';

  container.innerHTML = filtered.map(p => {
    const coverSrc = p.coverImage || 'assets/project_placeholder.jpg';
    const metricsHtml = (p.metrics || []).slice(0, 2).map(m => `<span class="metric-tag">${m.label}: <strong>${m.value}</strong></span>`).join('');
    const techTagsHtml = (p.technologies || []).slice(0, 4).map(t => `<span style="font-size:0.75rem; background:rgba(255,255,255,0.06); padding:0.2rem 0.5rem; border-radius:4px; color:var(--text-secondary);">${t}</span>`).join('');

    return `
      <div class="project-card" data-slug="${p.slug}">
        <div class="project-img-wrapper" style="cursor:pointer;" onclick="openProjectModal('${p.slug}')">
          <img src="${coverSrc}" alt="${p.title}" class="project-img" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600';">
          <span class="project-badge">${p.category}</span>
        </div>
        <div class="project-content">
          <h3 class="project-title" style="cursor:pointer;" onclick="openProjectModal('${p.slug}')">${p.title}</h3>
          <p class="project-desc">${p.shortDescription || p.description.slice(0, 120)}</p>
          ${techTagsHtml ? `<div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.8rem;">${techTagsHtml}</div>` : ''}
          ${metricsHtml ? `<div class="project-metrics">${metricsHtml}</div>` : ''}
          <div class="project-footer" style="display:flex; gap:0.8rem; flex-wrap:wrap; align-items:center; justify-content:space-between; margin-top:1rem;">
            <button type="button" onclick="openProjectModal('${p.slug}')" class="project-link" style="background:none; border:none; cursor:pointer; color:var(--accent-color); font-weight:600;">
              View Details <i class="fas fa-arrow-right"></i>
            </button>
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="project-link" style="color:var(--text-secondary); font-size:0.85rem;"><i class="fab fa-github"></i> Code</a>` : ''}
            ${p.liveDemoUrl ? `<a href="${p.liveDemoUrl}" target="_blank" class="project-link" style="color:var(--accent-color); font-size:0.85rem;"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 4. Open Public Project Detail Modal
async function openProjectModal(projIdOrSlug) {
  let project = PROJECTS_ITEMS.find(p => p.id === projIdOrSlug || p.slug === projIdOrSlug);

  if (!project && typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(projIdOrSlug);
      const query = isUuid 
        ? supabaseClient.from('projects').select('*').eq('id', projIdOrSlug).single()
        : supabaseClient.from('projects').select('*').eq('slug', projIdOrSlug).single();
      const { data } = await query;
      if (data) {
        project = {
          id: data.id,
          title: data.title,
          slug: data.slug,
          shortDescription: data.short_description,
          description: data.description,
          category: data.category,
          technologies: data.technologies || [],
          coverImage: data.cover_image,
          githubUrl: data.github_url,
          liveDemoUrl: data.live_demo_url,
          documentationUrl: data.documentation_url,
          paperUrl: data.paper_url,
          demoVideoUrl: data.demo_video_url,
          metrics: data.metrics || [],
          content: data.content || ''
        };
      }
    } catch (e) { console.warn(e); }
  }

  if (!project) return;

  const modal = document.getElementById('projectReaderModal');
  if (!modal) return;

  window.location.hash = `#project/${project.slug}`;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');

  const heroWrapper = document.getElementById('projCoverHeroWrapper');
  const coverImg = document.getElementById('projDetailCoverImg');
  if (project.coverImage) {
    if (coverImg) coverImg.src = project.coverImage;
    if (heroWrapper) heroWrapper.style.display = 'block';
  } else {
    if (heroWrapper) heroWrapper.style.display = 'none';
  }

  const badge = document.getElementById('projDetailBadge');
  const title = document.getElementById('projDetailTitle');
  const shortDesc = document.getElementById('projDetailShortDesc');
  const techWrapper = document.getElementById('projDetailTech');
  const linksRow = document.getElementById('projDetailLinksRow');
  const metricsSection = document.getElementById('projDetailMetricsSection');
  const metricsGrid = document.getElementById('projDetailMetricsGrid');
  const body = document.getElementById('projDetailBody');

  if (badge) badge.textContent = project.category || 'AI / ML';
  if (title) title.textContent = project.title;
  if (shortDesc) shortDesc.textContent = project.shortDescription || '';

  if (techWrapper) {
    techWrapper.innerHTML = (project.technologies || []).map(t => `<span class="tag-pill">${t}</span>`).join('');
  }

  // Render Action Links ONLY IF THEY EXIST
  if (linksRow) {
    let linksHtml = '';
    if (project.githubUrl) linksHtml += `<a href="${project.githubUrl}" target="_blank" class="btn btn-primary" style="font-size:0.85rem;"><i class="fab fa-github"></i> GitHub Repo &rarr;</a>`;
    if (project.liveDemoUrl) linksHtml += `<a href="${project.liveDemoUrl}" target="_blank" class="btn btn-outline" style="font-size:0.85rem; border-color:var(--accent-color); color:var(--accent-color);"><i class="fas fa-external-link-alt"></i> Live Demo &rarr;</a>`;
    if (project.documentationUrl) linksHtml += `<a href="${project.documentationUrl}" target="_blank" class="btn btn-outline" style="font-size:0.85rem;"><i class="fas fa-book"></i> Documentation &rarr;</a>`;
    if (project.paperUrl) linksHtml += `<a href="${project.paperUrl}" target="_blank" class="btn btn-outline" style="font-size:0.85rem;"><i class="fas fa-file-pdf"></i> Research Paper &rarr;</a>`;
    if (project.demoVideoUrl) linksHtml += `<a href="${project.demoVideoUrl}" target="_blank" class="btn btn-outline" style="font-size:0.85rem;"><i class="fab fa-youtube"></i> Demo Video &rarr;</a>`;
    linksRow.innerHTML = linksHtml;
  }

  // Render Metrics Grid ONLY IF THEY EXIST
  if (metricsSection && metricsGrid) {
    if (project.metrics && project.metrics.length > 0) {
      metricsSection.style.display = 'block';
      metricsGrid.innerHTML = project.metrics.map(m => `
        <div style="background:var(--bg-main); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid var(--border-color); text-align:center;">
          <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">${m.label}</span>
          <strong style="font-size:1.1rem; color:var(--text-primary);">${m.value}</strong>
        </div>
      `).join('');
    } else {
      metricsSection.style.display = 'none';
    }
  }

  // Render Content Markdown
  if (body) {
    const rawContent = project.content || project.description || '*No detailed overview available yet.*';
    if (typeof marked !== 'undefined') {
      body.innerHTML = marked.parse(rawContent);
    } else {
      body.innerHTML = `<p>${rawContent}</p>`;
    }

    if (typeof renderMathInElement !== 'undefined') {
      try {
        renderMathInElement(body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ]
        });
      } catch (e) { console.warn(e); }
    }
  }

  const closeBtn = document.getElementById('closeProjectModalBtn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      window.location.hash = '#portfolio';
    };
  }

  const shareBtn = document.getElementById('shareProjectLinkBtn');
  if (shareBtn) {
    shareBtn.onclick = () => {
      const url = `${window.location.origin}${window.location.pathname}#project/${project.slug}`;
      navigator.clipboard.writeText(url);
      const span = document.getElementById('copyProjTextSpan');
      if (span) span.textContent = 'Copied!';
      setTimeout(() => { if (span) span.textContent = 'Copy Link'; }, 2000);
    };
  }
}

// 5. Admin Projects Dashboard Sub-Nav & Controls
function initProjectsAdminCMS() {
  const secNavArticlesBtn = document.getElementById('secNavArticlesBtn');
  const secNavProjectsBtn = document.getElementById('secNavProjectsBtn');
  const articlesSection = document.getElementById('adminArticlesSection');
  const projectsSection = document.getElementById('adminProjectsSection');

  if (secNavArticlesBtn && secNavProjectsBtn) {
    secNavArticlesBtn.onclick = () => {
      secNavArticlesBtn.classList.add('active');
      secNavArticlesBtn.style.borderBottom = '2px solid var(--accent-color)';
      secNavArticlesBtn.style.color = 'var(--accent-color)';
      secNavProjectsBtn.classList.remove('active');
      secNavProjectsBtn.style.borderBottom = 'none';
      secNavProjectsBtn.style.color = 'var(--text-secondary)';
      if (articlesSection) articlesSection.style.display = 'block';
      if (projectsSection) projectsSection.style.display = 'none';
    };

    secNavProjectsBtn.onclick = () => {
      secNavProjectsBtn.classList.add('active');
      secNavProjectsBtn.style.borderBottom = '2px solid var(--accent-color)';
      secNavProjectsBtn.style.color = 'var(--accent-color)';
      secNavArticlesBtn.classList.remove('active');
      secNavArticlesBtn.style.borderBottom = 'none';
      secNavArticlesBtn.style.color = 'var(--text-secondary)';
      if (articlesSection) articlesSection.style.display = 'none';
      if (projectsSection) projectsSection.style.display = 'block';
      renderProjectsAdminDashboard();
    };
  }

  const addNewProjectBtn = document.getElementById('addNewProjectBtn');
  const emptyAddBtn = document.getElementById('emptyStateAddProjectBtn');
  if (addNewProjectBtn) addNewProjectBtn.onclick = () => openProjectEditor();
  if (emptyAddBtn) emptyAddBtn.onclick = () => openProjectEditor();

  const searchInput = document.getElementById('adminProjSearchInput');
  if (searchInput) {
    searchInput.oninput = () => renderProjectsAdminDashboard();
  }

  const filterTabs = document.querySelectorAll('#adminProjFilterTabs .admin-tab-btn');
  filterTabs.forEach(btn => {
    btn.onclick = () => {
      filterTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeProjFilterStatus = btn.getAttribute('data-projfilter');
      renderProjectsAdminDashboard();
    };
  });
}

function renderProjectsAdminDashboard() {
  const tbody = document.getElementById('adminProjTableBody');
  const emptyState = document.getElementById('adminProjTableEmptyState');
  if (!tbody) return;

  const statFeatured = document.getElementById('statFeaturedCount');
  if (statFeatured) {
    statFeatured.textContent = PROJECTS_ITEMS.filter(p => p.featured).length;
  }

  let items = [...PROJECTS_ITEMS];

  if (activeProjFilterStatus === 'Published') items = items.filter(p => p.published);
  else if (activeProjFilterStatus === 'Draft') items = items.filter(p => !p.published || p.status === 'Draft');
  else if (activeProjFilterStatus === 'Featured') items = items.filter(p => p.featured);

  const searchVal = (document.getElementById('adminProjSearchInput')?.value || '').toLowerCase().trim();
  if (searchVal) {
    items = items.filter(p => 
      p.title.toLowerCase().includes(searchVal) ||
      p.category.toLowerCase().includes(searchVal) ||
      (p.technologies || []).some(t => t.toLowerCase().includes(searchVal)) ||
      p.shortDescription.toLowerCase().includes(searchVal)
    );
  }

  if (items.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = items.map((p, idx) => {
    const coverThumb = p.coverImage 
      ? `<img src="${p.coverImage}" style="width:40px; height:30px; object-fit:cover; border-radius:4px;">`
      : `<div style="width:40px; height:30px; background:var(--bg-main); border-radius:4px; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:0.7rem;"><i class="fas fa-image"></i></div>`;

    const statusBadge = p.published
      ? `<span class="status-pill status-pub"><i class="fas fa-check"></i> Published</span>`
      : `<span class="status-pill status-draft"><i class="fas fa-pencil-alt"></i> Draft</span>`;

    const featuredStar = p.featured 
      ? `<i class="fas fa-star" style="color:gold;"></i>` 
      : `<i class="far fa-star" style="color:var(--text-secondary);"></i>`;

    return `
      <tr>
        <td>${coverThumb}</td>
        <td><strong>${p.title}</strong><br><span style="font-size:0.75rem; color:var(--text-secondary);">/${p.slug}</span></td>
        <td><span class="type-tag">${p.category}</span></td>
        <td>${statusBadge}</td>
        <td style="text-align:center; cursor:pointer;" onclick="toggleProjectFeatured('${p.id}')">${featuredStar}</td>
        <td style="font-size:0.8rem; color:var(--text-secondary);">${p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Just now'}</td>
        <td>
          <div style="display:flex; gap:0.2rem;">
            <button onclick="reorderProject('${p.id}', 'up')" class="btn-icon" title="Move Up"><i class="fas fa-arrow-up"></i></button>
            <button onclick="reorderProject('${p.id}', 'down')" class="btn-icon" title="Move Down"><i class="fas fa-arrow-down"></i></button>
          </div>
        </td>
        <td>
          <div class="row-actions">
            <button onclick="openProjectEditor('${p.id}')" class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>
            <button onclick="openProjectModal('${p.id}')" class="btn-icon" title="Preview"><i class="fas fa-eye"></i></button>
            <button onclick="duplicateProject('${p.id}')" class="btn-icon" title="Duplicate"><i class="fas fa-copy"></i></button>
            <button onclick="togglePublishProject('${p.id}', ${!p.published})" class="btn-icon" title="${p.published ? 'Unpublish' : 'Publish'}"><i class="fas fa-${p.published ? 'eye-slash' : 'paper-plane'}"></i></button>
            <button onclick="deleteProject('${p.id}')" class="btn-icon delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 6. Open Project Editor
function openProjectEditor(projectId = null) {
  activeEditingProjectId = projectId;
  const editorView = document.getElementById('adminProjectEditorView');
  const headerTitle = document.getElementById('projectEditorHeaderTitle');

  if (editorView) {
    document.querySelectorAll('.admin-view').forEach(v => v.style.display = 'none');
    editorView.style.display = 'block';
    window.location.hash = projectId ? `#admin/projects/edit/${projectId}` : '#admin/projects/new';
  }

  const projTitle = document.getElementById('projTitle');
  const projSlug = document.getElementById('projSlug');
  const projCategory = document.getElementById('projCategory');
  const projShortDesc = document.getElementById('projShortDesc');
  const projTech = document.getElementById('projTech');
  const projCoverUrl = document.getElementById('projCoverUrl');
  const projCoverPreviewWrapper = document.getElementById('projCoverPreviewWrapper');
  const projCoverPreviewImg = document.getElementById('projCoverPreviewImg');
  const projGithub = document.getElementById('projGithub');
  const projLiveDemo = document.getElementById('projLiveDemo');
  const projDocs = document.getElementById('projDocs');
  const projPaper = document.getElementById('projPaper');
  const projDemoVideo = document.getElementById('projDemoVideo');
  const projFeatured = document.getElementById('projFeatured');
  const projContentTextarea = document.getElementById('projContentTextarea');

  if (projectId) {
    const proj = PROJECTS_ITEMS.find(p => p.id === projectId);
    if (proj) {
      if (headerTitle) headerTitle.textContent = `Edit Project: ${proj.title}`;
      if (projTitle) projTitle.value = proj.title;
      if (projSlug) projSlug.value = proj.slug;
      if (projCategory) projCategory.value = proj.category || 'AI / Machine Learning';
      if (projShortDesc) projShortDesc.value = proj.shortDescription || '';
      if (projTech) projTech.value = (proj.technologies || []).join(', ');
      if (projCoverUrl) projCoverUrl.value = proj.coverImage || '';
      if (projCoverUrl && proj.coverImage && projCoverPreviewWrapper && projCoverPreviewImg) {
        projCoverPreviewImg.src = proj.coverImage;
        projCoverPreviewWrapper.style.display = 'block';
      } else if (projCoverPreviewWrapper) {
        projCoverPreviewWrapper.style.display = 'none';
      }
      if (projGithub) projGithub.value = proj.githubUrl || '';
      if (projLiveDemo) projLiveDemo.value = proj.liveDemoUrl || '';
      if (projDocs) projDocs.value = proj.documentationUrl || '';
      if (projPaper) projPaper.value = proj.paperUrl || '';
      if (projDemoVideo) projDemoVideo.value = proj.demoVideoUrl || '';
      if (projFeatured) projFeatured.checked = Boolean(proj.featured);
      if (projContentTextarea) projContentTextarea.value = proj.content || '';
      projMetricsState = proj.metrics ? [...proj.metrics] : [];
    }
  } else {
    if (headerTitle) headerTitle.textContent = `Create New ML Project`;
    if (projTitle) projTitle.value = '';
    if (projSlug) projSlug.value = '';
    if (projCategory) projCategory.value = 'AI / Machine Learning';
    if (projShortDesc) projShortDesc.value = '';
    if (projTech) projTech.value = '';
    if (projCoverUrl) projCoverUrl.value = '';
    if (projCoverPreviewWrapper) projCoverPreviewWrapper.style.display = 'none';
    if (projGithub) projGithub.value = '';
    if (projLiveDemo) projLiveDemo.value = '';
    if (projDocs) projDocs.value = '';
    if (projPaper) projPaper.value = '';
    if (projDemoVideo) projDemoVideo.value = '';
    if (projFeatured) projFeatured.checked = false;
    if (projContentTextarea) projContentTextarea.value = '';
    projMetricsState = [];
  }

  renderMetricsEditorList();
  bindProjectEditorEvents();
}

function bindProjectEditorEvents() {
  const backBtn = document.getElementById('backToProjectsDashboardBtn');
  if (backBtn) {
    backBtn.onclick = () => {
      window.location.hash = '#admin/dashboard';
      const editorView = document.getElementById('adminProjectEditorView');
      const dashboardView = document.getElementById('adminDashboardView');
      if (editorView) editorView.style.display = 'none';
      if (dashboardView) dashboardView.style.display = 'block';
      renderProjectsAdminDashboard();
    };
  }

  const saveDraftBtn = document.getElementById('saveProjDraftBtn');
  const publishBtn = document.getElementById('publishProjBtn');
  if (saveDraftBtn) saveDraftBtn.onclick = () => saveProject('Draft');
  if (publishBtn) publishBtn.onclick = () => {
    if (confirm("Publish this project live to the public portfolio?")) {
      saveProject('Published');
    }
  };

  const uploadBtn = document.getElementById('uploadProjCoverBtn');
  const fileInput = document.getElementById('projCoverFileInput');
  const removeBtn = document.getElementById('removeProjCoverBtn');
  const coverUrlInput = document.getElementById('projCoverUrl');

  if (uploadBtn && fileInput) {
    uploadBtn.onclick = () => fileInput.click();
    fileInput.onchange = async () => {
      if (!fileInput.files || !fileInput.files[0]) return;
      const file = fileInput.files[0];
      
      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        showToast("Uploading project cover image to Supabase Storage...");
        const filePath = `cover-${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
        const { data, error } = await supabaseClient.storage.from('project-images').upload(filePath, file);
        if (error) {
          alert(`Image upload failed: ${error.message}`);
          return;
        }
        if (data) {
          const { data: pubUrlData } = supabaseClient.storage.from('project-images').getPublicUrl(filePath);
          if (pubUrlData && pubUrlData.publicUrl) {
            coverUrlInput.value = pubUrlData.publicUrl;
            const previewImg = document.getElementById('projCoverPreviewImg');
            const previewWrapper = document.getElementById('projCoverPreviewWrapper');
            if (previewImg) previewImg.src = pubUrlData.publicUrl;
            if (previewWrapper) previewWrapper.style.display = 'block';
            showToast("Project cover image uploaded cleanly!");
          }
        }
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          coverUrlInput.value = e.target.result;
          const previewImg = document.getElementById('projCoverPreviewImg');
          const previewWrapper = document.getElementById('projCoverPreviewWrapper');
          if (previewImg) previewImg.src = e.target.result;
          if (previewWrapper) previewWrapper.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    };
  }

  if (removeBtn && coverUrlInput) {
    removeBtn.onclick = () => {
      coverUrlInput.value = '';
      const previewWrapper = document.getElementById('projCoverPreviewWrapper');
      if (previewWrapper) previewWrapper.style.display = 'none';
    };
  }

  const addMetricBtn = document.getElementById('addMetricBtn');
  if (addMetricBtn) {
    addMetricBtn.onclick = () => {
      const label = prompt("Enter Metric Label (e.g. Accuracy, Latency, FPS):");
      if (!label) return;
      const value = prompt(`Enter Value for ${label} (e.g. 94.8%, 18 ms):`);
      if (!value) return;
      projMetricsState.push({ label: label.trim(), value: value.trim() });
      renderMetricsEditorList();
    };
  }
}

function renderMetricsEditorList() {
  const container = document.getElementById('projMetricsEditorList');
  if (!container) return;

  if (projMetricsState.length === 0) {
    container.innerHTML = `<span style="font-size:0.8rem; color:var(--text-secondary); text-align:center; display:block;">No metrics added yet.</span>`;
    return;
  }

  container.innerHTML = projMetricsState.map((m, idx) => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-main); padding:0.4rem 0.6rem; border-radius:4px; border:1px solid var(--border-color); font-size:0.85rem;">
      <span><strong>${m.label}:</strong> ${m.value}</span>
      <button type="button" onclick="deleteMetric(${idx})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fas fa-times"></i></button>
    </div>
  `).join('');
}

function deleteMetric(idx) {
  projMetricsState.splice(idx, 1);
  renderMetricsEditorList();
}

// 7. Save Project (CREATE vs EDIT Mode with Supabase)
async function saveProject(status = 'Draft', isAutosave = false) {
  const titleInput = document.getElementById('projTitle');
  const slugInput = document.getElementById('projSlug');
  const catInput = document.getElementById('projCategory');
  const shortDescInput = document.getElementById('projShortDesc');
  const techInput = document.getElementById('projTech');
  const coverUrlInput = document.getElementById('projCoverUrl');
  const githubInput = document.getElementById('projGithub');
  const liveDemoInput = document.getElementById('projLiveDemo');
  const docsInput = document.getElementById('projDocs');
  const paperInput = document.getElementById('projPaper');
  const demoVideoInput = document.getElementById('projDemoVideo');
  const featuredInput = document.getElementById('projFeatured');
  const contentInput = document.getElementById('projContentTextarea');

  const titleVal = titleInput ? titleInput.value.trim() : '';
  if (!titleVal && !isAutosave) {
    alert("Please enter a project title.");
    return;
  }

  const isEditMode = Boolean(activeEditingProjectId);
  let baseSlug = slugInput && slugInput.value.trim() 
    ? slugInput.value.trim() 
    : (titleVal.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') || 'new-project');
  let finalSlug = baseSlug;

  if (isEditMode) {
    const otherItemWithSlug = PROJECTS_ITEMS.find(p => p.slug === finalSlug && p.id !== activeEditingProjectId);
    if (otherItemWithSlug) {
      alert("This slug is already used by another project.");
      return;
    }
  } else {
    let counter = 2;
    while (PROJECTS_ITEMS.some(p => p.slug === finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  const techArr = techInput ? techInput.value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const payload = {
    title: titleVal || 'Untitled Project',
    slug: finalSlug,
    short_description: shortDescInput ? shortDescInput.value.trim() : '',
    description: shortDescInput ? shortDescInput.value.trim() : '',
    category: catInput ? catInput.value : 'AI / Machine Learning',
    technologies: techArr,
    cover_image: coverUrlInput ? coverUrlInput.value.trim() : '',
    github_url: githubInput ? githubInput.value.trim() : '',
    live_demo_url: liveDemoInput ? liveDemoInput.value.trim() : '',
    documentation_url: docsInput ? docsInput.value.trim() : '',
    paper_url: paperInput ? paperInput.value.trim() : '',
    demo_video_url: demoVideoInput ? demoVideoInput.value.trim() : '',
    featured: featuredInput ? featuredInput.checked : false,
    published: (status === 'Published'),
    status: status,
    metrics: projMetricsState,
    content: contentInput ? contentInput.value : '',
    updated_at: new Date().toISOString()
  };

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    let res;
    if (isEditMode) {
      res = await supabaseClient.from('projects').update(payload).eq('id', activeEditingProjectId).select().single();
    } else {
      res = await supabaseClient.from('projects').insert([payload]).select().single();
    }

    if (res.error) {
      console.error("Supabase Project Save Error:", res.error);
      if (!isAutosave) {
        alert(`Unable to save project to Supabase: ${res.error.message}`);
      }
      return;
    }

    if (res.data && res.data.id) {
      activeEditingProjectId = res.data.id;
    }
  }

  await fetchProjectsFromSupabase();
  initProjectsSection();
  renderProjectsAdminDashboard();

  if (!isAutosave) {
    showToast(`Project saved cleanly as ${status}!`);
    window.location.hash = '#admin/dashboard';
    const editorView = document.getElementById('adminProjectEditorView');
    const dashboardView = document.getElementById('adminDashboardView');
    if (editorView) editorView.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'block';
  }
}

// 8. Toggle Publish / Featured / Reorder / Duplicate / Delete
async function togglePublishProject(id, shouldPublish) {
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    const { error } = await supabaseClient.from('projects').update({
      published: shouldPublish,
      status: shouldPublish ? 'Published' : 'Draft',
      updated_at: new Date().toISOString()
    }).eq('id', id);

    if (error) {
      alert(`Publish toggle failed: ${error.message}`);
      return;
    }
  }

  await fetchProjectsFromSupabase();
  initProjectsSection();
  renderProjectsAdminDashboard();
  showToast(`Project status updated.`);
}

async function toggleProjectFeatured(id) {
  const proj = PROJECTS_ITEMS.find(p => p.id === id);
  if (!proj) return;

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    await supabaseClient.from('projects').update({ featured: !proj.featured }).eq('id', id);
  }

  await fetchProjectsFromSupabase();
  initProjectsSection();
  renderProjectsAdminDashboard();
}

async function duplicateProject(id) {
  const proj = PROJECTS_ITEMS.find(p => p.id === id);
  if (!proj) return;

  const dupPayload = {
    title: `${proj.title} (Copy)`,
    slug: `${proj.slug}-copy-${Date.now()}`,
    short_description: proj.shortDescription,
    description: proj.description,
    category: proj.category,
    technologies: proj.technologies,
    cover_image: proj.coverImage,
    github_url: proj.githubUrl,
    live_demo_url: proj.liveDemoUrl,
    documentation_url: proj.documentationUrl,
    paper_url: proj.paperUrl,
    demo_video_url: proj.demoVideoUrl,
    featured: false,
    published: false,
    status: 'Draft',
    metrics: proj.metrics,
    content: proj.content
  };

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    const { error } = await supabaseClient.from('projects').insert([dupPayload]);
    if (error) {
      alert(`Duplicate project failed: ${error.message}`);
      return;
    }
  }

  await fetchProjectsFromSupabase();
  renderProjectsAdminDashboard();
  showToast(`Duplicated project draft created.`);
}

async function reorderProject(id, direction) {
  const idx = PROJECTS_ITEMS.findIndex(p => p.id === id);
  if (idx < 0) return;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= PROJECTS_ITEMS.length) return;

  const currentProj = PROJECTS_ITEMS[idx];
  const targetProj = PROJECTS_ITEMS[targetIdx];

  const currentOrder = currentProj.displayOrder || idx;
  const targetOrder = targetProj.displayOrder || targetIdx;

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    await supabaseClient.from('projects').update({ display_order: targetOrder }).eq('id', currentProj.id);
    await supabaseClient.from('projects').update({ display_order: currentOrder }).eq('id', targetProj.id);
  }

  await fetchProjectsFromSupabase();
  initProjectsSection();
  renderProjectsAdminDashboard();
}

async function deleteProject(id) {
  const proj = PROJECTS_ITEMS.find(p => p.id === id);
  if (!proj) return;

  if (confirm(`Are you sure you want to permanently delete the project "${proj.title}"?`)) {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      const { error } = await supabaseClient.from('projects').delete().eq('id', id);
      if (error) {
        alert(`Delete failed: ${error.message}`);
        return;
      }
    }

    await fetchProjectsFromSupabase();
    initProjectsSection();
    renderProjectsAdminDashboard();
    showToast(`Project permanently deleted.`);
  }
}
