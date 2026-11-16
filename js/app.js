// Cœur de l'application : routeur, coquille, authentification, accueil, explorer, projets, profils, paramètres.
const App = { routes: {}, actions: {}, forms: {}, inputs: {}, after: {}, ui: { authMode: 'login', newGroup: false, newCapsule: false, agentConfig: null } };

const U = {
  esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  initials(name) {
    return String(name).split(/\s+/).map(p => p[0] || '').join('').slice(0, 2).toUpperCase();
  },
  color(id) {
    const cols = ['#0F4C3A', '#B5651D', '#2F6690', '#7A3E65', '#4F6D2A', '#8C2F39', '#3D5A80', '#6B4F1D'];
    let h = 0;
    for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return cols[h % cols.length];
  },
  avatar(p, cls = '') {
    if (!p) return `<span class="avatar ${cls}" style="background:#999">?</span>`;
    return `<span class="avatar ${cls}" style="background:${U.color(p.id)}">${U.esc(U.initials(p.name))}</span>`;
  },
  ago(t) {
    const d = (Date.now() - t) / 1000;
    if (d < 60) return "à l'instant";
    if (d < 3600) return Math.floor(d / 60) + ' min';
    if (d < 86400) return Math.floor(d / 3600) + ' h';
    return Math.floor(d / 86400) + ' j';
  },
  hhmm(t) {
    return new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  },
  dateFr(t) {
    return new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  },
  person(id) {
    return Store.get().people.find(p => p.id === id);
  },
  project(id) {
    return Store.get().projects.find(p => p.id === id);
  },
  me() {
    const s = Store.get();
    return s.session ? s.people.find(p => p.id === s.session) || null : null;
  },
  avgNote(p) {
    const r = Store.get().reviews.filter(x => x.projectId === p.id);
    return r.length ? r.reduce((a, b) => a + b.note, 0) / r.length : null;
  },
  tags(list) {
    return (list || []).map(x => `<span class="tag">${U.esc(x)}</span>`).join('');
  },
  testsBadge(p) {
    const ok = p.tests.ok === p.tests.total;
    return `<span class="tests ${ok ? 'ok' : 'warn'}">Tests ${p.tests.ok}/${p.tests.total}</span>`;
  },
  empty(text) {
    return `<div class="empty">${U.esc(text)}</div>`;
  },
  toast(msg) {
    const box = document.getElementById('toasts');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  },
  notify(text, to) {
    const s = Store.get();
    s.notifications.unshift({ id: Store.uid('n'), text, at: Date.now(), read: false, to: to || null });
    Store.save();
  }
};

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').map(decodeURIComponent);
  return { name: parts[0] || 'accueil', args: parts.slice(1) };
}

