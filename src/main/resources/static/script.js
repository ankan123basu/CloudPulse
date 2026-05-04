/* =============================================
   CloudPulse — App Logic + Three.js
   ============================================= */

(function () {
  'use strict';

  const API_BASE = '/api/tasks';

  // ─── THREE.JS ───
  const canvas = document.getElementById('bg-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const starCount = 1800;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) { starPos[i] = (Math.random() - 0.5) * 40; starPos[i+1] = (Math.random() - 0.5) * 40; starPos[i+2] = (Math.random() - 0.5) * 40; }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.5 })));

  const nodeColors = [0x38bdf8, 0x818cf8, 0x4ade80, 0xe879f9, 0xfbbf24];
  const nodePos = [[-4,2,-4],[-2,-1.5,-5],[0,1,-3],[2,-1,-6],[4,2,-4]];
  const nodes = [];
  nodeColors.forEach((c,i) => {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2,1), new THREE.MeshBasicMaterial({color:c,wireframe:true,transparent:true,opacity:0.4}));
    m.position.set(...nodePos[i]); m.userData = {baseY:nodePos[i][1], speed:0.3+Math.random()*0.5, phase:Math.random()*Math.PI*2};
    scene.add(m); nodes.push(m);
  });

  const lm = new THREE.LineBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.06});
  [[0,1],[1,2],[2,3],[3,4],[0,2],[2,4]].forEach(([a,b])=>{ scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...nodePos[a]),new THREE.Vector3(...nodePos[b])]),lm)); });

  const tk = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5,0.25,80,6), new THREE.MeshBasicMaterial({color:0x818cf8,wireframe:true,transparent:true,opacity:0.025}));
  tk.position.set(0,0,-10); scene.add(tk);

  // Traveling particles along connector lines
  const conns = [[0,1],[1,2],[2,3],[3,4],[0,2],[2,4]];
  const travelParts = [];
  for (let i = 0; i < 40; i++) {
    const ci = conns[Math.floor(Math.random() * conns.length)];
    const pm = new THREE.Mesh(new THREE.SphereGeometry(0.03,4,4), new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.7}));
    pm.userData = {si:ci[0],ei:ci[1],t:Math.random(),spd:0.003+Math.random()*0.005};
    scene.add(pm); travelParts.push(pm);
  }

  // Pulsing ring
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.5,2.6,64), new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.04,side:THREE.DoubleSide}));
  ring.position.set(0,0,-7); scene.add(ring);

  // Floating orbs (ambient glow)
  const orbs = [];
  for (let i = 0; i < 8; i++) {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.08,8,8), new THREE.MeshBasicMaterial({color:[0x38bdf8,0xe879f9,0x4ade80,0xfbbf24][i%4],transparent:true,opacity:0.3}));
    orb.position.set((Math.random()-0.5)*12,(Math.random()-0.5)*8,-5-Math.random()*5);
    orb.userData = {baseX:orb.position.x,baseY:orb.position.y,sx:0.2+Math.random()*0.3,sy:0.15+Math.random()*0.25,px:Math.random()*6,py:Math.random()*6};
    scene.add(orb); orbs.push(orb);
  }

  let mx=0,my=0,tx=0,ty=0;
  document.addEventListener('mousemove', e => { mx=(e.clientX/window.innerWidth-0.5)*1; my=-(e.clientY/window.innerHeight-0.5)*0.6; });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    tx+=(mx-tx)*0.03; ty+=(my-ty)*0.03;
    camera.position.x=tx; camera.position.y=ty; camera.lookAt(0,0,0);
    const p=starGeo.attributes.position.array;
    for(let i=2;i<starCount*3;i+=3){p[i]+=0.006;if(p[i]>20)p[i]=-20;}
    starGeo.attributes.position.needsUpdate=true;
    nodes.forEach(n=>{n.rotation.x+=0.002;n.rotation.y+=0.004;n.position.y=n.userData.baseY+Math.sin(t*n.userData.speed+n.userData.phase)*0.2;});
    tk.rotation.x+=0.0008;tk.rotation.y+=0.001;

    // Traveling particles
    travelParts.forEach(p=>{
      p.userData.t+=p.userData.spd;
      if(p.userData.t>1){p.userData.t=0;const ci=conns[Math.floor(Math.random()*conns.length)];p.userData.si=ci[0];p.userData.ei=ci[1];}
      const s=nodePos[p.userData.si],e=nodePos[p.userData.ei];
      p.position.set(s[0]+(e[0]-s[0])*p.userData.t,s[1]+(e[1]-s[1])*p.userData.t,s[2]+(e[2]-s[2])*p.userData.t);
    });

    // Ring pulse
    ring.scale.set(1+Math.sin(t*0.5)*0.15,1+Math.sin(t*0.5)*0.15,1);
    ring.material.opacity=0.03+Math.sin(t*0.8)*0.015;
    ring.rotation.z+=0.001;

    // Floating orbs
    orbs.forEach(o=>{o.position.x=o.userData.baseX+Math.sin(t*o.userData.sx+o.userData.px)*0.8;o.position.y=o.userData.baseY+Math.cos(t*o.userData.sy+o.userData.py)*0.6;});

    renderer.render(scene,camera);
  }
  animate();
  window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});

  // ─── STATE ───
  let allTasks = [];

  // ─── API ───
  async function fetchTasks() {
    try {
      const res = await fetch(API_BASE);
      allTasks = await res.json();
      document.getElementById('api-status').textContent = 'Connected';
      document.getElementById('api-status').style.color = '#4ade80';
      render();
    } catch {
      document.getElementById('api-status').textContent = 'Offline — start Docker';
      document.getElementById('api-status').style.color = '#f87171';
      document.getElementById('task-list').innerHTML = '<div class="empty-state">⚠️ Cannot reach API.<br>Run: <code>docker-compose up -d</code></div>';
    }
  }

  async function createTask(data) { return (await fetch(API_BASE,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})).json(); }
  async function deleteTask(id) { await fetch(`${API_BASE}/${id}`,{method:'DELETE'}); fetchTasks(); }
  async function resolveConflict(id) { await fetch(`${API_BASE}/resolve/${id}`,{method:'POST'}); fetchTasks(); }
  async function markDone(id) { await fetch(`${API_BASE}/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'DONE'})}); fetchTasks(); }

  // ─── RENDER ALL ───
  function render() {
    renderTasks();
    renderConflicts();
    renderResources();
    renderTimeline();
    updateStats();
  }

  function getFiltered() {
    let tasks = [...allTasks];
    const search = (document.getElementById('search-tasks')?.value || '').toLowerCase();
    const status = document.getElementById('filter-status')?.value || '';
    if (search) tasks = tasks.filter(t => (t.title||'').toLowerCase().includes(search) || (t.assignee||'').toLowerCase().includes(search) || (t.resourceTag||'').toLowerCase().includes(search));
    if (status) tasks = tasks.filter(t => t.status === status);
    return tasks;
  }

  function renderTasks() {
    const tasks = getFiltered();
    const list = document.getElementById('task-list');
    if (tasks.length === 0) { list.innerHTML = '<div class="empty-state">No tasks found. Create your first task! ✨</div>'; return; }
    list.innerHTML = tasks.map(t => cardHTML(t)).join('');
  }

  function renderConflicts() {
    const conflicts = allTasks.filter(t => t.status === 'CONFLICT');
    const cnt = document.getElementById('conflict-count');
    cnt.textContent = conflicts.length;
    cnt.className = 'conflict-count' + (conflicts.length === 0 ? ' zero' : '');
    const banner = document.getElementById('conflict-banner');
    if (conflicts.length > 0) {
      banner.className = 'conflict-banner show';
      banner.innerHTML = `⚠️ <strong>${conflicts.length} conflict${conflicts.length>1?'s':''}</strong> detected. Click Auto-Resolve on any task to fix.`;
    } else {
      banner.className = 'conflict-banner clear';
      banner.innerHTML = '✅ No scheduling conflicts. All clear!';
    }
    const list = document.getElementById('conflict-list');
    if (conflicts.length === 0) { list.innerHTML = '<div class="empty-state">✅ No conflicts. All tasks are scheduled without overlap.</div>'; return; }
    list.innerHTML = conflicts.map(t => cardHTML(t, true)).join('');
  }

  function renderResources() {
    const groups = {};
    allTasks.forEach(t => { if (!groups[t.resourceTag]) groups[t.resourceTag] = []; groups[t.resourceTag].push(t); });
    const view = document.getElementById('resource-view');
    if (!Object.keys(groups).length) { view.innerHTML = '<div class="empty-state">No resources assigned yet.</div>'; return; }
    view.innerHTML = Object.entries(groups).map(([res, tasks]) => {
      const c = tasks.filter(t => t.status === 'CONFLICT').length;
      return `<div class="resource-group"><div class="resource-header"><span>🖥️ ${res}</span><span class="resource-count">${tasks.length} task${tasks.length>1?'s':''}${c?' · <span style="color:#f87171">'+c+' conflict'+(c>1?'s':'')+'</span>':''}</span></div>${tasks.map(t=>cardHTML(t)).join('')}</div>`;
    }).join('');
  }

  function renderTimeline() {
    const view = document.getElementById('timeline-view');
    const tasks = allTasks.filter(t => t.startTime && t.status !== 'DONE');
    if (!tasks.length) { view.innerHTML = '<div class="empty-state">No active tasks to display on timeline.</div>'; return; }
    const sorted = tasks.sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
    view.innerHTML = '<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">📅 Active tasks sorted by start time</div>' + sorted.map(t => {
      const s = new Date(t.startTime); const e = new Date(t.endTime);
      const fmt = d => d.toLocaleString('en-IN',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
      return `<div class="timeline-row"><div class="timeline-time">${fmt(s)}</div><div class="timeline-bar ${t.status.toLowerCase()}">${t.title} → ${fmt(e)}</div></div>`;
    }).join('');
  }

  function updateStats() {
    const total = allTasks.length;
    const conflicts = allTasks.filter(t => t.status === 'CONFLICT').length;
    const resolved = allTasks.filter(t => t.status === 'RESOLVED').length;
    const active = allTasks.filter(t => t.status !== 'DONE').length;
    const done = allTasks.filter(t => t.status === 'DONE').length;

    document.getElementById('hero-stats').innerHTML = `
      <div class="hero-stat"><span class="hero-stat-val">${total}</span><span class="hero-stat-label">Total Tasks</span></div>
      <div class="hero-stat alert"><span class="hero-stat-val">${conflicts}</span><span class="hero-stat-label">Conflicts</span></div>
      <div class="hero-stat success"><span class="hero-stat-val">${resolved}</span><span class="hero-stat-label">Resolved</span></div>
      <div class="hero-stat amber"><span class="hero-stat-val">${active}</span><span class="hero-stat-label">Active</span></div>
      <div class="hero-stat"><span class="hero-stat-val">${done}</span><span class="hero-stat-label">Completed</span></div>
    `;
    document.getElementById('nav-stats').innerHTML = `
      <span class="nav-stat">📋 <span class="nav-stat-val">${total}</span></span>
      <span class="nav-stat">⚠️ <span class="nav-stat-val">${conflicts}</span></span>
      <span class="nav-stat">✅ <span class="nav-stat-val">${resolved}</span></span>
    `;
  }

  function cardHTML(task, showResolve = false) {
    const sc = task.status.toLowerCase(), pc = task.priority.toLowerCase();
    const iC = task.status==='CONFLICT', iR = task.status==='RESOLVED', iD = task.status==='DONE';
    const fmtD = d => d ? new Date(d).toLocaleString('en-IN',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
    return `<div class="task-card ${iC?'conflict-card':''} ${iR?'resolved-card':''} ${iD?'done-card':''}">
      <div class="task-header"><span class="task-title">${task.title||'Untitled'}</span><span class="task-id">#${task.id}</span></div>
      ${task.description?`<div class="task-desc">${task.description}</div>`:''}
      <div class="task-meta">
        <span class="badge ${pc}">${task.priority}</span>
        <span class="badge ${sc}">${task.status}</span>
        <span class="task-resource">${task.resourceTag||'—'}</span>
        ${task.assignee?`<span class="task-assignee">👤 ${task.assignee}</span>`:''}
      </div>
      <div class="task-time">🕐 ${fmtD(task.startTime)} → ${fmtD(task.endTime)}</div>
      ${iR&&task.resolvedNote?`<div class="resolved-note">💡 ${task.resolvedNote}</div>`:''}
      <div class="task-actions">
        ${iC?`<button class="btn-small btn-resolve" onclick="window.cp.resolve('${task.id}')">⚡ Auto-Resolve</button>`:''}
        ${!iD?`<button class="btn-small btn-done" onclick="window.cp.done('${task.id}')">✓ Done</button>`:''}
        <button class="btn-small btn-delete" onclick="window.cp.del('${task.id}')">✕ Delete</button>
      </div>
    </div>`;
  }

  // ─── FORM ───
  document.getElementById('task-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.disabled = true; btn.textContent = 'Scheduling...';

    const data = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      assignee: document.getElementById('assignee').value,
      resourceTag: document.getElementById('resourceTag').value,
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      priority: document.querySelector('input[name="priority"]:checked').value
    };

    try {
      const r = await createTask(data);
      const rd = document.getElementById('form-result');
      if (r.conflictsDetected > 0) {
        rd.className = 'form-result show conflict';
        rd.innerHTML = `⚠️ <strong>Conflict detected!</strong> ${r.conflictsDetected} overlapping task(s) on ${data.resourceTag}. Go to Conflicts tab to resolve.`;
        showToast('⚠️ Conflict detected on ' + data.resourceTag, 'conflict');
      } else {
        rd.className = 'form-result show success';
        rd.innerHTML = `✅ <strong>"${data.title}"</strong> scheduled on ${data.resourceTag} successfully!`;
        showToast('✅ "' + data.title + '" scheduled!', 'success');
      }
      document.getElementById('task-form').reset();
      setDefaultTimes();
      setTimeout(() => rd.className = 'form-result', 6000);
      fetchTasks();
    } catch { alert('Failed — is the API running?'); }

    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Schedule Task';
  });

  // ─── TABS ───
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ─── SEARCH/FILTER ───
  document.getElementById('search-tasks')?.addEventListener('input', renderTasks);
  document.getElementById('filter-status')?.addEventListener('change', renderTasks);

  // ─── NAV LINKS ───
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // ─── DEFAULTS ───
  function setDefaultTimes() {
    const now = new Date();
    const later = new Date(now.getTime() + 3600000);
    document.getElementById('startTime').value = now.toISOString().slice(0, 16);
    document.getElementById('endTime').value = later.toISOString().slice(0, 16);
  }
  setDefaultTimes();

  // ─── TOAST NOTIFICATIONS ───
  function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
  }

  // ─── EXPOSE ───
  window.cp = {
    resolve: async id => { await resolveConflict(id); showToast('⚡ Conflict resolved!', 'success'); },
    del: async id => { if (confirm('Delete this task?')) { await deleteTask(id); showToast('🗑️ Task deleted', 'info'); } },
    done: async id => { await markDone(id); showToast('✓ Task completed!', 'success'); }
  };

  // ─── ANIMATED COUNTER ───
  function animateValue(el, end) {
    const start = parseInt(el.textContent) || 0;
    if (start === end) return;
    const dur = 400, st = performance.now();
    function step(now) {
      const p = Math.min((now - st) / dur, 1);
      el.textContent = Math.round(start + (end - start) * p);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ─── INIT ───
  fetchTasks();
  setInterval(fetchTasks, 5000);

})();
