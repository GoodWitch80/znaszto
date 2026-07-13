/* ZnaszTo — app logic: theme toggle, mobile nav, lesson generator, copy-link */
(function () {
  'use strict';

  /* ---------- Theme ---------- */
  (function () {
    var root = document.documentElement;
    var pref = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', pref);
    var t = document.querySelector('[data-theme-toggle]');
    if (t) {
      setIcon(t, pref);
      t.addEventListener('click', function () {
        pref = pref === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', pref);
        setIcon(t, pref);
      });
    }
    function setIcon(btn, mode) {
      btn.setAttribute(
        'aria-label',
        'Przełącz na motyw ' + (mode === 'dark' ? 'jasny' : 'ciemny')
      );
      btn.innerHTML =
        mode === 'dark'
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
    }
  })();

  /* ---------- Mobile nav ---------- */
  (function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  })();

  /* ---------- Copy-link on related questions ---------- */
  (function () {
    var copyBtns = document.querySelectorAll('[data-copy-link]');
    copyBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var id = btn.getAttribute('data-copy-link');
        var url = location.origin + location.pathname + '#' + id;
        var done = function () {
          var old = btn.textContent;
          btn.textContent = '✓ Skopiowano';
          var live = document.querySelector('[data-copy-live]');
          if (live) live.textContent = 'Link skopiowany: ' + url;
          setTimeout(function () {
            btn.textContent = 'Skopiuj link';
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, fallback);
        } else {
          fallback();
        }
        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
          } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
      });
    });
    // open targeted question
    if (location.hash) {
      var el = document.getElementById(location.hash.slice(1));
      if (el && el.tagName === 'DETAILS') el.setAttribute('open', '');
    }
  })();

  /* ---------- Lesson generator ---------- */
  var gen = document.getElementById('gen-form');
  if (!gen) return;

  var out = document.getElementById('gen-output');
  var empty = document.getElementById('gen-empty');
  var tabs = document.querySelectorAll('[data-tab]');
  var panels = document.querySelectorAll('[data-panel]');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', 'false');
      });
      tab.setAttribute('aria-selected', 'true');
      var target = tab.getAttribute('data-tab');
      panels.forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-panel') === target);
      });
    });
  });

  gen.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      temat: val('temat'),
      cel: val('cel'),
      przedmiot: val('przedmiot'),
      klasa: val('klasa'),
      czas: val('czas') || '45',
    };
    if (!data.temat || !data.cel) return;

    var lesson = buildLesson(data);
    render(lesson, data);
    empty.style.display = 'none';
    out.classList.add('active');
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function buildLesson(d) {
    var total = parseInt(d.czas, 10) || 45;
    var tIntro = Math.round(total * 0.15);
    var tMain = Math.round(total * 0.6);
    var tSum = total - tIntro - tMain;
    var subj = d.przedmiot || 'wybrany przedmiot';

    var celeOp = [
      'Uczeń potrafi opisać i wyjaśnić pojęcie: ' + d.temat + '.',
      'Uczeń potrafi zastosować wiedzę w praktycznym zadaniu.',
      'Uczeń potrafi sformułować własne wnioski i je uzasadnić.',
    ];

    var fazy = [
      {
        nazwa: 'Część wstępna',
        czas: tIntro + ' min',
        nauczyciel:
          'Powitanie, sprawdzenie listy, wprowadzenie w temat "' + esc(d.temat) + '" poprzez pytanie aktywizujące lub krótką burzę mózgów. Podanie celu lekcji.',
        uczen: 'Odpowiadają na pytania, zgłaszają skojarzenia, notują temat i cel lekcji.',
      },
      {
        nazwa: 'Część wprowadzająca',
        czas: Math.round(tMain * 0.3) + ' min',
        nauczyciel:
          'Krótka prezentacja / omówienie kluczowych pojęć związanych z: ' + esc(d.temat) + '. Wyjaśnienie nowych terminów, pokazanie przykładu.',
        uczen: 'Słuchają, notują najważniejsze informacje, zadają pytania wyjaśniające.',
      },
      {
        nazwa: 'Część główna',
        czas: Math.round(tMain * 0.7) + ' min',
        nauczyciel:
          'Rozdaje kartę pracy. Nadzoruje pracę uczniów, pomaga grupom/uczniom mającym trudności, zadaje pytania pogłębiające. Realizacja celu: ' + esc(d.cel) + '.',
        uczen: 'Wykonują zadania z karty pracy indywidualnie lub w grupach, analizują, dyskutują, prezentują wyniki.',
      },
      {
        nazwa: 'Podsumowanie',
        czas: tSum + ' min',
        nauczyciel:
          'Podsumowanie lekcji, wspólne sformułowanie wniosków. Sprawdzenie stopnia realizacji celu. Podanie zadania domowego. Ocena pracy uczniów.',
        uczen: 'Prezentują wnioski, samoocena pracy, zapisują zadanie domowe.',
      },
    ];

    var kartaZadania = [
      {
        tytul: 'Zadanie 1 — Wprowadzenie',
        tresc:
          'Korzystając z omawianych informacji, zapisz definicję pojęcia "' +
          esc(d.temat) +
          '" własnymi słowami (3–4 zdania).',
      },
      {
        tytul: 'Zadanie 2 — Ćwiczenie',
        tresc:
          'Rozwiąż poniższe zadanie praktyczne związane z tematem. Pokaż kolejne kroki swojego rozumowania.',
      },
      {
        tytul: 'Zadanie 3 — Zastosowanie',
        tresc:
          'Podaj dwa przykłady z życia codziennego, w których pojęcie "' +
          esc(d.temat) +
          '" ma znaczenie. Uzasadnij swój wybór.',
      },
      {
        tytul: 'Zadanie 4 — Wnioski',
        tresc: 'Sformułuj jedno pytanie, które chciał(a)byś zadać na zakończenie lekcji, oraz jedno zdanie podsumowujące.',
      },
    ];

    var zadDomowe = [
      'Opcja A (podstawowa): Uczeń przygotuje krótką notatkę (5–7 zdań) na temat: ' + esc(d.temat) + ', korzystając z podręcznika lub wiarygodnego źródła.',
      'Opcja B (rozszerzająca): Uczeń znajdzie w otoczeniu przykład związany z tematem ' + esc(d.temat) + ' i opisze go w 5 zdaniach, odnosząc się do celu lekcji: ' + esc(d.cel) + '.', 
    ];

    return {
      celeOp: celeOp,
      metody: ['pogadanka', 'praca z tekstem / materiałem', 'praca indywidualna i grupowa', 'dyskusja', 'metoda problemowa'],
      formy: ['praca zbiorowa', 'praca w grupach', 'praca indywidualna'],
      pomoce: ['karta pracy ucznia', 'tablica / rzutnik', 'materiały źródłowe związane z: ' + d.temat],
      fazy: fazy,
      karta: kartaZadania,
      domowe: zadDomowe,
    };
  }

  function render(L, d) {
    var subj = d.przedmiot || '—';
    document.getElementById('gen-konspekt').innerHTML =
      '<h3>Konspekt lekcji</h3>' +
      '<p class="gen-meta">Przedmiot: ' + esc(subj) + ' · Klasa: ' + esc(d.klasa || '—') +
      ' · Czas: ' + esc(d.czas) + ' min</p>' +
      '<h4>Temat lekcji</h4><p>' + esc(cap(d.temat)) + '</p>' +
      '<h4>Cel główny lekcji</h4><p>' + esc(d.cel) + '</p>' +
      '<h4>Cele operacyjne</h4><ul class="dashed">' +
      L.celeOp.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
      '<h4>Metody pracy</h4><p>' + L.metody.join(', ') + '</p>' +
      '<h4>Formy pracy</h4><p>' + L.formy.join(', ') + '</p>' +
      '<h4>Pomoce dydaktyczne</h4><p>' + L.pomoce.join('; ') + '</p>' +
      '<h4>Przebieg lekcji</h4><ol>' +
      L.fazy.map(function (f) {
        return '<li><strong>' + esc(f.nazwa) + ' (' + f.czas + ')</strong><br>' +
          '<em>Nauczyciel:</em> ' + f.nauczyciel + '<br>' +
          '<em>Uczeń:</em> ' + f.uczen + '</li>';
      }).join('') + '</ol>';

    document.getElementById('gen-karta').innerHTML =
      '<h3>Karta pracy ucznia</h3>' +
      '<p class="gen-meta">Imię i nazwisko: ……………………… Klasa: ' + esc(d.klasa || '—') + ' · Data: ………………………</p>' +
      '<h4>Temat: ' + esc(cap(d.temat)) + '</h4>' +
      '<p>Instrukcja: Wykonaj poniższe zadania samodzielnie lub w grupie. Zapisuj swoje odpowiedzi czytelnie w wyznaczonych miejscach.</p>' +
      L.karta.map(function (z) {
        return '<h4>' + esc(z.tytul) + '</h4><p>' + esc(z.tresc) + '</p>' +
          '<p style="border-bottom:1px solid var(--color-divider);min-height:60px"></p>';
      }).join('') +
      '<h4>Samoocena</h4>' +
      '<p>Zaznacz, jak oceniasz swoją pracę: ☐ jestem zadowolony/a ☐ częściowo ☐ muszę powtórzyć temat</p>';

    document.getElementById('gen-domowe').innerHTML =
      '<h3>Zadanie domowe</h3>' +
      '<p class="gen-meta">Cel: utrwalenie wiadomości z lekcji: ' + esc(cap(d.temat)) + '</p>' +
      '<ul class="dashed">' +
      L.domowe.map(function (z) { return '<li>' + esc(z) + '</li>'; }).join('') + '</ul>' +
      '<h4>Kryteria oceny</h4><ul class="dashed">' +
      '<li>rzetelne wykonanie zadania zgodnie z poleceniem</li>' +
      '<li>poprawność merytoryczna</li>' +
      '<li>estetyka i terminowość</li></ul>';
  }
})();

  /* ---------- Worksheet generator (karty pracy) ---------- */
  (function () {
    var f = document.getElementById('kp-form');
    if (!f) return;
    var out = document.getElementById('kp-out');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var temat = val('kp-temat');
      if (!temat) return;
      var przedmiot = val('kp-przedmiot');
      var klasa = val('kp-klasa');
      var liczba = parseInt(val('kp-liczba') || '4', 10);
      var typ = val('kp-typ');
      render(buildTasks(temat, liczba, typ), temat, przedmiot, klasa);
      out.classList.add('active');
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function buildTasks(temat, n, typ) {
      var types = typ === 'mieszane' ? ['praktyczne', 'pytania', 'luki'] : [typ];
      var arr = [];
      for (var i = 0; i < n; i++) arr.push({ n: i + 1, type: types[i % types.length] });
      return arr;
    }
    function typeLabel(t) {
      return t === 'praktyczne' ? 'Ćwiczenie praktyczne' : t === 'pytania' ? 'Pytanie otwarte' : t === 'luki' ? 'Uzupełnianie luk' : 'Zadanie';
    }
    function taskText(t, temat) {
      if (t === 'praktyczne') return 'Wykonaj ćwiczenie praktyczne związane z tematem „' + esc(temat) + '”. Pokaż kolejne kroki swojego rozumowania i zapisz wynik.';
      if (t === 'pytania') return 'Odpowiedz własnymi słowami na pytanie: Wyjaśnij, co rozumiesz przez pojęcie „' + esc(temat) + '”, i podaj przykład z życia codziennego.';
      if (t === 'luki') return 'Uzupełnij brakujące słowa w zdaniach dotyczących tematu „' + esc(temat) + '”. (Miejsca luk zaznacz kreską.)';
      return 'Zadanie związane z tematem: ' + esc(temat) + '.';
    }
    function render(tasks, temat, przedmiot, klasa) {
      var html = '<h3>Karta pracy ucznia</h3>';
      html += '<p class="gen-meta">Imię i nazwisko: ………………………  Klasa: ' + esc(klasa || '—') + '  ·  Data: ………………………</p>';
      html += '<h4>Temat: ' + esc(cap(temat)) + '</h4>';
      html += '<p><strong>Instrukcja:</strong> Wykonaj poniższe zadania samodzielnie lub w grupie. Zapisuj odpowiedzi czytelnie w wyznaczonych miejscach.</p>';
      tasks.forEach(function (t) {
        html += '<h4>Zadanie ' + t.n + ' — ' + typeLabel(t.type) + '</h4>';
        html += '<p>' + taskText(t.type, temat) + '</p>';
        html += '<p style="border-bottom:1px solid var(--color-divider);min-height:70px"></p>';
      });
      html += '<h4>Samoocena</h4>';
      html += '<p>Zaznacz, jak oceniasz swoją pracę: ☐ jestem zadowolony/a ☐ częściowo ☐ muszę powtórzyć temat</p>';
      document.getElementById('kp-content').innerHTML = html;
    }
  })();

  /* ---------- Opinion / observation generator ---------- */
  (function () {
    var f = document.getElementById('op-form');
    if (!f) return;
    var out = document.getElementById('op-out');
    var TYP = {
      'opinia-o-uczniu': 'Opinia o uczniu',
      'wniosek-ppp': 'Wniosek o badanie w Poradni Psychologiczno-Pedagogicznej',
      'opinia-grupa': 'Opinia o funkcjonowaniu ucznia w grupie',
      'karta-obserwacji': 'Karta obserwacji ucznia',
    };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var typ = val('op-typ');
      var inicjal = val('op-inicjal');
      var klasa = val('op-klasa');
      var cel = val('op-cel');
      var obserwacje = val('op-obserwacje');
      var mocne = val('op-mocne');
      var obszary = val('op-obszary');
      var zalecenia = val('op-zalecenia');
      var wyst = val('op-wyst');
      render();
      out.classList.add('active');
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
      function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
      function d(v, def) { return v ? v : def; }
      function p(label, text) { return '<h4>' + label + '</h4><p>' + text + '</p>'; }
      function render() {
        var today = new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
        var html = '<h3>' + (TYP[typ] || 'Opinia') + '</h3>';
        html += '<p class="gen-meta">Miejscowość, data: ………………………, ' + today + '</p>';
        html += '<p class="gen-meta">Dotyczy ucznia (inicjał/pseudonim): ' + d(inicjal, '………………………') + '  ·  Klasa: ' + d(klasa, '—') + '</p>';
        html += '<p class="gen-meta">Wystawił: ' + d(wyst, 'Nauczyciel') + '</p>';
        html += '<hr style="border:none;border-top:1px solid var(--color-divider);margin:var(--space-5) 0">';
        html += p('1. Cel opinii', d(cel, 'Opinia została sporządzona w celu lepszego poznania potrzeb edukacyjnych ucznia i dostosowania form oraz metod wsparcia.'));
        html += p('2. Obserwacje i funkcjonowanie ucznia', d(obserwacje, '(Uzupełnij obserwacje dotyczące funkcjonowania ucznia na zajęciach, w relacjach rówieśniczych oraz w sytuacjach trudnych.)'));
        html += p('3. Mocne strony i zasoby ucznia', d(mocne, '(Wypisz mocne strony, zainteresowania i zasoby ucznia, na których można budować.)'));
        html += p('4. Obszary wymagające wsparcia', d(obszary, '(Wypisz obszary, w których uczeń napotyka trudności i potrzebuje wsparcia.)'));
        html += p('5. Zalecenia i rekomendacje', d(zalecenia, '(Sformułuj zalecenia dotyczące form i metod pracy z uczniem oraz ewentualnych działań specjalistycznych.)'));
        html += p('6. Wnioski', 'Na podstawie powyższych obserwacji rekomenduje się podjęcie działań wynikających z zaleceń oraz bieżące monitorowanie funkcjonowania ucznia.');
        html += '<hr style="border:none;border-top:1px solid var(--color-divider);margin:var(--space-6) 0">';
        html += '<p style="margin-top:var(--space-6)">...........................................................................<br>' + d(wyst, 'Nauczyciel') + '<br>(podpis i pieczątka)</p>';
        html += '<p style="margin-top:var(--space-4);color:var(--color-text-faint);font-size:var(--text-xs)">Dokument jest szablonem wygenerowanym automatycznie. Przed podpisaniem zweryfikuj treść i dostosuj ją do sytuacji ucznia. Nie wprowadzaj pełnych danych osobowych — stosuj inicjał lub pseudonim.</p>';
        document.getElementById('op-content').innerHTML = html;
      }
    });
  })();

  /* ---------- Karty edukacyjne i terapeutyczne ---------- */
  (function () {
    var form = document.getElementById('kt-form');
    if (!form) return;
    var out = document.getElementById('kt-out');
    var rodzaj = document.getElementById('kt-rodzaj');
    var groups = {
      kolorowanka: document.getElementById('kt-grp-kolorowanka'),
      pisanie: document.getElementById('kt-grp-pisanie'),
      szlaczyki: document.getElementById('kt-grp-szlaczyki'),
      emocje: document.getElementById('kt-grp-emocje'),
      labirynt: document.getElementById('kt-grp-labirynt'),
    };
    function sync() {
      var v = rodzaj.value;
      Object.keys(groups).forEach(function (k) {
        if (groups[k]) groups[k].style.display = k === v ? '' : 'none';
      });
    }
    rodzaj.addEventListener('change', sync);
    sync();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var tytul = val('kt-tytul');
      var r = rodzaj.value;
      var svg = '';
      if (r === 'kolorowanka') svg = colorSVG(val('kt-szablon'));
      else if (r === 'pisanie') svg = writingSVG(val('kt-litera'), parseInt(val('kt-powtorzenia') || '4', 10));
      else if (r === 'szlaczyki') svg = patternSVG(val('kt-wzor'));
      else if (r === 'emocje') svg = emotionSVG(val('kt-emocja'));
      else if (r === 'labirynt') svg = mazeSVG(val('kt-trudnosc'));
      var html = '<div class="kt-card">';
      if (tytul) html += '<h3 class="kt-title">' + esc(tytul) + '</h3>';
      html += '<p class="gen-meta">Imię: \u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026  Data: \u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026</p>';
      html += '<div class="kt-svg">' + svg + '</div>';
      html += '</div>';
      document.getElementById('kt-content').innerHTML = html;
      out.classList.add('active');
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function rep(s, n) { var o = ''; for (var i = 0; i < n; i++) o += s; return o; }
    function wrap(inner) {
      return '<svg viewBox="0 0 380 490" width="100%" role="img" aria-label="Karta do druku" xmlns="http://www.w3.org/2000/svg" style="max-width:720px;margin:0 auto;display:block;background:#fff;border-radius:var(--radius-md)">' + inner + '</svg>';
    }
    function colorSVG(name) {
      var g = '<g fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">';
      if (name === 'motyl') {
        g += '<ellipse cx="190" cy="255" rx="12" ry="72"/>';
        g += '<circle cx="190" cy="178" r="16"/>';
        g += '<path d="M190 188 C138 150 78 172 84 232 C90 288 152 296 190 256"/>';
        g += '<path d="M190 188 C242 150 302 172 296 232 C290 288 228 296 190 256"/>';
        g += '<path d="M185 168 q-22 -26 -48 -22"/>';
        g += '<path d="M195 168 q22 -26 48 -22"/>';
      } else if (name === 'ryba') {
        g += '<ellipse cx="168" cy="255" rx="108" ry="66"/>';
        g += '<path d="M276 255 l66 -56 0 112 z"/>';
        g += '<circle cx="230" cy="240" r="7" fill="#111"/>';
        g += '<path d="M150 210 q26 -30 56 -8"/>';
        g += '<path d="M150 300 q26 30 56 8"/>';
        g += '<path d="M124 255 q32 18 56 0"/>';
      } else if (name === 'kot') {
        g += '<circle cx="190" cy="262" r="92"/>';
        g += '<path d="M120 202 l18 -56 50 40"/>';
        g += '<path d="M260 202 l-18 -56 -50 40"/>';
        g += '<circle cx="160" cy="252" r="7" fill="#111"/>';
        g += '<circle cx="220" cy="252" r="7" fill="#111"/>';
        g += '<path d="M180 286 l10 12 10 -12 z" fill="#111"/>';
        g += '<path d="M190 298 q-22 16 -44 4"/>';
        g += '<path d="M190 298 q22 16 44 4"/>';
        g += '<path d="M150 274 l-44 -4"/><path d="M150 284 l-44 6"/>';
        g += '<path d="M230 274 l44 -4"/><path d="M230 284 l44 6"/>';
      } else if (name === 'drzewo') {
        g += '<rect x="172" y="332" width="36" height="120"/>';
        g += '<circle cx="190" cy="220" r="80"/>';
        g += '<circle cx="132" cy="258" r="50"/>';
        g += '<circle cx="248" cy="258" r="50"/>';
        g += '<circle cx="158" cy="188" r="42"/>';
        g += '<circle cx="222" cy="188" r="42"/>';
      } else if (name === 'balwan') {
        g += '<circle cx="190" cy="380" r="80"/>';
        g += '<circle cx="190" cy="245" r="55"/>';
        g += '<circle cx="190" cy="150" r="40"/>';
        g += '<path d="M176 148 l13 -44 15 44 z" fill="#111"/>';
        g += '<circle cx="176" cy="144" r="4" fill="#111"/>';
        g += '<circle cx="204" cy="144" r="4" fill="#111"/>';
        g += '<path d="M150 122 q40 12 80 0"/>';
        g += '<rect x="150" y="108" width="80" height="16"/>';
        g += '<rect x="160" y="62" width="60" height="48"/>';
        g += '<circle cx="190" cy="230" r="5" fill="#111"/>';
        g += '<circle cx="190" cy="258" r="5" fill="#111"/>';
        g += '<circle cx="190" cy="286" r="5" fill="#111"/>';
        g += '<path d="M135 245 l-46 -12"/><path d="M89 233 l-6 -12 m6 12 l-6 12"/>';
        g += '<path d="M245 245 l46 -12"/><path d="M291 233 l6 -12 m-6 12 l6 12"/>';
      } else if (name === 'lisc') {
        g += '<path d="M190 90 Q150 110 110 150 Q90 180 70 250 Q90 310 120 360 Q155 390 190 410 Q225 390 260 360 Q290 310 310 250 Q290 180 270 150 Q230 110 190 90 Z"/>';
        g += '<path d="M190 110 L190 408"/>';
        g += '<path d="M190 200 Q150 212 122 242"/>';
        g += '<path d="M190 200 Q230 212 258 242"/>';
        g += '<path d="M190 290 Q150 302 122 332"/>';
        g += '<path d="M190 290 Q230 302 258 332"/>';
        g += '<path d="M190 410 L190 472"/>';
        g += '<line x1="258" y1="242" x2="324" y2="224" stroke-width="1.5"/>';
        g += '<text x="328" y="228" font-size="14" fill="#111" stroke="none" font-family="Inter,sans-serif">blaszka</text>';
        g += '<line x1="190" y1="324" x2="324" y2="350" stroke-width="1.5"/>';
        g += '<text x="328" y="354" font-size="14" fill="#111" stroke="none" font-family="Inter,sans-serif">nerw</text>';
        g += '<line x1="190" y1="456" x2="252" y2="470" stroke-width="1.5"/>';
        g += '<text x="256" y="474" font-size="14" fill="#111" stroke="none" font-family="Inter,sans-serif">ogonek</text>';
      } else {
        g += '<rect x="30" y="30" width="320" height="430"/>';
      }
      g += '</g>';
      return wrap(g);
    }
    function patternSVG(type) {
      var rowH = 80, startY = 50, rows = 4, inner = '';
      function p(type, y) {
        if (type === 'petle') return 'M10 ' + (y + 30) + ' ' + rep('q10 -26 20 0 q10 26 20 0 ', 9);
        if (type === 'fale') return 'M10 ' + (y + 30) + ' ' + rep('q16 -22 32 0 q16 22 32 0 ', 6);
        if (type === 'zygzak') return 'M10 ' + (y + 30) + ' ' + rep('l22 -22 22 22 22 -22 22 22 ', 4);
        if (type === 'kolka') return 'M22 ' + (y + 30) + ' ' + rep('a12 12 0 1 0 24 0 m24 0 ', 7);
        if (type === 'spirale') return 'M16 ' + (y + 30) + ' ' + rep('q18 0 18 -18 q0 -18 -18 -18 q-18 0 -18 18 ', 5);
        return 'M10 ' + (y + 30) + ' L370 ' + (y + 30);
      }
      for (var i = 0; i < rows; i++) {
        var op = i === 0 ? 1 : 0.32;
        var sw = i === 0 ? 3 : 2.4;
        inner += '<path d="' + p(type, startY + i * rowH) + '" fill="none" stroke="#111" stroke-width="' + sw + '" stroke-opacity="' + op + '" stroke-linecap="round" stroke-linejoin="round"/>';
      }
      return wrap(inner);
    }
    function emotionSVG(name) {
      var g = '<g fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">';
      g += '<circle cx="190" cy="220" r="118"/>';
      g += '<path d="M168 106 q8 -20 18 -6 q8 -16 20 -2 q8 -14 18 -4 q8 -12 16 -2"/>';
      g += '<circle cx="132" cy="248" r="11"/>';
      g += '<circle cx="248" cy="248" r="11"/>';
      if (name === 'spokoj') {
        g += '<path d="M150 214 q13 11 28 0"/><path d="M202 214 q13 11 28 0"/>';
      } else if (name === 'wstyd') {
        g += '<circle cx="164" cy="216" r="14"/><circle cx="216" cy="216" r="14"/>';
        g += '<circle cx="164" cy="220" r="4" fill="#111"/><circle cx="216" cy="220" r="4" fill="#111"/>';
        g += '<path d="M150 200 l28 8"/><path d="M230 200 l-28 8"/>';
      } else {
        g += '<circle cx="164" cy="212" r="15"/><circle cx="216" cy="212" r="15"/>';
        g += '<circle cx="164" cy="215" r="5" fill="#111"/><circle cx="216" cy="215" r="5" fill="#111"/>';
      }
      if (name === 'zlosc') { g += '<path d="M146 184 l32 16"/><path d="M234 184 l-32 16"/>'; }
      else if (name === 'strach') { g += '<path d="M148 176 l30 -10"/><path d="M232 176 l-30 -10"/>'; }
      else if (name === 'zdziwienie') { g += '<path d="M152 182 q12 -7 24 0"/><path d="M204 182 q12 -7 24 0"/>'; }
      else if (name === 'smutek') { g += '<path d="M150 188 q14 -6 28 0"/><path d="M202 188 q14 -6 28 0"/>'; }
      else { g += '<path d="M150 190 q14 -7 28 0"/><path d="M202 190 q14 -7 28 0"/>'; }
      g += '<circle cx="190" cy="250" r="9"/>';
      if (name === 'radosc') g += '<path d="M148 278 q42 44 84 0"/>';
      else if (name === 'smutek') g += '<path d="M154 294 q36 -38 72 0"/>';
      else if (name === 'zlosc') g += '<path d="M150 294 q40 -34 80 0"/>';
      else if (name === 'zdziwienie') g += '<ellipse cx="190" cy="290" rx="12" ry="16"/>';
      else if (name === 'strach') g += '<ellipse cx="190" cy="292" rx="11" ry="15"/>';
      else if (name === 'spokoj') g += '<path d="M156 280 q34 24 68 0"/>';
      else if (name === 'wstyd') g += '<path d="M166 294 q24 -24 48 0"/>';
      else g += '<path d="M152 286 q38 30 76 0"/>';
      g += '</g>';
      var labels = { radosc: 'radość', smutek: 'smutek', zlosc: 'złość', zdziwienie: 'zdziwienie', strach: 'strach', spokoj: 'spokój', wstyd: 'wstyd' };
      g += '<text x="190" y="408" font-size="24" fill="#111" stroke="none" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" font-weight="700">' + (labels[name] || '') + '</text>';
      g += '<text x="190" y="446" font-size="13" fill="#111" stroke="none" text-anchor="middle" font-family="Inter,sans-serif">Jak się czujesz? Pokoloruj i opowiedz.</text>';
      return wrap(g);
    }
    function mazeSVG(diff) {
      var cols = diff === 'trudny' ? 14 : diff === 'sredni' ? 11 : 8;
      var rows = diff === 'trudny' ? 16 : diff === 'sredni' ? 13 : 10;
      var cells = [];
      for (var y = 0; y < rows; y++) { cells[y] = []; for (var x = 0; x < cols; x++) cells[y][x] = { w: [true, true, true, true], v: false }; }
      var stack = [[0, 0]];
      cells[0][0].v = true;
      while (stack.length) {
        var cur = stack[stack.length - 1];
        var cx = cur[0], cy = cur[1];
        var nb = [];
        if (cy > 0 && !cells[cy - 1][cx].v) nb.push([cx, cy - 1, 0, 2]);
        if (cx < cols - 1 && !cells[cy][cx + 1].v) nb.push([cx + 1, cy, 1, 3]);
        if (cy < rows - 1 && !cells[cy + 1][cx].v) nb.push([cx, cy + 1, 2, 0]);
        if (cx > 0 && !cells[cy][cx - 1].v) nb.push([cx - 1, cy, 3, 1]);
        if (nb.length) {
          var n = nb[Math.floor(Math.random() * nb.length)];
          cells[cy][cx].w[n[2]] = false;
          cells[n[1]][n[0]].w[n[3]] = false;
          cells[n[1]][n[0]].v = true;
          stack.push([n[0], n[1]]);
        } else stack.pop();
      }
      var W = 380, H = 490, pad = 20, oy = 50;
      var cw = (W - 2 * pad) / cols;
      var chh = (H - oy - pad) / rows;
      var ox = pad;
      var bottomY = oy + rows * chh;
      var rightX = ox + cols * cw;
      var inner = '';
      for (var yy = 0; yy < rows; yy++) {
        for (var xx = 0; xx < cols; xx++) {
          var c = cells[yy][xx];
          var x0 = ox + xx * cw, y0 = oy + yy * chh, x1 = x0 + cw, y1 = y0 + chh;
          if (c.w[0] && !(xx === 0 && yy === 0)) inner += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '"/>';
          if (c.w[3]) inner += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + y1 + '"/>';
        }
      }
      inner += '<line x1="' + ox + '" y1="' + bottomY + '" x2="' + (ox + (cols - 1) * cw) + '" y2="' + bottomY + '"/>';
      inner += '<line x1="' + rightX + '" y1="' + oy + '" x2="' + rightX + '" y2="' + bottomY + '"/>';
      var g = '<g fill="none" stroke="#111" stroke-width="2" stroke-linecap="square">' + inner + '</g>';
      g += '<text x="' + ox + '" y="42" font-size="13" fill="#111" stroke="none" font-family="Inter,sans-serif">⬆ Start</text>';
      g += '<text x="' + (rightX - 56) + '" y="' + (bottomY + 18) + '" font-size="13" fill="#111" stroke="none" font-family="Inter,sans-serif">Meta ⬇</text>';
      return wrap(g);
    }
    function writingSVG(text, reps) {
      text = (text || 'A').trim() || 'A';
      reps = reps && reps > 0 ? reps : 4;
      var len = text.length;
      var fontSize = len <= 1 ? 50 : len === 2 ? 44 : len <= 4 ? 36 : len <= 6 ? 30 : 24;
      var step = Math.min(330 / reps, fontSize * len * 0.62 + 22);
      var rowH = 86, startY = 60, rows = 5, inner = '';
      for (var r = 0; r < rows; r++) {
        var y = startY + r * rowH;
        var top = y, mid = y + 32, base = y + 64, bot = y + rowH - 4;
        inner += '<line x1="20" y1="' + top + '" x2="360" y2="' + top + '" stroke="#cfd6e4" stroke-width="1"/>';
        inner += '<line x1="20" y1="' + mid + '" x2="360" y2="' + mid + '" stroke="#9bb3d1" stroke-width="1" stroke-dasharray="5 5"/>';
        inner += '<line x1="20" y1="' + base + '" x2="360" y2="' + base + '" stroke="#111" stroke-width="1.6"/>';
        inner += '<line x1="20" y1="' + bot + '" x2="360" y2="' + bot + '" stroke="#cfd6e4" stroke-width="1"/>';
        if (r < rows - 1) {
          var x = 30;
          var op = r === 0 ? 0.6 : 0.32;
          for (var c = 0; c < reps; c++) {
            inner += '<text x="' + x + '" y="' + base + '" font-size="' + fontSize + '" fill="#111" fill-opacity="' + op + '" stroke="none" font-family="Segoe Print, Comic Sans MS, cursive">' + esc(text) + '</text>';
            x += step;
          }
        }
      }
      return wrap(inner);
    }
  })();
