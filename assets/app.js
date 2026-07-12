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
