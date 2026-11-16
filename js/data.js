// Données de démonstration (fictives). À remplacer par une vraie base de données.
function makeSeed() {
  const H = 3600e3;
  const D = 24 * H;
  const now = Date.now();
  const msg = (from, text, minAgo, kind = 'text') => ({
    id: 'm' + Math.random().toString(36).slice(2, 9),
    from, kind, text, at: now - minAgo * 60e3, status: 'sent'
  });

  const people = [
    { id: 'u1', handle: 'awa-diallo', name: 'Awa Diallo', email: 'awa@exemple.dev', role: 'Développeuse full-stack', ville: 'Dakar', pays: 'Sénégal', fuseau: 'UTC+0', langues: ['Français', 'Wolof', 'Anglais'], stack: ['React', 'Node.js', 'PostgreSQL'], bio: "Je construis des outils de gestion pour les petites structures. J'aime expliquer simplement.", mentor: true, annees: 7, creneaux: ['Lun 18:00', 'Mer 19:00', 'Sam 10:00'] },
    { id: 'u2', handle: 'kofi-mensah', name: 'Kofi Mensah', email: 'kofi@exemple.dev', role: 'Développeur mobile', ville: 'Accra', pays: 'Ghana', fuseau: 'UTC+0', langues: ['Anglais', 'Twi', 'Français'], stack: ['Flutter', 'Dart', 'Firebase'], bio: 'Applications mobiles pour commerçants, avec un mode hors ligne par défaut.', mentor: true, annees: 5, creneaux: ['Mar 20:00', 'Jeu 18:30'] },
    { id: 'u3', handle: 'fatou-ndiaye', name: 'Fatou Ndiaye', email: 'fatou@exemple.dev', role: 'Data engineer', ville: 'Thiès', pays: 'Sénégal', fuseau: 'UTC+0', langues: ['Français', 'Wolof'], stack: ['Python', 'Airflow', 'SQL'], bio: 'Pipelines de données propres et documentés.', mentor: false, annees: 3, creneaux: [] },
    { id: 'u4', handle: 'yves-kouassi', name: 'Yves Kouassi', email: 'yves@exemple.dev', role: 'Ingénieur backend', ville: 'Abidjan', pays: "Côte d'Ivoire", fuseau: 'UTC+0', langues: ['Français', 'Anglais'], stack: ['Python', 'FastAPI', 'Docker'], bio: 'APIs de paiement mobile et tests automatisés.', mentor: true, annees: 6, creneaux: ['Ven 19:00', 'Dim 16:00'] },
    { id: 'u5', handle: 'nadia-elamrani', name: 'Nadia El Amrani', email: 'nadia@exemple.dev', role: 'Développeuse front-end', ville: 'Casablanca', pays: 'Maroc', fuseau: 'UTC+1', langues: ['Français', 'Arabe', 'Anglais'], stack: ['Vue', 'Tailwind', 'Accessibilité'], bio: "Des interfaces claires, accessibles et rapides à charger, même sur mobile.", mentor: false, annees: 4, creneaux: [] },
    { id: 'u6', handle: 'jean-marc-tchoumi', name: 'Jean-Marc Tchoumi', email: 'jeanmarc@exemple.dev', role: 'Ingénieur DevOps', ville: 'Douala', pays: 'Cameroun', fuseau: 'UTC+1', langues: ['Français', 'Anglais'], stack: ['Docker', 'Kubernetes', 'Linux'], bio: 'Déploiements simples et reproductibles, même avec peu de moyens.', mentor: true, annees: 8, creneaux: ['Lun 20:00', 'Sam 14:00'] },
    { id: 'u7', handle: 'amina-traore', name: 'Amina Traoré', email: 'amina@exemple.dev', role: 'Étudiante en informatique (L3)', ville: 'Bamako', pays: 'Mali', fuseau: 'UTC+0', langues: ['Français', 'Bambara'], stack: ['HTML', 'CSS', 'JavaScript'], bio: 'J apprends le développement web et je documente mes progrès.', mentor: false, annees: 1, creneaux: [] },
    { id: 'u8', handle: 'sipho-ndlovu', name: 'Sipho Ndlovu', email: 'sipho@exemple.dev', role: 'Développeur systèmes', ville: 'Johannesburg', pays: 'Afrique du Sud', fuseau: 'UTC+2', langues: ['Anglais', 'Zulu'], stack: ['Rust', 'WebAssembly'], bio: 'Outils rapides et sûrs, compilés pour le navigateur et les appareils modestes.', mentor: true, annees: 9, creneaux: ['Mer 12:00', 'Ven 18:00'] }
  ];

  const projects = [
    { id: 'p1', authorId: 'u1', nom: 'Kiosque Offline Sync', resume: 'Synchronisation hors ligne pour applications de vente, avec résolution des conflits.', stack: ['React', 'IndexedDB', 'Node.js'], licence: 'MIT', tests: { ok: 31, total: 32 }, reutilisations: 42, tags: ['hors ligne', 'synchro', 'réseau faible'], depot: 'depot/awa-diallo/kiosque-offline-sync', createdAt: now - 20 * D },
    { id: 'p2', authorId: 'u2', nom: 'Flutter Caisse Simple', resume: "Application de caisse pour petits commerces, fonctionne sans connexion et se synchronise ensuite.", stack: ['Flutter', 'Dart', 'Firebase'], licence: 'Apache-2.0', tests: { ok: 18, total: 18 }, reutilisations: 27, tags: ['commerce', 'mobile', 'hors ligne'], depot: 'depot/kofi-mensah/flutter-caisse', createdAt: now - 35 * D },
    { id: 'p3', authorId: 'u3', nom: 'Analyseur de relevés CSV', resume: 'Normalise les relevés de compte exportés par les opérateurs et détecte les formats.', stack: ['Python', 'pandas'], licence: 'MIT', tests: { ok: 12, total: 14 }, reutilisations: 19, tags: ['données', 'banque', 'CSV'], depot: 'depot/fatou-ndiaye/releves-csv', createdAt: now - 12 * D },
    { id: 'p4', authorId: 'u4', nom: 'Grand livre Mobile Money', resume: 'API de rapprochement des paiements mobile money, avec webhooks et journal d’audit.', stack: ['Python', 'FastAPI', 'Docker'], licence: 'MIT', tests: { ok: 40, total: 40 }, reutilisations: 55, tags: ['paiement', 'API', 'audit'], depot: 'depot/yves-kouassi/grand-livre', createdAt: now - 50 * D },
    { id: 'p5', authorId: 'u5', nom: 'Kit UI Kente', resume: 'Composants Vue accessibles et sobres, avec thème clair et sombre.', stack: ['Vue', 'Tailwind'], licence: 'CC-BY-4.0', tests: { ok: 9, total: 9 }, reutilisations: 14, tags: ['interface', 'accessibilité'], depot: 'depot/nadia-elamrani/kit-kente', createdAt: now - 8 * D },
    { id: 'p6', authorId: 'u6', nom: 'Compose en une commande', resume: 'Déploie une application et sa base sur un petit serveur, en une seule commande.', stack: ['Docker', 'Linux'], licence: 'MIT', tests: { ok: 6, total: 6 }, reutilisations: 33, tags: ['déploiement', 'serveur'], depot: 'depot/jean-marc-tchoumi/compose-oneshot', createdAt: now - 25 * D },
    { id: 'p7', authorId: 'u7', nom: 'Lexique Wolof-Français', resume: 'Petit lexique consultable hors ligne, pensé pour apprendre le développement web en wolof.', stack: ['HTML', 'JavaScript'], licence: 'CC-BY-SA-4.0', tests: { ok: 4, total: 5 }, reutilisations: 8, tags: ['éducation', 'hors ligne'], depot: 'depot/amina-traore/lexique', createdAt: now - 4 * D },
    { id: 'p8', authorId: 'u8', nom: 'Analyseur SMS en Rust', resume: 'Extrait les montants et références des SMS de paiement, compilé en WebAssembly.', stack: ['Rust', 'WebAssembly'], licence: 'Apache-2.0', tests: { ok: 22, total: 22 }, reutilisations: 16, tags: ['SMS', 'performance'], depot: 'depot/sipho-ndlovu/sms-rust', createdAt: now - 18 * D }
  ];

  const capsules = [
    { id: 'k1', projectId: 'p1', authorId: 'u1', titre: 'Synchro hors ligne en 8 minutes', duree: '08:14', theme: 'Architecture', vues: 412, chapitres: [{ t: '00:00', label: 'Le problème des caisses hors ligne' }, { t: '02:10', label: 'File d’attente locale' }, { t: '05:30', label: 'Résoudre un conflit' }], url: '', createdAt: now - 10 * D },
    { id: 'k2', projectId: 'p4', authorId: 'u4', titre: 'Relier un webhook mobile money', duree: '12:40', theme: 'Paiement', vues: 268, chapitres: [{ t: '00:00', label: 'Recevoir un événement' }, { t: '04:15', label: 'Vérifier la signature' }, { t: '09:20', label: 'Rapprochement et journal' }], url: '', createdAt: now - 6 * D },
    { id: 'k3', projectId: 'p6', authorId: 'u6', titre: 'Docker Compose sur un petit serveur', duree: '09:05', theme: 'Déploiement', vues: 190, chapitres: [{ t: '00:00', label: 'Choisir son serveur' }, { t: '03:40', label: 'Le fichier compose' }], url: '', createdAt: now - 3 * D },
    { id: 'k4', projectId: 'p8', authorId: 'u8', titre: 'Compiler du Rust vers WebAssembly', duree: '15:22', theme: 'Performance', vues: 133, chapitres: [{ t: '00:00', label: 'Pourquoi Rust' }, { t: '06:00', label: 'Construire le paquet' }], url: '', createdAt: now - 2 * D },
    { id: 'k5', projectId: 'p7', authorId: 'u7', titre: 'Le DOM expliqué simplement', duree: '06:30', theme: 'Débutants', vues: 77, chapitres: [{ t: '00:00', label: 'Qu’est-ce que le DOM' }, { t: '03:10', label: 'Modifier une page' }], url: '', createdAt: now - D }
  ];

  const reviews = [
    { id: 'r1', projectId: 'p1', authorId: 'u3', note: 5, texte: 'Bonne gestion des conflits, documentation claire.', createdAt: now - 4 * D },
    { id: 'r2', projectId: 'p1', authorId: 'u6', note: 4, texte: 'Idéal pour les caisses en zone rurale.', createdAt: now - 2 * D },
    { id: 'r3', projectId: 'p4', authorId: 'u2', note: 5, texte: 'Webhooks testés, prêt pour la production.', createdAt: now - 5 * D },
    { id: 'r4', projectId: 'p3', authorId: 'u1', note: 4, texte: 'Utile, la détection des formats peut encore progresser.', createdAt: now - 3 * D },
    { id: 'r5', projectId: 'p7', authorId: 'u5', note: 4, texte: 'Bon point de départ pour les débutants.', createdAt: now - D }
  ];

  const conversations = [
    { id: 'c1', type: 'dm', members: ['u3'], unread: 2, updatedAt: now - 175 * 60e3, messages: [
      msg('u3', "Salut ! J'ai testé ton Kiosque Offline, la gestion des conflits est propre.", 180),
      msg('u3', 'Tu veux qu’on regarde ensemble la synchro de ton module caisse ?', 175)
    ] },
    { id: 'c2', type: 'group', name: 'React débutants', members: ['u1', 'u5', 'u7'], unread: 0, updatedAt: now - 40 * 60e3, messages: [
      msg('u7', "Quelqu'un peut m'expliquer les hooks simplement ?", 90),
      msg('u1', 'Je fais une session jeudi soir, viens avec tes questions.', 70),
      msg('u5', 'Je partagerai des exemples dans la capsule Composants.', 40)
    ] },
    { id: 'c3', type: 'group', name: 'Mobile money dev', members: ['u2', 'u3', 'u4'], unread: 0, updatedAt: now - 280 * 60e3, messages: [
      msg('u4', 'Qui a un analyseur de relevés Orange Money propre ?', 300),
      msg('u3', 'Le mien est dans « Analyseur de relevés CSV », les dates sont gérées.', 280)
    ] },
    { id: 'c4', type: 'dm', members: ['u2'], unread: 0, updatedAt: now - 600 * 60e3, messages: [
      msg('u2', 'Ton avis sur Flutter pour les caisses hors ligne ? Je prépare une capsule.', 600)
    ] }
  ];

  const notifications = [
    { id: 'n1', text: 'Yves Kouassi a réutilisé « Kiosque Offline Sync » (crédit affiché).', at: now - 3 * H, read: false, to: 'u1' },
    { id: 'n2', text: 'Nouvelle capsule : « Docker Compose sur un petit serveur ».', at: now - 5 * H, read: false },
    { id: 'n3', text: 'Fatou Ndiaye a laissé un avis sur « Grand livre Mobile Money ».', at: now - D, read: true },
    { id: 'n4', text: 'Une demande de mentorat a été confirmée avec Awa Diallo.', at: now - 2 * D, read: true }
  ];

  return { session: null, online: true, people, projects, capsules, reviews, conversations, notifications, bookings: [], agentConfig: null };
}
