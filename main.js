// ===================================================================
// ===== LÓGICA DEL LOADER FINAL (CONTROL TOTAL CON JS) =====
// ===================================================================
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    // --- Elementos del DOM ---
    const loaderContent = document.querySelector('.loader-content');
    const loaderFlash = document.querySelector('.loader-flash');
    const progressPercentage = document.querySelector('.progress-percentage');
    const progressText = document.querySelector('.progress-text');
    const progressBar = document.querySelector('.progress-bar');

    document.body.style.overflow = 'hidden';

    // --- Crear Bloques de la Barra ---
    const blockCount = 20;
    progressBar.innerHTML = '';
    for (let i = 0; i < blockCount; i++) {
        const block = document.createElement('div');
        block.classList.add('progress-block');
        progressBar.appendChild(block);
    }
    const progressBlocks = document.querySelectorAll('.progress-block');

    // --- Textos de Carga ---
    const loadingTexts = [
        'Inicializando ecosistema...', 'Configurando Dynamics 365...',
        'Activando Power Platform...', 'Conectando a Azure Cloud...',
        'Optimizando con IA...', 'Finalizando...'
    ];
    
    let progress = 0;
    let textIndex = 0;

    // --- Función de Carga ---
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            updateProgressUI(progress); // Última actualización al 100%
            startOutroAnimation();
        } else {
            updateProgressUI(progress);
        }
    }, 200);

    // --- Función para actualizar la UI de progreso ---
    function updateProgressUI(currentProgress) {
        progressPercentage.textContent = Math.floor(currentProgress) + '%';
        const textThreshold = 100 / loadingTexts.length;
        const newTextIndex = Math.min(Math.floor(currentProgress / textThreshold), loadingTexts.length - 1);
        if (newTextIndex !== textIndex) {
            textIndex = newTextIndex;
            progressText.textContent = loadingTexts[textIndex];
        }
        const blocksToFill = Math.ceil((currentProgress / 100) * blockCount);
        progressBlocks.forEach((block, index) => {
            block.classList.toggle('filled', index < blocksToFill);
        });
    }

    // --- Secuencia de Animación Final ---
    function startOutroAnimation() {
        // Espera a que la animación del logo termine
        setTimeout(() => {
            // 1. Oculta el contenido del loader (logo y barra)
            loader.classList.add('final-sequence');

            // 2. Activa la explosión de pantalla completa
            loaderFlash.classList.add('exploding');

            // 3. Oculta el loader por completo justo después de la explosión
            setTimeout(() => {
                loader.classList.add('is-hidden');
                document.body.style.overflow = 'auto';
            }, 600); // Duración de la explosión

        }, 1000); // Tiempo para admirar el logo final
    }
});



// ======================
// PARTICLES.JS
// ======================
document.addEventListener('DOMContentLoaded', () => {
  if (window.particlesJS) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    particlesJS('particles-js', {
      particles: {
        number: { value: isMobile ? 45 : 80 },
        color: { value: ["#facc15", "#ffffff"] },
        shape: { type: "circle" },
        opacity: { value: isMobile ? 0.55 : 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.15 } },
        size: { value: isMobile ? 2.6 : 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1 } },
        line_linked: { 
          enable: !isMobile,               // sin líneas en móvil para claridad
          distance: 150, color: "#85e0ff", // tono celeste claro si se muestran
          opacity: 0.35, width: 1 
        },
        move: { enable: true, speed: isMobile ? 0.8 : 1.2, direction: "none", random: true, out_mode: "out" }
      },
      interactivity: { 
        detect_on: "window",
        events: { onhover: { enable: !isMobile, mode: "grab" }, onclick: { enable: !isMobile, mode: "push" } }
      },
      retina_detect: true
    });
  }
});


