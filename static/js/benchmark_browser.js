// Benchmark browser for the #benchmark section. Data: assets/benchmark/data.js
// (window.SDV_BENCH = {carlaf: [...], b2dc: [...]}). BEV overlay coordinates are figure
// fractions exported by plot_paper_bev.py (x right, y up).
(function () {
  "use strict";

  var BLURB = {
    carlaf: "<b>CARLA-F</b> tests navigation following. Routes are rebuilt from the CARLA road graph " +
      "with all traffic removed and every light held green. A speed instruction comes first, then " +
      "navigation instructions fire at set distances along the route.",
    b2dc: "<b>B2D-C</b> tests navigation&ndash;scene conflict on Bench2Drive safety-critical routes. " +
      "A speed instruction comes first. The moment the scenario activates, a hand-written " +
      "<b>unsafe instruction</b> is issued that a careful driver should not carry out."
  };
  var FOV_DEG = 110;   // front camera field of view
  var FOV_M = 16;      // drawn wedge length, metres

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function init() {
    var data = window.SDV_BENCH;
    var root = document.getElementById("sdv-bx");
    if (!data || !root) return;

    var ui = {
      blurb: $(".sdv-bx-blurb", root),
      tabs: root.querySelectorAll(".sdv-bx-tab"),
      bev: $(".sdv-bx-bev img", root),
      fov: $(".sdv-bx-fov", root),
      fovPath: $(".sdv-bx-fov path", root),
      fovGrad: $("#sdv-bx-fovgrad", root),
      ring: $(".sdv-bx-ring", root),
      ringCircle: $(".sdv-bx-ring circle", root),
      unsafeKey: $(".sdv-bx-legend .is-b2dc", root),
      chip: $(".sdv-bx-chip", root),
      title: $(".sdv-bx-title", root),
      meta: $(".sdv-bx-meta", root),
      count: $(".sdv-bx-count", root),
      cam: $(".sdv-bx-cam img", root),
      stamp: $(".sdv-bx-stamp", root),
      say: $(".sdv-bx-say", root),
      steps: $(".sdv-bx-steps", root),
      strip: $(".sdv-bx-strip", root)
    };
    var state = { set: "carlaf", idx: 0, step: 0 };

    function routes() { return data[state.set]; }
    function route() { return routes()[state.idx]; }

    function renderStrip() {
      ui.strip.innerHTML = "";
      routes().forEach(function (r, i) {
        var b = el("button", "sdv-bx-thumb");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", r.title);
        b.innerHTML = '<img loading="lazy" src="' + r.thumb + '" alt=""><em>' + (i + 1) +
          "</em><span>" + esc(r.label) + "</span>";
        b.addEventListener("click", function () { selectRoute(i); });
        ui.strip.appendChild(b);
      });
    }

    function setWedge(r) {
      var R = Math.max(170, Math.min(280, FOV_M / r.view_m * 1000));
      var h = FOV_DEG / 2 * Math.PI / 180;
      var x = (R * Math.cos(h)).toFixed(1), y = (R * Math.sin(h)).toFixed(1);
      ui.fovPath.setAttribute("d", "M0 0 L" + x + " -" + y + " A" + R + " " + R + " 0 0 1 " +
        x + " " + y + " Z");
      ui.fovGrad.setAttribute("r", R.toFixed(1));
    }

    function selectRoute(i) {
      var list = routes();
      state.idx = (i + list.length) % list.length;
      var r = route();
      ui.strip.querySelectorAll(".sdv-bx-thumb").forEach(function (b, j) {
        b.classList.toggle("is-active", j === state.idx);
        b.setAttribute("aria-selected", j === state.idx ? "true" : "false");
      });
      ui.bev.src = r.bev;
      ui.bev.alt = "Bird's-eye view of the route: " + r.title;
      setWedge(r);

      var unsafe = state.set === "b2dc";
      ui.chip.textContent = unsafe ? r.category : r.steps.length + " instructions";
      ui.chip.classList.toggle("is-unsafe", unsafe);
      ui.title.textContent = r.title;
      ui.meta.innerHTML = r.meta.map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("") +
        (unsafe && r.scenario ? "<span>Scenario <code>" + esc(r.scenario) + "</code></span>" : "");
      ui.count.textContent = (state.idx + 1) + " / " + list.length;

      ui.steps.innerHTML = "";
      r.steps.forEach(function (s, k) {
        var li = el("li");
        var b = el("button", "sdv-bx-step k-" + s.kind);
        b.type = "button";
        b.innerHTML = '<span class="sdv-bx-pin"></span><span class="sdv-bx-when">' + esc(s.when) +
          '</span><span class="sdv-bx-text">&ldquo;' + esc(s.text.replace(/\.$/, "")) + '.&rdquo;</span>' +
          (s.unsafe ? '<span class="sdv-bx-flag">Unsafe</span>' : "<span></span>");
        b.addEventListener("click", function () { selectStep(k); });
        li.appendChild(b);
        ui.steps.appendChild(li);
      });
      r.steps.forEach(function (s) { var im = new Image(); im.src = s.src; });
      selectStep(r.key);
    }

    function selectStep(k) {
      var r = route();
      state.step = (k + r.steps.length) % r.steps.length;
      var s = r.steps[state.step];
      ui.steps.querySelectorAll(".sdv-bx-step").forEach(function (b, j) {
        b.classList.toggle("is-active", j === state.step);
        b.setAttribute("aria-pressed", j === state.step ? "true" : "false");
      });

      ui.cam.classList.remove("is-in");
      void ui.cam.offsetWidth;
      ui.cam.src = s.src;
      ui.cam.alt = "Front camera after the instruction “" + s.text + "” fired";
      ui.cam.classList.add("is-in");
      ui.stamp.textContent = "Front camera · " + s.dt.toFixed(1) + " s after this instruction";
      ui.say.className = "sdv-bx-say k-" + s.kind;
      ui.say.innerHTML = "<i></i><span>&ldquo;" + esc(s.text.replace(/\.$/, "")) + ".&rdquo;</span>";

      var p = s.pose;
      ui.fov.style.transform = "translate(" + (p[0] * 1000).toFixed(1) + "px," +
        ((1 - p[1]) * 1000).toFixed(1) + "px) rotate(" + (-p[2]).toFixed(1) + "deg)";
      if (s.anchor) {
        ui.ring.style.opacity = "1";
        ui.ring.style.transform = "translate(" + (s.anchor[0] * 1000).toFixed(1) + "px," +
          ((1 - s.anchor[1]) * 1000).toFixed(1) + "px)";
        ui.ringCircle.style.stroke = getComputedStyle(ui.steps.children[state.step].firstChild)
          .getPropertyValue("--kc");
      } else {
        ui.ring.style.opacity = "0";
      }
    }

    function selectSet(name) {
      state.set = name;
      ui.tabs.forEach(function (t) {
        var on = t.getAttribute("data-set") === name;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      ui.blurb.innerHTML = BLURB[name];
      ui.unsafeKey.hidden = name !== "b2dc";
      renderStrip();
      selectRoute(0);
    }

    ui.tabs.forEach(function (t) {
      t.addEventListener("click", function () { selectSet(t.getAttribute("data-set")); });
    });
    $(".sdv-bx-prev", root).addEventListener("click", function () { selectRoute(state.idx - 1); });
    $(".sdv-bx-next", root).addEventListener("click", function () { selectRoute(state.idx + 1); });
    root.addEventListener("keydown", function (e) {
      var m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!m) return;
      e.preventDefault();
      if (m[0]) selectRoute(state.idx + m[0]); else selectStep(state.step + m[1]);
    });

    selectSet("carlaf");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
