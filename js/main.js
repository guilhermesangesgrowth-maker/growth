
document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("scrollCue").addEventListener("click", () => {
  document.getElementById("cases").scrollIntoView({ behavior: "smooth" });
});


/* ============ NAV SHADOW ON SCROLL ============ */
const navEl = document.getElementById("nav");
window.addEventListener(
  "scroll",
  () => {
    navEl.style.borderBottomColor = window.scrollY > 20 ? "rgba(255,107,0,0.35)" : "";
  },
  { passive: true }
);

/* ============ MENU MOBILE (SANDUÍCHE) ============ */
(function initMobileNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMobile");
  if (!nav || !toggle || !menu) return;

  function setOpen(open) {
    nav.classList.toggle("nav--open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("nav--open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
  window.matchMedia("(min-width: 860px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
})();

/* ============ CASES: CARROSSEL AUTOMÁTICO NO MOBILE (4s) ============ */
(function initCasesCarousel() {
  const grid = document.querySelector(".cases-grid");
  if (!grid) return;

  const mobile = window.matchMedia("(max-width: 899px)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;
  let resumeTimer = null;
  let index = 0;

  const cards = () => grid.querySelectorAll(".case-card");

  function currentIndex() {
    const list = cards();
    if (!list.length) return 0;
    const step = list[0].offsetWidth + (parseFloat(getComputedStyle(grid).columnGap) || 14);
    return Math.max(0, Math.min(list.length - 1, Math.round(grid.scrollLeft / step)));
  }

  function go(n) {
    const list = cards();
    if (!list.length) return;
    index = (n + list.length) % list.length;
    grid.scrollTo({ left: list[index].offsetLeft, behavior: "smooth" });
  }

  function start() {
    if (reduce || timer || !mobile.matches) return;
    timer = setInterval(() => go(currentIndex() + 1), 4000);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    clearTimeout(resumeTimer);
  }
  function resumeLater() {
    stop();
    resumeTimer = setTimeout(start, 6000);
  }

  grid.addEventListener("touchstart", stop, { passive: true });
  grid.addEventListener("touchend", resumeLater, { passive: true });
  grid.addEventListener("mouseenter", stop);
  grid.addEventListener("mouseleave", start);
  grid.addEventListener("focusin", stop);
  grid.addEventListener("focusout", start);

  mobile.addEventListener("change", () => {
    stop();
    if (mobile.matches) start();
    else grid.scrollLeft = 0;
  });
  start();
})();


/* ============ MÉTODO: inicia a animação (balde → ikigai) quando a seção aparece ============ */
(function initMethodAnim() {
  const el = document.getElementById("mxAnim");
  if (!el) return;
  if (!("IntersectionObserver" in window)) { el.classList.add("is-playing"); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { el.classList.add("is-playing"); io.disconnect(); }
    });
  }, { threshold: 0.35 });
  io.observe(el);
})();

/* ============ SERVIÇOS: carrossel de soluções (auto-roll a cada 3s, pausa ao interagir) ============ */
(function initSolutions() {
  const track = document.getElementById("solTrack");
  if (!track) return;
  const cards = Array.from(track.querySelectorAll(".sol__card"));
  const dots = Array.from(document.querySelectorAll("#solDots button"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0, timer = null, resume = null, visible = false;

  function mark(i) {
    index = i;
    cards.forEach((c, k) => c.classList.toggle("is-active", k === i));
    dots.forEach((d, k) => d.setAttribute("aria-selected", k === i ? "true" : "false"));
  }
  function go(i) {
    const n = (i + cards.length) % cards.length;
    const c = cards[n];
    track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    mark(n);
  }
  function start() { if (reduce || timer || !visible) return; timer = setInterval(() => go(index + 1), 3000); }
  function stop() { clearInterval(timer); timer = null; clearTimeout(resume); }
  function pauseThenResume() { stop(); resume = setTimeout(start, 6000); }

  // índice segue a rolagem manual (dedo ou trackpad)
  let raf = null;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, dist = Infinity;
      cards.forEach((c, k) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < dist) { dist = d; best = k; } });
      if (best !== index) mark(best);
    });
  }, { passive: true });

  dots.forEach((d, k) => d.addEventListener("click", () => { go(k); pauseThenResume(); }));
  document.getElementById("solPrev").addEventListener("click", () => { go(index - 1); pauseThenResume(); });
  document.getElementById("solNext").addEventListener("click", () => { go(index + 1); pauseThenResume(); });
  ["touchstart", "pointerdown", "focusin"].forEach((ev) => track.addEventListener(ev, pauseThenResume, { passive: true }));
  track.addEventListener("mouseenter", stop);
  track.addEventListener("mouseleave", () => { clearTimeout(resume); start(); });

  // só gira quando a seção está na tela
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => entries.forEach((e) => { visible = e.isIntersecting; visible ? start() : stop(); }), { threshold: 0.3 }).observe(track);
  } else { visible = true; start(); }

  mark(0);
  requestAnimationFrame(() => go(0));
})();