// ---------- Coquille (menu, en-tête, navigation mobile) ----------
App.shell = function (route, content) {
  const s = Store.get();
  const me = U.me();
  const unread = s.conversations.reduce((n, c) => n + (c.unread || 0), 0);
  const notifs = s.notifications.filter(n => !n.read && (!n.to || n.to === me.id)).length;
  const links = [
    ['accueil', 'Accueil'],
    ['explorer', 'Explorer'],
    ['capsules', 'Capsules'],
    ['messages', 'Messages', unread],
    ['mentorat', 'Mentorat'],
    ['api', 'API & accès']
  ];
  const nav = links.map(([id, label, count]) =>
    `<a href="#/${id}" class="nav-link ${route === id ? 'active' : ''}">${label}${count ? `<span class="badge">${count}</span>` : ''}</a>`
  ).join('');
  const bottom = [['accueil', 'Accueil'], ['explorer', 'Explorer'], ['messages', 'Messages'], ['mentorat', 'Mentorat'], ['profil', 'Profil']].map(([id, label]) => {
    const target = id === 'profil' ? `#/profil/${me.id}` : `#/${id}`;
    const active = id === 'profil' ? route === 'profil' : route === id;
    return `<a href="${target}" class="${active ? 'active' : ''}">${label}</a>`;
  }).join('');
  const titles = { accueil: 'Accueil', explorer: 'Explorer', capsules: 'Capsules', messages: 'Messages', mentorat: 'Mentorat', api: 'API & accès', profil: 'Profil', projet: 'Projet', nouveau: 'Nouveau projet', parametres: 'Paramètres', notifications: 'Notifications', capsule: 'Capsule' };
  return `
  <div class="layout">
    <aside class="sidebar">
      <a href="#/accueil" class="logo"><span class="logo-mark">S</span><span>Sankofa</span></a>
      <nav class="nav">${nav}</nav>
      <a href="#/nouveau" class="btn primary block">Publier un projet</a>
      <div class="side-foot">
        <a href="#/profil/${me.id}" class="side-user">${U.avatar(me, 'sm')}<span><b>${U.esc(me.name)}</b><small>${U.esc(me.role)}</small></span></a>
        <button class="link-btn" data-action="logout">Se déconnecter</button>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <h1 class="topbar-title">${titles[route] || ''}</h1>
        <div class="top-actions">
          <a href="#/notifications" class="top-link">Notifications${notifs ? `<span class="badge">${notifs}</span>` : ''}</a>
          <a href="#/parametres" class="top-link">Paramètres</a>
        </div>
      </header>
      <main class="content">${content}</main>
    </div>
  </div>
  <nav class="bottom-nav">${bottom}</nav>`;
};

// ---------- Routage et rendu ----------
App.render = function () {
  const root = document.getElementById('root');
  const s = Store.get();
  const r = parseRoute();
  if (!s.session && r.name !== 'connexion') {
    location.hash = '#/connexion';
    return;
  }
  if (s.session && r.name === 'connexion') {
    location.hash = '#/accueil';
    return;
  }
  const view = App.routes[r.name] || App.routes.notfound;
  const html = view(...r.args);
  root.innerHTML = r.name === 'connexion' ? html : App.shell(r.name, html);
  if (App.after[r.name]) App.after[r.name](...r.args);
};

App.init = function () {
  Store.get();
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = App.actions[el.dataset.action];
    if (fn) {
      e.preventDefault();
      fn(el);
    }
  });
  document.addEventListener('submit', e => {
    const form = e.target;
    const fn = App.forms[form.dataset.form];
    if (fn) {
      e.preventDefault();
      fn(form);
    }
  });
  document.addEventListener('input', e => {
    const el = e.target.closest('[data-input]');
    if (!el) return;
    const fn = App.inputs[el.dataset.input];
    if (fn) fn(el);
  });
  window.addEventListener('hashchange', () => App.render());
  App.render();
};

// ---------- Authentification (démonstration) ----------
App.routes.connexion = () => {
  const signup = App.ui.authMode === 'signup';
  return `
  <div class="auth-wrap">
    <div class="auth card">
      <div class="logo big"><span class="logo-mark">S</span><span>Sankofa</span></div>
      <h1>${signup ? 'Créer un compte' : 'Bienvenue'}</h1>
      <p class="muted">La forge des développeurs africains : publiez vos projets, échangez directement, réutilisez du code crédité.</p>
      <div class="tabs">
        <button class="tab ${!signup ? 'active' : ''}" data-action="authMode" data-mode="login">Se connecter</button>
        <button class="tab ${signup ? 'active' : ''}" data-action="authMode" data-mode="signup">Créer un compte</button>
      </div>
      <form data-form="auth" class="form">
        ${signup ? `
        <label class="field"><span>Nom complet</span><input class="input" name="name" required minlength="2" maxlength="60" autocomplete="name"></label>
        <label class="field"><span>Rôle</span><input class="input" name="role" placeholder="Ex. Développeur backend" maxlength="60"></label>` : ''}
        <label class="field"><span>Adresse email</span><input class="input" type="email" name="email" required autocomplete="email"></label>
        <label class="field"><span>Mot de passe</span><input class="input" type="password" name="password" required minlength="4" autocomplete="current-password"></label>
        <button class="btn primary block" type="submit">${signup ? 'Créer mon compte' : 'Se connecter'}</button>
      </form>
      <p class="muted small">Démonstration : les données sont enregistrées dans ce navigateur. Un compte de démonstration existe déjà avec l'email awa@exemple.dev.</p>
    </div>
  </div>`;
};

