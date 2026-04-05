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
  function initMobileStaggerReveal() {
    var sections = document.querySelectorAll("[data-m-reveal-section]");
    if (!sections.length) return;

    var mqMobile = window.matchMedia("(max-width: 768px)");
    var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    function revealAll() {
      sections.forEach(function (el) {
        el.classList.add("m-reveal-section--visible");
      });
    }

    function useScrollReveal() {
      return mqMobile.matches && !mqReduce.matches;
    }

    function sectionLikelyInView(section) {
      var r = section.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.93 && r.bottom > -Math.min(r.height * 0.4, vh * 0.35);
    }

    if (!useScrollReveal()) {
      revealAll();
    } else if (typeof IntersectionObserver === "undefined") {
      revealAll();
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("m-reveal-section--visible");
            io.unobserve(entry.target);
          });
        },
        {
          root: null,
          rootMargin: "0px 0px -7% 0px",
          threshold: 0.06,
        }
      );

      sections.forEach(function (section) {
        if (sectionLikelyInView(section)) {
          section.classList.add("m-reveal-section--visible");
        } else {
          io.observe(section);
        }
      });
    }

    function onViewportModeChange() {
      if (!mqMobile.matches || mqReduce.matches) {
        revealAll();
      }
    }

    if (typeof mqMobile.addEventListener === "function") {
      mqMobile.addEventListener("change", onViewportModeChange);
      mqReduce.addEventListener("change", onViewportModeChange);
    } else if (typeof mqMobile.addListener === "function") {
      mqMobile.addListener(onViewportModeChange);
      mqReduce.addListener(onViewportModeChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileStaggerReveal);
  } else {
    initMobileStaggerReveal();
  }
})();

(function () {
  var childSelector =
    ".service-card, .contact-card, .portfolio-item, .ai-portfolio-item, .shooting-flow__card";
  var touchPressTimers = new WeakMap();

  function isRoughlyInView(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var margin = vh * 0.08;
    return r.bottom > margin && r.top < vh - margin;
  }

  /** На узком экране карточки «Услуги» раскрываются блоком data-m-reveal-section — без scroll-reveal-child */
  function skipServiceCardMobileMReveal(el) {
    if (!el.classList.contains("service-card")) return false;
    if (!window.matchMedia("(max-width: 768px)").matches) return false;
    return !!el.closest(".services[data-m-reveal-section]");
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
      if (skipServiceCardMobileMReveal(el)) {
        return;
      }
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
    }, 480);
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

    document
      .querySelectorAll(".about-photo, .about-benefit-card, .hero-visual, .before-after-item")
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

(function () {
  function initHeroPortraitParallax() {
    var hero = document.querySelector(".hero");
    var img = document.querySelector(".hero-visual__img");
    if (!hero || !img) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    var maxPx = 8;
    var targetX = 0;
    var targetY = 0;
    var curX = 0;
    var curY = 0;
    var rafId = null;

    function apply() {
      img.style.transform = "translate(" + curX.toFixed(3) + "px, " + curY.toFixed(3) + "px)";
    }

    function loop() {
      var dx = targetX - curX;
      var dy = targetY - curY;
      curX += dx * 0.082;
      curY += dy * 0.082;
      if (Math.abs(targetX - curX) < 0.025 && Math.abs(targetY - curY) < 0.025) {
        curX = targetX;
        curY = targetY;
        apply();
        rafId = null;
        return;
      }
      apply();
      rafId = window.requestAnimationFrame(loop);
    }

    function schedule() {
      if (rafId == null) {
        rafId = window.requestAnimationFrame(loop);
      }
    }

    function onMove(e) {
      var r = hero.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return;
      var mx = (e.clientX - (r.left + r.width * 0.5)) / (r.width * 0.5);
      var my = (e.clientY - (r.top + r.height * 0.5)) / (r.height * 0.5);
      mx = Math.max(-1, Math.min(1, mx));
      my = Math.max(-1, Math.min(1, my));
      targetX = mx * maxPx;
      targetY = my * maxPx;
      schedule();
    }

    function reset() {
      targetX = 0;
      targetY = 0;
      schedule();
    }

    hero.addEventListener("mousemove", onMove, { passive: true });
    hero.addEventListener("mouseleave", reset, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroPortraitParallax);
  } else {
    initHeroPortraitParallax();
  }
})();

(function () {
  function initMobileBackgroundParallax() {
    var el = document.querySelector(".site-bg-parallax");
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var mq = window.matchMedia("(max-width: 768px)");
    var factor = 0.09;
    var ticking = false;

    function apply() {
      ticking = false;
      if (!mq.matches) {
        el.style.transform = "";
        return;
      }
      var y = window.scrollY || window.pageYOffset || 0;
      el.style.transform = "translate3d(0, " + (y * factor).toFixed(2) + "px, 0)";
    }

    function onScroll() {
      if (!mq.matches) return;
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(apply);
      }
    }

    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
    } else if (mq.addListener) {
      mq.addListener(apply);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", apply, { passive: true });
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileBackgroundParallax);
  } else {
    initMobileBackgroundParallax();
  }
})();

