document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------
  // Internship Status Logic
  // --------------------------------------------------------
  const internshipBadges = document.querySelectorAll('#internship-badge, .internship-status-badge');
  const internshipDates = document.querySelectorAll('#internship-date, .internship-date-text');
  
  if (internshipBadges.length > 0 && internshipDates.length > 0) {
    const startDate = new Date('2026-08-15T00:00:00');
    const endDate = new Date('2026-11-15T00:00:00');
    const now = new Date();
    
    let badgeText = '';
    let dateText = '';
    let badgeColor = '';
    let badgeBg = '';
    let badgeBorder = '';
    
    if (now < startDate) {
      badgeText = 'INCOMING';
      dateText = '15 AUG 2026';
    } else if (now >= startDate && now <= endDate) {
      badgeText = 'CURRENT';
      badgeColor = 'var(--bg)';
      badgeBg = 'var(--accent-primary)';
      dateText = 'AUG 2026 — NOV 2026';
    } else {
      badgeText = 'COMPLETED';
      badgeColor = 'var(--text-muted)';
      badgeBorder = '1px solid var(--border-subtle)';
      dateText = 'AUG 2026 — NOV 2026';
    }
    
    internshipBadges.forEach(badge => {
      badge.textContent = badgeText;
      if (badgeColor) badge.style.color = badgeColor;
      if (badgeBg) badge.style.background = badgeBg;
      if (badgeBorder) badge.style.border = badgeBorder;
    });
    
    internshipDates.forEach(dateEl => {
      if (dateEl.id === 'internship-date' && now < startDate) {
        dateEl.textContent = 'STARTING 15 AUG 2026';
      } else {
        dateEl.textContent = dateText;
      }
    });
  }
  const navLinks = document.querySelectorAll('.nav-links a');
  const navbar = document.querySelector('.navbar');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        // Calculate offset for the sticky navbar
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Navbar scroll styling
  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  // Init on load
  handleScroll();

  // Scroll Reveal System using Intersection Observer
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    });
  }, revealOptions);

  revealElements.forEach(el => {
    revealOnScroll.observe(el);
  });

  // Active Navigation State
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-links a');

  const navObserverOptions = {
    threshold: 0.2,
    rootMargin: "-20% 0px -60% 0px"
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href').substring(1) === entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => {
    if (section.id) {
      navObserver.observe(section);
    }
  });

  // --------------------------------------------------------
  // Email Clipboard Copy
  // --------------------------------------------------------
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-email');
      const originalText = 'EMAIL';
      
      try {
        await navigator.clipboard.writeText(email);
        copyEmailBtn.innerText = '✓ COPIED';
        copyEmailBtn.style.color = 'var(--accent-primary)';
      } catch (err) {
        console.error('Failed to copy email: ', err);
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          copyEmailBtn.innerText = '✓ COPIED';
          copyEmailBtn.style.color = 'var(--accent-primary)';
        } catch (fallbackErr) {
          copyEmailBtn.innerText = 'FAILED';
        }
        document.body.removeChild(textArea);
      }
      
      setTimeout(() => {
        copyEmailBtn.innerText = originalText;
        copyEmailBtn.style.color = '';
      }, 2000);
    });
  }

  // --------------------------------------------------------
  // Ambient Motion System - Living Neural Grid
  // --------------------------------------------------------
  const canvas = document.getElementById('neural-canvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];
    let isMobile = window.innerWidth < 768;
    let nodeCount = isMobile ? 35 : 75;
    const maxDistance = isMobile ? 120 : 160;
    
    let mouse = { x: -1000, y: -1000 };
    
    // Resize handler
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = document.getElementById('hero').offsetHeight;
      isMobile = window.innerWidth < 768;
    };
    
    window.addEventListener('resize', () => {
      resize();
      initNodes();
    });
    
    // Mouse tracking for desktop
    if (!isMobile) {
      document.getElementById('hero').addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      document.getElementById('hero').addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
      });
    }

    class Node {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3; // Very slow, organic movement
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.2 + 0.5;
        this.baseAlpha = Math.random() * 0.5 + 0.1;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges smoothly
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Mouse interaction (subtle glow and pull)
        let alpha = this.baseAlpha;
        if (!isMobile) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            alpha = Math.min(1, alpha + (120 - dist) / 250);
            // Subtle gravitational pull
            this.x += dx * 0.002;
            this.y += dy * 0.002;
          }
        }
        
        ctx.fillStyle = `rgba(79, 140, 255, ${alpha})`;
        ctx.fill();
      }
    }
    
    const initNodes = () => {
      nodes = [];
      nodeCount = isMobile ? 35 : 75;
      for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node());
      }
    };
    
    // Data Pulse
    let activePulse = null;
    const triggerPulse = () => {
      if (Math.random() > 0.015) return; // Very rare occurrence
      if (!nodes.length) return;
      
      const startNode = nodes[Math.floor(Math.random() * nodes.length)];
      // Find a connected node
      let targetNode = null;
      for (const node of nodes) {
        if (node !== startNode) {
          const dx = startNode.x - node.x;
          const dy = startNode.y - node.y;
          if (Math.sqrt(dx * dx + dy * dy) < maxDistance) {
            targetNode = node;
            break;
          }
        }
      }
      
      if (targetNode) {
        activePulse = {
          start: startNode,
          end: targetNode,
          progress: 0
        };
      }
    };

    let animationFrameId;
    let isVisible = true;

    // Optimize with IntersectionObserver to only animate when Hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    });
    heroObserver.observe(document.getElementById('hero'));

    const animate = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);
        
        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].update();
          nodes[i].draw();
          
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < maxDistance) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              // Calculate opacity based on distance
              const alpha = (1 - dist / maxDistance) * 0.12; // Extremely faint
              ctx.strokeStyle = `rgba(168, 175, 186, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
        
        // Handle Pulse
        if (activePulse) {
          activePulse.progress += 0.015; // Speed of pulse
          if (activePulse.progress >= 1) {
            activePulse = null;
          } else {
            const px = activePulse.start.x + (activePulse.end.x - activePulse.start.x) * activePulse.progress;
            const py = activePulse.start.y + (activePulse.end.y - activePulse.start.y) * activePulse.progress;
            
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(79, 140, 255, 0.8)';
            ctx.shadowColor = 'rgba(79, 140, 255, 0.5)';
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
          }
        } else {
          triggerPulse();
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    
    resize();
    initNodes();
    animate();
  }

  // --------------------------------------------------------
  // Contact Form Submission (EmailJS + Toast Notifications)
  // --------------------------------------------------------
  
  const EMAILJS_PUBLIC_KEY = 'fY6cC1Y-fHontjpz0';
  const EMAILJS_SERVICE_ID = 'service_pkytpuo';
  const EMAILJS_TEMPLATE_ID = 'template_vdvn5eu';

  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // Toast Notification System
  const toastContainer = document.getElementById('toast-container');
  const showToast = (message, type = 'success') => {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = 'var(--radius-sm)';
    toast.style.fontFamily = 'var(--font-sans)';
    toast.style.fontSize = '0.9375rem';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '0.75rem';
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    
    if (type === 'success') {
      toast.style.background = 'rgba(16, 185, 129, 0.95)';
      toast.style.color = '#fff';
      toast.style.border = '1px solid #10B981';
      toast.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ${message}`;
    } else {
      toast.style.background = 'rgba(239, 68, 68, 0.95)';
      toast.style.color = '#fff';
      toast.style.border = '1px solid #EF4444';
      toast.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${message}`;
    }

    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    // Remove after 5s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  };

  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnLoader = submitBtn ? submitBtn.querySelector('.btn-loader') : null;

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const messageInput = document.getElementById('contact-message');
      
      const nameError = document.getElementById('name-error');
      const emailError = document.getElementById('email-error');
      const messageError = document.getElementById('message-error');

      // Reset errors
      nameInput.classList.remove('error');
      emailInput.classList.remove('error');
      messageInput.classList.remove('error');
      nameError.textContent = '';
      emailError.textContent = '';
      messageError.textContent = '';

      let isValid = true;

      // Validate
      if (!nameInput.value.trim()) {
        nameInput.classList.add('error');
        nameError.textContent = 'Name is required';
        isValid = false;
      }

      if (!emailInput.value.trim()) {
        emailInput.classList.add('error');
        emailError.textContent = 'Email is required';
        isValid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        emailInput.classList.add('error');
        emailError.textContent = 'Please enter a valid email';
        isValid = false;
      }

      if (!messageInput.value.trim()) {
        messageInput.classList.add('error');
        messageError.textContent = 'Message is required';
        isValid = false;
      }

      if (!isValid) return;

      // Spam Protection / Rate Limiting (1 message per 30 seconds)
      const lastSentTime = localStorage.getItem('lastMessageSentAt');
      const now = new Date().getTime();
      const cooldown = 30 * 1000; // 30 seconds in ms
      if (lastSentTime && now - parseInt(lastSentTime) < cooldown) {
        const remainingMs = cooldown - (now - parseInt(lastSentTime));
        const remainingSec = Math.ceil(remainingMs / 1000);
        showToast(`Please wait ${remainingSec} seconds before sending another message.`, 'error');
        return;
      }

      // Loading state
      submitBtn.disabled = true;
      btnText.textContent = 'Sending Message...';
      btnLoader.style.display = 'inline-block';

      try {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        // Send Email via EmailJS
        if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
          const templateParams = {
            name: name,
            email: email,
            message: message,
            time: new Date().toLocaleString()
          };
          
          console.log("Sending EmailJS payload:", { name, email, message, time: templateParams.time });
          
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
          
          // Success
          localStorage.setItem('lastMessageSentAt', now.toString());
          contactForm.reset();
          showToast('Message sent successfully!', 'success');
          btnText.textContent = '✓ Message Sent';
          // revert after short delay
          setTimeout(() => {
            btnText.textContent = 'SEND MESSAGE';
          }, 3000);
        } else {
          console.warn("EmailJS is not configured.");
          showToast('Email service is not configured yet.', 'error');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        showToast('Something went wrong. Please try again later or email me directly.', 'error');
      } finally {
        // Reset loading state
        submitBtn.disabled = false;
        if (btnText.textContent !== '✓ Message Sent') {
            btnText.textContent = 'SEND MESSAGE';
        }
        btnLoader.style.display = 'none';
      }
    });
  }

  // --- Global Copy Email Handlers ---
  const copyButtons = [
    document.getElementById('copy-email-btn'), // Hero section
    document.getElementById('copy-email-contact-btn') // Contact section
  ];

  copyButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        // Prevent clicking the card behind it
        e.preventDefault();
        e.stopPropagation();

        const email = btn.dataset.email;
        navigator.clipboard.writeText(email).then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'COPIED!';
          btn.style.color = '#10B981';
          btn.style.borderColor = '#10B981';
          
          showToast('Email address copied to clipboard!', 'success');

          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.color = '';
            btn.style.borderColor = '';
          }, 2000);
        });
      });
    }
  });

});
