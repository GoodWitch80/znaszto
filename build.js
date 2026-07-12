/* ZnaszTo — static site generator. Run: node build.js */
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://znaszto.pl';
const SITE_NAME = 'ZnaszTo';
const TAGLINE = 'Kompetencje cyfrowe dla nauczycieli';
const DESC = 'Praktyczne narzędzia TIK, LLM i AI dla nauczycieli. Scenariusze lekcji, wskazówki i przykłady zastosowania w szkole.';
const OUT = __dirname;

const NAV = [
  { href: '/', label: 'Start' },
  { href: '/generator', label: 'Generator' },
  { href: '/narzedzia-tik', label: 'Narzędzia TIK' },
  { href: '/llm-w-szkole', label: 'LLM w szkole' },
  { href: '/scenariusze', label: 'Scenariusze' },
  { href: '/blog', label: 'Blog' },
  { href: '/o-projekcie', label: 'O projekcie' },
];

const ICON = {
  cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.3 2.7 2.5 6 2.5s6-1.2 6-2.5v-5"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2Z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8Z"/></svg>',
  brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 1 2.2A3 3 0 0 0 9 19a3 3 0 0 0 3-1Z"/><path d="M12 5a3 3 0 0 1 3 3 3 3 0 0 1 3 3 3 3 0 0 1-1 2.2A3 3 0 0 1 15 19a3 3 0 0 1-3-1Z"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 14v4M21 16h-4M5 4v2M6 5H4"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4Z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
  wand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 12-12M14 5l2 2M19 10l1 1M16 3l1 1M21 6l1 1M9 10l1 1"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></svg>',
};

