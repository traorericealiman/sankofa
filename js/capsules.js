// Capsules vidéo, mentorat, et accès programmatique (API) pour les outils externes.

function capsuleCard(c) {
  const a = U.person(c.authorId);
  const p = U.project(c.projectId);
  return `<a class="card capsule-card" href="#/capsule/${c.id}">
    <div class="thumb" style="background:${U.color(c.id)}"><span class="play" aria-hidden="true">▶</span><span class="duree">${U.esc(c.duree)}</span></div>
    <h3>${U.esc(c.titre)}</h3>
    <p class="muted small">${U.esc(a.name)} · ${U.esc(c.theme)}</p>
    <p class="muted small">${c.vues} vues${p ? ' · ' + U.esc(p.nom) : ''}</p>
  </a>`;
}

function capsuleRow(c) {
  return `<a class="row-item" href="#/capsule/${c.id}">
    <span class="thumb-sm" style="background:${U.color(c.id)}">▶</span>
    <div class="grow"><b>${U.esc(c.titre)}</b><small class="muted">${U.esc(c.duree)} · ${c.vues} vues</small></div>
  </a>`;
}

App.inputs.capsule = el => {
  const q = el.value.trim().toLowerCase();
  const list = Store.get().capsules.filter(c => {
    const a = U.person(c.authorId);
    return !q || [c.titre, c.theme, a.name].join(' ').toLowerCase().includes(q);
  });
  const grid = document.getElementById('cap-grid');
  if (grid) grid.innerHTML = list.length ? list.map(capsuleCard).join('') : U.empty('Aucune capsule ne correspond.');
};

App.routes.capsules = () => {
  const s = Store.get();
  const me = U.me();
  const mine = s.projects.filter(p => p.authorId === me.id);
  const form = App.ui.newCapsule ? `
  <section class="card narrow">
    <h2>Publier une capsule vidéo</h2>
    <form class="form" data-form="capsule">
      <label class="field"><span>Titre</span><input class="input" name="titre" required minlength="3" maxlength="90"></label>
      <div class="grid-2 tight">
        <label class="field"><span>Durée (mm:ss)</span><input class="input" name="duree" required pattern="[0-9]{1,2}:[0-5][0-9]" placeholder="04:30"></label>
        <label class="field"><span>Thème</span><input class="input" name="theme" required placeholder="Architecture, Débutants…"></label>
      </div>
      <label class="field"><span>Projet associé</span>
        <select class="input" name="projectId" required>
          ${mine.length ? mine.map(p => `<option value="${p.id}">${U.esc(p.nom)}</option>`).join('') : '<option value="">Publiez d’abord un projet</option>'}
        </select>
      </label>
      <label class="field"><span>Lien de la vidéo (facultatif)</span><input class="input" type="url" name="url" placeholder="https://…"></label>
      <label class="field"><span>Chapitres (un par ligne, format « 02:10 Titre »)</span><textarea class="input" name="chapitres" rows="3" placeholder="00:00 Introduction"></textarea></label>
      <div class="row gap"><button class="btn primary" type="submit" ${mine.length ? '' : 'disabled'}>Publier la capsule</button><button class="btn" type="button" data-action="capsuleToggle">Annuler</button></div>
    </form>
  </section>` : '';
  return `
  <div class="page-head">
    <div><h2>Capsules vidéo</h2><p class="muted">Explications courtes, démonstrations et tutoriels, liés aux projets.</p></div>
    <button class="btn primary" data-action="capsuleToggle">Publier une capsule</button>
  </div>
  ${form}
  <div class="toolbar"><input class="input grow" type="search" placeholder="Rechercher une capsule, un thème, un auteur" data-input="capsule"></div>
  <div class="grid-3" id="cap-grid">${s.capsules.map(capsuleCard).join('')}</div>`;
};

App.actions.capsuleToggle = () => {
  App.ui.newCapsule = !App.ui.newCapsule;
  App.render();
};

App.forms.capsule = form => {
  const s = Store.get();
  const titre = form.titre.value.trim();
  const projectId = form.projectId.value;
  const chapitres = form.chapitres.value.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const m = l.match(/^(\d{1,2}:[0-5]\d)\s+(.+)$/);
    return m ? { t: m[1], label: m[2] } : null;
  }).filter(Boolean);
  s.capsules.push({
    id: Store.uid('k'), projectId, authorId: U.me().id, titre, duree: form.duree.value.trim(),
    theme: form.theme.value.trim(), vues: 0, chapitres, url: form.url.value.trim(), createdAt: Date.now()
  });
  App.ui.newCapsule = false;
  Store.save();
  U.toast('Capsule publiée.');
  App.render();
};