App.actions.authMode = el => {
  App.ui.authMode = el.dataset.mode;
  App.render();
};

App.forms.auth = form => {
  const s = Store.get();
  const email = form.email.value.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return U.toast('Adresse email invalide.');
  let person = s.people.find(p => p.email === email);
  if (App.ui.authMode === 'signup') {
    const name = (form.name && form.name.value.trim()) || '';
    if (name.length < 2) return U.toast('Indiquez votre nom.');
    if (person) return U.toast('Un compte existe déjà avec cet email.');
    person = {
      id: Store.uid('u'), handle: name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name, email, role: (form.role && form.role.value.trim()) || 'Développeur', ville: '', pays: '', fuseau: 'UTC+0',
      langues: ['Français'], stack: [], bio: '', mentor: false, annees: 0, creneaux: []
    };
    s.people.push(person);
  } else if (!person) {
    const name = email.split('@')[0];
    person = {
      id: Store.uid('u'), handle: name, name: name.charAt(0).toUpperCase() + name.slice(1), email, role: 'Développeur', ville: '', pays: '', fuseau: 'UTC+0',
      langues: ['Français'], stack: [], bio: '', mentor: false, annees: 0, creneaux: []
    };
    s.people.push(person);
  }
  s.session = person.id;
  Store.save();
  location.hash = '#/accueil';
};

App.actions.logout = () => {
  const s = Store.get();
  s.session = null;
  Store.save();
  location.hash = '#/connexion';
  App.render();
};

// ---------- Accueil ----------
function projectRow(p) {
  const a = U.person(p.authorId);
  return `<a class="row-item" href="#/projet/${p.id}">
    ${U.avatar(a, 'sm')}
    <div class="grow"><b>${U.esc(p.nom)}</b><small class="muted">${U.esc(a.name)} · ${U.esc(p.licence)}</small></div>
    <span class="muted">↻ ${p.reutilisations}</span>
  </a>`;
}

function projectCard(p) {
  const a = U.person(p.authorId);
  const note = U.avgNote(p);
  return `<a class="card project-card" href="#/projet/${p.id}">
    <div class="row between">
      <span class="licence">${U.esc(p.licence)}</span>
      ${U.testsBadge(p)}
    </div>
    <h3>${U.esc(p.nom)}</h3>
    <p class="muted clamp">${U.esc(p.resume)}</p>
    <div class="tags">${U.tags(p.stack)}</div>
    <div class="row between card-foot">
      <span class="row gap-sm">${U.avatar(a, 'xs')}<span class="small">${U.esc(a.name)}</span></span>
      <span class="muted small">↻ ${p.reutilisations}${note ? ` · ★ ${note.toFixed(1)}` : ''}</span>
    </div>
  </a>`;
}

function mentorCard(p) {
  return `<div class="card person-card">
    ${U.avatar(p, 'lg')}
    <b>${U.esc(p.name)}</b>
    <span class="muted small">${U.esc(p.role)} · ${U.esc(p.ville)}</span>
    <div class="tags">${U.tags(p.stack.slice(0, 3))}</div>
    <a class="btn small" href="#/mentorat">Voir les créneaux</a>
  </div>`;
}

