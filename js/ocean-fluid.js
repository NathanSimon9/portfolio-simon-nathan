/* Fluide WebGL transparent — section océan uniquement. */
(() => {
  const canvas = document.querySelector('.sea-transition-section > .ocean-fluid-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false
  });
  if (!gl) {
    console.warn('[Ocean fluid] WebGL indisponible; aucune autre section n’a été modifiée.');
    return;
  }

  const vertex = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;
  const simulation = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uPrevious;
    uniform vec2 uPointer;
    uniform vec2 uVelocity;
    uniform vec2 uResolution;
    uniform float uActive;
    uniform float uAspect;
    void main() {
      vec2 uv = vUv;
      vec2 delta = uv - uPointer;
      delta.x *= uAspect;
      float d = length(delta);
      float influence = exp(-d * 18.0) * uActive;
      vec2 tangent = vec2(-delta.y, delta.x);
      vec2 flow = (uVelocity * 0.0018 + tangent * length(uVelocity) * 0.0009) * influence;
      vec2 sampleUv = clamp(uv - flow, vec2(0.001), vec2(0.999));
      vec4 old = texture2D(uPrevious, sampleUv);
      old *= 0.982;
      float radius = 0.018 + min(length(uVelocity) * 0.00008, 0.022);
      float splat = exp(-dot(delta, delta) / (radius * radius)) * uActive;
      vec3 ink = vec3(0.30, 0.78, 1.0);
      float strength = min(0.22 + length(uVelocity) * 0.003, 0.72);
      vec3 color = old.rgb + ink * splat * strength;
      float alpha = old.a + splat * strength * 0.62;
      gl_FragColor = vec4(min(color, vec3(1.0)), min(alpha, 0.88));
    }
  `;
  const display = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    void main() {
      vec4 fluid = texture2D(uTexture, vUv);
      // Légère mise en valeur des filaments sans ajouter de fond opaque.
      float a = smoothstep(0.015, 0.34, fluid.a) * fluid.a;
      gl_FragColor = vec4(fluid.rgb, a);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[Ocean fluid] Erreur shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  function makeProgram(fragmentSource) {
    const vs = compile(gl.VERTEX_SHADER, vertex);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('[Ocean fluid] Erreur programme:', gl.getProgramInfoLog(p));
      gl.deleteProgram(p);
      return null;
    }
    return p;
  }
  const simProgram = makeProgram(simulation);
  const displayProgram = makeProgram(display);
  if (!simProgram || !displayProgram) return;

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

  function bindQuad(program) {
    const loc = gl.getAttribLocation(program, 'aPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }
  function createTarget(width, height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return { texture, framebuffer };
  }

  let targets = [];
  let width = 1, height = 1, readIndex = 0;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, Math.floor(rect.width * dpr));
    height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.width = width; canvas.height = height;
    gl.viewport(0, 0, width, height);
    targets.forEach(t => { gl.deleteTexture(t.texture); gl.deleteFramebuffer(t.framebuffer); });
    targets = [createTarget(width, height), createTarget(width, height)];
    targets.forEach(t => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.framebuffer);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  const pointer = { x: -10, y: -10, px: -10, py: -10, vx: 0, vy: 0, active: 0, lastMove: 0 };
  function onMove(event) {
    const rect = canvas.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      pointer.active = 0;
      return;
    }
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    const now = performance.now();
    const dt = Math.max(8, now - (pointer.lastMove || now - 16));
    pointer.vx = Math.max(-120, Math.min(120, (x - pointer.x) * width * 16 / dt));
    pointer.vy = Math.max(-120, Math.min(120, (y - pointer.y) * height * 16 / dt));
    pointer.x = x; pointer.y = y;
    pointer.active = 1;
    pointer.lastMove = now;
  }
  const section = canvas.closest('.sea-transition-section');
  section.addEventListener('pointermove', onMove, { passive: true });
  section.addEventListener('pointerleave', () => { pointer.active = 0; }, { passive: true });
  // Initialisation à l’entrée dans la section; ne touche pas au canvas des étoiles du hero.
  resize();
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(section);
  window.addEventListener('resize', resize, { passive: true });

  function frame() {
    const read = targets[readIndex];
    const write = targets[1 - readIndex];
    gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.useProgram(simProgram); bindQuad(simProgram);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, read.texture);
    gl.uniform1i(gl.getUniformLocation(simProgram, 'uPrevious'), 0);
    gl.uniform2f(gl.getUniformLocation(simProgram, 'uPointer'), pointer.x, pointer.y);
    gl.uniform2f(gl.getUniformLocation(simProgram, 'uVelocity'), pointer.vx, pointer.vy);
    gl.uniform2f(gl.getUniformLocation(simProgram, 'uResolution'), width, height);
    gl.uniform1f(gl.getUniformLocation(simProgram, 'uActive'), pointer.active);
    gl.uniform1f(gl.getUniformLocation(simProgram, 'uAspect'), width / height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(displayProgram); bindQuad(displayProgram);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, write.texture);
    gl.uniform1i(gl.getUniformLocation(displayProgram, 'uTexture'), 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disable(gl.BLEND);

    readIndex = 1 - readIndex;
    pointer.vx *= 0.88; pointer.vy *= 0.88;
    requestAnimationFrame(frame);
  }
  frame();
})();
