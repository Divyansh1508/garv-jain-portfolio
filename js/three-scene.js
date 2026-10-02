/**
 * GARV JAIN OFFICIAL LUXURY PORTFOLIO
 * 3D WebGL Experience Engine using Three.js
 * - Background 3D Particle Constellation & Floating Metallic Polyhedrons
 * - Hero 3D Interactive Gyroscope Diamond Core with 360° Drag & Inertia
 * - Real-time Parallax tracking & Mouse specular light reactivity
 */

(function() {
  'use strict';

  // Check WebGL availability
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable() || typeof THREE === 'undefined') {
    console.warn("WebGL or Three.js not available. Using CSS 3D fallback.");
    return;
  }

  /* =========================================================================
     1. BACKGROUND 3D PARTICLE GALAXY & FLOATING GOLD POLYHEDRONS
     ========================================================================= */
  const bgCanvas = document.getElementById('webglBgCanvas');
  if (!bgCanvas) return;

  const isMobile = window.innerWidth < 768;

  const bgRenderer = new THREE.WebGLRenderer({
    canvas: bgCanvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: "high-performance"
  });
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));

  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  bgCamera.position.z = 80;

  // Ambient & Directional Gold / Cyan Lighting
  const ambientLight = new THREE.AmbientLight(0x222233, 1.2);
  bgScene.add(ambientLight);

  const goldLight = new THREE.PointLight(0xd4af37, 3, 160);
  goldLight.position.set(40, 30, 40);
  bgScene.add(goldLight);

  const cyanLight = new THREE.PointLight(0x00f2fe, 2, 160);
  cyanLight.position.set(-40, -30, 30);
  bgScene.add(cyanLight);

  const mouseLight = new THREE.PointLight(0xfff0aa, 2.5, 100);
  mouseLight.position.set(0, 0, 50);
  bgScene.add(mouseLight);

  // Floating 3D Gold Geometric Crystals & Rings
  const geometries = [
    new THREE.IcosahedronGeometry(3.5, 0),
    new THREE.OctahedronGeometry(4, 0),
    new THREE.DodecahedronGeometry(3, 0),
    new THREE.TorusGeometry(3.8, 0.6, 16, 32),
    new THREE.TetrahedronGeometry(3.2, 0),
    new THREE.TorusGeometry(5, 0.4, 16, 40)
  ];

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.88,
    roughness: 0.22,
    wireframe: false,
    flatShading: true
  });

  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffe89e,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });

  const floatingMeshes = [];
  const count = isMobile ? 8 : 16;

  for (let i = 0; i < count; i++) {
    const geo = geometries[i % geometries.length];
    const group = new THREE.Group();

    // Solid core
    const solidMesh = new THREE.Mesh(geo, goldMaterial);
    group.add(solidMesh);

    // Wireframe outer shell
    const wireMesh = new THREE.Mesh(geo, wireframeMaterial);
    wireMesh.scale.set(1.15, 1.15, 1.15);
    group.add(wireMesh);

    // Scatter in 3D space
    group.position.x = (Math.random() - 0.5) * 160;
    group.position.y = (Math.random() - 0.5) * 140;
    group.position.z = (Math.random() - 0.5) * 80 - 20;

    group.rotation.x = Math.random() * Math.PI;
    group.rotation.y = Math.random() * Math.PI;

    // Random rotational velocity
    group.userData = {
      rotX: (Math.random() - 0.5) * 0.008,
      rotY: (Math.random() - 0.5) * 0.012,
      rotZ: (Math.random() - 0.5) * 0.006,
      floatSpeed: 0.5 + Math.random() * 0.8,
      floatOffset: Math.random() * Math.PI * 2,
      initialY: group.position.y
    };

    bgScene.add(group);
    floatingMeshes.push(group);
  }

  // 3D Stardust & Golden Nebula Particles
  const particleCount = isMobile ? 220 : 550;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  const colorGold = new THREE.Color(0xd4af37);
  const colorCyan = new THREE.Color(0x00f2fe);
  const colorWhite = new THREE.Color(0xffffff);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 220;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 200;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 150;

    const mixedColor = Math.random() > 0.4 ? colorGold : (Math.random() > 0.5 ? colorCyan : colorWhite);
    particleColors[i3] = mixedColor.r;
    particleColors[i3 + 1] = mixedColor.g;
    particleColors[i3 + 2] = mixedColor.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  // Circular particle texture generator
  function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 215, 0, 0.8)');
    grad.addColorStop(0.7, 'rgba(0, 242, 254, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  const particleMat = new THREE.PointsMaterial({
    size: 2.2,
    map: createCircleTexture(),
    transparent: true,
    opacity: 0.85,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  bgScene.add(particleSystem);

  // Mouse & Scroll Parallax State
  let mouseX = 0;
  let mouseY = 0;
  let targetCameraX = 0;
  let targetCameraY = 0;
  let scrollY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;

    mouseLight.position.x = mouseX * 45;
    mouseLight.position.y = mouseY * 35;
  });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  window.addEventListener('resize', () => {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  /* =========================================================================
     2. HERO 3D INTERACTIVE GYROSCOPE CORE (360° Drag & Touch)
     ========================================================================= */
  const heroCoreContainer = document.getElementById('hero3DCore');
  let heroRenderer, heroScene, heroCamera, coreGroup;
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let velocity = { x: 0.005, y: 0.008 };

  if (heroCoreContainer) {
    const width = heroCoreContainer.clientWidth || 340;
    const height = heroCoreContainer.clientHeight || 340;

    heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: "high-performance" });
    heroRenderer.setSize(width, height);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
    heroCoreContainer.appendChild(heroRenderer.domElement);

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    heroCamera.position.z = 16;

    // Lights for hero jewel
    const heroHemi = new THREE.HemisphereLight(0xffffff, 0x111122, 1.5);
    heroScene.add(heroHemi);

    const heroKeyGold = new THREE.PointLight(0xffd700, 3, 50);
    heroKeyGold.position.set(10, 12, 10);
    heroScene.add(heroKeyGold);

    const heroRimCyan = new THREE.PointLight(0x00f2fe, 3, 50);
    heroRimCyan.position.set(-10, -10, 8);
    heroScene.add(heroRimCyan);

    coreGroup = new THREE.Group();
    heroScene.add(coreGroup);

    // 1. Central Faceted Crystal Jewel
    const crystalGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.12,
      flatShading: true,
      wireframe: false
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    coreGroup.add(crystal);

    // 2. Wireframe Hologram Aura
    const wireAuraGeo = new THREE.IcosahedronGeometry(3.3, 1);
    const wireAuraMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireAura = new THREE.Mesh(wireAuraGeo, wireAuraMat);
    coreGroup.add(wireAura);

    // 3. Gyroscope Outer Ring 1 (Gold)
    const ring1Geo = new THREE.TorusGeometry(4.4, 0.14, 16, 64);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xf6df88,
      metalness: 0.9,
      roughness: 0.2
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    coreGroup.add(ring1);

    // 4. Gyroscope Outer Ring 2 (Cyan/Chrome)
    const ring2Geo = new THREE.TorusGeometry(5.2, 0.1, 16, 64);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      metalness: 0.8,
      roughness: 0.3
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2.5;
    coreGroup.add(ring2);

    // 5. Small Orbiting Satellite Spheres
    const satellites = [];
    const satGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xd4af37,
      emissiveIntensity: 0.6,
      metalness: 0.5,
      roughness: 0.2
    });

    for (let s = 0; s < 3; s++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      coreGroup.add(sat);
      satellites.push({
        mesh: sat,
        angle: (s * Math.PI * 2) / 3,
        radius: 4.8 + s * 0.4,
        speed: 0.02 + s * 0.008,
        axisY: Math.sin(s)
      });
    }

    // Interactive Dragging on Hero Core
    const domEl = heroRenderer.domElement;
    domEl.style.cursor = 'grab';

    domEl.addEventListener('mousedown', (e) => {
      isDragging = true;
      domEl.style.cursor = 'grabbing';
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      domEl.style.cursor = 'grab';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      velocity.y = deltaX * 0.005;
      velocity.x = deltaY * 0.005;

      coreGroup.rotation.y += velocity.y;
      coreGroup.rotation.x += velocity.x;

      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    // Touch support for mobile
    domEl.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;

      velocity.y = deltaX * 0.005;
      velocity.x = deltaY * 0.005;

      coreGroup.rotation.y += velocity.y;
      coreGroup.rotation.x += velocity.x;

      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    // Core Animation loop function
    function animateHeroCore(time) {
      if (!isDragging) {
        // Natural spinning with friction
        velocity.x *= 0.96;
        velocity.y *= 0.96;

        coreGroup.rotation.x += velocity.x + 0.004;
        coreGroup.rotation.y += velocity.y + 0.007;
      }

      // Counter-rotating rings
      ring1.rotation.z += 0.012;
      ring1.rotation.y += 0.006;
      ring2.rotation.x += 0.01;
      ring2.rotation.y -= 0.008;

      wireAura.rotation.y -= 0.005;
      wireAura.rotation.x += 0.003;

      // Orbit satellites
      satellites.forEach(s => {
        s.angle += s.speed;
        s.mesh.position.x = Math.cos(s.angle) * s.radius;
        s.mesh.position.z = Math.sin(s.angle) * s.radius;
        s.mesh.position.y = Math.sin(s.angle * 2) * 1.4;
      });

      heroRenderer.render(heroScene, heroCamera);
    }

    // Attach to global loop
    window.renderHero3DCore = animateHeroCore;

    // Resize handler for hero core
    window.addEventListener('resize', () => {
      const nw = heroCoreContainer.clientWidth || 340;
      const nh = heroCoreContainer.clientHeight || 340;
      heroCamera.aspect = nw / nh;
      heroCamera.updateProjectionMatrix();
      heroRenderer.setSize(nw, nh);
    });
  }

  /* =========================================================================
     3. MASTER ANIMATION LOOP WITH AUTO-PAUSE & HERO INTERSECTION
     ========================================================================= */
  let clock = new THREE.Clock();
  let isTabActive = !document.hidden;
  let isHeroVisible = true;

  // Pause off-screen hero 3D rendering
  if ('IntersectionObserver' in window) {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isHeroVisible = entry.isIntersecting;
        });
      }, { rootMargin: '100px 0px 100px 0px', threshold: 0.01 });
      heroObserver.observe(heroSection);
    }
  }

  // Pause when tab minimized / switched
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    if (isTabActive) {
      clock.start();
      requestAnimationFrame(animate);
    }
  });

  function animate() {
    if (!isTabActive) return;
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // 1. Camera Parallax Tracking
    targetCameraX = mouseX * 12;
    targetCameraY = mouseY * 8 - (scrollY * 0.035);

    bgCamera.position.x += (targetCameraX - bgCamera.position.x) * 0.05;
    bgCamera.position.y += (targetCameraY - bgCamera.position.y) * 0.05;
    bgCamera.lookAt(0, - (scrollY * 0.025), 0);

    // 2. Rotate & Float 3D Gold Geometries
    floatingMeshes.forEach(mesh => {
      const d = mesh.userData;
      mesh.rotation.x += d.rotX;
      mesh.rotation.y += d.rotY;
      mesh.rotation.z += d.rotZ;

      // Vertical floating wave
      mesh.position.y = d.initialY + Math.sin(elapsedTime * d.floatSpeed + d.floatOffset) * 4;
    });

    // 3. Subtle rotation of particle field
    particleSystem.rotation.y = elapsedTime * 0.02;
    particleSystem.rotation.x = Math.sin(elapsedTime * 0.01) * 0.08;

    bgRenderer.render(bgScene, bgCamera);

    // 4. Render Hero 3D interactive core ONLY when hero is visible
    if (window.renderHero3DCore && isHeroVisible) {
      window.renderHero3DCore(elapsedTime);
    }
  }

  animate();

})();