App.routes.accueil = () => {
  const s = Store.get();
  const me = U.me();
  const top = [...s.projects].sort((a, b) => b.reutilisations - a.reutilisations).slice(0, 4);
  const mentors = s.people.filter(p => p.mentor && p.id !== me.id).slice(0, 4);
  const caps = [...s.capsules].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  const stats = [
    ['Projets publiés', s.projects.length],
    ['Développeurs', s.people.length],
    ['Réutilisations', s.projects.reduce((n, p) => n + p.reutilisations, 0)],
    ['Capsules vidéo', s.capsules.length]
  ];
  const activity = s.notifications.slice(0, 4).map(n => `
    <li><span class="dot ${n.read ? '' : 'on'}"></span><div><span>${U.esc(n.text)}</span><small class="muted">il y a ${U.ago(n.at)}</small></div></li>`).join('');
  return `
  <section class="hero">
    <div>
      <p class="eyebrow">Bonjour ${U.esc(me.name.split(' ')[0])}</p>
      <h2 class="hero-title">Ce que la communauté construit aujourd’hui</h2>
      <p class="muted">Projets testés, capsules vidéo et entraide directe. Chaque réutilisation crédite son auteur.</p>
      <div class="row gap">
        <a class="btn primary" href="#/explorer">Explorer les projets</a>
        <a class="btn" href="#/messages">Ouvrir mes discussions</a>
      </div>
    </div>
    <div class="stats">${stats.map(([l, v]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
  </section>

  <div class="grid-2">
    <section class="card">
      <div class="row between"><h2>Projets les plus réutilisés</h2><a class="small" href="#/explorer">Tout voir</a></div>
      ${top.map(projectRow).join('')}
    </section>
    <section class="card">
      <h2>Activité récente</h2>
      <ul class="activity">${activity || '<li class="muted">Rien pour le moment.</li>'}</ul>
    </section>
  </div>

  <section>
    <div class="row between"><h2>Seniors disponibles pour un mentorat</h2><a class="small" href="#/mentorat">Réserver un créneau</a></div>
    <div class="grid-4">${mentors.map(mentorCard).join('')}</div>
  </section>

  <section>
    <div class="row between"><h2>Nouvelles capsules vidéo</h2><a class="small" href="#/capsules">Toutes les capsules</a></div>
    <div class="grid-3">${caps.map(capsuleCard).join('')}</div>
  </section>`;
};

// ---------- Explorer ----------
function filterProjects(q, stack, sort) {
  const s = Store.get();
  const needle = (q || '').trim().toLowerCase();
  let list = s.projects.filter(p => {
    const a = U.person(p.authorId);
    const hay = [p.nom, p.resume, a.name, p.licence, ...p.stack, ...p.tags].join(' ').toLowerCase();
    if (needle && !hay.includes(needle)) return false;
    if (stack && !p.stack.includes(stack)) return false;
    return true;
  });
  if (sort === 'recent') list.sort((a, b) => b.createdAt - a.createdAt);
  else if (sort === 'tests') list.sort((a, b) => (b.tests.ok / b.tests.total) - (a.tests.ok / a.tests.total));
  else list.sort((a, b) => b.reutilisations - a.reutilisations);
  return list;
}

App.refreshExplorer = () => {
  const q = document.getElementById('ex-q');
  if (!q) return;
  const list = filterProjects(q.value, document.getElementById('ex-stack').value, document.getElementById('ex-sort').value);
  document.getElementById('ex-grid').innerHTML = list.length ? list.map(projectCard).join('') : U.empty('Aucun projet ne correspond à votre recherche.');
};
App.inputs.explorer = () => App.refreshExplorer();

App.routes.explorer = () => {
  const s = Store.get();
  const stacks = [...new Set(s.projects.flatMap(p => p.stack))].sort();
  return `
  <div class="page-head">
    <div><h2>Explorer les projets</h2><p class="muted">Projets publics de la communauté, avec tests et licence visibles.</p></div>
    <a class="btn primary" href="#/nouveau">Publier mon projet</a>
  </div>
  <div class="toolbar">
    <input class="input grow" type="search" id="ex-q" placeholder="Rechercher un projet, une technologie, un tag" data-input="explorer">
    <select class="input" id="ex-stack" data-input="explorer" aria-label="Technologie">
      <option value="">Toutes les technologies</option>
      ${stacks.map(x => `<option value="${U.esc(x)}">${U.esc(x)}</option>`).join('')}
    </select>
    <select class="input" id="ex-sort" data-input="explorer" aria-label="Tri">
      <option value="reut">Les plus réutilisés</option>
      <option value="recent">Les plus récents</option>
      <option value="tests">Meilleurs tests</option>
    </select>
  </div>
  <div class="grid-3" id="ex-grid">${filterProjects('', '', 'reut').map(projectCard).join('')}</div>`;
};