// ===== NAVIGATION FUNCTIONALITY (merge: smooth + active + typing/expand) =====
function initNavigation() {
  // --- Smooth scroll para anchors internos ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      // si es solo hash y existe el target, hacemos smooth scroll
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // --- Estado activo por página ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-menu-glass .nav-btn');
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // --- Tipado LED + expansión que empuja a los vecinos ---
  const SPEED = 35;          // ms por letra
  const EXTRA = 20;          // padding extra al ancho del texto

  const btns = [...document.querySelectorAll('.nav-menu-glass .nav-btn')];
  if (!btns.length) return;

  // Medidor invisible con misma tipografía que los botones
  const probe = document.createElement('span');
  Object.assign(probe.style, {
    position: 'absolute',
    visibility: 'hidden',
    whiteSpace: 'nowrap'
  });
  document.body.appendChild(probe);

  // Utilidad: ancho compacto desde CSS var --compact (o 52px por defecto)
  function getCompact(btn) {
    const cs = getComputedStyle(btn);
    const v = cs.getPropertyValue('--compact').trim();
    const n = parseFloat(v);
    // copia la fuente al probe para medir exacto
    probe.style.fontFamily = cs.fontFamily;
    probe.style.fontSize = cs.fontSize;
    probe.style.fontWeight = '800';
    probe.style.letterSpacing = '.01em';
    return Number.isFinite(n) ? n : 52;
  }

  btns.forEach(btn => {
    let timer = null;
    const labelEl = btn.querySelector('.btn-text');
    const label = (labelEl?.textContent || '').trim();
    const COMPACT = getCompact(btn);

    // Estado inicial compacto
    btn.style.width = COMPACT + 'px';
    btn.style.minWidth = COMPACT + 'px';
    btn.setAttribute('data-shown', '');

    function open() {
      clearInterval(timer);
      btn.classList.add('typing');
      btn.setAttribute('data-shown', '');

      // medir ancho del texto destino y expandir
      probe.textContent = label;
      const textWidth = Math.ceil(probe.offsetWidth);
      const openWidth = COMPACT + textWidth + EXTRA;
      btn.style.width = openWidth + 'px';
      btn.style.minWidth = openWidth + 'px';

      // typing rápido
      let i = 0;
      timer = setInterval(() => {
        if (i > label.length) { clearInterval(timer); return; }
        btn.setAttribute('data-shown', label.slice(0, i++));
      }, SPEED);
    }

    function close() {
      clearInterval(timer);
      btn.classList.remove('typing');
      btn.style.width = COMPACT + 'px';
      btn.style.minWidth = COMPACT + 'px';
      btn.setAttribute('data-shown', '');
    }

    btn.addEventListener('mouseenter', open);
    btn.addEventListener('mouseleave', close);
    // Accesible: teclado
    btn.addEventListener('focus', open);
    btn.addEventListener('blur', close);
  });
}



// ===== 3D TILT EFFECT =====
function init3DTilt() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', handleTilt);
        element.addEventListener('mouseleave', resetTilt);
    });
    
    function handleTilt(e) {
        const element = e.currentTarget;
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;
        
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    }
    
    function resetTilt(e) {
        const element = e.currentTarget;
        element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }
}

// ===== AURORA PARTICLES — versión suave y lenta =====
function initParticles() {
  const neuralContainer = document.getElementById('neuralNetwork');
  if (!neuralContainer) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Menos elementos y más lentos en móvil
  const P_COUNT = isMobile ? 20 : 30;
  const C_COUNT = isMobile ? 8  : 12;
  const S_COUNT = isMobile ? 3  : 4;

  for (let i = 0; i < P_COUNT; i++) createAuroraParticle();
  for (let i = 0; i < C_COUNT; i++) createAuroraConnection();
  for (let i = 0; i < S_COUNT; i++) createAuroraSpark();

  function createAuroraParticle() {
    const el = document.createElement('div');
    el.className = 'neural-particle';

    const x = Math.random() * window.innerWidth;
    const delay = Math.random() * 10;             // arranque más espaciado
    const duration = 24 + Math.random() * 28;     // 24–52s (MUCHO más lento)

    el.style.left = x + 'px';
    el.style.animationDelay = delay + 's';
    el.style.animationDuration = duration + 's';

    // color se controla por nth-child en CSS; opcional: variar leve la opacidad
    el.style.opacity = (0.16 + Math.random()*0.14).toFixed(2);

    neuralContainer.appendChild(el);

    setTimeout(() => {
      el.remove();
      createAuroraParticle();
    }, (duration + delay) * 1000);
  }

  function createAuroraConnection() {
    const el = document.createElement('div');
    el.className = 'neural-connection';

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const w = 120 + Math.random() * 260;
    const a = Math.random() * 360;
    const delay = Math.random() * 8;
    const duration = 14 + Math.random() * 10;     // 14–24s

    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = w + 'px';
    el.style.transform = `rotate(${a}deg)`;
    el.style.animationDelay = delay + 's';
    el.style.animationDuration = duration + 's';

    neuralContainer.appendChild(el);

    setTimeout(() => {
      el.remove();
      createAuroraConnection();
    }, (duration + delay) * 1000);
  }

  function createAuroraSpark() {
    const el = document.createElement('div');
    el.className = 'electric-spark';

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const delay = Math.random() * 6;
    const duration = 6 + Math.random() * 6;       // 6–12s

    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.animationDelay = delay + 's';
    el.style.animationDuration = duration + 's';

    neuralContainer.appendChild(el);

    setTimeout(() => {
      el.remove();
      createAuroraSpark();
    }, (duration + delay) * 1000);

    
  }
}

// Animaciones de scroll: entrar y salir
document.addEventListener('DOMContentLoaded', () => {
  const animatedSections = document.querySelectorAll('.scroll-section');
  if (!animatedSections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;

      // visible cuando entra al viewport
      if (entry.isIntersecting) {
        el.classList.add('visible');
        el.classList.remove('hidden');

        // opcional: typing dinámico si hay .type-effect dentro
        const title = el.querySelector('.type-effect');
        if (title && !title.dataset.typed) {
          const text = title.textContent;
          const steps = text.length;
          const duration = Math.max(1.2, Math.min(steps * 0.05, 2.5));
          title.style.setProperty('--typing-steps', steps);
          title.style.setProperty('--typing-duration', `${duration}s`);
          title.classList.add('is-typing');
          title.dataset.typed = 'true';
        }
      } else {
        // se oculta cuando sale (para “reaparecer” al volver)
        el.classList.remove('visible');
        el.classList.add('hidden');
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -15% 0px', // aparece un poco antes; desaparece al salir
    threshold: 0.15
  });

  animatedSections.forEach(section => observer.observe(section));
});




