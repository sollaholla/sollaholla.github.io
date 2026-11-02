/* Soloman Northrop, portfolio. Plain JS, no dependencies. */
(() => {
  'use strict';
  const doc = document;
  const root = doc.documentElement;

  /* Theme (initial value is set inline in <head>) */
  const toggle = doc.getElementById('theme-toggle');
  const applyTheme = (t) => {
    root.dataset.theme = t;
    toggle.setAttribute('aria-pressed', String(t === 'dark'));
  };
  applyTheme(root.dataset.theme || 'light');
  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

  /* Active nav */
  const links = [...doc.querySelectorAll('.nav nav a')];
  const targets = links.map((a) => doc.querySelector(a.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    let current = null;
    for (const t of targets) if (t.getBoundingClientRect().top <= innerHeight * 0.4) current = t;
    links.forEach((a) => a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Reveal on scroll (opacity only) */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  doc.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* Copy email */
  const copyBtn = doc.getElementById('copy-email');
  let toast;
  const say = (msg) => {
    if (!toast) { toast = doc.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); doc.body.appendChild(toast); }
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 1800);
  };
  copyBtn?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(copyBtn.dataset.email); say('Copied'); }
    catch { say(copyBtn.dataset.email); }
  });
  doc.getElementById('year').textContent = new Date().getFullYear();

  /* Architecture diagrams. edges: [from, to, highlight, dashed, offset] */
  const DIAGRAMS = {
    robocor: {
      w: 520, h: 300,
      groups: [
        { x: 10, y: 10, w: 160, label: 'On the robot' },
        { x: 190, y: 10, w: 150, label: 'Operators' },
        { x: 360, y: 10, w: 150, label: 'Cloud' },
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
        { x: 10, y: 10, w: 150, label: 'Patient' },
        { x: 185, y: 10, w: 150, label: 'Backend, AWS ECS' },
        { x: 360, y: 10, w: 150, label: 'Clinic' },
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
        { x: 10, y: 10, w: 150, label: 'Clients, upstream' },
        { x: 185, y: 10, w: 150, label: 'Core, my delta' },
        { x: 360, y: 10, w: 150, label: 'Agents and tools' },
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
  const narrow = matchMedia('(max-width: 600px)').matches;
  const relayoutNarrow = (d) => {
    // Phones: stack the three groups as bands, nodes in a two-column grid per band.
    const W = 340, colW = 150, gutter = 10, pad = 10, rowH = 70, headH = 26;
    let y = pad;
    const byGroup = d.groups.map((g) => d.nodes.filter((n) => n.x >= g.x && n.x < g.x + g.w));
    d.groups.forEach((g, gi) => {
      const list = byGroup[gi];
      const rows = Math.ceil(list.length / 2);
      g.x = pad; g.y = y; g.w = W - pad * 2;
      list.forEach((n, i) => {
        n.w = colW;
        n.x = pad + gutter + (i % 2) * (colW + gutter);
        n.y = y + headH + Math.floor(i / 2) * rowH;
      });
      y += headH + rows * rowH + 14;
    });
    d.w = W; d.h = y;
  };
  const renderDiagram = (fig, d, name) => {
    if (narrow && d.groups) relayoutNarrow(d);
    const cap = fig.querySelector('figcaption');
    const capId = 'cap-' + name;
    if (cap) cap.id = capId;
    const svg = el('svg', { viewBox: `0 0 ${d.w} ${d.h}`, role: 'img', 'aria-labelledby': capId });
    const defs = el('defs');
    for (const [id, color] of [['arrow-' + name, 'var(--ink-2)'], ['arrow-hi-' + name, 'var(--accent)']]) {
      const marker = el('marker', { id, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse' });
      marker.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', style: `fill: ${color}` }));
      defs.appendChild(marker);
    }
    svg.appendChild(defs);
    for (const g of d.groups || []) {
      const grp = el('g', { class: 'dg-group' });
      grp.appendChild(el('text', { x: g.x, y: g.y + 14 }, g.label));
      grp.appendChild(el('line', { x1: g.x, x2: g.x + g.w, y1: g.y + 20, y2: g.y + 20 }));
      svg.appendChild(grp);
    }
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

  /* GitHub repos and the live line */
  const REPOS = [
    { name: 'sollacode', desc: 'Fork of T3 Code for running several AI coding agents, extended with orchestration, MCP, scheduling and a shared browser.', lang: 'TypeScript', stars: 1, url: 'https://github.com/sollaholla/sollacode' },
  ];
  const repoBox = doc.getElementById('repos');
  const card = (r) => {
    const a = doc.createElement('a');
    a.className = 'repo'; a.href = r.url; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = `<span class="repo-name">${r.name}</span><p class="repo-desc">${r.desc || ''}</p>
      <span class="repo-meta"><span class="lang" data-lang="${r.lang || ''}">${r.lang || 'Code'}</span><span>${r.stars ?? 0} stars</span>${r.updated ? `<span>pushed ${r.updated}</span>` : ''}</span>`;
    return a;
  };
  const paint = (list) => { repoBox.replaceChildren(...list.map(card)); };
  const gh = (path) => fetch(`https://api.github.com/${path}`, { headers: { Accept: 'application/vnd.github+json' } }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const live = doc.getElementById('live');
  const paintLive = (s) => { if (live && s) live.textContent = s; };
  if (repoBox) {
    paint(REPOS);
    const cacheKey = 'gh-repos-v4';
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
            status = `sollacode: last push ${days === 0 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago'}` + (latest && latest.tag_name ? `, latest stable ${latest.tag_name}` : '');
          }
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ repos: merged, live: status })); } catch { /* ignore */ }
          paint(merged); paintLive(status);
        });
    }
  }
})();