// ---------- Projet ----------
App.routes.projet = id => {
  const s = Store.get();
  const p = U.project(id);
  if (!p) return App.routes.notfound();
  const a = U.person(p.authorId);
  const me = U.me();
  const note = U.avgNote(p);
  const reviews = s.reviews.filter(r => r.projectId === p.id);
  const caps = s.capsules.filter(c => c.projectId === p.id);
  const isMine = me.id === p.authorId;
  const credit = `Crédit : ${p.nom} par ${a.name} (@${a.handle}), licence ${p.licence}.`;
  return `
  <div class="breadcrumb"><a href="#/explorer">Explorer</a> / ${U.esc(p.nom)}</div>
  <section class="project-head card">
    <div class="grow">
      <div class="row gap-sm wrap">
        <span class="licence">${U.esc(p.licence)}</span>
        ${U.testsBadge(p)}
        <span class="muted small">↻ ${p.reutilisations} réutilisations${note ? ` · ★ ${note.toFixed(1)} (${reviews.length} avis)` : ''}</span>
      </div>
      <h1>${U.esc(p.nom)}</h1>
      <p class="lead">${U.esc(p.resume)}</p>
      <a class="author-line" href="#/profil/${a.id}">${U.avatar(a, 'sm')}<span>${U.esc(a.name)} · ${U.esc(a.role)}</span></a>
    </div>
    <div class="project-actions">
      ${isMine ? '<a class="btn" href="#/parametres">Modifier mon profil</a>' : `
        <button class="btn primary" data-action="reuse" data-id="${p.id}">Réutiliser ce projet</button>
        <button class="btn" data-action="dm" data-id="${a.id}">Écrire à l’auteur</button>`}
    </div>
  </section>

  <div class="grid-2">
    <section class="card">
      <h2>Description</h2>
      <p>${U.esc(p.resume)} Ce projet est publié avec sa licence et ses tests : vous savez exactement ce que vous réutilisez.</p>
      <h3>Technologies</h3>
      <div class="tags">${U.tags(p.stack)}</div>
      <h3>Mots-clés</h3>
      <div class="tags">${U.tags(p.tags)}</div>
      <h3>Dépôt</h3>
      <p class="mono small">${U.esc(p.depot)}</p>
      <h3>Crédit à conserver</h3>
      <div class="credit-box">
        <code>${U.esc(credit)}</code>
        <button class="btn small" data-action="copy" data-text="${U.esc(credit)}">Copier</button>
      </div>
    </section>

    <section class="card">
      <h2>Capsules vidéo</h2>
      ${caps.length ? caps.map(capsuleRow).join('') : U.empty('Aucune capsule pour ce projet.')}
      <a class="small" href="#/capsules">Publier une capsule</a>
    </section>
  </div>

  <div class="grid-2">
    <section class="card">
      <h2>Avis (${reviews.length})</h2>
      ${reviews.length ? reviews.map(r => {
        const author = U.person(r.authorId);
        return `<div class="review"><div class="row between"><b>${U.esc(author.name)}</b><span class="stars">${'★'.repeat(r.note)}<span class="muted">${'★'.repeat(5 - r.note)}</span></span></div><p>${U.esc(r.texte)}</p></div>`;
      }).join('') : U.empty('Pas encore d’avis.')}
    </section>
    <section class="card">
      <h2>Donner un avis</h2>
      ${isMine ? '<p class="muted">Vous ne pouvez pas noter votre propre projet.</p>' : `
      <form class="form" data-form="review" data-id="${p.id}">
        <label class="field"><span>Note</span>
          <select class="input" name="note" required>
            <option value="5">5 — Excellent</option><option value="4">4 — Très bien</option><option value="3">3 — Correct</option><option value="2">2 — Limité</option><option value="1">1 — À revoir</option>
          </select>
        </label>
        <label class="field"><span>Commentaire</span><textarea class="input" name="texte" rows="3" required minlength="5" maxlength="400" placeholder="Ce qui fonctionne, ce qui manque"></textarea></label>
        <button class="btn primary" type="submit">Publier l’avis</button>
      </form>`}
    </section>
  </div>`;
};

