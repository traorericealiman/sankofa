// Messagerie : discussions privées et groupes, pièces jointes, notes vocales, file d'attente hors ligne.
const REPLIES = [
  'Bien vu, je regarde ça ce soir.',
  'Tu as essayé avec la dernière version de la bibliothèque ?',
  'Envoie-moi la capture, je jette un œil.',
  'Merci pour le partage.',
  'Ok, on se cale un créneau demain ?',
  'Bonne idée, je note ça dans ma capsule.'
];

function convName(c) {
  if (c.type === 'dm') return U.person(c.members[0]).name;
  return c.name;
}

function convPreview(c, me) {
  const last = c.messages[c.messages.length - 1];
  if (!last) return 'Aucun message';
  const who = last.from === me.id ? 'Vous : ' : '';
  const body = last.kind === 'voice' ? 'Note vocale' : last.kind === 'file' ? 'Fichier partagé' : last.text;
  return who + body;
}

function convItem(c, me, active) {
  const last = c.messages[c.messages.length - 1];
  const ava = c.type === 'dm'
    ? U.avatar(U.person(c.members[0]), 'sm')
    : `<span class="avatar sm group">${U.esc(U.initials(c.name))}</span>`;
  return `<a class="conv ${active ? 'active' : ''}" href="#/messages/${c.id}">
    ${ava}
    <div class="conv-body">
      <div class="row between"><b class="clamp1">${U.esc(convName(c))}</b><span class="muted small">${last ? U.ago(last.at) : ''}</span></div>
      <div class="row between"><span class="muted clamp1 small">${U.esc(convPreview(c, me))}</span>${c.unread ? `<span class="badge">${c.unread}</span>` : ''}</div>
    </div>
  </a>`;
}

function messageHtml(m, c, me) {
  const mine = m.from === me.id;
  const author = U.person(m.from);
  const who = !mine && c.type === 'group' && author ? `<div class="msg-who">${U.esc(author.name)}</div>` : '';
  let body;
  if (m.kind === 'voice') {
    body = `<div class="voice"><span class="play" aria-hidden="true">▶</span><span class="wave" aria-hidden="true"></span><span class="small">${U.esc(m.text)}</span></div>`;
  } else if (m.kind === 'file') {
    body = `<div class="file"><b>Fichier</b> ${U.esc(m.text)}</div>`;
  } else {
    body = U.esc(m.text);
  }
  const tick = mine
    ? (m.status === 'queued' ? '<span class="tick queued">en attente</span>' : '<span class="tick">envoyé</span>')
    : '';
  return `<div class="msg ${mine ? 'mine' : ''}">${who}<div class="bubble">${body}</div><div class="meta">${U.hhmm(m.at)} ${tick}</div></div>`;
}

function chatHtml(c, me) {
  const s = Store.get();
  const dmPerson = c.type === 'dm' ? U.person(c.members[0]) : null;
  const title = convName(c);
  const sub = c.type === 'dm'
    ? `${U.esc(dmPerson.role)}${dmPerson.ville ? ' · ' + U.esc(dmPerson.ville) : ''}`
    : c.members.map(id => U.esc(U.person(id).name)).join(', ') + ', vous';
  const online = s.online;
  return `
  <header class="chat-head">
    <a href="#/messages" class="back" aria-label="Retour aux discussions">←</a>
    ${c.type === 'dm' ? U.avatar(dmPerson, 'sm') : `<span class="avatar sm group">${U.esc(U.initials(c.name))}</span>`}
    <div class="grow clamp1"><b>${U.esc(title)}</b><small class="muted clamp1 block">${sub}</small></div>
    <button class="pill ${online ? 'on' : 'off'}" data-action="toggleOnline" title="Simuler une coupure réseau">${online ? 'Connecté' : 'Hors ligne'}</button>
  </header>
  ${online ? '' : '<div class="offline-note">Hors ligne : vos messages restent en attente et partent dès le retour de la connexion.</div>'}
  <div class="chat-body" id="chat-body">
    ${c.messages.length ? c.messages.map(m => messageHtml(m, c, me)).join('') : '<div class="empty">Dites bonjour pour commencer.</div>'}
  </div>
  <form class="composer" data-form="send" data-id="${c.id}">
    <button type="button" class="btn small ghost" data-action="attach" data-id="${c.id}">Fichier</button>
    <button type="button" class="btn small ghost" data-action="voice" data-id="${c.id}">Vocal</button>
    <input class="input grow" name="text" placeholder="Écrire un message" autocomplete="off" maxlength="1000">
    <button class="btn primary" type="submit">Envoyer</button>
  </form>`;
}