App.routes.capsule = id => {
  const s = Store.get();
  const c = s.capsules.find(x => x.id === id);
  if (!c) return App.routes.notfound();
  const a = U.person(c.authorId);
  const p = U.project(c.projectId);
  return `
  <div class="breadcrumb"><a href="#/capsules">Capsules</a> / ${U.esc(c.titre)}</div>
  <div class="grid-2 wide-left">
    <section>
      <div class="player" role="img" aria-label="Lecteur vidéo">
        <span class="play big" aria-hidden="true">▶</span>
        <span class="duree">${U.esc(c.duree)}</span>
      </div>
      ${c.url ? `<p class="small"><a href="${U.esc(c.url)}" target="_blank" rel="noopener">Ouvrir la vidéo source</a></p>` : '<p class="muted small">Vidéo hébergée par l’auteur. Le lecteur se branche sur le lien fourni lors de la publication.</p>'}
      <h1 class="h1-sm">${U.esc(c.titre)}</h1>
      <p class="muted">${U.esc(a.name)} · ${U.esc(c.theme)} · ${c.vues} vues</p>
      ${p ? `<p>Projet associé : <a href="#/projet/${p.id}">${U.esc(p.nom)}</a></p>` : ''}
      <div class="row gap">
        <button class="btn" data-action="dm" data-id="${a.id}">Poser une question à l’auteur</button>
      </div>
    </section>
    <aside class="card">
      <h2>Chapitres</h2>
      ${c.chapitres.length ? `<ol class="chapters">${c.chapitres.map(ch => `<li><span class="mono">${U.esc(ch.t)}</span> ${U.esc(ch.label)}</li>`).join('')}</ol>` : U.empty('Pas de chapitres.')}
    </aside>
  </div>`;
};

// ---------- Mentorat ----------
App.routes.mentorat = () => {
  const s = Store.get();
  const me = U.me();
  const mentors = s.people.filter(p => p.mentor && p.id !== me.id);
  const mine = s.bookings.filter(b => b.menteeId === me.id);
  return `
  <div class="page-head"><div><h2>Mentorat</h2><p class="muted">Réservez un créneau de 30 minutes avec un senior. Échange en direct, audio ou texte.</p></div></div>
  <div class="stack-list">
    ${mentors.map(p => {
      const booked = s.bookings.filter(b => b.mentorId === p.id);
      return `<section class="card mentor-row">
        ${U.avatar(p, 'lg')}
        <div class="grow">
          <b>${U.esc(p.name)}</b> <span class="muted small">${U.esc(p.role)} · ${U.esc(p.ville)} · ${p.annees} ans</span>
          <div class="tags">${U.tags(p.stack)}</div>
          <div class="slots">${(p.creneaux || []).map(slot => {
            const taken = booked.some(b => b.slot === slot);
            return taken
              ? `<span class="slot taken">${U.esc(slot)} · réservé</span>`
              : `<button class="slot" data-action="book" data-mentor="${p.id}" data-slot="${U.esc(slot)}">${U.esc(slot)}</button>`;
          }).join('') || '<span class="muted small">Aucun créneau publié.</span>'}</div>
        </div>
        <button class="btn small" data-action="dm" data-id="${p.id}">Écrire</button>
      </section>`;
    }).join('') || U.empty('Aucun senior disponible pour le moment.')}
  </div>
  <h2>Mes réservations</h2>
  <section class="card">${mine.length ? mine.map(b => {
    const m = U.person(b.mentorId);
    return `<div class="row-item"><div class="grow"><b>${U.esc(m.name)}</b><small class="muted">${U.esc(b.slot)} · demandé le ${U.dateFr(b.at)}</small></div><span class="tests ok">Confirmé</span></div>`;
  }).join('') : U.empty('Aucune réservation pour le moment.')}</section>`;
};

App.actions.book = el => {
  const s = Store.get();
  const me = U.me();
  const mentor = U.person(el.dataset.mentor);
  const slot = el.dataset.slot;
  if (s.bookings.some(b => b.mentorId === mentor.id && b.slot === slot)) return U.toast('Ce créneau est déjà réservé.');
  s.bookings.push({ id: Store.uid('b'), mentorId: mentor.id, menteeId: me.id, slot, at: Date.now() });
  U.notify(`${me.name} a réservé « ${slot} » pour un mentorat.`, mentor.id);
  Store.save();
  U.toast(`Créneau réservé avec ${mentor.name}.`);
  App.render();
};

// ---------- API & accès ----------
function apiSearch(q, stack) {
  const s = Store.get();
  const needle = (q || '').trim().toLowerCase();
  return s.projects
    .filter(p => {
      const a = U.person(p.authorId);
      const hay = [p.nom, p.resume, a.name, ...p.stack, ...p.tags].join(' ').toLowerCase();
      if (needle && !hay.includes(needle)) return false;
      if (stack && !p.stack.map(x => x.toLowerCase()).includes(stack.toLowerCase())) return false;
      return true;
    })
    .slice(0, 5)
    .map(p => {
      const a = U.person(p.authorId);
      return {
        id: p.id,
        nom: p.nom,
        auteur: { nom: a.name, identifiant: a.handle },
        licence: p.licence,
        tests: `${p.tests.ok}/${p.tests.total}`,
        reutilisations: p.reutilisations,
        credit: `Crédit : ${p.nom} par ${a.name} (@${a.handle}), licence ${p.licence}.`
      };
    });
}