App.actions.reuse = el => {
  const s = Store.get();
  const p = U.project(el.dataset.id);
  const me = U.me();
  if (!p) return;
  p.reutilisations += 1;
  U.notify(`${me.name} a réutilisé « ${p.nom} » (crédit affiché).`, p.authorId);
  Store.save();
  U.toast(`Réutilisation enregistrée. L’auteur, ${U.person(p.authorId).name}, est crédité.`);
  App.render();
};

App.actions.copy = el => {
  const text = el.dataset.text;
  try {
    navigator.clipboard.writeText(text).then(() => U.toast('Crédit copié.'), () => U.toast('Copie impossible, sélectionnez le texte.'));
  } catch (e) {
    U.toast('Copie impossible dans ce navigateur.');
  }
};

App.forms.review = form => {
  const s = Store.get();
  const p = U.project(form.dataset.id);
  const me = U.me();
  const texte = form.texte.value.trim();
  if (texte.length < 5) return U.toast('Commentaire trop court.');
  s.reviews.push({ id: Store.uid('r'), projectId: p.id, authorId: me.id, note: parseInt(form.note.value, 10), texte, createdAt: Date.now() });
  U.notify(`${me.name} a laissé un avis sur « ${p.nom} ».`, p.authorId);
  Store.save();
  U.toast('Avis publié.');
  App.render();
};

App.actions.dm = el => {
  const s = Store.get();
  const otherId = el.dataset.id;
  let conv = s.conversations.find(c => c.type === 'dm' && c.members.length === 1 && c.members[0] === otherId);
  if (!conv) {
    conv = { id: Store.uid('c'), type: 'dm', members: [otherId], messages: [], unread: 0, updatedAt: Date.now() };
    s.conversations.push(conv);
    Store.save();
  }
  location.hash = `#/messages/${conv.id}`;
};

// ---------- Nouveau projet ----------
App.routes.nouveau = () => {
  const me = U.me();
  return `
  <div class="page-head"><div><h2>Publier un projet</h2><p class="muted">Partagez votre travail avec la communauté. La licence et les tests sont obligatoires.</p></div></div>
  <section class="card narrow">
    <form class="form" data-form="newProject">
      <label class="field"><span>Nom du projet</span><input class="input" name="nom" required minlength="3" maxlength="80"></label>
      <label class="field"><span>Résumé</span><textarea class="input" name="resume" rows="3" required minlength="10" maxlength="240" placeholder="Ce que fait le projet, en une ou deux phrases"></textarea></label>
      <label class="field"><span>Technologies (séparées par des virgules)</span><input class="input" name="stack" required placeholder="React, Node.js, PostgreSQL"></label>
      <label class="field"><span>Mots-clés (séparés par des virgules)</span><input class="input" name="tags" placeholder="hors ligne, paiement, débutants"></label>
      <label class="field"><span>Dépôt</span><input class="input" name="depot" required placeholder="depot/${U.esc(me.handle)}/mon-projet"></label>
      <div class="grid-2 tight">
        <label class="field"><span>Licence</span>
          <select class="input" name="licence" required>
            <option>MIT</option><option>Apache-2.0</option><option>GPL-3.0</option><option>CC-BY-4.0</option><option>CC-BY-SA-4.0</option>
          </select>
        </label>
        <div class="field"><span>Tests réussis / total</span>
          <div class="row gap-sm"><input class="input" type="number" name="ok" min="0" required value="0"><span>/</span><input class="input" type="number" name="total" min="0" required value="0"></div>
        </div>
      </div>
      <p class="muted small">Le dépôt doit être accessible. Les tests sont déclarés par l’auteur ; un test exécuté automatiquement peut être ajouté plus tard.</p>
      <button class="btn primary" type="submit">Publier</button>
    </form>
  </section>`;
};

