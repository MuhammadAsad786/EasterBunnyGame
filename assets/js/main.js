/* ============================================================
   Easter Bunny Runner — site interactions
   Lenis smooth scroll + GSAP hero/scroll animations.
   Everything is progressive enhancement: if a CDN fails to
   load, the page stays fully visible and usable.
   ============================================================ */
(function () {
  "use strict";

  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mark JS as available so CSS can hide-then-reveal .reveal elements.
  document.documentElement.classList.add("js");

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initMailtoForm();
    initSkinsCarousel(); // core navigation — always on, independent of animation libs

    if (reduce) {
      // Respect reduced motion: show everything, skip animation.
      revealAllImmediately();
      return;
    }

    var lenis = initLenis();
    if (hasGSAP) {
      if (hasST) window.gsap.registerPlugin(window.ScrollTrigger);
      // Sync Lenis with GSAP ScrollTrigger
      if (lenis && hasST) {
        lenis.on("scroll", window.ScrollTrigger.update);
        window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        window.gsap.ticker.lagSmoothing(0);
      }
      initHero();
      initFloaters();
      initReveals();
      initCounters();
      initControlBunny();
      if (hasST) window.ScrollTrigger.refresh();
    } else {
      revealAllImmediately();
    }
  });

  /* ---------- Smooth scroll ---------- */
  function initLenis() {
    if (!hasLenis) return null;
    try {
      var lenis = new window.Lenis({
        duration: 1.15,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true
      });
      // Fallback ticker if GSAP isn't present
      if (!hasGSAP) {
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
      }
      return lenis;
    } catch (e) { return null; }
  }

  /* ---------- Navbar ---------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");

    function onScroll() {
      if (!nav) return;
      if (window.scrollY > 30) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
        toggle.textContent = links.classList.contains("open") ? "✕" : "☰";
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("open");
          toggle.textContent = "☰";
        });
      });
    }

    // Smooth in-page anchor scroll (works with or without Lenis)
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
  }

  /* ---------- Hero intro timeline ---------- */
  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var tl = window.gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from("[data-hero-el]", { y: 36, opacity: 0, duration: 0.9, stagger: 0.12 })
      .from(".hero-stage .phone", { y: 60, opacity: 0, scale: 0.92, duration: 1.1, ease: "elastic.out(1,0.7)" }, "-=0.6")
      .from(".hero-stage .floaty", { opacity: 0, scale: 0, duration: 0.6, stagger: 0.08, ease: "back.out(2)" }, "-=0.8");
  }

  /* ---------- Floating collectibles (idle + parallax) ---------- */
  function initFloaters() {
    document.querySelectorAll(".floaty").forEach(function (el, i) {
      window.gsap.to(el, {
        y: "+=18", x: (i % 2 ? "+=10" : "-=10"), rotation: (i % 2 ? 8 : -8),
        duration: 2.6 + (i % 3) * 0.6, repeat: -1, yoyo: true, ease: "sine.inOut"
      });
    });
    // Parallax drift on scroll
    if (hasST) {
      document.querySelectorAll("[data-parallax]").forEach(function (el) {
        var depth = parseFloat(el.getAttribute("data-parallax")) || 0.2;
        window.gsap.to(el, {
          yPercent: depth * 28,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
        });
      });
    }
  }

  /* ---------- Scroll reveals ---------- */
  function initReveals() {
    if (!hasST) { revealAllImmediately(); return; }
    document.querySelectorAll(".reveal").forEach(function (el) {
      window.ScrollTrigger.create({
        trigger: el,
        start: "top 86%",
        onEnter: function () { el.classList.add("is-in"); },
        once: true
      });
    });
    // Stagger groups: children of [data-stagger]
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var kids = group.children;
      window.gsap.set(kids, { opacity: 0, y: 30 });
      window.ScrollTrigger.create({
        trigger: group, start: "top 82%", once: true,
        onEnter: function () {
          window.gsap.to(kids, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
        }
      });
    });
  }

  function revealAllImmediately() {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
    document.querySelectorAll("[data-stagger]").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (k) { k.style.opacity = 1; k.style.transform = "none"; });
    });
  }

  /* ---------- Skins carousel: arrows + drag-to-scroll ---------- */
  function initSkinsCarousel() {
    var track = document.getElementById("skinsTrack");
    if (!track) return;
    var prev = document.getElementById("skinsPrev");
    var next = document.getElementById("skinsNext");

    function step() {
      var card = track.querySelector(".skin");
      if (!card) return track.clientWidth * 0.8;
      var cs = getComputedStyle(track);
      var gap = parseFloat(cs.columnGap || cs.gap) || 26;
      return card.getBoundingClientRect().width + gap;
    }
    function update() {
      if (!prev || !next) return;
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.toggleAttribute("disabled", track.scrollLeft <= 2);
      next.toggleAttribute("disabled", track.scrollLeft >= max);
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    /* Click-and-drag to scroll (desktop pointer / mouse) */
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return; // let native touch scrolling handle it
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add("dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    function end() {
      if (!down) return;
      down = false; track.classList.remove("dragging");
      setTimeout(update, 60);
    }
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    /* Swallow the click that follows a drag so skin links/buttons don't misfire */
    track.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  }

  /* ---------- Animated number counters ---------- */
  function initCounters() {
    if (!hasST) {
      document.querySelectorAll("[data-count]").forEach(function (el) {
        el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
      });
      return;
    }
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var end = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var obj = { v: 0 };
      window.ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: function () {
          window.gsap.to(obj, {
            v: end, duration: 1.6, ease: "power2.out",
            onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; }
          });
        }
      });
    });
  }

  /* ---------- Control-ring bunny: gentle 2D drift to illustrate drag ---------- */
  function initControlBunny() {
    var b = document.querySelector(".control-ring .drag-bunny");
    if (!b) return;
    window.gsap.to(b, { x: 46, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    window.gsap.to(b, { y: -30, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }

  /* ---------- Contact form -> mailto ---------- */
  function initMailtoForm() {
    var form = document.querySelector("[data-mailto-form]");
    if (!form) return;
    var to = form.getAttribute("data-mailto") || "";
    var success = form.querySelector(".form-success");

    function setInvalid(field, bad) {
      var wrap = field.closest(".field");
      if (wrap) wrap.classList.toggle("invalid", bad);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var subject = form.querySelector('[name="subject"]');
      var message = form.querySelector('[name="message"]');

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      var ok = true;
      [name, message].forEach(function (f) {
        var bad = !f.value.trim();
        setInvalid(f, bad);
        if (bad) ok = false;
      });
      setInvalid(email, !emailOk);
      if (!emailOk) ok = false;
      if (!ok) return;

      var subj = subject && subject.value.trim() ? subject.value.trim() : "Easter Bunny Runner — message from " + name.value.trim();
      var bodyLines = [
        "Name: " + name.value.trim(),
        "Email: " + email.value.trim(),
        "",
        message.value.trim(),
        "",
        "— sent from the Easter Bunny Runner website"
      ];
      var href = "mailto:" + encodeURIComponent(to) +
        "?subject=" + encodeURIComponent(subj) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = href;

      if (success) {
        success.classList.add("show");
        if (hasGSAP && !reduce) window.gsap.from(success, { y: 10, opacity: 0, duration: 0.5, ease: "power2.out" });
        setTimeout(function () { success.classList.remove("show"); }, 9000);
      }
      form.reset();
    });
  }
})();