(function () {
  function initTestimonialsSlider() {
    var root = document.querySelector("[data-testimonials-slider]");
    if (!root) return;
    var viewport = root.querySelector(".testimonials-slider__viewport");
    var track = root.querySelector("[data-testimonials-track]");
    var prevBtn = root.querySelector("[data-testimonials-prev]");
    var nextBtn = root.querySelector("[data-testimonials-next]");
    if (!viewport || !track || !prevBtn || !nextBtn) return;

    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-testimonials-card]"));
    if (cards.length === 0) return;

    var index = 0;

    function getGapPx() {
      var cs = window.getComputedStyle(track);
      var g = cs.gap || cs.columnGap || "0px";
      var n = parseFloat(g, 10);
      return isNaN(n) ? 16 : n;
    }

    function update() {
      var first = cards[0];
      if (!first) return;
      var vpW = viewport.clientWidth;
      if (vpW <= 0) return;
      var cardW = first.offsetWidth;
      var gap = getGapPx();
      var x = vpW / 2 - (index * (cardW + gap) + cardW / 2);
      track.style.transform = "translate3d(" + x + "px, 0, 0)";

      cards.forEach(function (card, i) {
        card.classList.toggle("is-active", i === index);
        card.setAttribute("aria-hidden", i === index ? "false" : "true");
      });

      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= cards.length - 1;
    }

    function go(delta) {
      var next = index + delta;
      if (next < 0 || next >= cards.length) return;
      index = next;
      update();
    }

    prevBtn.addEventListener("click", function () {
      go(-1);
    });
    nextBtn.addEventListener("click", function () {
      go(1);
    });

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        window.requestAnimationFrame(update);
      });
      ro.observe(viewport);
    } else {
      window.addEventListener("resize", update, { passive: true });
    }

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(update);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTestimonialsSlider);
  } else {
    initTestimonialsSlider();
  }
})();

