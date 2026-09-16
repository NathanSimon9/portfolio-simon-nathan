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

      const dx = mouse.x - star.x;
      const dy = mouse.y - star.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 60) {
        const push = (60 - distance) / 60;
        const angle = Math.atan2(dy, dx);
        const repelX = Math.cos(angle) * push * 0.7;
        const repelY = Math.sin(angle) * push * 0.7;

        star.x -= repelX;
        star.y -= repelY;
      }

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

    const halo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 60);
    halo.addColorStop(0, 'rgba(255,255,255,0.10)');
    halo.addColorStop(0.25, 'rgba(126,170,255,0.06)');
    halo.addColorStop(1, 'rgba(126,170,255,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(mouse.x - 60, mouse.y - 60, 120, 120);

    stars.forEach((star) => {
      const twinkle = 0.8 + Math.sin((star.x + star.y) * 0.03 + performance.now() * 0.0015) * 0.2;
      const glow = 0.35 + Math.sin(star.drift) * 0.12;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, star.alpha + twinkle * 0.12)})`;
      ctx.shadowBlur = 6 * glow;
      ctx.shadowColor = 'rgba(255,255,255,0.5)';
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
    requestAnimationFrame(drawStars);
  }

  window.addEventListener('pointermove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  resizeCanvas();
  drawStars();
  window.addEventListener('resize', resizeCanvas);

  setInterval(updateStars, 16);
}
