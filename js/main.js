import { loadProjects } from "./data.js";
import { createProjectCard } from "./components/project-card.js";

const heroCanvas = document.querySelector('.hero-canvas');

if (heroCanvas) {
  const ctx = heroCanvas.getContext('2d');
  let stars = [];
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  function initStars() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const starCount = Math.min(120, Math.max(70, Math.floor((width * height) / 35)));

    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.4,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: Math.random() * 0.12 + 0.04,
      alpha: Math.random() * 0.7 + 0.15,
      drift: Math.random() * Math.PI * 2,
    }));
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    heroCanvas.width = window.innerWidth * dpr;
    heroCanvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initStars();
  }

  function updateStars() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    stars.forEach((star) => {
      star.x += star.speedX + Math.sin(star.drift) * 0.05;
      star.y += star.speedY * 0.5;
      star.drift += 0.008;

      if (star.x < 0 || star.x > width) star.x = Math.random() * width;
      if (star.y > height + 10) {
        star.y = -10;
        star.x = Math.random() * width;
      }
    });
  }

  function drawStars() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      const twinkle = 0.8 + Math.sin((star.x + star.y) * 0.03 + performance.now() * 0.0015) * 0.2;
      const glow = 0.35 + Math.sin(star.drift) * 0.12;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, star.alpha + twinkle * 0.12)})`;
      ctx.shadowBlur = 4 * glow;
      ctx.shadowColor = 'rgba(255,255,255,0.35)';
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
    requestAnimationFrame(drawStars);
  }

  resizeCanvas();
  drawStars();
  window.addEventListener('resize', resizeCanvas);

  setInterval(updateStars, 16);
}

const seaCanvas = document.querySelector('.heightfield-sea-canvas');

if (seaCanvas) {
  const gl = seaCanvas.getContext('webgl', { alpha: false, antialias: true });

  if (gl) {
    const vertexSource = `
      attribute vec2 position;
      uniform vec2 resolution;
      uniform float time;
      uniform vec3 ripples[8];
      varying vec3 surfaceNormal;
      varying vec3 surfacePosition;
      varying float surfaceDepth;

      float wave(vec2 point, float speed, float scale) {
        return sin(point.x * scale + point.y * scale * 0.55 + time * speed);
      }

      float waterHeight(vec2 point) {
        float height = 0.0;
        height += wave(point, 0.75, 5.2) * 0.24;
        height += wave(point * 1.8 + vec2(time * 0.03, -time * 0.02), -1.1, 7.0) * 0.14;
        height += wave(point * 3.4 + vec2(-time * 0.04, time * 0.03), 1.45, 9.5) * 0.08;
        for (int i = 0; i < 8; i++) {
          float age = time - ripples[i].z;
          float distanceToRipple = distance(vec2((point.x / 2.8) + 0.5, point.y / 28.0), ripples[i].xy);
          height += sin(distanceToRipple * 95.0 - age * 16.0) * exp(-distanceToRipple * 8.0) * exp(-age * 0.7) * step(0.0, age) * step(age, 4.0) * 0.22;
        }
        return height;
      }

      void main() {
        float aspect = resolution.x / resolution.y;
        vec3 world = vec3(position.x * aspect * 1.35, waterHeight(position), position.y);
        float sampleSize = 0.04;
        float slopeX = waterHeight(position + vec2(sampleSize, 0.0)) - waterHeight(position - vec2(sampleSize, 0.0));
        float slopeZ = waterHeight(position + vec2(0.0, sampleSize)) - waterHeight(position - vec2(0.0, sampleSize));
        surfaceNormal = normalize(vec3(-slopeX * 2.8, 1.0, -slopeZ * 2.8));
        surfacePosition = world;
        surfaceDepth = position.y / 28.0;

        vec3 camera = vec3(0.0, 1.45, -3.5);
        vec3 target = vec3(0.0, 0.0, 13.0);
        vec3 forward = normalize(target - camera);
        vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
        vec3 up = cross(right, forward);
        vec3 viewPosition = vec3(dot(world - camera, right), dot(world - camera, up), dot(world - camera, forward));
        float focalLength = 1.0 / tan(radians(38.0));
        float nearPlane = 0.1;
        float farPlane = 42.0;
        gl_Position = vec4(
          viewPosition.x * focalLength / aspect,
          viewPosition.y * focalLength,
          (farPlane + nearPlane - 2.0 * nearPlane * viewPosition.z) / (farPlane - nearPlane),
          viewPosition.z
        );
      }
    `;
    const fragmentSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      varying vec3 surfaceNormal;
      varying vec3 surfacePosition;
      varying float surfaceDepth;

      void main() {
        vec3 normal = normalize(surfaceNormal);
        vec3 lightDirection = normalize(vec3(-0.35, 0.82, 0.42));
        vec3 viewDirection = normalize(vec3(0.0, 0.65, 1.0));
        vec3 halfDirection = normalize(lightDirection + viewDirection);

        float horizon = smoothstep(0.0, 0.55, surfaceDepth);
        float depth = smoothstep(0.0, 1.0, surfaceDepth);
        float diffuse = max(dot(normal, lightDirection), 0.0);
        float specular = pow(max(dot(normal, halfDirection), 0.0), 48.0);
        float reflection = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
        float caustics = smoothstep(0.3, 0.9, sin(surfacePosition.x * 12.0 + surfacePosition.z * 1.8 + time * 1.5) * 0.5 + 0.5);

        vec3 skyReflection = mix(vec3(0.58, 0.82, 0.98), vec3(0.08, 0.3, 0.52), horizon);
        vec3 shallow = vec3(0.08, 0.46, 0.68);
        vec3 deep = vec3(0.006, 0.055, 0.13);
        vec3 color = mix(skyReflection, mix(shallow, deep, depth), 0.62);
        color += diffuse * vec3(0.04, 0.16, 0.2);
        color += specular * vec3(0.75, 0.92, 1.0) * (0.35 + reflection);
        color += caustics * vec3(0.08, 0.22, 0.28) * (1.0 - depth) * 0.45;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const mesh = [];
    const columns = 120;
    const rows = 80;
    for (let row = 0; row < rows - 1; row += 1) {
      for (let column = 0; column < columns - 1; column += 1) {
        const x0 = (column / (columns - 1)) * 2 - 1;
        const x1 = ((column + 1) / (columns - 1)) * 2 - 1;
        const z0 = (row / (rows - 1)) * 28;
        const z1 = ((row + 1) / (rows - 1)) * 28;
        mesh.push(x0, z0, x1, z0, x0, z1, x1, z0, x1, z1, x0, z1);
      }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, 'resolution');
    const time = gl.getUniformLocation(program, 'time');
    const rippleUniform = gl.getUniformLocation(program, 'ripples');
    const ripples = Array.from({ length: 8 }, () => [0, 0, -10]);
    let rippleIndex = 0;

    function addRipple(event) {
      const bounds = seaCanvas.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = 1 - (event.clientY - bounds.top) / bounds.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;

      ripples[rippleIndex] = [x, y, performance.now() * 0.001];
      rippleIndex = (rippleIndex + 1) % ripples.length;
    }

    seaCanvas.addEventListener('pointerdown', (event) => {
      seaCanvas.setPointerCapture(event.pointerId);
      addRipple(event);
    });
    seaCanvas.addEventListener('pointermove', (event) => {
      if (event.buttons) addRipple(event);
    });

    function resizeSeaCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      seaCanvas.width = Math.floor(seaCanvas.clientWidth * dpr);
      seaCanvas.height = Math.floor(seaCanvas.clientHeight * dpr);
      gl.viewport(0, 0, seaCanvas.width, seaCanvas.height);
    }

    function drawSea(now) {
      gl.uniform2f(resolution, seaCanvas.width, seaCanvas.height);
      gl.uniform1f(time, now * 0.001);
      gl.uniform3fv(rippleUniform, new Float32Array(ripples.flat()));
      gl.drawArrays(gl.TRIANGLES, 0, mesh.length / 2);
      requestAnimationFrame(drawSea);
    }

    resizeSeaCanvas();
    drawSea(0);
    window.addEventListener('resize', resizeSeaCanvas);
  }
}


// Parallaxe de transition : la section de nuages descend légèrement avant l'océan.
const cloudSection = document.querySelector('.cloud-plain-section');
const oceanSection = document.querySelector('.sea-transition-section');

if (cloudSection && oceanSection) {
  let cloudParallaxY = 0;
  let ticking = false;

  function updateCloudParallax() {
    const oceanRect = oceanSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const leadValue = getComputedStyle(cloudSection)
      .getPropertyValue('--cloud-parallax-lead')
      .trim();
    const artificialOffset = leadValue.endsWith('vh')
      ? (parseFloat(leadValue) * viewportHeight) / 100
      : parseFloat(leadValue);
    const distanceIntoView = Math.max(0, viewportHeight - oceanRect.top + artificialOffset);
    const parallax = Math.min(700, distanceIntoView * 0.35);
    cloudParallaxY = parallax;
    cloudSection.style.setProperty('--cloud-parallax-y', `${cloudParallaxY}px`);
    ticking = false;
  }

  function requestCloudParallaxUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateCloudParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestCloudParallaxUpdate, { passive: true });
  window.addEventListener('resize', requestCloudParallaxUpdate);
  updateCloudParallax();
}

const projectsContainer = document.querySelector('[data-projects]');

if (projectsContainer) {
  loadProjects()
    .then((projects) => {
      const fragment = document.createDocumentFragment();
      projects.forEach((project) => {
        fragment.appendChild(createProjectCard(project));
      });
      projectsContainer.appendChild(fragment);
    })
    .catch(() => {
      projectsContainer.innerHTML = '<p>Les projets sont momentanément indisponibles.</p>';
    });
}

const bubbleLayer = document.querySelector('.bubble-layer');

if (bubbleLayer) {
  const bubbleCount = 16;

  for (let index = 0; index < bubbleCount; index += 1) {
    const bubble = document.createElement('button');
    bubble.className = 'ocean-bubble';
    bubble.type = 'button';
    bubble.setAttribute('aria-label', 'Faire éclater la bulle');
    bubble.style.setProperty('--bubble-left', `${8 + Math.random() * 84}%`);
    bubble.style.setProperty('--bubble-size', `${0.45 + Math.random() * 1.9}vw`);
    bubble.style.setProperty('--bubble-duration', `${7 + Math.random() * 16}s`);
    bubble.style.setProperty('--bubble-delay', `${-Math.random() * 20}s`);
    bubble.style.setProperty('--bubble-drift', `${-3 + Math.random() * 6}vw`);
    bubble.style.setProperty('--bubble-rise', `${85 + Math.random() * 45}vh`);
    bubble.style.setProperty('--bubble-opacity', `${0.35 + Math.random() * 0.5}`);

    bubble.addEventListener('click', () => {
      bubble.classList.add('is-popped');
      window.setTimeout(() => bubble.remove(), 260);
    });

    bubbleLayer.appendChild(bubble);
  }
}

const demoVideo = document.querySelector('.demo-video');
const soundToggle = document.querySelector('.video-sound-toggle');

if (demoVideo && soundToggle) {
  soundToggle.addEventListener('click', () => {
    demoVideo.muted = !demoVideo.muted;
    soundToggle.setAttribute('aria-pressed', String(!demoVideo.muted));
    soundToggle.setAttribute(
      'aria-label',
      demoVideo.muted ? 'Activer le son' : 'Couper le son'
    );
    soundToggle.textContent = demoVideo.muted ? '🔇' : '🔊';
  });
}

const skillMeters = document.querySelectorAll('.software-list .progress-bar[data-value]');

if (skillMeters.length) {
  const animatedMeters = new Set();

  const animateMeter = (meter) => {
    if (animatedMeters.has(meter)) return;
    animatedMeters.add(meter);
    const target = Number(meter.dataset.value);
    const startTime = Date.now();
    meter.style.setProperty('--meter-progress', '0%');

    const timer = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startTime) / 900);
      const value = target * (1 - Math.pow(1 - progress, 3));
      meter.setAttribute('aria-valuenow', String(Math.round(value)));
      meter.style.setProperty('--meter-progress', `${value}%`);
      if (progress >= 1) window.clearInterval(timer);
    }, 16);
  };

  const startVisibleMeters = () => {
    skillMeters.forEach((meter) => {
      const rect = meter.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
        animateMeter(meter);
      }
    });
  };

  window.addEventListener('scroll', startVisibleMeters, { passive: true });
  window.addEventListener('resize', startVisibleMeters);
  startVisibleMeters();
}


// Ondes blanches déclenchées par le déplacement du curseur dans l'océan.
// Cette animation est dessinée sur son propre canvas : la distorsion automatique
// et l'animation de fond de l'océan ne sont pas modifiées.
(() => {
  const section = document.querySelector('.sea-transition-section');
  const canvas = section?.querySelector('.ocean-fluid-canvas');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let previous = null;
  let raf = 0;
  let lastFrame = 0;
  const waves = [];

  function resize() {
    const rect = section.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
  }

  function addWave(x, y, speed) {
    const intensity = Math.min(1, speed / 30);
    // Plusieurs anneaux espacés donnent une vraie lecture d'onde, pas une traînée.
    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      waves.push({
        x, y,
        radius: 4 + i * (5 + intensity * 3),
        maxRadius: 48 + intensity * 125 + i * 18,
        age: i * 0.075,
        life: 0.75 + intensity * 0.45,
        alpha: 0.08 + intensity * 0.16,
        lineWidth: 0.7 + intensity * 1.1,
        wobble: Math.random() * Math.PI * 2,
        ellipticity: 0.88 + Math.random() * 0.24
      });
    }
    if (waves.length > 180) waves.splice(0, waves.length - 180);
    if (!raf) {
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    }
  }

  function draw(now) {
    const dt = Math.min(0.033, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;
    ctx.clearRect(0, 0, width, height);

    for (let i = waves.length - 1; i >= 0; i--) {
      const wave = waves[i];
      wave.age += dt;
      if (wave.age >= wave.life) {
        waves.splice(i, 1);
        continue;
      }

      const progress = wave.age / wave.life;
      const eased = 1 - Math.pow(1 - progress, 1.5);
      const radius = wave.radius + (wave.maxRadius - wave.radius) * eased;
      const fade = Math.pow(1 - progress, 1.8);
      const alpha = wave.alpha * fade;
      if (alpha < 0.006) continue;

      ctx.save();
      ctx.translate(wave.x, wave.y);
      ctx.scale(1, wave.ellipticity);
      ctx.globalCompositeOperation = 'screen';
      ctx.lineWidth = wave.lineWidth * (1 - progress * 0.35);
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.shadowColor = `rgba(225,245,255,${alpha * 0.45})`;
      ctx.shadowBlur = 2 + alpha * 5;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (waves.length) {
      raf = requestAnimationFrame(draw);
    } else {
      raf = 0;
      ctx.clearRect(0, 0, width, height);
    }
  }

  section.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const rect = section.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      previous = null;
      return;
    }
    if (previous) {
      const dx = x - previous.x;
      const dy = y - previous.y;
      const distance = Math.hypot(dx, dy);
      // La vitesse règle la taille et la visibilité des ondes.
      if (distance > 2.5) addWave(x, y, distance);
    }
    previous = { x, y };
  }, { passive: true });

  section.addEventListener('pointerleave', () => { previous = null; }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  resize();
})();
