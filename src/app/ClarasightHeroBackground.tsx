"use client";

import { useEffect, useRef } from "react";

/** Video source from Clarasight hero — drives dot luminance simulation. */
export const CLARASIGHT_HERO_VIDEO =
  "https://ourlifeswork.github.io/clarasight-web/homepage-hero-compressed.mp4";

/** CONFIG object mirrored from Clarasight embed script. */
const CONFIG = {
  density: 80,
  minCols: 90,
  maxCols: 320,
  densityReferenceWidth: 1440,
  densityMinScale: 0.28,
  densityMaxScale: 1.0,
  densityWidthExponent: 1.55,
  minDotMinSize: 0.7,
  maxDotMinSize: 0.32,
  minDotMaxSize: 4.8,
  maxDotMaxSize: 2.4,
  mobileDotScaleMin: 0.82,
  mobileDotScaleMax: 1.0,
  minThreshold: 0.06,
  maxThreshold: 0.1,
  minFeather: 0.2,
  maxFeather: 0.12,
  gamma: 1.1,
  opacity: 0.92,
  softness: 0.22,
  smoothing: 0.085,
  dotColor: "#FFFFFF",
  contentOffsetY: 0.35,
  contentScale: 1.2,
  hoverEnabled: true,
  hoverRadius: 0.1,
  hoverSoftness: 0.12,
  hoverStrength: 1.0,
  hoverSmoothing: 0.12,
  hoverMorphSpeed: 0.9,
  hoverNoiseScale: 36.0,
  hoverNoiseAmount: 0.42,
} as const;

