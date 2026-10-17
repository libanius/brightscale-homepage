/* BrightScale Remodeling — motion layer (Motion, the vanilla build of Framer Motion)
   One authored moment: the hero plan becomes the room. Everything else is feedback or state:
   the price range rolls to its new value, the Tracker fills, the founder's numbers count.
   Content is visible by default; this file only animates from a visible state, so if it
   fails to load the page looks exactly as designed. */
(function () {
  "use strict";
  var M = window.Motion;
  if (!M || !M.animate) return;
  var animate = M.animate, inView = M.inView, stagger = M.stagger;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = [0.16, 1, 0.3, 1];

  /* ---------- Price range: roll to the new numbers ---------- */
  window.bsTweenRange = function (el, lo, hi, fmt) {
    var cur = el._bsCur, last = el._bsTarget;
    if (last && last.lo === lo && last.hi === hi) return; // same numbers (input + change both fire)
    el._bsTarget = { lo: lo, hi: hi };
    if (el._bsAnim) el._bsAnim.stop();
    var paint = function (a, b) { el._bsCur = { lo: a, hi: b }; el.textContent = fmt(a) + " – " + fmt(b); };
    if (!cur || reduce) { paint(lo, hi); return; }
    el._bsAnim = animate(0, 1, {
      duration: 0.45, ease: EASE,
      onUpdate: function (p) { paint(cur.lo + (lo - cur.lo) * p, cur.hi + (hi - cur.hi) * p); }
    });
  };

  function countUp(el, to, opts) {
    opts = opts || {};
    var prefix = opts.prefix || "", suffix = opts.suffix || "";
    return animate(0, to, {
      duration: opts.duration || 1.1, ease: EASE, delay: opts.delay || 0,
      onUpdate: function (v) { el.textContent = prefix + Math.round(v).toLocaleString("en-US") + suffix; }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- Hero: the plan becomes the room ---------- */
    var sheet = document.querySelector(".hero .sheet");
    var img = sheet && sheet.querySelector("img");
    if (sheet && img) {
      var callouts = sheet.querySelectorAll(".callout");
      var block = sheet.querySelector(".title-block");
      if (reduce) {
        animate(callouts, { opacity: [0, 1] }, { duration: 0.3, delay: stagger(0.12) });
      } else {
        // Plan layer: the same picture as a drafting sheet, underneath the colour one.
        var plan = img.cloneNode();
        plan.alt = ""; plan.setAttribute("aria-hidden", "true");
        plan.className = "sheet-plan";
        img.parentNode.insertBefore(plan, img);
        img.classList.add("sheet-room");
        var scan = document.createElement("i");
        scan.className = "sheet-scan"; scan.setAttribute("aria-hidden", "true");
        sheet.appendChild(scan);

        var run = function () {
          animate(img, { clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] }, { duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.25 });
          animate(scan, { left: ["0%", "100%"] }, { duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.25 })
            .then(function () { return animate(scan, { opacity: 0 }, { duration: 0.2 }); })
            .then(function () { scan.remove(); plan.remove(); img.classList.remove("sheet-room"); img.style.clipPath = ""; });
          animate(callouts, { opacity: [0, 1], transform: ["translateY(8px) scale(0.96)", "translateY(0px) scale(1)"] },
            { duration: 0.45, ease: EASE, delay: stagger(0.22, { startDelay: 1.15 }) });
          if (block) animate(block, { opacity: [0, 1], transform: ["translateY(12px)", "translateY(0px)"] }, { duration: 0.5, ease: EASE, delay: 1.55 });
        };
        if (img.complete) run(); else img.addEventListener("load", run, { once: true });
      }
    }

    if (reduce || !inView) return;

    /* ---------- Smart Remodeling: the five letters, in order ---------- */
    var smart = document.querySelector(".smart");
    if (smart) inView(smart, function () {
      animate(smart.querySelectorAll(".letter"), { transform: ["scale(0.6)", "scale(1)"], opacity: [0.2, 1] },
        { duration: 0.45, ease: EASE, delay: stagger(0.09) });
    }, { amount: 0.4 });

    /* ---------- Tracker: the job fills to where it really is ---------- */
    var phone = document.querySelector(".iphone");
    if (phone) inView(phone, function () {
      var bar = phone.querySelector(".ip-prog i");
      if (bar) animate(bar, { transform: ["scaleX(0)", "scaleX(1)"] }, { duration: 1.1, ease: EASE, delay: 0.15 });
      var pct = phone.querySelector(".ip-pct");
      if (pct) countUp(pct, 66, { suffix: "%", delay: 0.15 });
      phone.querySelectorAll(".ip-scopes div").forEach(function (row, i) {
        var cell = row.lastElementChild, n = parseInt(cell.textContent, 10);
        if (n > 0) countUp(cell, n, { suffix: "%", duration: 0.8, delay: 0.25 + i * 0.08 });
      });
      animate(phone.querySelectorAll(".ip-tasks .pill"), { opacity: [0, 1], transform: ["scale(0.85)", "scale(1)"] },
        { duration: 0.3, ease: EASE, delay: stagger(0.1, { startDelay: 0.9 }) });
    }, { amount: 0.15 });

    /* ---------- Founder: the numbers behind the method ---------- */
    var stats = document.querySelector(".stats");
    if (stats) inView(stats, function () {
      var b = stats.querySelectorAll("b");
      if (b[0]) countUp(b[0], 6, { duration: 0.8 });
      if (b[1]) countUp(b[1], 2500, { suffix: "+", duration: 1.4 });
      if (b[2]) countUp(b[2], 30, { prefix: "~", duration: 1.1 });
    }, { amount: 0.3 });
  });
})();
