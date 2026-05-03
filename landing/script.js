/* =============================================
   CloudPulse Landing — Three.js 3D Scene +
   Interactions (Parallax, Tilt Cards, Timeline)
   ============================================= */

(function () {
  'use strict';

  // ─── THREE.JS 3D BACKGROUND ─────────────────
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  // ── Starfield (2000 points) ──
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    starPos[i] = (Math.random() - 0.5) * 200;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ── Pipeline Nodes (5 glowing icosahedrons) ──
  const nodePositions = [
    [-16, 2, -5], [-8, -1, -3], [0, 1.5, -4], [8, -0.5, -2], [16, 1, -6]
  ];
  const nodeColors = [0x38bdf8, 0x818cf8, 0x38bdf8, 0x818cf8, 0x4ade80];
  const nodes = [];

  nodePositions.forEach((pos, i) => {
    const geo = new THREE.IcosahedronGeometry(0.8, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: nodeColors[i],
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.userData = { baseY: pos[1], phase: Math.random() * Math.PI * 2 };
    scene.add(mesh);
    nodes.push(mesh);
  });

  // ── Connector Lines between nodes ──
  const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15 });
  for (let i = 0; i < nodes.length - 1; i++) {
    const points = [nodes[i].position.clone(), nodes[i + 1].position.clone()];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);
  }

  // ── Traveling Particles along connectors ──
  const particleCount = 80;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const segIdx = i % (nodes.length - 1);
    const pGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });
    const pMesh = new THREE.Mesh(pGeo, pMat);
    pMesh.userData = {
      segIdx,
      t: Math.random(),
      speed: 0.003 + Math.random() * 0.004
    };
    scene.add(pMesh);
    particles.push(pMesh);
  }

  // ── Mouse Parallax ──
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Animation Loop ──
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Rotate starfield slowly
    stars.rotation.y = t * 0.02;
    stars.rotation.x = t * 0.01;

    // Bob nodes
    nodes.forEach((n) => {
      n.position.y = n.userData.baseY + Math.sin(t * 0.8 + n.userData.phase) * 0.6;
      n.rotation.x = t * 0.3;
      n.rotation.y = t * 0.2;
    });

    // Move particles along segments
    particles.forEach((p) => {
      p.userData.t += p.userData.speed;
      if (p.userData.t > 1) p.userData.t = 0;
      const a = nodes[p.userData.segIdx].position;
      const b = nodes[p.userData.segIdx + 1].position;
      p.position.lerpVectors(a, b, p.userData.t);
    });

    // Camera parallax
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ─── INTERSECTION OBSERVER — Timeline Fade-in ───
  const tlItems = document.querySelectorAll('.tl-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });
  tlItems.forEach((item) => observer.observe(item));

  // ─── 3D TILT CARDS ──────────────────────────
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });

  // ─── ANIMATED SINE-WAVE CHART ───────────────
  const chartCanvas = document.getElementById('healthChart');
  if (chartCanvas) {
    const ctx = chartCanvas.getContext('2d');
    chartCanvas.width = chartCanvas.offsetWidth * 2;
    chartCanvas.height = 200;

    let offset = 0;
    function drawChart() {
      requestAnimationFrame(drawChart);
      offset += 0.03;
      ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let y = 0; y < chartCanvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartCanvas.width, y);
        ctx.stroke();
      }

      // Sine wave
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      for (let x = 0; x < chartCanvas.width; x++) {
        const y = chartCanvas.height / 2 +
          Math.sin((x / chartCanvas.width) * 6 + offset) * 35 +
          Math.sin((x / chartCanvas.width) * 12 + offset * 1.5) * 15;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Fill under curve
      ctx.lineTo(chartCanvas.width, chartCanvas.height);
      ctx.lineTo(0, chartCanvas.height);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, chartCanvas.height);
      grad.addColorStop(0, 'rgba(56,189,248,0.15)');
      grad.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }
    drawChart();
  }
})();
