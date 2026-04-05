(function () {
  var PHRASE = "• Открыта предзапись на фотосессию ";
  var PHRASE_REPEAT = 36;

  function announcementMarqueeUnit() {
    var s = "";
    for (var i = 0; i < PHRASE_REPEAT; i++) s += PHRASE;
    return s;
  }

  function initAnnouncementMarquee() {
    var mq = document.querySelector("[data-announcement-marquee]");
    if (!mq) return;

    var unit = announcementMarqueeUnit();
    mq.textContent = "";

    function appendRepeat() {
      var rep = document.createElement("div");
      rep.className = "announcement-bar__repeat";
      var sp = document.createElement("span");
      sp.className = "announcement-bar__segment";
      sp.textContent = unit;
      rep.appendChild(sp);
      mq.appendChild(rep);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      appendRepeat();
      return;
    }

    appendRepeat();
    appendRepeat();

    function tuneDuration() {
      var first = mq.querySelector(".announcement-bar__repeat");
      if (!first || !first.offsetWidth) return;
      var w = first.offsetWidth;
      var pxPerSec = 38;
      mq.style.animationDuration = Math.max(36, Math.round(w / pxPerSec)) + "s";
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(tuneDuration);
    });
    window.addEventListener("resize", tuneDuration, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnnouncementMarquee);
  } else {
    initAnnouncementMarquee();
  }
})();

(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-navigation");

  if (!header || !toggle || !nav) return;

  function setOpen(open) {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  }

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("nav-open"));
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
})();

(function () {
  function initBeforeAfterSliders() {
    document.querySelectorAll("[data-before-after-slider]").forEach(function (root) {
      var range = root.querySelector(".before-after-slider__range");
      if (!range) return;

      function setPos(raw) {
        var v = Math.max(0, Math.min(100, raw));
        root.style.setProperty("--ba-pos", String(v));
        range.value = String(v);
        range.setAttribute("aria-valuenow", String(Math.round(v * 4) / 4));
        range.setAttribute("aria-valuetext", Math.round(v) + " процентов");
      }

      function onInput() {
        setPos(parseFloat(range.value, 10));
      }

      function endDrag() {
        root.classList.remove("is-dragging");
      }

      range.addEventListener("input", onInput);

      range.addEventListener("keydown", function () {
        requestAnimationFrame(onInput);
      });

      range.addEventListener("pointerdown", function (e) {
        root.classList.add("is-dragging");
        if (typeof range.setPointerCapture === "function") {
          try {
            range.setPointerCapture(e.pointerId);
          } catch (err) {
            /* ignore */
          }
        }
      });

      range.addEventListener("pointerup", endDrag);
      range.addEventListener("pointercancel", endDrag);
      range.addEventListener("blur", endDrag);
      range.addEventListener("touchend", endDrag, { passive: true });
      range.addEventListener("change", endDrag);

      setPos(parseFloat(range.value, 10) || 50);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBeforeAfterSliders);
  } else {
    initBeforeAfterSliders();
  }
})();

(function () {
  function initAiOrbitScale() {
    var root = document.querySelector("[data-ai-orbit]");
    var viewport = root && root.querySelector(".ai-orbit__viewport");
    if (!root || !viewport) return;

    var base = 1400;

    function update() {
      var w = viewport.clientWidth;
      if (w <= 0) return;
      root.style.setProperty("--orbit-scale", String(w / base));
    }

    update();

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(update);
      ro.observe(viewport);
    } else {
      window.addEventListener("resize", update);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAiOrbitScale);
  } else {
    initAiOrbitScale();
  }
})();

(function () {
  function initScrollReveal() {
    var nodes = document.querySelectorAll(".scroll-reveal");
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (el) {
        el.classList.add("scroll-reveal--visible");
      });
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach(function (el) {
        el.classList.add("scroll-reveal--visible");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("scroll-reveal--visible");
          io.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -5% 0px",
        threshold: 0.05,
      }
    );

    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollReveal);
  } else {
    initScrollReveal();
  }
})();

(function () {
  var childSelector =
    ".service-card, .contact-card, .portfolio-item, .ai-portfolio-item";
  var touchPressTimers = new WeakMap();

  function isRoughlyInView(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var margin = vh * 0.08;
    return r.bottom > margin && r.top < vh - margin;
  }

  function initScrollRevealChildren() {
    var nodes = document.querySelectorAll(childSelector);
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (el) {
        el.classList.add("scroll-reveal-child", "scroll-reveal-child--visible");
      });
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach(function (el) {
        el.classList.add("scroll-reveal-child", "scroll-reveal-child--visible");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("scroll-reveal-child--visible");
          io.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      }
    );

    nodes.forEach(function (el) {
      el.classList.add("scroll-reveal-child");
      if (isRoughlyInView(el)) {
        el.classList.add("scroll-reveal-child--visible");
      } else {
        io.observe(el);
      }
    });
  }

  function scheduleClearTouch(el) {
    var prev = touchPressTimers.get(el);
    if (prev) window.clearTimeout(prev);
    var t = window.setTimeout(function () {
      el.classList.remove("touch-pressed");
      touchPressTimers.delete(el);
    }, 420);
    touchPressTimers.set(el, t);
  }

  function touchRevealOk(el) {
    if (!el.classList.contains("scroll-reveal-child")) return true;
    return el.classList.contains("scroll-reveal-child--visible");
  }

  function initTouchFeedback() {
    if (!window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document
      .querySelectorAll(".service-card, .portfolio-item, .ai-portfolio-item")
      .forEach(function (el) {
        el.addEventListener(
          "touchstart",
          function () {
            if (!touchRevealOk(el)) return;
            el.classList.add("touch-pressed");
          },
          { passive: true }
        );
        el.addEventListener(
          "touchend",
          function () {
            scheduleClearTouch(el);
          },
          { passive: true }
        );
        el.addEventListener(
          "touchcancel",
          function () {
            scheduleClearTouch(el);
          },
          { passive: true }
        );
      });

    document.querySelectorAll(".contact-card a").forEach(function (link) {
      var card = link.closest(".contact-card");
      if (!card) return;

      link.addEventListener(
        "touchstart",
        function () {
          if (!touchRevealOk(card)) return;
          card.classList.add("touch-pressed");
        },
        { passive: true }
      );
      link.addEventListener(
        "touchend",
        function () {
          scheduleClearTouch(card);
        },
        { passive: true }
      );
      link.addEventListener(
        "touchcancel",
        function () {
          scheduleClearTouch(card);
        },
        { passive: true }
      );
    });
  }

  function boot() {
    initScrollRevealChildren();
    initTouchFeedback();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