// ===== PARALLAX EFFECT =====
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.hero-visual, .floating-card');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Agregar parallax a la inicialización principal
function initAnimations() {
    initNavigation();
    init3DTilt();
    initParticles();
    initScrollAnimations();
    initParallaxEffect(); // Agregar esta línea
    initCounters();
    initFormHandling();
    initFloatingCards();
    initGlassmorphism();
    optimizePerformance();
}


// ===== COUNTER ANIMATION =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                animateCounter(entry.target);
                entry.target.classList.add('counted');
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
    
    function animateCounter(element) {
        const target = parseInt(element.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + '+';
        }, 16);
    }
}

// ===== FORM HANDLING =====
function initFormHandling() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Validate required fields
        const requiredFields = ['nombre', 'email', 'mensaje'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            const input = contactForm.querySelector(`[name="${field}"]`);
            if (!data[field] || data[field].trim() === '') {
                input.style.borderColor = '#d13438';
                isValid = false;
            } else {
                input.style.borderColor = '#0078d4';
            }
        });
        
        if (!isValid) {
            showNotification('Por favor, completa todos los campos requeridos.', 'error');
            return;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            contactForm.querySelector('[name="email"]').style.borderColor = '#d13438';
            showNotification('Por favor, ingresa un email válido.', 'error');
            return;
        }
        
        // Simulate form submission
        const submitButton = contactForm.querySelector('.btn-submit');
        const originalText = submitButton.querySelector('span').textContent;
        
        submitButton.querySelector('span').textContent = 'ENVIANDO...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            showNotification('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.', 'success');
            contactForm.reset();
            submitButton.querySelector('span').textContent = originalText;
            submitButton.disabled = false;
            
            // Reset input styles
            contactForm.querySelectorAll('input, select, textarea').forEach(input => {
                input.style.borderColor = '';
            });
        }, 2000);
    });
}


// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const colors = {
        success: '#00bcf2',
        error: '#d13438',
        info: '#0078d4'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        border-left: 4px solid ${colors[type]};
        backdrop-filter: blur(20px);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}



// ===== GLASSMORPHISM EFFECTS =====
function initGlassmorphism() {
    const glassElements = document.querySelectorAll('.nav, .floating-card, .service-card-3d, .feature-card, .contact-form-3d, .info-card-3d');
    
    glassElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255, 255, 255, 0.1)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.background = '';
            this.style.borderColor = '';
        });
    });
}

// ===== PERFORMANCE OPTIMIZATION =====
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Throttle scroll events
    let ticking = false;
    
    function updateOnScroll() {
        // Update scroll-dependent animations here
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });
}