export default function ClarasightHeroBackground({
  className,
}: {
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    let disposed = false;
    let raf = 0;
    let disconnectTheme: (() => void) | null = null;
    let hoverEnabled: boolean = CONFIG.hoverEnabled;
    if ("ontouchstart" in window) hoverEnabled = false;

    import("three").then((THREE) => {
      if (disposed || wrap.querySelector('canvas[data-three-bg="true"]')) return;

      const readDotColor = () => {
        const fromCss = getComputedStyle(document.documentElement)
          .getPropertyValue("--cs-dot-color")
          .trim();
        return fromCss || CONFIG.dotColor;
      };

      const readDotOpacity = () => {
        const raw = getComputedStyle(document.documentElement)
          .getPropertyValue("--cs-dot-opacity")
          .trim();
        const n = Number.parseFloat(raw);
        return Number.isFinite(n) ? n : CONFIG.opacity;
      };

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.domElement.setAttribute("data-three-bg", "true");

      const isMobile = () => window.innerWidth < 768;
      renderer.setPixelRatio(
        isMobile() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5),
      );
      renderer.setClearColor(0x000000, 0);
      Object.assign(renderer.domElement.style, {
        background: "transparent",
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      });
      wrap.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      let geometry: THREE.BufferGeometry | null = null;
      let material: THREE.ShaderMaterial | null = null;
      let points: THREE.Points | null = null;
      let videoTexture: THREE.VideoTexture | null = null;
      let prevRT: THREE.WebGLRenderTarget | null = null;
      let currRT: THREE.WebGLRenderTarget | null = null;
      let simScene: THREE.Scene | null = null;
      let simCamera: THREE.OrthographicCamera | null = null;
      let simMaterial: THREE.ShaderMaterial | null = null;
      let simQuad: THREE.Mesh | null = null;
      let started = false;
      let cols = 0;
      let rows = 0;
      let time = 0;
      let lastTime = performance.now();
      let isVisible = !document.hidden;

      const pointer = {
        currentX: 0.5,
        currentY: 0.5,
        targetX: 0.5,
        targetY: 0.5,
        currentActive: 0,
        targetActive: 0,
      };

      const clamp = (v: number, min: number, max: number) =>
        Math.max(min, Math.min(max, v));
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      const getWrapSize = () => {
        const rect = wrap.getBoundingClientRect();
        return {
          width: Math.max(1, Math.round(rect.width || window.innerWidth)),
          height: Math.max(1, Math.round(rect.height || window.innerHeight)),
        };
      };

      const readCssNumber = (name: string, fallback: number) => {
        const raw = getComputedStyle(document.documentElement)
          .getPropertyValue(name)
          .trim();
        const n = Number.parseFloat(raw);
        return Number.isFinite(n) ? n : fallback;
      };

      const getDerivedConfig = () => {
        const { width } = getWrapSize();
        const t = clamp(CONFIG.density, 0, 100) / 100;
        const baseCols = lerp(CONFIG.minCols, CONFIG.maxCols, t);
        const widthRatio = clamp(width / CONFIG.densityReferenceWidth, 0, 1);
        const widthScale = lerp(
          CONFIG.densityMinScale,
          CONFIG.densityMaxScale,
          Math.pow(widthRatio, CONFIG.densityWidthExponent),
        );
        const dotScale = lerp(
          CONFIG.mobileDotScaleMin,
          CONFIG.mobileDotScaleMax,
          Math.pow(widthRatio, 1.15),
        );
        const sizeScale = readCssNumber("--cs-dot-size-scale", 1);
        const thresholdScale = readCssNumber("--cs-dot-threshold-scale", 1);
        return {
          cols: Math.max(28, Math.round(baseCols * widthScale)),
          minSize:
            lerp(CONFIG.minDotMinSize, CONFIG.maxDotMinSize, t) *
            dotScale *
            sizeScale,
          maxSize:
            lerp(CONFIG.minDotMaxSize, CONFIG.maxDotMaxSize, t) *
            dotScale *
            sizeScale,
          threshold:
            lerp(CONFIG.minThreshold, CONFIG.maxThreshold, t) * thresholdScale,
          feather: lerp(CONFIG.minFeather, CONFIG.maxFeather, t),
        };
      };

      const SIM_FRAG = `
        varying vec2 vUv;
        uniform sampler2D uVideo;
        uniform sampler2D uPrev;
        uniform float uThreshold;
        uniform float uFeather;
        uniform float uGamma;
        uniform float uSmoothing;
        uniform float uVideoAspect;
        uniform float uCanvasAspect;
        uniform float uContentOffsetY;
        uniform float uContentScale;
        uniform vec2 uPointer;
        uniform float uPointerActive;
        uniform float uPointerRadius;
        uniform float uPointerSoftness;
        uniform float uPointerStrength;
        uniform float uTime;
        uniform float uHoverMorphSpeed;
        uniform float uHoverNoiseScale;
        uniform float uHoverNoiseAmount;

        vec2 coverUv(vec2 uv, float textureAspect, float screenAspect, float offsetY, float zoom) {
          vec2 newUv = uv;
          if (screenAspect > textureAspect) {
            float scale = textureAspect / screenAspect;
            newUv.y = (uv.y - 0.5) * scale + 0.5;
          } else {
            float scale = screenAspect / textureAspect;
            newUv.x = (uv.x - 0.5) * scale + 0.5;
          }
          newUv = (newUv - 0.5) / zoom + 0.5;
          newUv.y += offsetY;
          return newUv;
        }

        float hoverField(vec2 uv, vec2 pointer, float canvasAspect, float timeValue) {
          vec2 delta = uv - pointer;
          delta.x *= canvasAspect;
          float t = timeValue * uHoverMorphSpeed;
          float n1 = sin((uv.x * uHoverNoiseScale) + t * 1.7 + sin(uv.y * 17.0 - t * 1.1) * 2.2);
          float n2 = sin((uv.y * (uHoverNoiseScale * 0.82)) - t * 1.35 + sin(uv.x * 21.0 + t * 0.9) * 1.9);
          float n3 = sin(((uv.x + uv.y) * (uHoverNoiseScale * 0.58)) + t * 1.9);
          float n = (n1 * 0.42 + n2 * 0.35 + n3 * 0.23);
          float irregularRadius = uPointerRadius * (1.0 + n * uHoverNoiseAmount);
          float irregularSoftness = uPointerSoftness * (0.9 + (n * 0.5 + 0.5) * 0.8);
          float d = length(delta);
          float base = 1.0 - smoothstep(irregularRadius, irregularRadius + irregularSoftness, d);
          float warp1 = sin((atan(delta.y, delta.x) * 5.0) + t * 1.4) * 0.08;
          float warp2 = sin((delta.x * 28.0) - (delta.y * 19.0) + t * 2.1) * 0.06;
          float warp3 = sin((delta.y * 34.0) + t * 1.6) * 0.05;
          return clamp(base + warp1 + warp2 + warp3, 0.0, 1.0);
        }

        void main() {
          vec2 sampleUv = coverUv(vUv, uVideoAspect, uCanvasAspect, uContentOffsetY, uContentScale);
          vec3 videoColor = texture2D(uVideo, sampleUv).rgb;
          float luma = dot(videoColor, vec3(0.2126, 0.7152, 0.0722));
          luma = pow(clamp(luma, 0.0, 1.0), uGamma);
          float videoTarget = smoothstep(uThreshold, uThreshold + uFeather, luma);
          float hoverTarget = hoverField(vUv, uPointer, uCanvasAspect, uTime) * uPointerStrength * uPointerActive;
          float target = max(videoTarget, hoverTarget);
          float prev = texture2D(uPrev, vUv).r;
          gl_FragColor = vec4(mix(prev, target, uSmoothing));
        }
      `;

      const buildPoints = () => {
        const { width, height } = getWrapSize();
        const aspect = width / height;
        const derived = getDerivedConfig();
        cols = derived.cols;
        rows = Math.max(1, Math.round(cols / aspect));
        const count = cols * rows;
        const positions = new Float32Array(count * 3);
        const uvs = new Float32Array(count * 2);
        let p3 = 0;
        let p2 = 0;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const u = cols > 1 ? x / (cols - 1) : 0.5;
            const v = rows > 1 ? y / (rows - 1) : 0.5;
            positions[p3++] = u * 2 - 1;
            positions[p3++] = 1 - v * 2;
            positions[p3++] = 0;
            uvs[p2++] = u;
            uvs[p2++] = 1.0 - v;
          }
        }
        geometry?.dispose();
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
        if (points) scene.remove(points);
        points = new THREE.Points(geometry, material!);
        scene.add(points);
      };

      const buildMaterial = () => {
        const derived = getDerivedConfig();
        material?.dispose();
        material = new THREE.ShaderMaterial({
          uniforms: {
            uBrightnessTex: { value: null as THREE.Texture | null },
            uMinSize: { value: derived.minSize * renderer.getPixelRatio() },
            uMaxSize: { value: derived.maxSize * renderer.getPixelRatio() },
            uOpacity: { value: readDotOpacity() },
            uSoftness: { value: CONFIG.softness },
            uColor: { value: new THREE.Color(readDotColor()) },
          },
          vertexShader: `
            varying float vStrength;
            uniform sampler2D uBrightnessTex;
            uniform float uMinSize;
            uniform float uMaxSize;
            void main() {
              float strength = texture2D(uBrightnessTex, uv).r;
              vStrength = strength;
              gl_PointSize = mix(uMinSize, uMaxSize, strength);
              gl_Position = vec4(position.xy, 0.0, 1.0);
            }
          `,
          fragmentShader: `
            varying float vStrength;
            uniform float uOpacity;
            uniform float uSoftness;
            uniform vec3 uColor;
            void main() {
              vec2 p = gl_PointCoord - vec2(0.5);
              float d = length(p);
              float outer = smoothstep(0.5, 0.5 - uSoftness, d);
              float inner = smoothstep(0.14, 0.0, d);
              float alpha = (outer * 0.75 + inner * 0.4) * vStrength * uOpacity;
              if (alpha < 0.008) discard;
              gl_FragColor = vec4(uColor, alpha);
            }
          `,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
      };

      const buildSimulation = () => {
        const derived = getDerivedConfig();
        simScene = new THREE.Scene();
        simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        simMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uVideo: { value: videoTexture },
            uPrev: { value: null as THREE.Texture | null },
            uThreshold: { value: derived.threshold },
            uFeather: { value: derived.feather },
            uGamma: { value: CONFIG.gamma },
            uSmoothing: { value: CONFIG.smoothing },
            uVideoAspect: { value: 1 },
            uCanvasAspect: { value: 1 },
            uContentOffsetY: { value: CONFIG.contentOffsetY },
            uContentScale: { value: CONFIG.contentScale },
            uPointer: { value: new THREE.Vector2(0.5, 0.5) },
            uPointerActive: { value: 0 },
            uPointerRadius: { value: CONFIG.hoverRadius },
            uPointerSoftness: { value: CONFIG.hoverSoftness },
            uPointerStrength: { value: CONFIG.hoverStrength },
            uTime: { value: 0 },
            uHoverMorphSpeed: { value: CONFIG.hoverMorphSpeed },
            uHoverNoiseScale: { value: CONFIG.hoverNoiseScale },
            uHoverNoiseAmount: { value: CONFIG.hoverNoiseAmount },
          },
          vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
          fragmentShader: SIM_FRAG,
        });
        simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial);
        simScene.add(simQuad);
      };

      const buildRenderTargets = () => {
        prevRT?.dispose();
        currRT?.dispose();
        const opts = {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          depthBuffer: false,
          stencilBuffer: false,
        };
        prevRT = new THREE.WebGLRenderTarget(cols, rows, opts);
        currRT = new THREE.WebGLRenderTarget(cols, rows, opts);
      };

      const updateDerivedUniforms = () => {
        const derived = getDerivedConfig();
        if (material) {
          material.uniforms.uMinSize.value = derived.minSize * renderer.getPixelRatio();
          material.uniforms.uMaxSize.value = derived.maxSize * renderer.getPixelRatio();
        }
        if (simMaterial) {
          simMaterial.uniforms.uThreshold.value = derived.threshold;
          simMaterial.uniforms.uFeather.value = derived.feather;
        }
      };

      const updateAspectUniforms = (width: number, height: number) => {
        const canvasAspect = width / height;
        const videoAspect =
          video.videoWidth && video.videoHeight
            ? video.videoWidth / video.videoHeight
            : 1;
        if (simMaterial) {
          simMaterial.uniforms.uCanvasAspect.value = canvasAspect;
          simMaterial.uniforms.uVideoAspect.value = videoAspect;
        }
      };

      const updatePointer = (clientX: number, clientY: number) => {
        const rect = wrap.getBoundingClientRect();
        const inside =
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom;
        if (!inside) {
          pointer.targetActive = 0;
          return;
        }
        pointer.targetX = clamp((clientX - rect.left) / rect.width, 0, 1);
        pointer.targetY = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
        pointer.targetActive = hoverEnabled ? 1 : 0;
      };

      const resize = () => {
        const { width, height } = getWrapSize();
        renderer.setPixelRatio(
          isMobile() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5),
        );
        renderer.setSize(width, height, false);
        updateDerivedUniforms();
        updateAspectUniforms(width, height);
        if (started) {
          buildPoints();
          buildRenderTargets();
          if (material) material.uniforms.uBrightnessTex.value = prevRT!.texture;
        }
      };

      const stepSimulation = () => {
        if (!simMaterial || !prevRT || !currRT) return;
        simMaterial.uniforms.uPrev.value = prevRT.texture;
        renderer.setRenderTarget(currRT);
        renderer.render(simScene!, simCamera!);
        renderer.setRenderTarget(null);
        const temp = prevRT;
        prevRT = currRT;
        currRT = temp;
        material!.uniforms.uBrightnessTex.value = prevRT.texture;
      };

      const animate = (now: number) => {
        raf = requestAnimationFrame(animate);
        if (!isVisible) return;
        const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
        lastTime = now;
        time += dt;
        if (videoTexture && !video.paused) videoTexture.needsUpdate = true;
        if (simMaterial) simMaterial.uniforms.uTime.value = time;
        pointer.currentX = lerp(pointer.currentX, pointer.targetX, CONFIG.hoverSmoothing);
        pointer.currentY = lerp(pointer.currentY, pointer.targetY, CONFIG.hoverSmoothing);
        pointer.currentActive = lerp(pointer.currentActive, pointer.targetActive, CONFIG.hoverSmoothing);
        if (simMaterial) {
          simMaterial.uniforms.uPointer.value.set(pointer.currentX, pointer.currentY);
          simMaterial.uniforms.uPointerActive.value = pointer.currentActive;
        }
        stepSimulation();
        renderer.render(scene, camera);
      };

      const startRenderer = () => {
        if (started || !video.videoWidth) return;
        videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.colorSpace = THREE.SRGBColorSpace;
        buildMaterial();
        buildPoints();
        buildRenderTargets();
        buildSimulation();
        material!.uniforms.uBrightnessTex.value = prevRT!.texture;
        const { width, height } = getWrapSize();
        updateDerivedUniforms();
        updateAspectUniforms(width, height);
        started = true;
        lastTime = performance.now();
        animate(lastTime);
      };

      const tryPlay = async () => {
        try {
          await video.play();
          return !video.paused;
        } catch {
          return false;
        }
      };

      const onPointerMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
      const onPointerLeave = () => {
        pointer.targetActive = 0;
      };
      const onVisibility = () => {
        isVisible = !document.hidden;
        if (isVisible) tryPlay();
        else video.pause();
      };

      const syncThemeDots = () => {
        if (!material) return;
        material.uniforms.uColor.value.set(readDotColor());
        material.uniforms.uOpacity.value = readDotOpacity();
        updateDerivedUniforms();
      };
      const themeObserver = new MutationObserver(syncThemeDots);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      disconnectTheme = () => themeObserver.disconnect();
      syncThemeDots();

      if (hoverEnabled) {
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerleave", onPointerLeave);
      }
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", onVisibility);

      const ro = new ResizeObserver(resize);
      ro.observe(wrap);

      video.addEventListener("loadeddata", () => {
        tryPlay();
        startRenderer();
      });
      video.addEventListener("canplay", startRenderer);

      resize();
      tryPlay();
      setTimeout(() => {
        tryPlay();
        startRenderer();
      }, 500);

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVisibility);
        ro.disconnect();
        geometry?.dispose();
        material?.dispose();
        simMaterial?.dispose();
        prevRT?.dispose();
        currRT?.dispose();
        videoTexture?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      disconnectTheme?.();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} id="hero-background" className={className} aria-hidden>
      <div className="cs-hero__background-grid" />
      <video
        ref={videoRef}
        src={CLARASIGHT_HERO_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      />
    </div>
  );
}
