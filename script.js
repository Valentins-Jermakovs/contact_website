(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Theme */
  var themeBtn = document.getElementById("theme");
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#161616" : "#ffffff");
  }
  try {
    var saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  } catch (e) { /* storage unavailable */ }
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  });

  /* Mobile navigation */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  function closeNav() {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
  }
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* Footer year */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* Scroll progress */
  var bar = document.querySelector(".progress");
  var ticking = false;
  function updateProgress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  /* Reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Active nav link */
  var links = {};
  document.querySelectorAll(".nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("is-active"); });
          links[en.target.id].classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* Pixel logo: cells use a 16 x 8 grid */
  var V = [[0,0],[1,0],[7,0],[8,0],[0,1],[1,1],[7,1],[8,1],[1,2],[2,2],[6,2],[7,2],[1,3],[2,3],[6,3],[7,3],[2,4],[3,4],[5,4],[6,4],[2,5],[3,5],[5,5],[6,5],[3,6],[4,6],[5,6],[3,7],[4,7],[5,7]];
  var J = [[12,0],[13,0],[14,0],[15,0],[13,1],[14,1],[13,2],[14,2],[13,3],[14,3],[13,4],[14,4],[10,5],[13,5],[14,5],[10,6],[11,6],[13,6],[14,6],[11,7],[12,7],[13,7]];
  var logo = document.getElementById("logo");
  var cells = {};
  V.forEach(function (c) { cells[c[1] * 16 + c[0]] = "v"; });
  J.forEach(function (c) { cells[c[1] * 16 + c[0]] = "j"; });
  var frag = document.createDocumentFragment();
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 16; c++) {
      var i = document.createElement("i");
      var kind = cells[r * 16 + c];
      if (kind) { i.className = kind; i.style.setProperty("--i", (c * 35 + r * 18) + 400); }
      else { i.style.visibility = "hidden"; }
      frag.appendChild(i);
    }
  }
  logo.appendChild(frag);

  /* Terminal sequence */
  var typed = document.getElementById("typed");
  var rows = document.querySelectorAll(".row");
  function showAll() {
    logo.classList.add("is-on");
    rows.forEach(function (row) { row.classList.add("is-on"); });
  }
  if (reduce) { showAll(); return; }

  var text = typed.getAttribute("data-text");
  typed.textContent = "";
  var term = document.querySelector(".term");
  var started = false;
  function run() {
    if (started) return;
    started = true;
    var n = 0;
    (function type() {
      typed.textContent = text.slice(0, ++n);
      if (n < text.length) { setTimeout(type, 70); return; }
      setTimeout(function () {
        logo.classList.add("is-on");
        rows.forEach(function (row, idx) {
          setTimeout(function () { row.classList.add("is-on"); }, 220 * idx);
        });
      }, 260);
    })();
  }
  if ("IntersectionObserver" in window) {
    var t = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { setTimeout(run, 500); t.disconnect(); }
    }, { threshold: 0.3 });
    t.observe(term);
  } else { run(); }
})();
