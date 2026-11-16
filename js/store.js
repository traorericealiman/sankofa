// État de l'application : persisté dans le navigateur (localStorage), protégé contre les erreurs.
const Store = (() => {
  const KEY = 'sankofa.v1';
  let state = null;

  function load() {
    if (state) return state;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) {
      state = null;
    }
    if (!state || !Array.isArray(state.people)) state = makeSeed();
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Stockage indisponible (navigation privée, quota) : l'état reste en mémoire.
    }
  }

  function get() {
    return load();
  }

  function reset() {
    state = makeSeed();
    save();
  }

  function uid(prefix = 'id') {
    return prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  return { get, save, reset, uid };
})();
