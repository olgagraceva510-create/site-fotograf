/**
 * Фон «звёзды» на чистом WebGL — без ES-модулей (работает с file:// и с локальным сервером).
 */
(function () {
  "use strict";

  var VERT = [
    "attribute vec2 uv;",
    "attribute vec2 position;",
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = uv;",
    "  gl_Position = vec4(position, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "uniform float uTime;",
    "uniform vec3 uResolution;",
    "uniform vec2 uFocal;",
    "uniform vec2 uRotation;",
    "uniform float uStarSpeed;",
    "uniform float uDensity;",
    "uniform float uHueShift;",
    "uniform float uSpeed;",
    "uniform vec2 uMouse;",
    "uniform float uGlowIntensity;",
    "uniform float uSaturation;",
    "uniform float uMouseRepulsion;",
    "uniform float uTwinkleIntensity;",
    "uniform float uRotationSpeed;",
    "uniform float uRepulsionStrength;",
    "uniform float uMouseActiveFactor;",
    "uniform float uAutoCenterRepulsion;",
    "uniform float uTransparent;",
    "varying vec2 vUv;",
    "#define NUM_LAYER 4.0",
    "#define STAR_COLOR_CUTOFF 0.2",
    "#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)",
    "#define PERIOD 3.0",
    "float Hash21(vec2 p) {",
    "  p = fract(p * vec2(123.34, 456.21));",
    "  p += dot(p, p + 45.32);",
    "  return fract(p.x * p.y);",
    "}",
    "float tri(float x) { return abs(fract(x) * 2.0 - 1.0); }",
    "float tris(float x) {",
    "  float t = fract(x);",
    "  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));",
    "}",
    "float trisn(float x) {",
    "  float t = fract(x);",
    "  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;",
    "}",
    "vec3 hsv2rgb(vec3 c) {",
    "  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
    "  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
    "  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
    "}",
    "float Star(vec2 uv, float flare) {",
    "  float d = length(uv);",
    "  float m = (0.05 * uGlowIntensity) / d;",
    "  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));",
    "  m += rays * flare * uGlowIntensity;",
    "  uv *= MAT45;",
    "  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));",
    "  m += rays * 0.3 * flare * uGlowIntensity;",
    "  m *= smoothstep(1.0, 0.2, d);",
    "  return m;",
    "}",
    "vec3 StarLayer(vec2 uv) {",
    "  vec3 col = vec3(0.0);",
    "  vec2 gv = fract(uv) - 0.5;",
    "  vec2 id = floor(uv);",
    "  for (int y = -1; y <= 1; y++) {",
    "    for (int x = -1; x <= 1; x++) {",
    "      vec2 offset = vec2(float(x), float(y));",
    "      vec2 si = id + vec2(float(x), float(y));",
    "      float seed = Hash21(si);",
    "      float size = fract(seed * 345.32);",
    "      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));",
    "      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;",
    "      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + vec2(1.0))) + STAR_COLOR_CUTOFF;",
    "      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + vec2(3.0))) + STAR_COLOR_CUTOFF;",
    "      float grn = min(red, blu) * seed;",
    "      vec3 base = vec3(red, grn, blu);",
    "      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;",
    "      hue = fract(hue + uHueShift / 360.0);",
    "      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;",
    "      float val = max(max(base.r, base.g), base.b);",
    "      base = hsv2rgb(vec3(hue, sat, val));",
    "      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;",
    "      float star = Star(gv - offset - pad, flareSize);",
    "      vec3 color = base;",
    "      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;",
    "      twinkle = mix(1.0, twinkle, uTwinkleIntensity);",
    "      star *= twinkle;",
    "      col += star * size * color;",
    "    }",
    "  }",
    "  return col;",
    "}",
    "void main() {",
    "  vec2 focalPx = uFocal * uResolution.xy;",
    "  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;",
    "  vec2 mouseNorm = uMouse - vec2(0.5);",
    "  if (uAutoCenterRepulsion > 0.0) {",
    "    vec2 centerUV = vec2(0.0, 0.0);",
    "    float centerDist = length(uv - centerUV);",
    "    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));",
    "    uv += repulsion * 0.05;",
    "  } else if (uMouseRepulsion > 0.5) {",
    "    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;",
    "    float mouseDist = length(uv - mousePosUV);",
    "    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));",
    "    uv += repulsion * 0.05 * uMouseActiveFactor;",
    "  } else {",
    "    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;",
    "    uv += mouseOffset;",
    "  }",
    "  float autoRotAngle = uTime * uRotationSpeed;",
    "  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));",
    "  uv = autoRot * uv;",
    "  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;",
    "  vec3 col = vec3(0.0);",
    "  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {",
    "    float depth = fract(i + uStarSpeed * uSpeed);",
    "    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);",
    "    float fade = depth * smoothstep(1.0, 0.9, depth);",
    "    col += StarLayer(uv * scale + i * 453.32) * fade;",
    "  }",
    "  if (uTransparent > 0.5) {",
    "    float alpha = length(col);",
    "    alpha = smoothstep(0.0, 0.3, alpha);",
    "    alpha = min(alpha, 1.0);",
    "    gl_FragColor = vec4(col, alpha);",
    "  } else {",
    "    gl_FragColor = vec4(col, 1.0);",
    "  }",
    "}",
  ].join("\n");

  function compileShader(gl, type, source) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("[Galaxy] shader:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function linkProgram(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, "position");
    gl.bindAttribLocation(p, 1, "uv");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn("[Galaxy] program:", gl.getProgramInfoLog(p));
      gl.deleteProgram(p);
      return null;
    }
    return p;
  }

  function boot() {
    var container = document.getElementById("galaxy-bg");
    if (!container) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    var glOpts = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    };
    /* Только WebGL 1: шейдеры в стиле GLSL ES 1.0 (с WebGL2 без #version 300 часто не компилируются). */
    var gl =
      canvas.getContext("webgl", glOpts) || canvas.getContext("experimental-webgl", glOpts);

    if (!gl) {
      console.warn("[Galaxy] WebGL недоступен в этом браузере.");
      container.classList.add("galaxy-bg--error");
      return;
    }

    var vShader = compileShader(gl, gl.VERTEX_SHADER, VERT);
    var fShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vShader || !fShader) {
      container.classList.add("galaxy-bg--error");
      return;
    }

    var program = linkProgram(gl, vShader, fShader);
    gl.deleteShader(vShader);
    gl.deleteShader(fShader);
    if (!program) {
      container.classList.add("galaxy-bg--error");
      return;
    }

    var tri = new Float32Array([
      -1, -1, 0, 0, 3, -1, 2, 0, -1, 3, 0, 2,
    ]);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, tri, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    var u = {
      uTime: gl.getUniformLocation(program, "uTime"),
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uFocal: gl.getUniformLocation(program, "uFocal"),
      uRotation: gl.getUniformLocation(program, "uRotation"),
      uStarSpeed: gl.getUniformLocation(program, "uStarSpeed"),
      uDensity: gl.getUniformLocation(program, "uDensity"),
      uHueShift: gl.getUniformLocation(program, "uHueShift"),
      uSpeed: gl.getUniformLocation(program, "uSpeed"),
      uMouse: gl.getUniformLocation(program, "uMouse"),
      uGlowIntensity: gl.getUniformLocation(program, "uGlowIntensity"),
      uSaturation: gl.getUniformLocation(program, "uSaturation"),
      uMouseRepulsion: gl.getUniformLocation(program, "uMouseRepulsion"),
      uTwinkleIntensity: gl.getUniformLocation(program, "uTwinkleIntensity"),
      uRotationSpeed: gl.getUniformLocation(program, "uRotationSpeed"),
      uRepulsionStrength: gl.getUniformLocation(program, "uRepulsionStrength"),
      uMouseActiveFactor: gl.getUniformLocation(program, "uMouseActiveFactor"),
      uAutoCenterRepulsion: gl.getUniformLocation(program, "uAutoCenterRepulsion"),
      uTransparent: gl.getUniformLocation(program, "uTransparent"),
    };

    var targetMouse = { x: 0.5, y: 0.5 };
    var smoothMouse = { x: 0.5, y: 0.5 };
    var targetActive = 0;
    var smoothActive = 0;

    var starSpeed = 0.5;
    var density = 1;
    var hueShift = 140;
    var speed = 1;
    var glowIntensity = 0.5;
    var twinkleIntensity = 0.3;
    var rotationSpeed = reduceMotion ? 0 : 0.1;
    var repulsionStrength = 2;

    function resize() {
      var w = container.clientWidth || window.innerWidth;
      var h = container.clientHeight || window.innerHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var cw = Math.max(1, Math.floor(w * dpr));
      var ch = Math.max(1, Math.floor(h * dpr));
      canvas.width = cw;
      canvas.height = ch;
      gl.viewport(0, 0, cw, ch);
      gl.uniform3f(u.uResolution, cw, ch, cw / ch);
    }

    gl.uniform2f(u.uFocal, 0.5, 0.5);
    gl.uniform2f(u.uRotation, 1, 0);
    gl.uniform1f(u.uDensity, density);
    gl.uniform1f(u.uHueShift, hueShift);
    gl.uniform1f(u.uSpeed, speed);
    gl.uniform1f(u.uGlowIntensity, glowIntensity);
    gl.uniform1f(u.uSaturation, 0);
    gl.uniform1f(u.uMouseRepulsion, 1);
    gl.uniform1f(u.uTwinkleIntensity, twinkleIntensity);
    gl.uniform1f(u.uRotationSpeed, rotationSpeed);
    gl.uniform1f(u.uRepulsionStrength, repulsionStrength);
    gl.uniform1f(u.uAutoCenterRepulsion, 0);
    gl.uniform1f(u.uTransparent, 1);

    container.appendChild(canvas);
    resize();

    var raf = 0;
    function frame(t) {
      raf = requestAnimationFrame(frame);
      var sec = t * 0.001;
      if (!reduceMotion) {
        gl.uniform1f(u.uTime, sec);
        gl.uniform1f(u.uStarSpeed, (sec * starSpeed) / 10);
      } else {
        gl.uniform1f(u.uTime, 0);
        gl.uniform1f(u.uStarSpeed, 0);
      }

      var lerp = 0.08;
      smoothMouse.x += (targetMouse.x - smoothMouse.x) * lerp;
      smoothMouse.y += (targetMouse.y - smoothMouse.y) * lerp;
      smoothActive += (targetActive - smoothActive) * lerp;
      gl.uniform2f(u.uMouse, smoothMouse.x, smoothMouse.y);
      gl.uniform1f(u.uMouseActiveFactor, smoothActive);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function onMove(e) {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = 1 - e.clientY / window.innerHeight;
      targetActive = 1;
    }
    function onLeave() {
      targetActive = 0;
    }

    window.addEventListener("resize", resize, false);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    container.classList.add("galaxy-bg--ready");
    var stack = container.closest(".bg-stack");
    if (stack) stack.classList.add("bg-stack--has-galaxy");

    raf = requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