App.inputs.apiQuery = el => {
  const stack = document.getElementById('api-stack');
  const out = document.getElementById('api-out');
  if (!out) return;
  out.textContent = JSON.stringify({ resultats: apiSearch(el.value, stack ? stack.value : '') }, null, 2);
};

App.routes.api = () => {
  const cfg = App.ui.agentConfig;
  const example = {
    id: 'p1',
    nom: 'Kiosque Offline Sync',
    auteur: { nom: 'Awa Diallo', identifiant: 'awa-diallo' },
    licence: 'MIT',
    tests: '31/32',
    stack: ['React', 'IndexedDB', 'Node.js'],
    credit: 'Crédit : Kiosque Offline Sync par Awa Diallo (@awa-diallo), licence MIT.'
  };
  return `
  <div class="page-head"><div><h2>API & accès</h2><p class="muted">Pour les développeurs qui automatisent leurs outils. Les données publiques sont lisibles, la réutilisation est toujours créditée.</p></div></div>

  <div class="grid-2">
    <section class="card">
      <h2>Points d’accès</h2>
      <table class="table">
        <thead><tr><th>Méthode</th><th>Chemin</th><th>Rôle</th></tr></thead>
        <tbody>
          <tr><td>GET</td><td class="mono">/api/v1/projets?q=&amp;stack=</td><td>Recherche de projets publics</td></tr>
          <tr><td>GET</td><td class="mono">/api/v1/projets/:id</td><td>Détail d’un projet, licence et tests</td></tr>
          <tr><td>GET</td><td class="mono">/api/v1/capsules?theme=</td><td>Capsules vidéo associées</td></tr>
          <tr><td>POST</td><td class="mono">/api/v1/projets/:id/reutilisations</td><td>Enregistrer une réutilisation (authentifié)</td></tr>
        </tbody>
      </table>
      <h3>Exemple de réponse</h3>
      <pre class="code">${U.esc(JSON.stringify(example, null, 2))}</pre>
    </section>

    <section class="card">
      <h2>Essayer la recherche</h2>
      <div class="toolbar tight">
        <input class="input grow" type="search" placeholder="Ex. paiement, hors ligne, Rust" data-input="apiQuery">
        <select class="input" id="api-stack" data-input="apiQuery" aria-label="Technologie">
          <option value="">Toutes</option>
          ${[...new Set(Store.get().projects.flatMap(p => p.stack))].sort().map(x => `<option value="${U.esc(x)}">${U.esc(x)}</option>`).join('')}
        </select>
      </div>
      <pre class="code" id="api-out">${U.esc(JSON.stringify({ resultats: apiSearch('', '') }, null, 2))}</pre>
    </section>
  </div>

  <div class="grid-2">
    <section class="card">
      <h2>Configurer un accès automatisé</h2>
      <p class="muted small">Décrivez votre besoin : la configuration générée indique au script où chercher, quelles licences accepter et comment créditer l’auteur.</p>
      <form class="form" data-form="agentConfig">
        <label class="field"><span>Objectif</span><input class="input" name="objectif" required minlength="5" maxlength="160" placeholder="Ex. module de synchronisation hors ligne"></label>
        <label class="field"><span>Technologie principale</span><input class="input" name="stack" required placeholder="React"></label>
        <label class="field"><span>Licences acceptées</span>
          <select class="input" name="licences">
            <option value="MIT,Apache-2.0,CC-BY-4.0">Permissives (MIT, Apache-2.0, CC-BY-4.0)</option>
            <option value="MIT">MIT uniquement</option>
          </select>
        </label>
        <label class="check"><input type="checkbox" name="tests" checked> N’accepter que les projets dont les tests passent</label>
        <button class="btn primary" type="submit">Générer la configuration</button>
      </form>
    </section>
    <section class="card">
      <h2>Configuration générée</h2>
      ${cfg ? `<pre class="code" id="cfg-out">${U.esc(cfg)}</pre>
        <button class="btn small" data-action="copy" data-text="${U.esc(cfg)}">Copier</button>` : U.empty('Remplissez le formulaire pour générer une configuration.')}
    </section>
  </div>`;
};

App.forms.agentConfig = form => {
  const me = U.me();
  const cfg = {
    version: 1,
    proprietaire: me.handle,
    objectif: form.objectif.value.trim(),
    source: '/api/v1/projets',
    filtres: {
      stack: form.stack.value.trim(),
      licences: form.licences.value.split(','),
      tests_reussis: form.tests.checked
    },
    attribution: 'obligatoire',
    format_credit: 'Crédit : {nom} par {auteur} (@{identifiant}), licence {licence}.'
  };
  App.ui.agentConfig = JSON.stringify(cfg, null, 2);
  App.render();
};