App.forms.newProject = form => {
  const s = Store.get();
  const me = U.me();
  const nom = form.nom.value.trim();
  const resume = form.resume.value.trim();
  const ok = parseInt(form.ok.value, 10);
  const total = parseInt(form.total.value, 10);
  if (nom.length < 3) return U.toast('Le nom du projet est trop court.');
  if (resume.length < 10) return U.toast('Le résumé est trop court.');
  if (!(total >= 0) || !(ok >= 0) || ok > total) return U.toast('Vérifiez le nombre de tests.');
  const p = {
    id: Store.uid('p'), authorId: me.id, nom, resume,
    stack: form.stack.value.split(',').map(x => x.trim()).filter(Boolean),
    licence: form.licence.value,
    tests: { ok, total },
    reutilisations: 0,
    tags: form.tags.value.split(',').map(x => x.trim()).filter(Boolean),
    depot: form.depot.value.trim(),
    createdAt: Date.now()
  };
  s.projects.push(p);
  Store.save();
  U.toast('Projet publié.');
  location.hash = `#/projet/${p.id}`;
};

// ---------- Profil public ----------
App.routes.profil = id => {
  const s = Store.get();
  const p = U.person(id);
  if (!p) return App.routes.notfound();
  const me = U.me();
  const isMe = me.id === p.id;
  const projects = s.projects.filter(x => x.authorId === p.id);
  const caps = s.capsules.filter(x => x.authorId === p.id);
  const reuse = projects.reduce((n, x) => n + x.reutilisations, 0);
  return `
  <section class="profile-head card">
    ${U.avatar(p, 'xl')}
    <div class="grow">
      <h1>${U.esc(p.name)}</h1>
      <p class="lead">${U.esc(p.role)}${p.ville ? ` · ${U.esc(p.ville)}, ${U.esc(p.pays)}` : ''}</p>
      <p>${U.esc(p.bio || 'Pas encore de présentation.')}</p>
      <div class="tags">${U.tags(p.stack)}</div>
      <p class="muted small">Langues : ${U.esc((p.langues || []).join(', ') || '—')} · Fuseau : ${U.esc(p.fuseau || '—')} · ${p.annees} an(s) d’expérience${p.mentor ? ' · Dispo pour mentorat' : ''}</p>
    </div>
    <div class="project-actions">
      ${isMe ? '<a class="btn" href="#/parametres">Modifier mon profil</a>' : `<button class="btn primary" data-action="dm" data-id="${p.id}">Envoyer un message</button>`}
    </div>
  </section>
  <div class="stats-row">
    <div class="stat"><b>${projects.length}</b><span>Projets</span></div>
    <div class="stat"><b>${reuse}</b><span>Réutilisations créditées</span></div>
    <div class="stat"><b>${caps.length}</b><span>Capsules</span></div>
  </div>
  <h2>Projets</h2>
  <div class="grid-3">${projects.length ? projects.map(projectCard).join('') : U.empty('Aucun projet publié pour le moment.')}</div>
  <h2>Capsules</h2>
  <div class="grid-3">${caps.length ? caps.map(capsuleCard).join('') : U.empty('Aucune capsule vidéo.')}</div>`;
};

