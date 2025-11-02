(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const root = document.documentElement;
  const drawer = $('#drawer');
  const navToggle = $('#navToggle');
  const themeToggle = $('#themeToggle');
  const themeIcon = $('#themeIcon');
  const categoryList = $('#categoryList');
  const cardGrid = $('#cardGrid');
  const emptyState = $('#emptyState');
  const crumbCategory = $('#crumbCategory');
  const yearEl = $('#year');

  let currentCategory = 'all';

  // Utilities
  const storageKey = 'mc-theme';
  function setTheme(theme) {
    // theme: 'system' | 'dark' | 'light'
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      themeIcon.textContent = 'light_mode';
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      themeIcon.textContent = 'dark_mode';
    } else {
      // system
      root.removeAttribute('data-theme');
      const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
      themeIcon.textContent = prefersDark ? 'light_mode' : 'dark_mode';
    }
    try { localStorage.setItem(storageKey, theme); } catch {}
  }
  function initTheme() {
    let theme = 'system';
    try { theme = localStorage.getItem(storageKey) || 'system'; } catch {}
    setTheme(theme);
  }

  function applyFilters() {
    if (!cardGrid) return;
    let visibleCount = 0;
    const cards = $$('.kb-card', cardGrid);
    const q = new URLSearchParams(location.search).get('q')?.trim().toLowerCase();

    cards.forEach(card => {
      const cat = card.getAttribute('data-category');
      const inCategory = currentCategory === 'all' || cat === currentCategory;

      let inQuery = true;
      if (q) {
        const text = (card.textContent || '').toLowerCase();
        const tags = (card.getAttribute('data-tags') || '').toLowerCase();
        inQuery = text.includes(q) || tags.includes(q);
      }

      const show = inCategory && inQuery;
      card.hidden = !show;
      if (show) visibleCount++;
    });

    if (emptyState) emptyState.hidden = visibleCount !== 0;

    // Update breadcrumb
    if (crumbCategory) crumbCategory.textContent = categoryLabel(currentCategory);
  }

  // Category labels
  function categoryLabel(key) {
    switch (key) {
      case 'recipe': return 'レシピ';
      case 'tips': return 'TIPS';
      case 'others': return 'その他';
      default: return 'すべて';
    }
  }

  function setCategory(cat) {
    currentCategory = cat;
    // update UI active state
    $$('.nav-item', categoryList).forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === cat);
    });
    applyFilters();
  }

  // Event wiring
  navToggle?.addEventListener('click', () => {
    drawer?.classList.toggle('open');
  });

  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme'); // 'dark' | 'light' | null
    let next;
    if (current === 'dark') {
      next = 'light';
    } else if (current === 'light') {
      next = 'system';
    } else {
      next = 'dark';
    }
    setTheme(next);
  });

  categoryList?.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-item');
    if (!btn) return;
    const cat = btn.getAttribute('data-category');
    setCategory(cat);
    // Close drawer on mobile
    if (window.matchMedia('(max-width: 920px)').matches) drawer?.classList.remove('open');
  });

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // Initial category from hash (?cat=recipe)
    const params = new URLSearchParams(location.search);
    const initCat = params.get('cat');
    if (initCat && ['all','recipe','tips','others'].includes(initCat)) {
      setCategory(initCat);
    } else {
      setCategory('all');
    }

    applyFilters();
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  });
})();
