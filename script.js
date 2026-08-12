document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for navigation links
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
});
