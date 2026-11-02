/* Soloman Northrop, portfolio. Plain JS, no dependencies. */
(() => {
  'use strict';
  const doc = document;
  const root = doc.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme (initial value is set inline in <head>) ---------- */
  const toggle = doc.getElementById('theme-toggle');
  const applyTheme = (t) => {
    root.dataset.theme = t;
    toggle.setAttribute('aria-pressed', String(t === 'light'));
  };
  applyTheme(root.dataset.theme || 'dark');
  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

  /* ---------- Scroll progress and active nav ---------- */
  const bar = doc.getElementById('progress-bar');
  const links = [...doc.querySelectorAll('.nav nav a')];
  const targets = links.map((a) => doc.querySelector(a.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    const h = doc.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    let current = null;
    for (const t of targets) if (t.getBoundingClientRect().top <= innerHeight * 0.4) current = t;
    links.forEach((a) => a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  doc.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- Copy email ---------- */
  const copyBtn = doc.getElementById('copy-email');
  let toast;
  const say = (msg) => {
    if (!toast) { toast = doc.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); doc.body.appendChild(toast); }
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 1800);
  };
  copyBtn?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(copyBtn.dataset.email); say('Email copied'); }
    catch { say(copyBtn.dataset.email); }
  });
  doc.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Hero field: a lidar sweep over a point grid ---------- */
  const canvas = doc.getElementById('field');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0, h = 0, dpr = 1, pts = [], angle = 0, raf = 0, visible = true;
    const origin = { x: 0.74, y: 0.5 }, target = { x: 0.74, y: 0.5 }, home = { x: 0.74, y: 0.5 };
    let acc = '#ff7a1a', ink = '236,234,228', accA = {};

    function hexA(hex, a) {
      const m = hex.replace('#', '');
      const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    const refreshColors = () => {
      acc = getComputedStyle(root).getPropertyValue('--accent').trim() || '#ff7a1a';
      ink = root.dataset.theme === 'light' ? '20,22,26' : '236,234,228';
      accA = { wedge: hexA(acc, 0.22), line: hexA(acc, 0.7), ring: hexA(acc, 0.5) };
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width)); h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = w < 700;
      home.x = small ? 0.82 : 0.74; home.y = small ? 0.16 : 0.5;
      target.x = origin.x = home.x; target.y = origin.y = home.y;
      pts = [];
      const step = small ? 34 : 30;
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          // keep the text column mostly clear
          const clear = small ? (y > h * 0.22 && y < h * 0.9) : (x < w * 0.56 && y > h * 0.12 && y < h * 0.86);
          pts.push({ x: x + (Math.random() - 0.5) * 6, y: y + (Math.random() - 0.5) * 6, a: clear ? 0.25 : 1, hit: 0, obj: Math.random() < 0.035 });
        }
      }
      refreshColors();
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      origin.x += (target.x - origin.x) * 0.03; origin.y += (target.y - origin.y) * 0.03;
      const ox = origin.x * w, oy = origin.y * h;
      if (!reduced) angle = (t / 1000) * 0.9;
      const R = Math.max(w, h);

      ctx.lineWidth = 1;
      for (let r = 90; r < R * 1.1; r += 90) {
        ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ink},${Math.max(0.01, 0.045 - r / (R * 40))})`; ctx.stroke();
      }
      const span = 0.55;
      if (ctx.createConicGradient) {
        const g = ctx.createConicGradient(angle - span, ox, oy);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(span / (Math.PI * 2), accA.wedge);
        g.addColorStop(span / (Math.PI * 2) + 0.002, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, R * 1.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath(); ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(angle) * R * 1.5, oy + Math.sin(angle) * R * 1.5);
      ctx.strokeStyle = accA.line; ctx.lineWidth = 1.2; ctx.stroke();

      for (const p of pts) {
        const da = Math.atan2(p.y - oy, p.x - ox);
        let diff = angle - da; diff = ((diff % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (diff < 0.05) p.hit = 1;
        p.hit *= 0.965;
        const base = 0.1 * p.a;
        if (p.obj) {
          const s = 2.2 + p.hit * 2;
          ctx.fillStyle = p.hit > 0.05 ? hexA(acc, 0.35 + p.hit * 0.65) : `rgba(${ink},${0.22 * p.a})`;
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
          if (p.hit > 0.4) {
            ctx.strokeStyle = hexA(acc, p.hit * 0.8); ctx.lineWidth = 1;
            ctx.strokeRect(p.x - 7, p.y - 7, 14, 14);
          }
        } else {
          ctx.fillStyle = p.hit > 0.02 ? hexA(acc, Math.min(1, base + p.hit)) : `rgba(${ink},${base})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 1 + p.hit * 1.4, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = accA.ring; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ox, oy, 9, 0, Math.PI * 2); ctx.stroke();

      if (!reduced && visible && !doc.hidden) raf = requestAnimationFrame(draw);
    };

    build(); draw(0);
    addEventListener('resize', () => { build(); if (reduced) draw(0); }, { passive: true });
    toggle.addEventListener('click', () => { refreshColors(); if (reduced) draw(0); });
    if (!reduced) {
      addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        if (e.clientY > r.bottom) return;
        target.x = home.x + ((e.clientX / r.width) - 0.5) * 0.08;
        target.y = home.y + ((e.clientY / r.height) - 0.5) * 0.12;
      }, { passive: true });
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
      }).observe(canvas);
      doc.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!doc.hidden) raf = requestAnimationFrame(draw); });
    }
  }

  /* ---------- Architecture diagrams ---------- */
  // edges: [from, to, highlight, dashed, offset]
  const DIAGRAMS = {
    robocor: {
      w: 520, h: 300,
      groups: [
        { x: 10, y: 10, w: 160, h: 280, label: 'On the robot' },
        { x: 190, y: 10, w: 150, h: 280, label: 'Operators' },
        { x: 360, y: 10, w: 150, h: 280, label: 'Cloud' },
      ],
      nodes: [
        { id: 'fw', x: 25, y: 40, w: 130, label: 'Firmware', sub: 'serial protocol, motor watchdog' },
        { id: 'jet', x: 25, y: 120, w: 130, label: 'Jetson', sub: 'ZED, YOLO, depth, ONNX, TensorRT', hi: true },
        { id: 'sim', x: 25, y: 200, w: 130, label: 'corBench', sub: 'WebGPU and Rapier test bench' },
        { id: 'app', x: 205, y: 40, w: 120, label: 'Flutter app', sub: 'six platforms, one codebase', hi: true },
        { id: 'llm', x: 205, y: 200, w: 120, label: 'LLM operator', sub: 'GPT-4o, realtime voice' },
        { id: 'db', x: 375, y: 40, w: 120, label: 'Supabase', sub: 'Postgres, auth, storage' },
        { id: 'wk', x: 375, y: 120, w: 120, label: 'Fly.io workers', sub: 'multi-tenant, Docker' },
        { id: 'ci', x: 375, y: 200, w: 120, label: 'CI and releases', sub: 'Windows, macOS, Jetson' },
      ],
      edges: [
        ['fw', 'jet'], ['jet', 'app', true], ['sim', 'jet', false, true], ['app', 'llm'], ['app', 'db', true], ['db', 'wk'], ['wk', 'jet', false, true], ['ci', 'app'],
      ],
    },
    medxr: {
      w: 520, h: 300,
      groups: [
        { x: 10, y: 10, w: 150, h: 280, label: 'Patient' },
        { x: 185, y: 10, w: 150, h: 280, label: 'Backend, AWS ECS' },
        { x: 360, y: 10, w: 150, h: 280, label: 'Clinic' },
      ],
      nodes: [
        { id: 'quest', x: 25, y: 60, w: 120, label: 'Meta Quest', sub: 'Svelte and Three.js WebXR', hi: true },
        { id: 'progress', x: 25, y: 170, w: 120, label: 'Adaptive input', sub: 'Xbox Adaptive, joystick HID' },
        { id: 'api', x: 200, y: 60, w: 120, label: 'Node realtime', sub: 'Colyseus rooms, Express', hi: true },
        { id: 'pipe', x: 200, y: 170, w: 120, label: 'Auth and progress', sub: 'Auth0, session reports' },
        { id: 'browser', x: 375, y: 60, w: 120, label: 'Practitioner', sub: 'any browser, live control', hi: true },
        { id: 'mon', x: 375, y: 170, w: 120, label: 'Clinic monitoring', sub: '15+ clinics' },
      ],
      edges: [
        ['quest', 'api', true, false, -7], ['api', 'quest', false, true, 7], ['api', 'browser', true, false, -7], ['browser', 'api', false, true, 7], ['progress', 'quest'], ['pipe', 'mon'], ['api', 'pipe'],
      ],
    },
    sollacode: {
      w: 520, h: 300,
      groups: [
        { x: 10, y: 10, w: 150, h: 280, label: 'Clients' },
        { x: 185, y: 10, w: 150, h: 280, label: 'Core' },
        { x: 360, y: 10, w: 150, h: 280, label: 'Agents and tools' },
      ],
      nodes: [
        { id: 'desk', x: 25, y: 40, w: 120, label: 'Electron desktop', sub: 'macOS, Windows' },
        { id: 'web', x: 25, y: 120, w: 120, label: 'Web', sub: 'React' },
        { id: 'mob', x: 25, y: 200, w: 120, label: 'Mobile', sub: 'Expo, remote control' },
        { id: 'orch', x: 200, y: 60, w: 120, label: 'Orchestrator', sub: 'multi-agent, approvals, state', hi: true },
        { id: 'sched', x: 200, y: 180, w: 120, label: 'Scheduler', sub: 'durable autonomous tasks' },
        { id: 'prov', x: 375, y: 40, w: 120, label: 'Providers', sub: 'Claude, Codex, Gemini', hi: true },
        { id: 'mcp', x: 375, y: 120, w: 120, label: 'MCP tools', sub: 'credential-bound' },
        { id: 'brw', x: 375, y: 200, w: 120, label: 'Shared browser', sub: 'human can take over' },
      ],
      edges: [
        ['desk', 'orch'], ['web', 'orch'], ['mob', 'orch'], ['orch', 'prov', true], ['orch', 'mcp'], ['orch', 'brw'], ['sched', 'orch', false, true], ['prov', 'mcp', false, true],
      ],
    },
    reach: {
      w: 520, h: 300,
      groups: [
        { x: 10, y: 10, w: 150, h: 280, label: 'Developers' },
        { x: 185, y: 10, w: 150, h: 280, label: 'Platform' },
        { x: 360, y: 10, w: 150, h: 280, label: 'Devices' },
      ],
      nodes: [
        { id: 'sdk', x: 25, y: 60, w: 120, label: 'Unity SDK', sub: 'headset, desktop, mobile', hi: true },
        { id: 'docs', x: 25, y: 170, w: 120, label: 'Generated docs', sub: 'C# generator' },
        { id: 'api', x: 200, y: 40, w: 120, label: 'Public API', sub: 'tenant isolation', hi: true },
        { id: 'sess', x: 200, y: 120, w: 120, label: 'Session broker', sub: 'multiplayer VR, AR, MR' },
        { id: 'stream', x: 200, y: 200, w: 120, label: 'Streaming', sub: 'low latency' },
        { id: 'fleet', x: 375, y: 60, w: 120, label: 'Device fleet', sub: 'remote management' },
        { id: 'hs', x: 375, y: 170, w: 120, label: 'Headsets', sub: 'shared sessions' },
      ],
      edges: [
        ['sdk', 'api', true], ['sdk', 'docs', false, true], ['api', 'sess'], ['api', 'stream'], ['api', 'fleet', true], ['sess', 'hs'], ['stream', 'hs'],
      ],
    },
    skycal: {
      w: 520, h: 300,
      groups: [
        { x: 10, y: 10, w: 150, h: 280, label: 'App' },
        { x: 185, y: 10, w: 150, h: 280, label: 'Supabase' },
        { x: 360, y: 10, w: 150, h: 280, label: 'Integrations' },
      ],
      nodes: [
        { id: 'ui', x: 25, y: 60, w: 120, label: 'React and Vite', sub: 'TypeScript, PWA', hi: true },
        { id: 'auth', x: 200, y: 40, w: 120, label: 'Auth', sub: 'households, roles' },
        { id: 'pg', x: 200, y: 120, w: 120, label: 'Postgres', sub: 'RLS, realtime', hi: true },
        { id: 'edge', x: 200, y: 200, w: 120, label: 'Edge functions', sub: 'webhooks, jobs' },
        { id: 'stripe', x: 375, y: 40, w: 120, label: 'Stripe', sub: 'household billing, portal' },
        { id: 'gcal', x: 375, y: 120, w: 120, label: 'Google, Outlook', sub: 'two-way sync, Graph' },
        { id: 'gem', x: 375, y: 200, w: 120, label: 'OpenAI realtime', sub: 'voice assistant' },
      ],
      edges: [
        ['ui', 'auth'], ['ui', 'pg', true, false, -7], ['pg', 'ui', false, true, 7], ['edge', 'pg'], ['stripe', 'edge', false, true], ['edge', 'gcal', true], ['edge', 'gem'],
      ],
    },
  };

  const NS = 'http://www.w3.org/2000/svg';
  const el = (name, attrs, text) => {
    const n = doc.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  };
  const wrap = (s, max) => {
    const out = []; let line = '';
    for (const word of s.split(' ')) {
      if ((line + ' ' + word).trim().length > max) { out.push(line.trim()); line = word; } else line += ' ' + word;
    }
    if (line.trim()) out.push(line.trim());
    return out;
  };
  const renderDiagram = (fig, d, name) => {
    const cap = fig.querySelector('figcaption');
    const capId = 'cap-' + name;
    if (cap) cap.id = capId;
    const svg = el('svg', { viewBox: `0 0 ${d.w} ${d.h}`, role: 'img', 'aria-labelledby': capId });
    const defs = el('defs');
    for (const [id, color] of [['arrow-' + name, 'var(--line-2)'], ['arrow-hi-' + name, 'var(--accent)']]) {
      const marker = el('marker', { id, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
      marker.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', style: `fill: ${color}` }));
      defs.appendChild(marker);
    }
    svg.appendChild(defs);

    for (const g of d.groups || []) {
      const grp = el('g', { class: 'dg-group' });
      grp.appendChild(el('rect', { x: g.x, y: g.y, width: g.w, height: g.h }));
      grp.appendChild(el('text', { x: g.x + 10, y: g.y + 16 }, g.label));
      svg.appendChild(grp);
    }
    // measure: wrap subs first so node heights are known before edges are routed
    for (const n of d.nodes) {
      n.lines = n.sub ? wrap(n.sub, Math.floor((n.w - 20) / 5.9)) : [];
      n.h = n.lines.length > 1 ? 58 : 46;
    }
    const byId = Object.fromEntries(d.nodes.map((n) => [n.id, n]));
    const center = (n) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });
    const port = (a, b, off) => {
      const ca = center(a), cb = center(b);
      const sep = b.x > a.x + a.w || b.x + b.w < a.x;
      if (sep) return { x: cb.x > ca.x ? a.x + a.w : a.x, y: ca.y + off };
      return { x: ca.x + off, y: cb.y > ca.y ? a.y + a.h : a.y };
    };
    for (const [from, to, hi, dash, off = 0] of d.edges) {
      const a = byId[from], b = byId[to];
      const p1 = port(a, b, off), p2 = port(b, a, off);
      const horizontal = Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y);
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      const path = horizontal
        ? `M${p1.x},${p1.y} C${mx},${p1.y} ${mx},${p2.y} ${p2.x},${p2.y}`
        : `M${p1.x},${p1.y} C${p1.x},${my} ${p2.x},${my} ${p2.x},${p2.y}`;
      svg.appendChild(el('path', { d: path, class: 'dg-edge' + (hi ? ' hi' : '') + (dash ? ' dash' : ''), 'marker-end': `url(#${hi ? 'arrow-hi-' : 'arrow-'}${name})` }));
    }
    for (const n of d.nodes) {
      const g = el('g', { class: 'dg-node' + (n.hi ? ' hi' : '') });
      g.appendChild(el('rect', { x: n.x, y: n.y, width: n.w, height: n.h }));
      g.appendChild(el('text', { x: n.x + 10, y: n.y + (n.sub ? 18 : n.h / 2 + 4) }, n.label));
      if (n.lines.length) {
        const t = el('text', { x: n.x + 10, y: n.y + 31, class: 'sub' });
        n.lines.forEach((l, i) => t.appendChild(el('tspan', { x: n.x + 10, dy: i ? 11 : 0 }, l)));
        g.appendChild(t);
      }
      svg.appendChild(g);
    }
    fig.insertBefore(svg, fig.firstChild);
    fig.classList.add('ready');
  };
  doc.querySelectorAll('.case-figure[data-diagram]').forEach((fig) => {
    const d = DIAGRAMS[fig.dataset.diagram]; if (d) renderDiagram(fig, d, fig.dataset.diagram);
  });

  /* ---------- GitHub repos and live status ---------- */
  const REPOS = [
    { name: 'sollacode', desc: 'Control surface for AI coding agents, forked from T3 Code and extended with orchestration, MCP, scheduling and a shared browser.', lang: 'TypeScript', stars: 1, url: 'https://github.com/sollaholla/sollacode' },
    { name: 'genedit-pro', desc: 'Browser-first AI video editor built on ffmpeg.wasm, with Playwright tests.', lang: 'TypeScript', stars: 1, url: 'https://github.com/sollaholla/genedit-pro' },
    { name: 'unity-authoritative-server-framework', desc: 'Authoritative server framework for Unity with client-side prediction.', lang: 'C#', stars: 2, url: 'https://github.com/sollaholla/unity-authoritative-server-framework' },
    { name: 'unity-simple-tp-controller', desc: 'A small third person controller setup for Unity.', lang: 'C#', stars: 16, url: 'https://github.com/sollaholla/unity-simple-tp-controller' },
    { name: 'me2ymap', desc: 'Converts map editor XML into ymap XML. Older modding tool, still used.', lang: 'C#', stars: 11, url: 'https://github.com/sollaholla/me2ymap' },
    { name: 'GTAMenu', desc: 'A menu library that replicates the vanilla GTA V menu. Early C# work.', lang: 'C#', stars: 7, url: 'https://github.com/sollaholla/GTAMenu' },
  ];
  const repoBox = doc.getElementById('repos');
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
  const card = (r) => {
    const a = doc.createElement('a');
    a.className = 'repo'; a.href = r.url; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = `<span class="repo-name">${icon}${r.name}</span><p class="repo-desc">${r.desc || ''}</p>
      <span class="repo-meta"><span class="lang" data-lang="${r.lang || ''}">${r.lang || 'Code'}</span><span>&#9733; ${r.stars ?? 0}</span>${r.updated ? `<span>updated ${r.updated}</span>` : ''}</span>`;
    return a;
  };
  const paint = (list) => { repoBox.replaceChildren(...list.map(card)); };
  const gh = (path) => fetch(`https://api.github.com/${path}`, { headers: { Accept: 'application/vnd.github+json' } }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const live = doc.getElementById('live');
  const paintLive = (s) => { if (live && s) live.textContent = s; };
  if (repoBox) {
    paint(REPOS);
    const cacheKey = 'gh-repos-v2';
    const cached = (() => { try { return JSON.parse(sessionStorage.getItem(cacheKey) || 'null'); } catch { return null; } })();
    if (cached) { paint(cached.repos); paintLive(cached.live); }
    else {
      Promise.all([...REPOS.map((r) => gh(`repos/sollaholla/${r.name}`)), gh('repos/sollaholla/sollacode/releases/latest')])
        .then((results) => {
          const latest = results.pop();
          const merged = REPOS.map((r, i) => {
            const g = results[i]; if (!g) return r;
            return { ...r, lang: g.language || r.lang, stars: g.stargazers_count, updated: new Date(g.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) };
          });
          let status = '';
          const sc = results[0];
          if (sc && sc.pushed_at) {
            const days = Math.max(0, Math.round((Date.now() - new Date(sc.pushed_at)) / 86400000));
            status = `sollacode: last push ${days === 0 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago'}` + (latest && latest.tag_name ? ` · latest stable ${latest.tag_name}` : '');
          }
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ repos: merged, live: status })); } catch { /* ignore */ }
          paint(merged); paintLive(status);
        });
    }
  }
})();