function layout(opts) {
  const {
    path: pagePath,
    title,
    description,
    bodyClass = '',
    canonical = pagePath,
    ogType = 'website',
    jsonld = '',
    content,
    activeNav = canonical,
  } = opts;

  const navHtml = NAV.map((n) => {
    const cur = n.href === activeNav ? ' aria-current="page"' : '';
    return `<a href="${n.href}"${cur}>${n.label}</a>`;
  }).join('\n          ');

  const fullUrl = BASE_URL + (canonical === '/' ? '/' : canonical.replace(/\/$/, '') + '/');
  const assetBase = pagePath.includes('/') ? '../assets/' : 'assets/';

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="ZnaszTo">
  <link rel="canonical" href="${fullUrl}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:image" content="${BASE_URL}/assets/og-image.svg">
  <meta property="og:locale" content="pl_PL">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@ZnaszTo">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${BASE_URL}/assets/og-image.svg">
  <link rel="icon" type="image/svg+xml" href="${assetBase}favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap">
  <link rel="stylesheet" href="${assetBase}styles.css">
${jsonld}
</head>
<body class="${bodyClass}">
  <a class="skip-link" href="#main">Przejdź do treści</a>
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="brand" href="/" aria-label="ZnaszTo — strona główna">
        <span aria-hidden="true" style="width:30px;height:30px;display:inline-flex">${ICON.cap}</span>
        ZnaszTo
      </a>
      <nav class="nav" data-nav aria-label="Główna nawigacja">
          ${navHtml}
      </nav>
      <div class="header-actions">
        <button class="theme-toggle" data-theme-toggle aria-label="Przełącz motyw"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>
        <button class="nav-toggle" data-nav-toggle aria-label="Przełącz menu" aria-expanded="false">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
    </div>
  </header>
  <main id="main">
${content}
  </main>
  <footer class="site-footer">
    <div class="container site-footer__grid">
      <div>
        <a class="brand" href="/" aria-label="ZnaszTo">
          <span aria-hidden="true" style="width:28px;height:28px;display:inline-flex">${ICON.cap}</span>
          ZnaszTo
        </a>
        <p>${TAGLINE}. Platforma dla nauczycieli, którzy chcą wykorzystywać nowoczesne narzędzia cyfrowe — TIK, LLM i AI — w pracy z uczniami i dokumentacją szkolną.</p>
      </div>
      <div>
        <h4>Strony</h4>
        <ul>
          <li><a href="/">Start</a></li>
          <li><a href="/generator">Generator lekcji AI</a></li>
          <li><a href="/scenariusze">Scenariusze lekcji</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/o-projekcie">O projekcie</a></li>
        </ul>
      </div>
      <div>
        <h4>Moduły</h4>
        <ul>
          <li><a href="/narzedzia-tik">Narzędzia TIK</a></li>
          <li><a href="/llm-w-szkole">LLM w szkole</a></li>
          <li><a href="/ai-w-pracy">AI w pracy</a></li>
          <li><a href="/wspolpraca">Współpraca zespołowa</a></li>
          <li><a href="/polityka-prywatnosci">Polityka prywatności</a></li>
        </ul>
      </div>
    </div>
    <div class="container site-footer__bottom">
      <span>© 2026 ZnaszTo. Materiały edukacyjne.</span>
      <span>ZnaszTo — kompetencje cyfrowe dla nauczycieli</span>
    </div>
  </footer>
  <script src="${assetBase}app.js" defer></script>
</body>
</html>
`;
}

function homeJsonLd() {
  const obj = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': BASE_URL + '/#website',
        url: BASE_URL + '/',
        name: SITE_NAME,
        description: DESC,
        inLanguage: 'pl-PL',
        publisher: { '@id': BASE_URL + '/#org' },
      },
      {
        '@type': 'Organization',
        '@id': BASE_URL + '/#org',
        name: SITE_NAME,
        url: BASE_URL + '/',
        logo: BASE_URL + '/assets/favicon.svg',
        description: DESC,
      },
      {
        '@type': 'WebApplication',
        name: 'Generator lekcji AI — ZnaszTo',
        url: BASE_URL + '/generator',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' },
        inLanguage: 'pl-PL',
      },
    ],
  };
  return `  <script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

/* ---------- Page content ---------- */

const MODULES = [
  { href: '/narzedzia-tik', icon: 'wrench', title: 'Narzędzia TIK', desc: 'Podstawowe i zaawansowane narzędzia informacyjno-komunikacyjne: tablice, prezentacje, arkusze, wideokonferencje i platformy edukacyjne.' },
  { href: '/llm-w-szkole', icon: 'brain', title: 'LLM w szkole', desc: 'Jak bezpiecznie korzystać z modeli językowych? Prompt engineering, zasady etyki i ochrony danych w pracy nauczyciela.' },
  { href: '/ai-w-pracy', icon: 'sparkles', title: 'AI w pracy', desc: 'Sztuczna inteligencja w tworzeniu treści, pracy z dokumentami, planowaniu i komunikacji między nauczycielami.' },
  { href: '/scenariusze', icon: 'file', title: 'Scenariusze lekcji', desc: 'Gotowe pomysły na lekcje z wykorzystaniem AI i TIK. Wiek uczniów, czas trwania, narzędzia i przebieg zajęć.' },
  { href: '/generator', icon: 'wand', title: 'Generator lekcji AI', desc: 'Wpisz temat i cel, a AI przygotuje gotowy konspekt, kartę pracy i zadanie domowe — po polsku, w kilka sekund.' },
  { href: '/wspolpraca', icon: 'users', title: 'Współpraca zespołowa', desc: 'Narzędzia i metody współpracy między nauczycielami: wspólne planowanie, wymiana materiałów i komunikacja w zespole.' },
];

function moduleCard(m) {
  return `<a class="card" href="${m.href}">
    <span class="card__icon" aria-hidden="true">${ICON[m.icon]}</span>
    <h3>${m.title}</h3>
    <p>${m.desc}</p>
    <span class="card__arrow">Przejdź do modułu ${ICON.arrow}</span>
  </a>`;
}

function homeContent() {
  return `<section class="hero">
  <div class="container">
    <span class="eyebrow">TIK · LLM · AI</span>
    <h1>Kompetencje cyfrowe dla nauczycieli</h1>
    <p class="lead">Odkryj, jak narzędzia TIK, modele językowe LLM i sztuczna inteligencja mogą wspierać Twoją pracę z uczniami, dokumentacją szkolną oraz współpracę z zespołem.</p>
    <div class="hero-actions">
      <a class="btn btn--primary btn--lg" href="/generator">Wygeneruj lekcję z AI ${ICON.arrow}</a>
      <a class="btn btn--ghost btn--lg" href="/narzedzia-tik">Zobacz moduły</a>
    </div>
    <ul class="hero-badges">
      <li>${ICON.check} Za darmo</li>
      <li>${ICON.check} Bez logowania</li>
      <li>${ICON.check} Po polsku</li>
      <li>${ICON.check} Eksport do PDF</li>
    </ul>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="split">
      <div>
        <span class="eyebrow">Najpopularniejsza funkcja</span>
        <h2 style="font-size:var(--text-xl);margin-top:var(--space-3)">Generator lekcji AI</h2>
        <p class="lead" style="margin-top:var(--space-4)">Wpisz temat i cel lekcji, a sztuczna inteligencja przygotuje gotowy konspekt, kartę pracy dla uczniów oraz zadanie domowe — po polsku, w kilka sekund. Za darmo i bez logowania.</p>
        <ul class="checks">
          <li>${ICON.check} Gotowy konspekt z celem, przebiegiem i metodami pracy.</li>
          <li>${ICON.check} Karta pracy dla uczniów gotowa do skopiowania lub druku.</li>
          <li>${ICON.check} Dopasowanie do poziomu klasy i typu lekcji, eksport do PDF.</li>
        </ul>
        <div style="margin-top:var(--space-8);display:flex;gap:var(--space-3);flex-wrap:wrap">
          <a class="btn btn--primary" href="/generator">Otwórz generator ${ICON.arrow}</a>
          <a class="btn btn--ghost" href="/scenariusze">Zobacz scenariusze</a>
        </div>
      </div>
      <div class="callout-card">
        <span class="card__icon" aria-hidden="true">${ICON.wand}</span>
        <h3 style="font-size:var(--text-lg);margin-top:var(--space-3)">Trzy gotowe materiały — jedno kliknięcie</h3>
        <p style="color:var(--color-text-muted);margin-top:var(--space-2)">Konspekt, karta pracy i zadanie domowe generowane jednocześnie, dopasowane do przedmiotu, klasy i czasu trwania lekcji.</p>
        <a class="btn btn--primary" href="/generator" style="margin-top:var(--space-5)">Wygeneruj lekcję ${ICON.arrow}</a>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--color-surface-offset)">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Moduły edukacyjne</span>
      <h2>Wybierz temat, który Cię interesuje</h2>
      <p>Każdy moduł zawiera konkretne narzędzia, przykłady użycia i gotowe wskazówki.</p>
    </div>
    <div class="grid grid--3">
      ${MODULES.map(moduleCard).join('\n      ')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Dlaczego warto?</span>
      <h2>Cyfrowe kompetencje, które realnie odciążają</h2>
    </div>
    <div class="value-grid">
      <div class="value">
        <h3>${ICON.clock} Oszczędność czasu</h3>
        <p>AI i LLM pomagają przygotować materiały, pomoce dydaktyczne i formularze szybciej, pozwalając skupić się na uczniach.</p>
      </div>
      <div class="value">
        <h3>${ICON.target} Personalizacja nauki</h3>
        <p>Dzięki nowym narzędziom łatwiej dostosować treści do różnych poziomów, stylów uczenia się i potrzeb uczniów.</p>
      </div>
      <div class="value">
        <h3>${ICON.file} Lepsza dokumentacja</h3>
        <p>Automatyczne podsumowania, generowanie raportów i planów działań usprawniają codzienną pracę biurową w szkole.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cta-band">
      <h2>Gotowy, aby zacząć?</h2>
      <p>Przejdź do generatora i zobacz, jak nowoczesne narzędzia mogą wspierać Twoją pracę od dziś.</p>
      <a class="btn btn--primary btn--lg" href="/generator" style="margin-top:var(--space-6)">Wygeneruj lekcję z AI ${ICON.arrow}</a>
    </div>
  </div>
</section>`;
}

function generatorContent() {
  return `<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Darmowe narzędzie</span>
      <h1>Generator lekcji AI</h1>
      <p class="lead" style="margin-inline:auto">Wpisz temat i cel lekcji, a generator przygotuje gotowy konspekt, kartę pracy dla uczniów i zadanie domowe — po polsku, w kilka sekund. Za darmo, bez logowania, z eksportem do PDF.</p>
    </div>

    <form class="gen-form" id="gen-form" novalidate>
      <div class="field">
        <label for="temat">Temat lekcji *</label>
        <span class="hint">Np. „Fotosynteza — proces i znaczenie dla ekosystemu”.</span>
        <input type="text" id="temat" name="temat" required placeholder="Wpisz temat lekcji">
      </div>
      <div class="field">
        <label for="cel">Cel lekcji *</label>
        <span class="hint">Co uczeń ma potrafić po lekcji? Np. „Uczeń wyjaśni proces fotosyntezy i jej rolę”.</span>
        <textarea id="cel" name="cel" required placeholder="Wpisz główny cel lekcji"></textarea>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="przedmiot">Przedmiot</label>
          <select id="przedmiot" name="przedmiot">
            <option value="">— wybierz —</option>
            <option>Język polski</option><option>Matematyka</option><option>Przyroda / Biologia</option>
            <option>Fizyka / Chemia</option><option>Historia / WOS</option><option>Język obcy</option>
            <option>Informatyka</option><option>Geografia</option><option>Inny</option>
          </select>
        </div>
        <div class="field">
          <label for="klasa">Poziom klasy</label>
          <select id="klasa" name="klasa">
            <option value="">— wybierz —</option>
            <option>Edukacja wczesnoszkolna (1–3)</option>
            <option>Klasy 4–6</option><option>Klasy 7–8</option>
            <option>Szkoła ponadpodstawowa</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="czas">Czas trwania (minuty)</label>
          <input type="number" id="czas" name="czas" min="15" max="120" value="45">
        </div>
        <div class="field" style="justify-content:flex-end">
          <span class="hint">Dane nie są nigdzie wysyłane ani zapisywane — generator działa w Twojej przeglądarce.</span>
        </div>
      </div>
      <div style="display:flex;gap:var(--space-3);flex-wrap:wrap">
        <button type="submit" class="btn btn--primary btn--lg">${ICON.wand} Wygeneruj lekcję</button>
      </div>
    </form>

    <div class="gen-empty" id="gen-empty">
      <p>Wypełnij temat i cel lekcji, a otrzymasz konspekt, kartę pracy oraz zadanie domowe gotowe do druku / PDF.</p>
    </div>

    <div class="gen-output" id="gen-output" aria-live="polite">
      <div class="gen-tabs" role="tablist" aria-label="Wyniki generatora">
        <button role="tab" data-tab="konspekt" aria-selected="true">Konspekt</button>
        <button role="tab" data-tab="karta" aria-selected="false">Karta pracy</button>
        <button role="tab" data-tab="domowe" aria-selected="false">Zadanie domowe</button>
      </div>
      <div class="gen-panel active" data-panel="konspekt" id="gen-konspekt" role="tabpanel"></div>
      <div class="gen-panel" data-panel="karta" id="gen-karta" role="tabpanel"></div>
      <div class="gen-panel" data-panel="domowe" id="gen-domowe" role="tabpanel"></div>
      <div class="gen-actions">
        <button type="button" class="btn btn--primary" onclick="window.print()">${ICON.file} Drukuj / zapisz jako PDF</button>
        <a class="btn btn--ghost" href="/scenariusze">Zobacz gotowe scenariusze</a>
      </div>
    </div>
  </div>
</section>`;
}

function modulePageContent({ title, eyebrow, intro, sections, ctaText }) {
  const secHtml = sections.map((s) => {
    if (s.h2) {
      return `<h2>${s.h2}</h2>${s.paras.map((p) => `<p>${p}</p>`).join('')}${s.list ? `<ul class="dashed">${s.list.map((i) => `<li>${i}</li>`).join('')}</ul>` : ''}`;
    }
    return '';
  }).join('\n      ');

  return `<section class="section">
    <div class="container container-narrow">
      <span class="eyebrow">${eyebrow}</span>
      <h1 style="font-size:var(--text-xl);margin-top:var(--space-3)">${title}</h1>
      <p class="lead" style="margin-top:var(--space-4)">${intro}</p>
      <div class="prose" style="margin-top:var(--space-8)">
      ${secHtml}
      </div>
      <div class="cta-band" style="margin-top:var(--space-16)">
        <h2>${ctaText}</h2>
        <p>Przejdź do generatora i przygotuj własną lekcję w kilka sekund.</p>
        <a class="btn btn--primary btn--lg" href="/generator" style="margin-top:var(--space-6)">Wygeneruj lekcję z AI ${ICON.arrow}</a>
      </div>
    </div>
  </section>`;
}

function pages() {
  return [
    {
      path: 'index.html',
      title: 'ZnaszTo — Kompetencje cyfrowe dla nauczycieli',
      description: DESC,
      canonical: '/',
      jsonld: homeJsonLd(),
      content: homeContent(),
    },
    {
      path: 'generator.html',
      title: 'Generator lekcji AI — ZnaszTo',
      description: 'Darmowy generator lekcji dla nauczycieli. Wpisz temat i cel, a AI przygotuje gotowy konspekt, kartę pracy i zadanie domowe po polsku.',
      canonical: '/generator',
      content: generatorContent(),
    },
    {
      path: 'narzedzia-tik.html',
      title: 'Narzędzia TIK — ZnaszTo',
      description: 'Przegląd narzędzi TIK dla nauczycieli: platformy edukacyjne, prezentacje, tablice, arkusze, kalendarze i wideokonferencje.',
      canonical: '/narzedzia-tik',
      activeNav: '/narzedzia-tik',
      content: modulePageContent({
        eyebrow: 'Moduł TIK',
        title: 'Narzędzia TIK',
        intro: 'Przegląd podstawowych i zaawansowanych narzędzi informacyjno-komunikacyjnych, które wspierają codzienną pracę nauczyciela — od tablic i prezentacji po arkusze, wideokonferencje i platformy edukacyjne.',
        ctaText: 'Wypróbuj narzędzia na lekcji',
        sections: [
          { h2: 'Tablice interaktywne i prezentacje', paras: ['Tablica interaktywna to dziś sercem nowoczesnej sali. Pozwala wyświetlać materiały, annotować je na żywo i angażować uczniów.', 'Wspieraj się narzędziami takimi jak Canva dla Edukacji, Genially czy Google Slides — wszystkie oferują darmowe licencje dla szkół.'], list: ['Canva dla Edukacji (darmowa)', 'Google Slides / PowerPoint Online', 'Genially — interaktywne prezentacje'] },
          { h2: 'Arkusze i kalkulatory', paras: ['Arkusze kalkulacyjne (Excel, Google Sheets) pomagają w ocenianiu, śledzeniu postępów i tworzeniu list obecności.', 'Formularze (Google Forms, Microsoft Forms) sprawdzają się w szybkich quizach i ankietach ewaluacyjnych.'] },
          { h2: 'Wideokonferencje i komunikacja', paras: ['Google Meet i Microsoft Teams to standardy w edukacji zdalnej i hybrydowej.', 'Współdziel ekran, używaj breakout rooms do pracy w grupach i nagrywaj lekcje dla nieobecnych.'] },
          { h2: 'Platformy edukacyjne', paras: ['Zintegrowana Platforma Edukacyjna (zpe.gov.pl), Classroom i Teams dla Edukacji to repozytoria materiałów i miejsca na zadania.', 'Wybierz jedną platformę jako „centrum dowodzenia” dla swojej klasy — spójność zmniejsza obciążenie poznawcze uczniów.'] },
        ],
      }),
    },
    {
      path: 'llm-w-szkole.html',
      title: 'LLM w szkole — ZnaszTo',
      description: 'Jak bezpiecznie używać modeli językowych LLM w szkole: ChatGPT, Copilot, Gemini, zasady etyki, ochrony danych i prompt engineering.',
      canonical: '/llm-w-szkole',
      activeNav: '/llm-w-szkole',
      content: modulePageContent({
        eyebrow: 'Moduł LLM',
        title: 'LLM w szkole',
        intro: 'Jak bezpiecznie korzystać z modeli językowych? Poznaj podstawy prompt engineeringu, zasady etyki oraz ochrony danych w pracy nauczyciela.',
        ctaText: 'Zastosuj LLM na lekcji',
        sections: [
          { h2: 'Czym jest model językowy (LLM)?', paras: ['LLM (Large Language Model) to program uczony na ogromnych zbiorach tekstu, który generuje odpowiedzi w języku naturalnym.', 'Nie jest wyszukiwarką ani encyklopedią — generuje prawdopodobny tekst, dlatego zawsze weryfikuj fakty, daty i źródła.'] },
          { h2: 'Prompt engineering — jak pisać dobre polecenia', paras: ['Jakość odpowiedzi zależy od jakości promptu. Dobry prompt zawiera: rolę, kontekst, temat, format wyjścia i ograniczenia.', 'Zamiast „napisz lekcję” napisz: „Jesteś nauczycielem biologii w klasie 7. Przygotuj 45-minutowy konspekt lekcji o fotosyntezie z kartą pracy.”'] },
          { h2: 'Ochrona danych uczniów (RODO)', paras: ['Nigdy nie wklejaj do chatbota danych osobowych uczniów — imion, ocen, orzeczeń, opinii z dokumentacji.', 'Opisuj sytuację ogólnie („uczeń klasy 5 z trudnościami w czytaniu”), nigdy personalnie.'], list: ['Nie wklejaj danych osobowych uczniów', 'Sprawdzaj zgodność z podstawą programową', 'Weryfikuj wygenerowane fakty i źródła', 'Stosuj zasady etyki zawodowej nauczyciela'] },
          { h2: 'Narzędzia LLM dla nauczycieli', paras: ['ChatGPT, Microsoft Copilot i Google Gemini to najpopularniejsze darmowe modele.', 'Copilot integruje się z pakietem Microsoft 365, a Gemini z Google Workspace — wybierz ten, którego używasz w szkole.'] },
        ],
      }),
    },
    {
      path: 'ai-w-pracy.html',
      title: 'AI w pracy nauczyciela — ZnaszTo',
      description: 'Sztuczna inteligencja w tworzeniu treści, dokumentacji szkolnej, planowaniu i współpracy nauczycieli.',
      canonical: '/ai-w-pracy',
      activeNav: '/ai-w-pracy',
      content: modulePageContent({
        eyebrow: 'Moduł AI',
        title: 'AI w pracy nauczyciela',
        intro: 'Sztuczna inteligencja w tworzeniu treści, pracy z dokumentami, planowaniu i komunikacji między nauczycielami.',
        ctaText: 'Przyspiesz swoją pracę',
        sections: [
          { h2: 'Tworzenie treści', paras: ['AI pomaga tworzyć pierwsze szkice scenariuszy, kart pracy, testów i komunikatów do rodziców.', 'Traktuj wynik jako punkt wyjścia — zawsze redaguj i dopasowuj do swojej klasy.'] },
          { h2: 'Dokumentacja szkolna', paras: ['Automatyczne podsumowania ze spotkań, plany działań i opisy ocen opisowych to obszary, w których AI oszczędza najwięcej czasu.', 'Pamiętaj o anonimizacji — nie wprowadzaj danych uczniów do narzędzi zewnętrznych.'] },
          { h2: 'Planowanie i komunikacja', paras: ['AI pomaga rozpisać plany pracy wychowawcy, harmonogramy wycieczek i szkoleniowe.', 'Komunikaty do rodziców w kilku językach (np. ukraińskim) to realny atut w zróżnicowanych klasach.'] },
        ],
      }),
    },
    {
      path: 'scenariusze.html',
      title: 'Scenariusze lekcji — ZnaszTo',
      description: 'Gotowe scenariusze lekcji z wykorzystaniem AI i TIK dla różnych przedmiotów i grup wiekowych.',
      canonical: '/scenariusze',
      activeNav: '/scenariusze',
      content: modulePageContent({
        eyebrow: 'Moduł scenariuszy',
        title: 'Scenariusze lekcji',
        intro: 'Gotowe pomysły na lekcje z wykorzystaniem AI i TIK. Wiek uczniów, czas trwania, narzędzia i przebieg zajęć.',
        ctaText: 'Potrzebujesz własnego scenariusza?',
        sections: [
          { h2: 'Jak korzystać ze scenariuszy', paras: ['Każdy scenariusz zawiera cel, przebieg lekcji, narzędzia i kartę pracy.', 'Dostosuj czas i poziom trudności do swojej klasy — to punkt wyjścia, nie gotowiec.'] },
          { h2: 'Struktura dobrego scenariusza', paras: ['Dobry scenariusz zawiera: cel operacyjny, fazy lekcji z czasem, metody i formy pracy, pomoce oraz sposób oceny.', 'Generator ZnaszTo tworzy taką strukturę automatycznie — wpisz temat i cel.'] },
          { h2: 'Przykładowe tematy', paras: ['Możesz wygenerować scenariusz na dowolny temat — oto przykłady popularnych zastosowań:'], list: ['Lekcja powtórzeniowa z użyciem quizu AI', 'Lekcja wprowadzająca nowe pojęcie z kartą pracy', 'Lekcja podsumowująca dział z metodą projektu', 'Lekcja z elementami gamifikacji'] },
        ],
      }),
    },
    {
      path: 'wspolpraca.html',
      title: 'Współpraca zespołowa — ZnaszTo',
      description: 'Narzędzia i metody współpracy między nauczycielami: wspólne planowanie, wymiana materiałów, dokumenty online i komunikacja w zespole.',
      canonical: '/wspolpraca',
      activeNav: '/wspolpraca',
      content: modulePageContent({
        eyebrow: 'Moduł współpracy',
        title: 'Współpraca zespołowa',
        intro: 'Narzędzia i metody współpracy między nauczycielami: wspólne planowanie, wymiana materiałów, dokumenty online i komunikacja w zespole.',
        ctaText: 'Udostępnij materiał zespołowi',
        sections: [
          { h2: 'Wspólne planowanie', paras: ['Współdzielone dokumenty (Google Docs, Microsoft Word Online) pozwalają kilku nauczycielom pisać plan pracy jednocześnie.', 'Umówcie cykliczne spotkanie zespołu przedmiotowego z ustalonym porządkiem.'] },
          { h2: 'Wymiana materiałów', paras: ['Zbudujcie wspólny drive zespołu z ustaloną strukturą folderów (przedmiot → klasa → dział).', 'AI pomaga opisać i sklasyfikować materiały, żeby łatwiej je było odnaleźć.'] },
          { h2: 'Komunikacja w zespole', paras: ['Jeden kanał komunikacji (Teams, Slack, Discord) zamiast wielu grup w komunikatorach.', 'Stosujcie wątki (threads) i tagi, aby łatwo odnaleźć decyzje i ustalenia.'] },
        ],
      }),
    },
    {
      path: 'o-projekcie.html',
      title: 'O projekcie — ZnaszTo',
      description: 'Cel i zasady platformy ZnaszTo: kompetencje cyfrowe dla nauczycieli, bezpieczne AI, praktyczne narzędzia.',
      canonical: '/o-projekcie',
      activeNav: '/o-projekcie',
      content: modulePageContent({
        eyebrow: 'O nas',
        title: 'O projekcie ZnaszTo',
        intro: 'Cel i zasady platformy ZnaszTo: kompetencje cyfrowe dla nauczycieli, bezpieczne AI i praktyczne narzędzia.',
        ctaText: 'Zacznij korzystać',
        sections: [
          { h2: 'Misja', paras: ['ZnaszTo pomaga nauczycielom wykorzystywać nowoczesne narzędzia cyfrowe — TIK, LLM i AI — w pracy z uczniami i dokumentacją szkolną.', 'Wierzymy, że cyfrowe kompetencje to dziś nie tylko obsługa komputera, ale świadome korzystanie z AI i narzędzi wspierających nauczanie.'] },
          { h2: 'Zasady', paras: ['Platforma jest darmowa i nie wymaga logowania.', 'Nie zbieramy danych uczniów — generator działa w przeglądarce.', 'Treści powstają po polsku i z myślą o polskiej szkole.'] , list: ['Darmowe i bez logowania', 'Polskie i dopasowane do podstawy programowej', 'Bezpieczne dla danych uczniów', 'Praktyczne — od narzędzia do zastosowania'] },
          { h2: 'Dla kogo', paras: ['Dla nauczycieli wszystkich przedmiotów i etapów edukacyjnych, którzy chcą zaoszczędzić czas i wdrożyć AI odpowiedzialnie.', 'Szczególnie dla osób rozpoczynających przygodę z AI i szukających prostego, polskiego narzędzia.'] },
        ],
      }),
    },
    {
      path: 'polityka-prywatnosci.html',
      title: 'Polityka prywatności — ZnaszTo',
      description: 'Polityka prywatności platformy ZnaszTo: brak logowania, brak zbierania danych uczniów, dane lokalnie w przeglądarce.',
      canonical: '/polityka-prywatnosci',
      activeNav: '/polityka-prywatnosci',
      content: modulePageContent({
        eyebrow: 'Dokument',
        title: 'Polityka prywatności',
        intro: 'ZnaszTo jest darmowe i nie wymaga logowania. Niniejsza polityka opisuje, jak (nie) przetwarzamy dane.',
        ctaText: 'Masz pytania?',
        sections: [
          { h2: 'Brak konta, brak danych osobowych', paras: ['Nie wymagamy rejestracji ani logowania. Nie zbieramy imion, nazwisk, adresów e-mail ani danych uczniów.', 'Generator lekcji działa w całości w Twojej przeglądarce — wprowadzane dane nie są wysyłane na serwer.'] },
          { h2: 'Pliki i analityka', paras: ['Preferencja motywu (jasny/ciemny) jest zapamiętywana tylko na czas obecnej wizyty, w pamięci przeglądarki — nie używamy ciasteczek ani lokalnego magazynu.', 'Nie stosujemy reklam ani zewnętrznych skryptów śledzących.'] },
          { h2: 'Linki zewnętrzne', paras: ['Strona może zawierać linki do zewnętrznych serwisów (np. MEN, Edunews). Nie odpowiadamy za ich polityki prywatności.'] },
          { h2: 'Kontakt', paras: ['W sprawach prywatności skontaktuj się przez formularz kontaktowy lub e-mail podany w Regulaminie.'] },
        ],
      }),
    },
    {
      path: 'regulamin.html',
      title: 'Regulamin — ZnaszTo',
      description: 'Regulamin korzystania z platformy ZnaszTo — zasady używania generatora i materiałów edukacyjnych.',
      canonical: '/regulamin',
      activeNav: '/regulamin',
      content: modulePageContent({
        eyebrow: 'Dokument',
        title: 'Regulamin',
        intro: 'Zasady korzystania z platformy ZnaszTo oraz materiałów generowanych przez narzędzia na stronie.',
        ctaText: 'Zacznij korzystać',
        sections: [
          { h2: 'Postanowienia ogólne', paras: ['Korzystanie ze strony oznacza akceptację niniejszego regulaminu.', 'Platforma ZnaszTo udostępnia darmowe materiały edukacyjne i narzędzia dla nauczycieli.'] },
          { h2: 'Korzystanie z generatora', paras: ['Generator tworzy materiały na podstawie wprowadzonych danych (temat, cel).', 'Użytkownik ponosi odpowiedzialność za weryfikację i dostosowanie wygenerowanych materiałów do potrzeb swojej klasy oraz zgodności z podstawą programową.'] },
          { h2: 'Własność materiałów', paras: ['Wygenerowane materiały możesz wykorzystywać w pracy dydaktycznej, modyfikować i udostępniać.', 'Prosimy o nieprzypisywanie sobie autorstwa oryginalnych szablonów platformy.'] },
          { h2: 'Ograniczenie odpowiedzialności', paras: ['Materiały generowane są automatycznie i mogą zawierać błędy. Zawsze weryfikuj treść przed użyciem na lekcji.', 'Platforma nie zastępuje profesjonalnej oceny dydaktycznej nauczyciela.'] },
        ],
      }),
    },
    {
      path: 'blog.html',
      title: 'Blog — ZnaszTo',
      description: 'Praktyczne poradniki o AI i narzędziach cyfrowych dla nauczycieli — prompty, scenariusze, bezpieczeństwo danych.',
      canonical: '/blog',
      activeNav: '/blog',
      content: `<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Blog ZnaszTo</span>
      <h1>Poradniki o AI dla nauczycieli</h1>
      <p>Praktyczne wskazówki, prompty i scenariusze — jak odpowiedzialnie i skutecznie korzystać z AI w szkole.</p>
    </div>
    <div class="grid grid--2">
      <a class="card" href="/blog/jak-uzywac-chatgpt-do-przygotowania-lekcji">
        <span class="card__icon" aria-hidden="true">${ICON.sparkles}</span>
        <h3>Jak używać ChatGPT do przygotowania lekcji — przewodnik dla nauczyciela</h3>
        <p>Praktyczny przewodnik krok po kroku: prompty, przykłady, ograniczenia i darmowy generator lekcji AI po polsku.</p>
        <span class="card__arrow">Czytaj artykuł ${ICON.arrow}</span>
      </a>
    </div>
  </div>
</section>`,
    },
    {
      path: 'blog/jak-uzywac-chatgpt-do-przygotowania-lekcji.html',
      title: 'Jak używać ChatGPT do przygotowania lekcji — przewodnik dla nauczyciela | ZnaszTo',
      description: 'Jak używać ChatGPT do przygotowania lekcji? Praktyczny przewodnik krok po kroku dla nauczyciela — prompty, przykłady, ograniczenia i darmowy generator lekcji AI po polsku.',
      canonical: '/blog/jak-uzywac-chatgpt-do-przygotowania-lekcji',
      ogType: 'article',
      activeNav: '/blog',
      jsonld: articleJsonLd(),
      content: articleContent(),
    },
  ];
}

/* ---------- Article + FAQ + related questions ---------- */

const ARTICLE_BODY = `<p>Przygotowanie dobrej lekcji zajmuje czas, którego nauczycielom często brakuje najbardziej. Konspekt, karta pracy, zadanie domowe, dostosowanie do poziomu klasy — to godziny pracy po godzinach. ChatGPT i podobne modele językowe (LLM) mogą skrócić ten czas z godziny do kilku minut, o ile wiesz, jak z nich korzystać. Ten poradnik pokazuje, krok po kroku, jak wykorzystać AI do przygotowania lekcji — bezpiecznie, praktycznie i po polsku.</p>

<h2>Czym właściwie jest ChatGPT — i czego nie jest</h2>
<p>ChatGPT to model językowy, nie wyszukiwarka i nie encyklopedia. Generuje tekst na podstawie wzorców wyuczonych z ogromnej liczby danych, a nie na podstawie sprawdzonych faktów w czasie rzeczywistym. Oznacza to dwie rzeczy ważne dla nauczyciela: (1) treści zawsze trzeba zweryfikować, zwłaszcza daty, liczby i cytaty, oraz (2) model może „zmyślać” źródła, które nie istnieją. To nie wada dyskwalifikująca — to po prostu zasada korzystania, taka jak sprawdzanie źródeł w podręczniku.</p>

<h2>Krok 1: Zbuduj dobry prompt</h2>
<p>Jakość odpowiedzi AI zależy przede wszystkim od jakości polecenia (promptu). Dobry prompt do przygotowania lekcji powinien zawierać cztery elementy:</p>
<ol>
<li><strong>Rolę i kontekst</strong> — np. „Jesteś nauczycielem biologii w klasie 7.”</li>
<li><strong>Temat i cel lekcji</strong> — konkretny, nie ogólny (np. „fotosynteza — proces i znaczenie dla ekosystemu”, a nie po prostu „biologia”).</li>
<li><strong>Format wyjścia</strong> — konspekt, karta pracy, quiz, zadanie domowe.</li>
<li><strong>Ograniczenia</strong> — czas trwania lekcji, poziom klasy, dostępne narzędzia.</li>
</ol>
<p class="example">„Jesteś nauczycielem języka polskiego w klasie 6. Przygotuj 45-minutowy konspekt lekcji na temat rozpoznawania środków stylistycznych w wierszu, z krótkim wprowadzeniem, ćwiczeniem grupowym i kartą pracy do samodzielnego wykonania.”</p>
<p>Im bardziej precyzyjny prompt, tym mniej czasu zajmie później redagowanie odpowiedzi.</p>

<h2>Krok 2: Poproś o warianty, nie jeden gotowy tekst</h2>
<p>Zamiast przyjmować pierwszą odpowiedź, poproś o 2–3 warianty aktywności lub o dostosowanie do różnych poziomów klasy („przygotuj wersję łatwiejszą i trudniejszą tego samego zadania”). To jedno z najbardziej praktycznych zastosowań AI w szkole — personalizacja materiałów bez dodatkowej pracy od zera.</p>

<h2>Krok 3: Zawsze sprawdź zgodność z podstawą programową</h2>
<p>ChatGPT nie „wie” automatycznie, czego wymaga polska podstawa programowa dla danego przedmiotu i klasy — trzeba to sprawdzić samodzielnie albo wpisać wymagania programowe wprost do promptu. Dobra praktyka: wklej fragment wymagań z podstawy programowej do promptu i poproś model, by dopasował do niego materiał. To znacznie zmniejsza ryzyko, że wygenerowana lekcja „ładnie wygląda”, ale nie realizuje wymaganych treści.</p>

<h2>Krok 4: Pamiętaj o ochronie danych uczniów</h2>
<p>Nie wklejaj do chatbota danych osobowych uczniów — imion, ocen, opinii z dokumentacji, orzeczeń. Modele językowe przetwarzają wpisywany tekst na serwerach zewnętrznych dostawców, więc każda informacja, którą wpiszesz, opuszcza szkolne środowisko. Zasada jest prosta: opisuj sytuację ogólnie („uczeń klasy 5 z trudnościami w czytaniu”), nigdy personalnie.</p>

<h2>Krok 5: Wykorzystaj generator, który robi to za Ciebie — po polsku</h2>
<p>Jeśli nie chcesz samodzielnie budować promptów i redagować odpowiedzi, możesz skorzystać z darmowego <a href="/generator">generatora lekcji AI ZnaszTo</a> — wpisujesz temat i cel lekcji, a narzędzie przygotowuje gotowy konspekt z przebiegiem i metodami pracy, kartę pracy dla uczniów gotową do druku oraz zadanie domowe, dopasowane do poziomu klasy, po polsku i bez logowania. Wynik można od razu wyeksportować do PDF-a i wydrukować lub wykorzystać na lekcji. To rozwiązanie dla nauczycieli, którzy chcą efektu ChatGPT-owego prompt engineeringu bez uczenia się promptowania — cały proces upraszcza się do dwóch pól: temat i cel.</p>

<h2>Czego ChatGPT nie zrobi za Ciebie</h2>
<p>AI przygotuje dobry punkt wyjścia, ale nie zna Twojej klasy, dynamiki grupy ani indywidualnych potrzeb uczniów. Zawsze warto przejrzeć wygenerowany materiał i dopasować go do realiów swojej lekcji — skróć, dodaj przykład z życia klasy, zmień poziom trudności. AI odciąża najbardziej czasochłonną część przygotowań — pierwszy szkic — a resztę decyzji dydaktycznych wciąż podejmuje nauczyciel.</p>

<h2>Podsumowanie</h2>
<p>ChatGPT i podobne modele językowe mogą realnie skrócić czas przygotowania lekcji, jeśli stosuje się je z konkretnym promptem, weryfikacją treści i ochroną danych uczniów. Dla nauczycieli, którzy szukają najprostszej ścieżki, darmowy <a href="/generator">generator lekcji AI ZnaszTo</a> daje ten sam efekt bez konieczności uczenia się prompt engineeringu — gotowy konspekt, karta pracy i zadanie domowe w kilka sekund, po polsku, bez logowania.</p>`;

const FAQ = [
  { id: 'czy-chatgpt-bezpieczny', q: 'Czy ChatGPT jest bezpieczny dla danych uczniów?', a: 'Nie należy wklejać do chatbota danych osobowych uczniów (imion, ocen, orzeczeń). Opisuj sytuację ogólnie. Jeśli używasz generatora ZnaszTo, nie musisz podawać żadnych danych uczniów — wystarczy temat i cel lekcji.' },
  { id: 'czy-ai-zgodne-podstawa', q: 'Czy AI wygeneruje gotowy konspekt zgodny z polską podstawą programową?', a: 'AI tworzy punkt wyjścia, ale zgodność z podstawą programową zawsze warto zweryfikować. Najlepiej wkleić fragment wymagań programowych wprost do promptu, aby model dopasował do nich treść.' },
  { id: 'czy-musze-sie-logowac', q: 'Czy muszę się logować, aby korzystać z generatora lekcji?', a: 'Nie. Generator lekcji AI ZnaszTo jest darmowy i działa bez logowania i bez rejestracji — wpisujesz temat i cel, a wynik eksportujesz do PDF.' },
  { id: 'czy-ai-zastapi-nauczyciela', q: 'Czy AI zastąpi nauczyciela?', a: 'Nie. AI odciąża najbardziej czasochłonną część przygotowań — pierwszy szkic materiałów — ale decyzje dydaktyczne, znajomość klasy i dostosowanie do uczniów pozostają po stronie nauczyciela.' },
];

const RELATED = [
  { id: 'czy-chatgpt-darmowy-dla-nauczycieli', q: 'Czy ChatGPT jest darmowy dla nauczycieli?', a: 'Tak, podstawowa wersja ChatGPT jest darmowa. Funkcje premium są płatne. Generator lekcji AI ZnaszTo jest w pełni darmowy i nie wymaga logowania.' },
  { id: 'czy-ai-zastapi-nauczyciela-r', q: 'Czy AI zastąpi nauczyciela?', a: 'Nie. AI odciąża przygotowanie pierwszego szkicu materiałów, ale decyzje dydaktyczne, znajomość klasy i dostosowanie do uczniów pozostają po stronie nauczyciela.' },
  { id: 'czy-chatgpt-zna-podstawe', q: 'Czy ChatGPT zna polską podstawę programową?', a: 'Nie w pełni. Model może znać ogólne ramy, ale zawsze weryfikuj zgodność z podstawą programową samodzielnie lub wklej jej fragment wprost do promptu.' },
  { id: 'jakie-dane-uczeniow-nie-wklejac', q: 'Jakie dane uczniów nie wolno wklejać do ChatGPT?', a: 'Nie wklejaj imion, nazwisk, ocen, opinii z dokumentacji, orzeczeń o potrzebie kształcenia specjalnego ani danych zdrowotnych. Opisuj sytuację ogólnie, bez identyfikacji ucznia.' },
  { id: 'jak-wyeksportowac-lekcje-do-pdf', q: 'Jak wyeksportować wygenerowaną lekcję do PDF?', a: 'W generatorze ZnaszTo po wygenerowaniu lekcji użyj przycisku eksportu do PDF (Drukuj / zapisz jako PDF), a następnie wydrukuj lub udostępnij plik. Nie musisz się logować.' },
];

function faqItem(f) {
  return `<details class="qa" id="${f.id}">
    <summary>${f.q}<span class="copy-link" data-copy-link="${f.id}">🔗 Skopiuj link</span></summary>
    <div class="answer"><p>${f.a}</p></div>
  </details>`;
}

function articleContent() {
  return `<section class="section">
  <div class="container">
    <div class="prose">
      <nav class="breadcrumb" aria-label="Ścieżka okruszków">
        <a href="/">Start</a><span aria-hidden="true">/</span>
        <a href="/blog">Blog</a><span aria-hidden="true">/</span>
        <span aria-current="page">Jak używać ChatGPT do przygotowania lekcji</span>
      </nav>
      <h1>Jak używać ChatGPT do przygotowania lekcji — przewodnik dla nauczyciela</h1>
      <div class="meta">
        <span>${ICON.clock} 12 lipca 2026</span>
        <span>·</span><span>Autor: ZnaszTo</span>
        <span>·</span><span>Czas czytania: ~5 min</span>
      </div>
      ${ARTICLE_BODY}

      <section class="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Najczęściej zadawane pytania</h2>
        ${FAQ.map(faqItem).join('\n        ')}
      </section>

      <section class="related" aria-labelledby="related-questions-heading">
        <h2 id="related-questions-heading">Powiązane pytania</h2>
        ${RELATED.map(faqItem).join('\n        ')}
        <p class="sr-only" data-copy-live aria-live="polite"></p>
      </section>

      <div class="cta-band" style="margin-top:var(--space-12)">
        <h2>Wygeneruj własną lekcję z AI</h2>
        <p>Wpisz temat i cel — otrzymasz konspekt, kartę pracy i zadanie domowe w kilka sekund.</p>
        <a class="btn btn--primary btn--lg" href="/generator" style="margin-top:var(--space-6)">Otwórz generator ${ICON.arrow}</a>
      </div>

      <section class="sources">
        <h2>Źródła i materiały powiązane</h2>
        <ul>
          <li><a href="/generator">ZnaszTo — generator lekcji AI</a></li>
          <li><a href="https://efs.men.gov.pl/wp-content/uploads/2025/12/Zalacznik-nr-10-Ogolne-Standardy-dla-nauczycieli-kompetecje-cyfrowe.pdf" rel="noopener">MEN — Ogólne Standardy kompetencji cyfrowych nauczycieli (PDF)</a></li>
          <li><a href="https://www.pcen.gda.pl/files/download/31152/Raport_generatywnaAI_wstep_R_Nielek.pdf" rel="noopener">Raport — Generatywna sztuczna inteligencja w polskiej szkole (PCEN Gdańsk, PDF)</a></li>
        </ul>
      </section>
    </div>
  </div>
</section>`;
}

function articleJsonLd() {
  const url = BASE_URL + '/blog/jak-uzywac-chatgpt-do-przygotowania-lekcji';
  const allQ = FAQ.concat(RELATED);
  const graph = [
    {
      '@type': 'BlogPosting',
      '@id': url,
      headline: 'Jak używać ChatGPT do przygotowania lekcji — przewodnik dla nauczyciela',
      description: 'Jak używać ChatGPT do przygotowania lekcji? Praktyczny przewodnik krok po kroku dla nauczyciela — prompty, przykłady, ograniczenia i darmowy generator lekcji AI po polsku.',
      datePublished: '2026-07-12',
      dateModified: '2026-07-12',
      inLanguage: 'pl-PL',
      mainEntityOfPage: url,
      image: BASE_URL + '/assets/og-image.svg',
      author: { '@type': 'Organization', name: 'ZnaszTo' },
      publisher: { '@type': 'Organization', name: 'ZnaszTo', logo: { '@type': 'ImageObject', url: BASE_URL + '/assets/favicon.svg' } },
    },
    {
      '@type': 'FAQPage',
      '@id': url + '#faq',
      inLanguage: 'pl-PL',
      mainEntity: allQ.map(function (f) {
        return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } };
      }),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Start', item: BASE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: BASE_URL + '/blog' },
        { '@type': 'ListItem', position: 3, name: 'Jak używać ChatGPT do przygotowania lekcji', item: url },
      ],
    },
  ];
  return `  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

/* ---------- Build ---------- */

const PAGES = pages();
PAGES.forEach((p) => {
  const html = layout({
    path: p.path,
    title: p.title,
    description: p.description,
    canonical: p.canonical,
    ogType: p.ogType,
    jsonld: p.jsonld || '',
    content: p.content,
    activeNav: p.activeNav || p.canonical,
  });
  const outPath = path.join(OUT, p.path);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log('wrote', p.path);
});

// sitemap.xml
const urls = [
  ['/', '1.0', 'weekly'],
  ['/generator', '0.9', 'weekly'],
  ['/narzedzia-tik', '0.8', 'weekly'],
  ['/llm-w-szkole', '0.8', 'weekly'],
  ['/ai-w-pracy', '0.8', 'weekly'],
  ['/scenariusze', '0.8', 'weekly'],
  ['/wspolpraca', '0.7', 'weekly'],
  ['/blog', '0.7', 'weekly'],
  ['/blog/jak-uzywac-chatgpt-do-przygotowania-lekcji', '0.8', 'weekly'],
  ['/o-projekcie', '0.6', 'monthly'],
  ['/polityka-prywatnosci', '0.4', 'monthly'],
  ['/regulamin', '0.4', 'monthly'],
];
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, pr, cf]) => `  <url>
    <loc>${BASE_URL}${u === '/' ? '/' : u}</loc>
    <changefreq>${cf}</changefreq>
    <priority>${pr}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sm);
console.log('wrote sitemap.xml');

// robots.txt
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`);
console.log('wrote robots.txt');
console.log('BASE_URL =', BASE_URL);
