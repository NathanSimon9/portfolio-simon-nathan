(function() {
  const section = document.querySelector('.sea-transition-section');
  const placeholder = document.querySelector('.ocean-canvas');
  if (!section || typeof GL === 'undefined' || typeof Water === 'undefined' || typeof Renderer === 'undefined') return;

  const gl = GL.create();
  gl.canvas.className = 'ocean-canvas';
  gl.canvas.setAttribute('aria-hidden', 'true');
  if (placeholder) placeholder.remove();
  section.appendChild(gl.canvas);
  gl.clearColor(0.502, 0.8, 1.0, 1);

  const water = new Water();
  const renderer = new Renderer();
  const cubemap = new Cubemap({
    xneg: document.getElementById('ocean-xneg'),
    xpos: document.getElementById('ocean-xpos'),
    yneg: document.getElementById('ocean-ypos'),
    ypos: document.getElementById('ocean-ypos'),
    zneg: document.getElementById('ocean-zneg'),
    zpos: document.getElementById('ocean-zpos')
  });

  let immersion = 0;
  let pointerDown = false;
  const cameraAngle = -25;
  const sphereCenter = new GL.Vector(0, -4, 0);
  renderer.sphereCenter = sphereCenter;
  renderer.sphereRadius = 0.001;

  for (let index = 0; index < 24; index += 1) {
    water.addDrop(Math.random() * 2 - 1, Math.random() * 2 - 1, 0.03, index % 2 ? 0.01 : -0.01);
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = section.clientWidth;
    const height = section.clientHeight;
    gl.canvas.width = width * ratio;
    gl.canvas.height = height * ratio;
    gl.canvas.style.width = width + 'px';
    gl.canvas.style.height = height + 'px';
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.matrixMode(gl.PROJECTION);
    gl.loadIdentity();
    gl.perspective(45, gl.canvas.width / gl.canvas.height, 0.01, 100);
    gl.matrixMode(gl.MODELVIEW);
  }

  function updateImmersion() {
    const bounds = section.getBoundingClientRect();
    const progress = (window.innerHeight - bounds.top) / Math.max(1, bounds.height);
    immersion = Math.max(0, Math.min(1, (progress - 0.35) / 0.65));
  }

  function addPointerDrop(event) {
    const bounds = gl.canvas.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((bounds.top + bounds.height - event.clientY) / bounds.height) * 2 - 1;
    water.addDrop(x, y, 0.035, 0.012);
  }

  gl.canvas.addEventListener('pointerdown', function(event) {
    pointerDown = true;
    addPointerDrop(event);
  });
  gl.canvas.addEventListener('pointermove', function(event) {
    if (pointerDown) addPointerDrop(event);
  });
  window.addEventListener('pointerup', function() {
    pointerDown = false;
  });
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', updateImmersion, { passive: true });

  function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.loadIdentity();
    gl.translate(0, -immersion * 0.9, -6.0);
    gl.rotate(-cameraAngle - immersion * 12, 1, 0, 0);
    gl.enable(gl.DEPTH_TEST);
    renderer.renderWater(water, cubemap, [0, 0, 0]);
    gl.disable(gl.DEPTH_TEST);
  }

  function animate() {
    water.stepSimulation();
    water.stepSimulation();
    water.updateNormals();
    draw();
    requestAnimationFrame(animate);
  }

  resize();
  updateImmersion();
  animate();
})();