// ===== RESIZE HANDLER =====
window.addEventListener('resize', () => {
    // Reinitialize particles on resize
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        particlesContainer.innerHTML = '';
        setTimeout(initParticles, 100);
    }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// ===== ACCESSIBILITY =====
document.addEventListener('keydown', function(e) {
    // ESC key to close modals/notifications
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
    }
    
    // Tab navigation enhancement
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Add keyboard navigation styles
const keyboardStyles = document.createElement('style');
keyboardStyles.textContent = `
    .keyboard-navigation *:focus {
        outline: 2px solid #0078d4 !important;
        outline-offset: 2px !important;
    }
`;
document.head.appendChild(keyboardStyles);


// ===== Cursor Fluido WebGL (vanilla, inspirado en WebGL Fluid + tu snippet React) =====
(function(){
  // ---------- Config por defecto (ajústalo a tu marca) ----------
  const CONFIG_DEFAULT = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,      // 1440 es bonito pero pesado; sube si tu público usa equipos potentes
    CAPTURE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 3.5,
    VELOCITY_DISSIPATION: 2.0,
    PRESSURE: 0.1,
    PRESSURE_ITERATIONS: 20,
    CURL: 2.0,
    SPLAT_RADIUS: 0.15,        // radio relativo
    SPLAT_FORCE: 4000,
    SHADING: true,
    COLOR_UPDATE_SPEED: 10,
    BACK_COLOR: { r: 0, g: 0, b: 0 }, // no se usa si TRANSPARENT=true
    TRANSPARENT: true
  };

  // ---------- API pública mínima ----------
  window.initFluidCursor = function initFluidCursor(overrides = {}){
    const config = Object.assign({}, CONFIG_DEFAULT, overrides);

    // Crear canvas overlay
    const canvas = document.createElement('canvas');
    canvas.className = 'canvas-fluid-cursor';
    canvas.id = 'fluid-cursor';
    // Nota: el CSS fija posición/z-index/pointer-events
    document.body.appendChild(canvas);

    // Arrancar motor
    startFluid(canvas, config);
  };

  // ---------- Motor principal ----------
  function startFluid(canvas, config){
    const { gl, ext, isWebGL2 } = getWebGLContext(canvas);

    if (!ext.supportLinearFiltering) {
      // Fallback seguro en equipos modestos
      config.DYE_RESOLUTION = Math.min(config.DYE_RESOLUTION, 256);
      config.SHADING = false;
    }

    // === Utils básicos ===
    function hashCode(s){ if(!s||!s.length) return 0; let h=0; for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i)|0;} return h; }
    function addKeywords(source, keywords){ if(!keywords) return source; return keywords.map(k=>`#define ${k}\n`).join('') + source; }
    function compileShader(type, source, keywords){
      source = addKeywords(source, keywords);
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.trace(gl.getShaderInfoLog(shader));
      return shader;
    }
    function createProgram(vertexShader, fragmentShader){
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.trace(gl.getProgramInfoLog(program));
      return program;
    }
    function getUniforms(program){
      const uniforms = [];
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for(let i=0;i<count;i++){
        const name = gl.getActiveUniform(program, i).name;
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      return uniforms;
    }

    class Program {
      constructor(vs, fs){ this.program = createProgram(vs, fs); this.uniforms = getUniforms(this.program); }
      bind(){ gl.useProgram(this.program); }
    }
    class Material {
      constructor(vs, fs){ this.vertexShader = vs; this.fragmentShaderSource = fs; this.programs = []; this.activeProgram = null; this.uniforms = []; }
      setKeywords(keywords){
        let hash = 0; for (let i=0;i<keywords.length;i++) hash += hashCode(keywords[i]);
        let program = this.programs[hash];
        if (!program){
          const fs = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
          program = createProgram(this.vertexShader, fs);
          this.programs[hash] = program;
        }
        if (program === this.activeProgram) return;
        this.uniforms = getUniforms(program);
        this.activeProgram = program;
      }
      bind(){ gl.useProgram(this.activeProgram); }
    }

    // === Contexto y formatos ===
    function getWebGLContext(canvas){
      const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
      let gl = canvas.getContext('webgl2', params);
      const isWebGL2 = !!gl;
      if (!isWebGL2){
        gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
      }
      gl.clearColor(0,0,0,0);

      let halfFloat, supportLinearFiltering;
      if (isWebGL2){
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = !!gl.getExtension('OES_texture_float_linear');
      } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
      }
      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat && halfFloat.HALF_FLOAT_OES);

      function supportRenderTextureFormat(internalFormat, format, type){
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        return status === gl.FRAMEBUFFER_COMPLETE;
      }
      function getSupportedFormat(internalFormat, format, type){
        if (!supportRenderTextureFormat(internalFormat, format, type)){
          switch(internalFormat){
            case gl.R16F:  return getSupportedFormat(gl.RG16F, gl.RG, type);
            case gl.RG16F: return getSupportedFormat(gl.RGBA16F, gl.RGBA, type);
            default:       return null;
          }
        }
        return { internalFormat, format };
      }

      let formatRGBA, formatRG, formatR;
      if (isWebGL2){
        formatRGBA = getSupportedFormat(gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG   = getSupportedFormat(gl.RG16F,   gl.RG,   halfFloatTexType);
        formatR    = getSupportedFormat(gl.R16F,    gl.RED,  halfFloatTexType);
      } else {
        formatRGBA = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG   = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR    = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatTexType);
      }

      return { gl, isWebGL2, ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering } };
    }

    // === Shaders base ===
    const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `);

    const copyShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      void main () { gl_FragColor = texture2D(uTexture, vUv); }
    `);

    const clearShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
    `);

    const displayShaderSource = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        #ifdef SHADING
          vec3 lc = texture2D(uTexture, vL).rgb;
          vec3 rc = texture2D(uTexture, vR).rgb;
          vec3 tc = texture2D(uTexture, vT).rgb;
          vec3 bc = texture2D(uTexture, vB).rgb;
          float dx = length(rc) - length(lc);
          float dy = length(tc) - length(bc);
          vec3 n = normalize(vec3(dx, dy, length(texelSize)));
          vec3 l = vec3(0.0, 0.0, 1.0);
          float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
          c *= diffuse;
        #endif
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }
    `;

    const splatShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `);

    const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize){
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main(){
        #ifdef MANUAL_FILTERING
          vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
          vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          vec4 result = texture2D(uSource, coord);
        #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }
    `, ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']);

    const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main(){
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `);

    const curlShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main(){
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `);

    const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
      void main(){
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uDivergence;
      void main(){
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `);

    const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uVelocity;
      void main(){
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    // === Geometría pantalla completa + blit ===
    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, -1,1, 1,1, 1,-1]), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2, 0,2,3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      return (target, clear=false) => {
        if (target == null){
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear){ gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT); }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

    // === Framebuffers ===
    function createFBO(w,h, internalFormat, format, type, param){
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0,0,w,h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        texture, fbo, width:w, height:h,
        get texelSizeX(){ return 1.0 / w; },
        get texelSizeY(){ return 1.0 / h; },
        attach(id){ gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; }
      };
    }
    function createDoubleFBO(w,h, internalFormat, format, type, param){
      let fbo1 = createFBO(w,h, internalFormat, format, type, param);
      let fbo2 = createFBO(w,h, internalFormat, format, type, param);
      return {
        width:w, height:h,
        get texelSizeX(){ return fbo1.texelSizeX; },
        get texelSizeY(){ return fbo1.texelSizeY; },
        get read(){ return fbo1; }, set read(v){ fbo1 = v; },
        get write(){ return fbo2; }, set write(v){ fbo2 = v; },
        swap(){ const t=fbo1; fbo1=fbo2; fbo2=t; }
      };
    }
    function resizeFBO(target, w,h, internalFormat, format, type, param){
      const newFBO = createFBO(w,h, internalFormat, format, type, param);
      copyProgram.bind();
      gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
      blit(newFBO);
      return newFBO;
    }
    function resizeDoubleFBO(target, w,h, internalFormat, format, type, param){
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(target.read, w,h, internalFormat, format, type, param);
      target.write = createFBO(w,h, internalFormat, format, type, param);
      target.width = w; target.height = h;
      return target;
    }
    function getResolution(res){
      let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspect < 1) aspect = 1.0 / aspect;
      const mn = Math.round(res);
      const mx = Math.round(res * aspect);
      return (gl.drawingBufferWidth > gl.drawingBufferHeight) ? { width: mx, height: mn } : { width: mn, height: mx };
    }

    // === Programas ===
    const copyProgram = new Program(baseVertexShader, copyShader);
    const clearProgram = new Program(baseVertexShader, clearShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradientSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);
    const displayMaterial = new Material(baseVertexShader, displayShaderSource);

    function updateKeywords(){
      const displayKeywords = [];
      if (config.SHADING) displayKeywords.push('SHADING');
      displayMaterial.setKeywords(displayKeywords);
    }
    updateKeywords();

    // === Estado ===
    let dye, velocity, divergence, curl, pressure;
    const pointers = [pointerPrototype()];
    function pointerPrototype(){
      return { id:-1, texcoordX:0, texcoordY:0, prevTexcoordX:0, prevTexcoordY:0, deltaX:0, deltaY:0, down:false, moved:false, color:[0,0,0] };
    }

    function initFramebuffers(){
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);
      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg   = ext.formatRG;
      const r    = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

      gl.disable(gl.BLEND);

      if (!dye) dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
      else      dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

      if (!velocity) velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
      else           velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

      divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
      curl       = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
      pressure   = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    }

    // === Bucle principal ===
    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0.0;

    function calcDeltaTime(){
      const now = Date.now();
      let dt = (now - lastUpdateTime) / 1000;
      dt = Math.min(dt, 1/60);
      lastUpdateTime = now;
      return dt;
    }
    function scaleByPixelRatio(x){ const dpr = window.devicePixelRatio || 1; return Math.floor(x * dpr); }
    function resizeCanvas(){
      const w = scaleByPixelRatio(canvas.clientWidth || window.innerWidth);
      const h = scaleByPixelRatio(canvas.clientHeight || window.innerHeight);
      if (canvas.width !== w || canvas.height !== h){
        canvas.width = w; canvas.height = h;
        gl.viewport(0,0,w,h);
        return true;
      }
      return false;
    }

    function updateColors(dt){
      colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorUpdateTimer >= 1){
        colorUpdateTimer = (colorUpdateTimer % 1);
        pointers.forEach(p => p.color = generateColor());
      }
    }

    function step(dt){
      gl.disable(gl.BLEND);

      // curl
      curlProgram.bind();
      gl.uniform2f(curlProgram.uniforms.texelSize, velocity.read.texelSizeX, velocity.read.texelSizeY);
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);

      // vorticity
      vorticityProgram.bind();
      gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.read.texelSizeX, velocity.read.texelSizeY);
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      gl.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      // divergence
      divergenceProgram.bind();
      gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.read.texelSizeX, velocity.read.texelSizeY);
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      // clear pressure
      clearProgram.bind();
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      blit(pressure.write);
      pressure.swap();

      // pressure solve
      pressureProgram.bind();
      gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.read.texelSizeX, velocity.read.texelSizeY);
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
      for(let i=0;i<config.PRESSURE_ITERATIONS;i++){
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      // subtract gradient
      gradientSubtractProgram.bind();
      gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.read.texelSizeX, velocity.read.texelSizeY);
      gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      // advect velocity
      advectionProgram.bind();
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.read.texelSizeX, velocity.read.texelSizeY);
      if (!ext.supportLinearFiltering) gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.read.texelSizeX, velocity.read.texelSizeY);
      let velId = velocity.read.attach(0);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velId);
      gl.uniform1i(advectionProgram.uniforms.uSource,   velId);
      gl.uniform1f(advectionProgram.uniforms.dt, calcDT(dt));
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      // advect dye
      if (!ext.supportLinearFiltering) gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.read.texelSizeX, dye.read.texelSizeY);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectionProgram.uniforms.uSource,   dye.read.attach(1));
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function calcDT(dt){ return dt; }

    function render(target){
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      drawDisplay(target);
    }
    function drawDisplay(target){
      const width  = target == null ? gl.drawingBufferWidth  : target.width;
      const height = target == null ? gl.drawingBufferHeight : target.height;
      displayMaterial.bind();
      if (config.SHADING) gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0/width, 1.0/height);
      gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
      blit(target);
    }

    function correctRadius(r){
      let aspect = canvas.width / canvas.height;
      if (aspect > 1) r *= aspect;
      return r;
    }
    function splat(x,y, dx,dy, color){
      // velocidad
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
      gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
      blit(velocity.write);
      velocity.swap();

      // tinte
      gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    }

    function generateColor(){
      const c = HSVtoRGB(Math.random(), 1, 1);
      c.r *= 0.15; c.g *= 0.15; c.b *= 0.15;
      return c;
    }
    function HSVtoRGB(h,s,v){
      let r,g,b,i = Math.floor(h*6), f = h*6 - i, p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s);
      switch(i%6){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;case 4:r=t;g=p;b=v;break;case 5:r=v;g=p;b=q;break;}
      return { r,g,b };
    }

    // === Puntero / inputs ===
    function updatePointerDownData(pointer, id, posX, posY){
      pointer.id = id; pointer.down = true; pointer.moved = false;
      pointer.texcoordX = posX / canvas.width; pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.prevTexcoordX = pointer.texcoordX; pointer.prevTexcoordY = pointer.texcoordY;
      pointer.deltaX = 0; pointer.deltaY = 0; pointer.color = generateColor();
    }
    function updatePointerMoveData(pointer, posX, posY, color){
      pointer.prevTexcoordX = pointer.texcoordX; pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas.width;  pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
      pointer.color = color;
    }
    function updatePointerUpData(pointer){ pointer.down = false; }
    function correctDeltaX(d){ let a = canvas.width / canvas.height; if (a < 1) d *= a; return d; }
    function correctDeltaY(d){ let a = canvas.width / canvas.height; if (a > 1) d /= a; return d; }
    function splatPointer(pointer){
      const dx = pointer.deltaX * config.SPLAT_FORCE;
      const dy = pointer.deltaY * config.SPLAT_FORCE;
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
    }
    function clickSplat(pointer){
      const color = generateColor(); color.r*=10; color.g*=10; color.b*=10;
      const dx = 10*(Math.random() - 0.5); const dy = 30*(Math.random() - 0.5);
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
    }

    // Eventos (canvas es pointer-events:none; escuchamos en window/document)
    window.addEventListener('mousedown', (e) => {
      const p = pointers[0];
      const x = scaleByPixelRatio(e.clientX), y = scaleByPixelRatio(e.clientY);
      updatePointerDownData(p, -1, x, y);
      clickSplat(p);
    });
    document.body.addEventListener('mousemove', function firstMouseMove(e){
      const p = pointers[0];
      const x = scaleByPixelRatio(e.clientX), y = scaleByPixelRatio(e.clientY);
      updatePointerMoveData(p, x, y, generateColor());
      document.body.removeEventListener('mousemove', firstMouseMove);
    });
    window.addEventListener('mousemove', (e) => {
      const p = pointers[0];
      const x = scaleByPixelRatio(e.clientX), y = scaleByPixelRatio(e.clientY);
      updatePointerMoveData(p, x, y, p.color);
    });

    document.body.addEventListener('touchstart', function firstTouchStart(e){
      const touches = e.targetTouches; const p = pointers[0];
      for (let i=0;i<touches.length;i++){
        const x = scaleByPixelRatio(touches[i].clientX), y = scaleByPixelRatio(touches[i].clientY);
        updatePointerDownData(p, touches[i].identifier, x, y);
      }
      document.body.removeEventListener('touchstart', firstTouchStart);
    });
    window.addEventListener('touchstart', (e) => {
      const touches = e.targetTouches; const p = pointers[0];
      for (let i=0;i<touches.length;i++){
        const x = scaleByPixelRatio(touches[i].clientX), y = scaleByPixelRatio(touches[i].clientY);
        updatePointerDownData(p, touches[i].identifier, x, y);
      }
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      const touches = e.targetTouches; const p = pointers[0];
      for (let i=0;i<touches.length;i++){
        const x = scaleByPixelRatio(touches[i].clientX), y = scaleByPixelRatio(touches[i].clientY);
        updatePointerMoveData(p, x, y, p.color);
      }
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
      const touches = e.changedTouches; const p = pointers[0];
      for (let i=0;i<touches.length;i++){ updatePointerUpData(p); }
    });

    // === Loop ===
    function updateFrame(){
      const dt = calcDeltaTime();
      if (resizeCanvas()) initFramebuffers();
      updateColors(dt);
      if (pointers[0].moved){ pointers[0].moved = false; splatPointer(pointers[0]); }
      step(dt);
      render(null);
      requestAnimationFrame(updateFrame);
    }

    // init
    function setCanvasSizeToViewport(){
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.display = 'block';
    }
    setCanvasSizeToViewport();
    initFramebuffers();
    updateFrame();
    window.addEventListener('resize', () => { setCanvasSizeToViewport(); }, { passive: true });
  }

  // ---------- Auto-inicializa con parámetros pensados para tu web ----------
  // Si quieres cambiar color de trazos base, duplica generateColor() o usa BACK_COLOR con TRANSPARENT=false
  window.addEventListener('load', () => {
    // Sube/baja DYE_RESOLUTION y SPLAT_FORCE para rendimiento
    initFluidCursor({
      DYE_RESOLUTION: 1024,
      SPLAT_FORCE: 6000,
      SPLAT_RADIUS: 0.22,
      SHADING: true,
      TRANSPARENT: true
    });
  });
})();

// ===== HERO: CardSwap (vanilla) — v2 robusto (lento + pausa) =====
(function () {
  function initHeroCards() {
    const container = document.getElementById('cdCardSwap');
    if (!container) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    const cards = Array.from(container.querySelectorAll('.cd-card'));
    if (cards.length < 2) return;

    // Config
    const cardDistance = 56;       // desplazamiento horizontal entre cartas
    const verticalDistance = 45;   // desplazamiento vertical (hacia arriba)
    const dropDistance = 290;      // caída de la carta frontal
    const delay = 5200;            // ⏳ ms entre swaps (antes 4000)

    // Timing/Easing
    const MOVE_DUR = 900;          // ms (antes 900)
    const DROP_DUR = 1300;         // ms (antes 1300)
    const PROMOTE_DELAY = 200;     // ms
    const EASE_MOVE = 'cubic-bezier(.22,.61,.36,1)';
    const EASE_DROP = 'cubic-bezier(.17,.67,.3,1.34)';

    let order = cards.map((_, i) => i); // 0 es la delantera
    let paused = false;
    let timer = null;

    // Helpers -------------------------------------------------
    function setZ(el, zi) { el.style.zIndex = String(zi); }
    function setTransform(el, x, y, z) {
      el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`;
      el.dataset.x = x; el.dataset.y = y; el.dataset.z = z;
    }
    function getPos(el) {
      return { x: Number(el.dataset.x || 0), y: Number(el.dataset.y || 0), z: Number(el.dataset.z || 0) };
    }

    function layout() {
      const total = cards.length;
      order.forEach((idx, i) => {
        const el = cards[idx];
        const x = i * cardDistance;
        const y = -i * verticalDistance;
        const z = -i * cardDistance * 1.5;
        setZ(el, total - i);
        setTransform(el, x, y, z);
      });
    }

    function swap() {
      if (order.length < 2) return;

      const [front, ...rest] = order;
      const elFront = cards[front];

      // 1) Caída de la carta delantera
      const { x, y, z } = getPos(elFront);
      elFront.style.transition = `transform ${DROP_DUR}ms ${EASE_DROP}`;
      setTransform(elFront, x, y + dropDistance, z);

      // 2) Promover el resto con un pequeño solape
      setTimeout(() => {
        rest.forEach((idx, i) => {
          const el = cards[idx];
          const nx = i * cardDistance;
          const ny = -i * verticalDistance;
          const nz = -i * cardDistance * 1.5;
          setZ(el, cards.length - i);
          el.style.transition = `transform ${MOVE_DUR}ms ${EASE_MOVE}`;
          setTransform(el, nx, ny, nz);
          setTimeout(() => { el.style.transition = ''; }, MOVE_DUR + 30);
        });
      }, PROMOTE_DELAY);

      // 3) Enviar la que cayó al fondo y recolocar
      setTimeout(() => {
        setZ(elFront, 1);
        const iBack = cards.length - 1;
        elFront.style.transition = `transform ${MOVE_DUR}ms ${EASE_MOVE}`;
        setTransform(
          elFront,
          iBack * cardDistance,
          -iBack * verticalDistance,
          -iBack * cardDistance * 1.5
        );
        setTimeout(() => { elFront.style.transition = ''; }, MOVE_DUR + 30);

        // Actualizar orden
        order = [...rest, front];

        // Programar siguiente ciclo (si no está en pausa)
        scheduleNext();
      }, DROP_DUR);
    }

    // Scheduler con pausa ------------------------------------
    function scheduleNext() {
      if (paused) return;
      clearTimeout(timer);
      timer = setTimeout(() => { if (!paused) swap(); }, delay);
    }
    function pause()  { paused = true;  clearTimeout(timer); }
    function resume() { if (!paused) return; paused = false; setTimeout(scheduleNext, 250); }

    // Pausa: mouse, teclado (accesible) y táctil
    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);
    container.addEventListener('focusin',  pause);
    container.addEventListener('focusout', resume);
    container.addEventListener('pointerdown', pause);
    container.addEventListener('pointerup',   resume);
    container.addEventListener('pointercancel', resume);

    // Recalcular posiciones en resize (sin romper animación)
    window.addEventListener('resize', () => requestAnimationFrame(layout), { passive: true });

    // Init
    layout();
    setTimeout(() => { if (!paused) swap(); }, 600); // primer swap tras mostrar la pila
    scheduleNext();

    // Limpieza
    window.addEventListener('beforeunload', () => { clearTimeout(timer); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroCards);
  } else {
    initHeroCards();
  }
})();


