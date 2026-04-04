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