// ---------- Paramètres ----------
App.routes.parametres = () => {
  const me = U.me();
  return `
  <div class="page-head"><div><h2>Mon profil</h2><p class="muted">Ces informations apparaissent sur votre page publique.</p></div></div>
  <section class="card narrow">
    <form class="form" data-form="profile">
      <div class="grid-2 tight">
        <label class="field"><span>Nom complet</span><input class="input" name="name" required minlength="2" value="${U.esc(me.name)}"></label>
        <label class="field"><span>Rôle</span><input class="input" name="role" value="${U.esc(me.role)}"></label>
        <label class="field"><span>Ville</span><input class="input" name="ville" value="${U.esc(me.ville)}"></label>
        <label class="field"><span>Pays</span><input class="input" name="pays" value="${U.esc(me.pays)}"></label>
        <label class="field"><span>Fuseau horaire</span><input class="input" name="fuseau" value="${U.esc(me.fuseau)}"></label>
        <label class="field"><span>Années d’expérience</span><input class="input" type="number" min="0" name="annees" value="${me.annees}"></label>
      </div>
      <label class="field"><span>Langues (séparées par des virgules)</span><input class="input" name="langues" value="${U.esc((me.langues || []).join(', '))}"></label>
      <label class="field"><span>Technologies (séparées par des virgules)</span><input class="input" name="stack" value="${U.esc((me.stack || []).join(', '))}"></label>
      <label class="field"><span>Présentation</span><textarea class="input" name="bio" rows="3" maxlength="300">${U.esc(me.bio)}</textarea></label>
      <label class="check"><input type="checkbox" name="mentor" ${me.mentor ? 'checked' : ''}> Je suis disponible pour du mentorat</label>
      <label class="field"><span>Créneaux proposés (séparés par des virgules)</span><input class="input" name="creneaux" value="${U.esc((me.creneaux || []).join(', '))}" placeholder="Lun 18:00, Mer 19:00"></label>
      <div class="row gap"><button class="btn primary" type="submit">Enregistrer</button></div>
    </form>
  </section>
  <section class="card narrow">
    <h2>Données de démonstration</h2>
    <p class="muted">Rétablit les projets, capsules et discussions d’origine. Votre compte est conservé.</p>
    <button class="btn danger" data-action="resetDemo">Réinitialiser la démonstration</button>
  </section>`;
};

App.forms.profile = form => {
  const s = Store.get();
  const me = U.me();
  const name = form.name.value.trim();
  if (name.length < 2) return U.toast('Le nom est trop court.');
  const list = v => v.split(',').map(x => x.trim()).filter(Boolean);
  Object.assign(me, {
    name, role: form.role.value.trim(), ville: form.ville.value.trim(), pays: form.pays.value.trim(),
    fuseau: form.fuseau.value.trim(), annees: parseInt(form.annees.value, 10) || 0,
    langues: list(form.langues.value), stack: list(form.stack.value), bio: form.bio.value.trim(),
    mentor: form.mentor.checked, creneaux: list(form.creneaux.value)
  });
  Store.save();
  U.toast('Profil enregistré.');
  App.render();
};

App.actions.resetDemo = () => {
  if (!confirm('Réinitialiser les données de démonstration ? Vos modifications seront perdues.')) return;
  const session = Store.get().session;
  Store.reset();
  Store.get().session = session;
  Store.save();
  U.toast('Démonstration réinitialisée.');
  App.render();
};

// ---------- Notifications ----------
App.routes.notifications = () => {
  const me = U.me();
  const list = Store.get().notifications.filter(n => !n.to || n.to === me.id);
  return `
  <div class="page-head"><div><h2>Notifications</h2></div><button class="btn small" data-action="readAll">Tout marquer comme lu</button></div>
  <section class="card">
    ${list.length ? `<ul class="activity">${list.map(n => `<li><span class="dot ${n.read ? '' : 'on'}"></span><div><span>${U.esc(n.text)}</span><small class="muted">il y a ${U.ago(n.at)}</small></div></li>`).join('')}</ul>` : U.empty('Aucune notification.')}
  </section>`;
};

App.actions.readAll = () => {
  Store.get().notifications.forEach(n => (n.read = true));
  Store.save();
  App.render();
};

App.routes.notfound = () => `
  <section class="card narrow"><h2>Page introuvable</h2><p class="muted">Cette page n’existe pas.</p><a class="btn" href="#/accueil">Retour à l’accueil</a></section>`;