// ===================================================================
// ===== JS UNIFICADO Y DINÁMICO PARA ANIMACIONES (SOLUCIÓN FINAL) =====
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Selecciona TODOS los elementos que deben aparecer con el scroll
    const animatedSections = document.querySelectorAll('.scroll-section');

    if (animatedSections.length === 0) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 1. Activa la animación de aparición de la sección
                entry.target.classList.add('is-visible');
                
                // 2. Busca un título con efecto de escritura DENTRO de la sección visible
                const title = entry.target.querySelector('.type-effect');
                
                if (title) {
                    // ¡LA CLAVE! Hacemos la animación de escritura dinámica
                    const text = title.textContent;
                    const textLength = text.length;
                    
                    // Calcula una duración dinámica basada en la longitud del texto
                    // (ej. 60ms por caracter, con un mínimo de 1.5s y un máximo de 3s)
                    const dynamicDuration = Math.max(1.5, Math.min(textLength * 0.06, 3));
                    
                    // Aplica los estilos de animación directamente con JS
                    title.style.setProperty('--typing-steps', textLength);
                    title.style.setProperty('--typing-duration', `${dynamicDuration}s`);
                    
                    // Añade la clase para activar la animación AHORA que las variables están listas
                    title.classList.add('is-typing');
                }
                
                // 3. Deja de observar el elemento para no repetir la animación
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -150px 0px',
        threshold: 0.2
    });

    animatedSections.forEach(section => {
        observer.observe(section);
    });
});