(function () {
  function initContactModal() {
    var root = document.querySelector("[data-contact-modal]");
    if (!root) return;

    var panel = root.querySelector(".contact-modal__panel");
    var form = document.getElementById("contact-modal-form");
    var mainEl = document.getElementById("contact-modal-main");
    var successView = document.getElementById("contact-modal-success-view");
    var successCloseBtn = successView ? successView.querySelector(".contact-modal__success-close") : null;
    var firstInput = document.getElementById("contact-name");
    var feedbackEl = document.getElementById("contact-modal-feedback");
    var openBtns = document.querySelectorAll("[data-contact-modal-open]");
    var closeEls = root.querySelectorAll("[data-contact-modal-close]");

    var previousFocus = null;

    function isOpen() {
      return root.classList.contains("contact-modal--open");
    }

    function syncFloatingLabels() {
      if (!form) return;
      form.querySelectorAll(".contact-modal__input, .contact-modal__textarea").forEach(function (el) {
        var c = el.closest(".contact-modal__control");
        if (!c) return;
        c.classList.toggle("is-filled", (el.value || "").trim().length > 0);
      });
    }

    function hideFeedback() {
      if (!feedbackEl) return;
      feedbackEl.hidden = true;
      feedbackEl.textContent = "";
      feedbackEl.classList.remove("contact-modal__feedback--success", "contact-modal__feedback--error");
    }

    function showFeedback(text, kind) {
      if (!feedbackEl) return;
      feedbackEl.textContent = text;
      feedbackEl.classList.remove("contact-modal__feedback--success", "contact-modal__feedback--error");
      if (kind === "success") feedbackEl.classList.add("contact-modal__feedback--success");
      else if (kind === "error") feedbackEl.classList.add("contact-modal__feedback--error");
      feedbackEl.hidden = false;
    }

    function resetModalContent() {
      hideFeedback();
      if (mainEl) mainEl.hidden = false;
      if (successView) successView.hidden = true;
    }

    function showSuccessState() {
      hideFeedback();
      if (mainEl) mainEl.hidden = true;
      if (successView) successView.hidden = false;
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          if (!successCloseBtn) return;
          try {
            successCloseBtn.focus({ preventScroll: true });
          } catch (err) {
            successCloseBtn.focus();
          }
        });
      });
    }

    function openModal() {
      resetModalContent();
      previousFocus = document.activeElement;
      root.classList.add("contact-modal--open");
      root.setAttribute("aria-hidden", "false");
      document.body.classList.add("contact-modal-open");
      syncFloatingLabels();
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          window.setTimeout(function () {
            if (!firstInput) return;
            try {
              firstInput.focus({ preventScroll: true });
            } catch (err) {
              firstInput.focus();
            }
          }, 340);
        });
      });
    }

    function closeModal() {
      resetModalContent();
      root.classList.remove("contact-modal--open");
      root.setAttribute("aria-hidden", "true");
      document.body.classList.remove("contact-modal-open");
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
      previousFocus = null;
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });

    closeEls.forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        closeModal();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !isOpen()) return;
      e.preventDefault();
      closeModal();
    });

    if (panel) {
      panel.addEventListener("keydown", function (e) {
        if (e.key !== "Tab" || !isOpen()) return;
        var sel =
          "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
        var nodes = panel.querySelectorAll(sel);
        var list = [];
        for (var i = 0; i < nodes.length; i++) {
          list.push(nodes[i]);
        }
        if (list.length === 0) return;
        var first = list[0];
        var last = list[list.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    }

    if (form) {
      var submitBtn = form.querySelector('button[type="submit"]');

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        hideFeedback();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        var keyInput = form.querySelector('input[name="access_key"]');
        var accessKey = keyInput && keyInput.value ? keyInput.value.trim() : "";
        var endpoint = form.getAttribute("action");
        if (!accessKey || !endpoint) {
          showFeedback("Форма не настроена для отправки.", "error");
          return;
        }

        var nameEl = document.getElementById("contact-name");
        var emailEl = document.getElementById("contact-email");
        var phoneEl = document.getElementById("contact-phone");
        var msgEl = document.getElementById("contact-message");
        var name = nameEl ? nameEl.value.trim() : "";
        var email = emailEl ? emailEl.value.trim() : "";
        var phone = phoneEl ? phoneEl.value.trim() : "";
        var message = msgEl ? msgEl.value.trim() : "";

        var payload = {
          access_key: accessKey,
          subject: "Сообщение с сайта — " + name,
          name: name,
          email: email,
          phone: phone,
          message: message,
          botcheck: false,
        };

        if (submitBtn) submitBtn.disabled = true;

        fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            return res.json().catch(function () {
              return { success: false, message: "Некорректный ответ сервера." };
            });
          })
          .then(function (data) {
            if (data && data.success === true) {
              form.reset();
              syncFloatingLabels();
              showSuccessState();
            } else {
              var errMsg =
                (data && (data.message || (data.body && data.body.message))) ||
                "Не удалось отправить сообщение. Попробуйте позже.";
              showFeedback(errMsg, "error");
            }
          })
          .catch(function () {
            showFeedback("Ошибка сети. Проверьте подключение и попробуйте снова.", "error");
          })
          .finally(function () {
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    }

    if (form) {
      form.querySelectorAll(".contact-modal__input, .contact-modal__textarea").forEach(function (el) {
        function onFloatInput() {
          var c = el.closest(".contact-modal__control");
          if (!c) return;
          c.classList.toggle("is-filled", (el.value || "").trim().length > 0);
        }
        el.addEventListener("input", onFloatInput);
        el.addEventListener("change", onFloatInput);
        el.addEventListener("blur", onFloatInput);
      });
    }

    function tryOpenFromUrl() {
      var hash = (location.hash || "").replace(/^#/, "");
      var params = new URLSearchParams(location.search || "");
      if (hash !== "contact" && params.get("contact") !== "1") return;
      openModal();
      if (history.replaceState) {
        history.replaceState(null, "", location.pathname + location.search);
      }
    }

    tryOpenFromUrl();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactModal);
  } else {
    initContactModal();
  }
})();
