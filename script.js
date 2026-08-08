/* ==========================================================================
   Step. Theme - Machine Learning Engineer Portfolio JavaScript
   Features: Ambient Particles, ML Model Playground, Theme Switcher,
             Filterable Projects, CV Viewer Modal, Toast Alerts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticleBackground();
  initThemeSwitcher();
  initNavigation();
  initMLPlayground();
  initPortfolioFilter();
  initModals();
  initContactForm();
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
   7. Contact Form & Toast System
   ========================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value;
      showToast(`Thank you, ${name}! Your message has been received.`);
      form.reset();
    });
  }
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