/* ===== LOGO LOOP (vanilla) ===== */
(function(){
  const ANIMATION = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };
  const container = document.getElementById('logoLoop');
  if(!container) return;

  const track = container.querySelector('.logoloop__track');
  const baseSeq = document.getElementById('logoLoopSeq');
  if(!track || !baseSeq) return;

  let copyCount = ANIMATION.MIN_COPIES;
  let seqWidth = 0;
  let offset = 0;
  let velocity = 120;         // px/s
  let hovered = false;
  let rafId = null;
  let lastT = null;

  // Config
  const pauseOnHover = true;
  const direction = 'left'; // 'left' o 'right'
  const dirMultiplier = direction === 'left' ? 1 : -1;

  // Hover pause
  container.addEventListener('mouseenter', ()=> { if(pauseOnHover) hovered = true; });
  container.addEventListener('mouseleave', ()=> { if(pauseOnHover) hovered = false; });

  // Duplicar listas para cubrir el ancho visible
  function ensureCopies(){
    // Limpiar copias previas
    const copies = track.querySelectorAll('.logoloop__list:not(#logoLoopSeq)');
    copies.forEach(n => n.remove());

    const containerWidth = container.clientWidth || 0;
    seqWidth = Math.ceil(baseSeq.getBoundingClientRect().width);
    if(seqWidth <= 0) return;

    const needed = Math.max(
      ANIMATION.MIN_COPIES,
      Math.ceil(containerWidth / seqWidth) + ANIMATION.COPY_HEADROOM
    );
    copyCount = needed;

    for(let i=1; i<copyCount; i++){
      const clone = baseSeq.cloneNode(true);
      clone.id = ''; clone.setAttribute('aria-hidden','true');
      track.appendChild(clone);
    }
    // “Modulo” del offset para evitar saltos
    offset = ((offset % seqWidth) + seqWidth) % seqWidth;
    track.style.transform = `translate3d(${-offset}px,0,0)`;
  }

  // Cargar imágenes antes de medir
  function waitImagesThen(cb){
    const imgs = baseSeq.querySelectorAll('img');
    if(imgs.length === 0){ cb(); return; }
    let remaining = imgs.length;
    const done = () => { remaining--; if(remaining<=0) cb(); };
    imgs.forEach(img=>{
      if(img.complete) return done();
      img.addEventListener('load', done, { once:true });
      img.addEventListener('error', done, { once:true });
    });
  }

  // ResizeObserver / fallback
  const ro = 'ResizeObserver' in window ? new ResizeObserver(()=>ensureCopies()) : null;
  if(ro){ ro.observe(container); ro.observe(baseSeq); }
  window.addEventListener('resize', ensureCopies);

  // Animación
  function tick(ts){
    if(lastT == null) lastT = ts;
    const dt = Math.max(0, (ts - lastT) / 1000); // s
    lastT = ts;

    const targetV = (pauseOnHover && hovered) ? 0 : (Math.abs(velocity) * dirMultiplier);
    const ease = 1 - Math.exp(-dt / ANIMATION.SMOOTH_TAU);
    velocity += (targetV - velocity) * ease;

    if(seqWidth > 0){
      offset = ((offset + velocity * dt) % seqWidth + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offset}px,0,0)`;
    }
    rafId = requestAnimationFrame(tick);
  }

  // Go!
  waitImagesThen(()=>{ ensureCopies(); rafId = requestAnimationFrame(tick); });

  // Limpieza
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden && rafId){ cancelAnimationFrame(rafId); rafId = null; lastT = null; }
    else if(!rafId){ rafId = requestAnimationFrame(tick); }
  });
})();