function newGroupHtml() {
  const s = Store.get();
  const me = U.me();
  const others = s.people.filter(p => p.id !== me.id);
  return `
  <header class="chat-head"><a href="#/messages" class="back" aria-label="Annuler">←</a><div class="grow"><b>Nouveau groupe</b></div></header>
  <form class="form pad" data-form="group">
    <label class="field"><span>Nom du groupe</span><input class="input" name="name" required minlength="3" maxlength="60" placeholder="Ex. Flutter débutants"></label>
    <fieldset class="field"><legend>Membres</legend>
      <div class="checks">${others.map(p => `<label class="check"><input type="checkbox" name="m" value="${p.id}"> ${U.esc(p.name)} <span class="muted small">${U.esc(p.role)}</span></label>`).join('')}</div>
    </fieldset>
    <div class="row gap"><button class="btn primary" type="submit">Créer le groupe</button><a class="btn" href="#/messages">Annuler</a></div>
  </form>`;
}

App.routes.messages = convId => {
  const s = Store.get();
  const me = U.me();
  const convs = [...s.conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  const current = convId ? s.conversations.find(c => c.id === convId) : null;
  let pane;
  if (App.ui.newGroup) pane = newGroupHtml();
  else if (current) pane = chatHtml(current, me);
  else pane = '<div class="chat-empty">Choisissez une discussion, ou démarrez-en une depuis un profil.</div>';
  return `
  <div class="msg-layout ${current || App.ui.newGroup ? 'has-chat' : ''}">
    <aside class="conv-list card">
      <div class="conv-head">
        <h2>Discussions</h2>
        <button class="btn small" data-action="newGroupOpen">+ Groupe</button>
      </div>
      <div class="conv-items">${convs.map(c => convItem(c, me, current && current.id === c.id)).join('') || U.empty('Aucune discussion.')}</div>
    </aside>
    <section class="chat card">${pane}</section>
  </div>`;
};

App.after.messages = convId => {
  const s = Store.get();
  if (convId) {
    const c = s.conversations.find(x => x.id === convId);
    if (c && c.unread) {
      c.unread = 0;
      Store.save();
    }
  }
  const body = document.getElementById('chat-body');
  if (body) body.scrollTop = body.scrollHeight;
};

App.actions.newGroupOpen = () => {
  App.ui.newGroup = true;
  App.render();
};

App.forms.group = form => {
  const s = Store.get();
  const me = U.me();
  const name = form.name.value.trim();
  if (name.length < 3) return U.toast('Donnez un nom au groupe.');
  const members = [...form.querySelectorAll('input[name="m"]:checked')].map(i => i.value);
  if (!members.length) return U.toast('Ajoutez au moins un membre.');
  const conv = { id: Store.uid('c'), type: 'group', name, members, messages: [], unread: 0, updatedAt: Date.now() };
  s.conversations.push(conv);
  App.ui.newGroup = false;
  Store.save();
  location.hash = `#/messages/${conv.id}`;
};

// Envoi : si hors ligne, le message reste « en attente » jusqu'au retour de la connexion.
function pushMessage(convId, kind, text) {
  const s = Store.get();
  const me = U.me();
  const c = s.conversations.find(x => x.id === convId);
  if (!c) return null;
  const m = { id: Store.uid('m'), from: me.id, kind, text, at: Date.now(), status: s.online ? 'sent' : 'queued' };
  c.messages.push(m);
  c.updatedAt = m.at;
  Store.save();
  if (s.online) scheduleReply(convId);
  return m;
}

function scheduleReply(convId) {
  setTimeout(() => {
    const s = Store.get();
    const c = s.conversations.find(x => x.id === convId);
    if (!c) return;
    // Interlocuteurs possibles : les membres autres que moi, sinon une personne de la communauté.
    let pool = c.members.filter(id => id !== s.session);
    if (!pool.length) pool = s.people.filter(p => p.id !== s.session).map(p => p.id);
    if (!pool.length) return;
    const from = pool[Math.floor(Math.random() * pool.length)];
    c.messages.push({ id: Store.uid('m'), from, kind: 'text', text: REPLIES[Math.floor(Math.random() * REPLIES.length)], at: Date.now(), status: 'sent' });
    c.updatedAt = Date.now();
    const route = parseRoute();
    if (route.name === 'messages' && route.args[0] === convId) {
      c.unread = 0;
      Store.save();
      App.render();
    } else {
      c.unread = (c.unread || 0) + 1;
      Store.save();
    }
  }, 1200 + Math.random() * 1500);
}

App.forms.send = form => {
  const text = form.text.value.trim();
  if (!text) return;
  pushMessage(form.dataset.id, 'text', text);
  App.render();
};

App.actions.attach = el => {
  pushMessage(el.dataset.id, 'file', 'Document partagé (1,2 Mo)');
  App.render();
};

App.actions.voice = el => {
  pushMessage(el.dataset.id, 'voice', '0:08');
  App.render();
};

App.actions.toggleOnline = () => {
  const s = Store.get();
  s.online = !s.online;
  if (s.online) {
    // Retour de la connexion : envoi des messages en attente.
    s.conversations.forEach(c => {
      let flushed = false;
      c.messages.forEach(m => {
        if (m.status === 'queued') {
          m.status = 'sent';
          flushed = true;
        }
      });
      if (flushed) scheduleReply(c.id);
    });
  }
  Store.save();
  App.render();
};
