/* ============================================================
   BUILT-N-AI — main.js
   Vanilla JS, no dependencies. Safe to load on every page:
   each module exits quietly if its markup is absent.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  (function nav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.getElementById("site-nav");
    if (!toggle || !panel) return;

    function setOpen(open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });

    // Close after choosing a destination.
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Tapping outside the panel closes it.
    document.addEventListener("click", function (e) {
      if (!document.body.classList.contains("nav-open")) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    // Never leave the panel open when the layout switches to desktop.
    var desktop = window.matchMedia("(min-width: 1000px)");
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  })();

  /* ---------- Scroll reveal ---------- */
  (function reveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-in");
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Current-section highlight in the nav ---------- */
  (function activeNav() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('#site-nav a[href^="#"]')
    );
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    links.forEach(function (link) {
      var el = document.getElementById(link.getAttribute("href").slice(1));
      if (el) map[el.id] = link;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "page");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Object.keys(map).forEach(function (id) {
      io.observe(document.getElementById(id));
    });
  })();

  /* ---------- Footer year ---------- */
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-year]"),
    function (el) { el.textContent = String(new Date().getFullYear()); }
  );

  /* ---------- Efficiency checkup ---------- */
  (function checkup() {
    var root = document.getElementById("checkup-quiz");
    if (!root) return;

    var stage = root.querySelector("[data-stage]");
    var bar = root.querySelector("[data-progress]");
    var backBtn = root.querySelector("[data-back]");
    var nextBtn = root.querySelector("[data-next]");
    var actions = root.querySelector("[data-actions]");
    var hint = root.querySelector("[data-hint]");
    var CAL = "https://calendly.com/jacksoncas200/ai-conversation-30-min";

    var QUESTIONS = [
      ["How often does your team re-enter information from one system into another?",
        ["Rarely", "Sometimes", "Daily", "Constantly"]],
      ["How much time is spent researching information needed for routine work?",
        ["Very little", "Some", "Several hours weekly", "A major burden"]],
      ["Do employees manually read, sort or route emails, documents, orders or requests?",
        ["Rarely", "Sometimes", "Often", "Constantly"]],
      ["When leaders need a new answer, do they wait for IT or an analyst to build a report?",
        ["Rarely", "Sometimes", "Often", "Usually"]],
      ["Do your ERP, CRM, accounting tools or spreadsheets disagree about the same business fact?",
        ["Rarely", "Sometimes", "Often", "Constantly"]],
      ["Do people make repetitive decisions using essentially the same rules each time?",
        ["Rarely", "Sometimes", "Often", "Constantly"]],
      ["Are there processes that depend on one employee knowing “how we do it”?",
        ["Very few", "Some", "Several", "Many"]],
      ["Do you struggle to see margin leakage, slow turns or avoidable exceptions quickly?",
        ["Rarely", "Sometimes", "Often", "Yes, significantly"]],
      ["Could the same team handle more volume if routine work were automated?",
        ["Probably not", "Maybe", "Likely", "Definitely"]],
      ["Have useful AI experiments failed to become reusable workflows or agents?",
        ["No", "A few", "Several", "Yes, repeatedly"]]
    ];

    var answers = QUESTIONS.map(function () { return null; });
    var index = 0;

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function render(focusChoices) {
      var q = QUESTIONS[index];
      var html =
        '<p class="kicker">Question ' + (index + 1) + " of " + QUESTIONS.length + "</p>" +
        '<h3 class="q-title" id="q-label">' + escapeHtml(q[0]) + "</h3>" +
        '<div class="choices" role="radiogroup" aria-labelledby="q-label">' +
        q[1].map(function (label, i) {
          var checked = answers[index] === i;
          return (
            '<button type="button" class="choice" role="radio" data-i="' + i + '"' +
            ' aria-checked="' + (checked ? "true" : "false") + '"' +
            ' tabindex="' + (checked || (answers[index] === null && i === 0) ? "0" : "-1") + '">' +
            escapeHtml(label) + "</button>"
          );
        }).join("") +
        "</div>";

      stage.innerHTML = html;
      bar.style.width = ((index + 1) / QUESTIONS.length) * 100 + "%";
      backBtn.hidden = index === 0;
      nextBtn.textContent =
        index === QUESTIONS.length - 1 ? "See my score" : "Next";
      hint.textContent = "";

      var choices = Array.prototype.slice.call(stage.querySelectorAll(".choice"));

      choices.forEach(function (btn, i) {
        btn.addEventListener("click", function () {
          answers[index] = i;
          choices.forEach(function (b, j) {
            b.setAttribute("aria-checked", j === i ? "true" : "false");
            b.tabIndex = j === i ? 0 : -1;
          });
          hint.textContent = "";
        });

        btn.addEventListener("keydown", function (e) {
          var dir = 0;
          if (e.key === "ArrowDown" || e.key === "ArrowRight") dir = 1;
          if (e.key === "ArrowUp" || e.key === "ArrowLeft") dir = -1;
          if (!dir) return;
          e.preventDefault();
          var target = choices[(i + dir + choices.length) % choices.length];
          target.focus();
          target.click();
        });
      });

      if (focusChoices && choices.length) {
        var sel = choices[answers[index] === null ? 0 : answers[index]];
        sel.focus();
      }
    }

    function finish() {
      var raw = answers.reduce(function (sum, a) { return sum + a; }, 0);
      var pct = Math.round((raw / (QUESTIONS.length * 3)) * 100);
      var band = pct < 30 ? "Low" : pct < 60 ? "Moderate" : "High";
      var phrase =
        pct < 30 ? "a few targeted" : pct < 60 ? "several meaningful" : "multiple high-value";

      actions.hidden = true;
      bar.style.width = "100%";
      stage.innerHTML =
        '<p class="kicker is-lime">Your Built-N-AI efficiency score</p>' +
        '<h3 class="score">' + pct + "/100</h3>" +
        "<p><strong>" + band + " opportunity.</strong> Your answers suggest " + phrase +
        " areas may be worth investigating for automation, better data access or process redesign.</p>" +
        '<div class="btn-row"><a class="btn btn--lime" href="' + CAL +
        '" target="_blank" rel="noopener">Discuss my results &rarr;</a>' +
        '<button type="button" class="btn btn--ghost" data-restart>Start over</button></div>';

      var restart = stage.querySelector("[data-restart]");
      if (restart) {
        restart.addEventListener("click", function () {
          answers = QUESTIONS.map(function () { return null; });
          index = 0;
          actions.hidden = false;
          render(true);
        });
      }
      stage.setAttribute("tabindex", "-1");
      stage.focus();
    }

    nextBtn.addEventListener("click", function () {
      if (answers[index] === null) {
        hint.textContent = "Choose an answer to continue.";
        return;
      }
      if (index < QUESTIONS.length - 1) {
        index++;
        render(true);
      } else {
        finish();
      }
    });

    backBtn.addEventListener("click", function () {
      if (index > 0) { index--; render(true); }
    });

    render(false);
  })();
})();
