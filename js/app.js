/* Khongchat app: hash router + views. No build step, no framework. */
(function () {
  var D = KC.data;
  var main = document.getElementById("main");
  var head = document.getElementById("head");
  var PIN = "2026"; // Prototype only: client-side gate. Production uses real staff accounts.
  var ui = { interests: [], pq: "", addDay: 1, confirm: null, month: new Date().getMonth(), tab: "stay", hl: null, lq: "", lregion: "", lshow: 5 };
  var PAGE = 5; // listings shown per tab before "Show more"
  var cleanup = [];

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pillCls(s) { return s === "open" ? "open" : s === "advisory" ? "adv" : "closed"; }
  function pill(st) { return '<span class="pill ' + pillCls(st.state) + '">' + esc(KC.stateLabel(st.state) + (st.note ? ": " + st.note : "")) + "</span>"; }
  function verified(st) { return '<p class="verified"><b>Verified by Manipur Tourism</b>, ' + KC.relTime(st.at) + "</p>"; }
  function regionName(r) { return D.regions[r]; }
  function toast(html, ms) {
    var box = document.getElementById("toasts");
    box.innerHTML = '<div class="toast" role="status">' + html + "</div>";
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { box.innerHTML = ""; }, ms || 3200);
  }
  function scrollToId(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function reveal() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .12 });
    $$(".reveal").forEach(function (e) { io.observe(e); });
  }

  /* ---------- network badge ---------- */
  function net() {
    var el = document.getElementById("net");
    if (navigator.onLine) { el.textContent = "Online"; el.className = "net on"; }
    else { el.textContent = "Offline. Saved trip works."; el.className = "net off"; }
  }
  window.addEventListener("online", function () { net(); toast("Back online."); });
  window.addEventListener("offline", function () { net(); toast("<b>No signal.</b> Your saved trip still works."); });

  /* ---------- live updates from the dashboard ---------- */
  KC.onChange(function (m) {
    if (m.type === "status" && m.id && route().name !== "admin") {
      var p = KC.placeById(m.id), st = KC.getStatus()[m.id];
      if (p && st) toast("Manipur Tourism updated <b>" + esc(p.name) + "</b>: " + esc(KC.stateLabel(st.state)));
    }
    var r = route().name;
    if (m.type === "status") {
      if (r === "trip") refreshTripStatus();
      if (r === "home") { refreshStrip(); refreshPills(); }
      if (r === "admin") renderAdminTable(true);
    }
    if (m.type === "trip" && r === "admin") renderBars();
    if (m.type === "stamp" && r === "passport") render();
  });

  /* ---------- router ---------- */
  function route() {
    var h = (location.hash || "#/").replace(/^#\/?/, "");
    var parts = h.split("/");
    var name = parts[0] || "home";
    return { name: name, arg: parts[1] || null };
  }
  function render() {
    cleanup.forEach(function (f) { f(); }); cleanup = [];
    var r = route();
    var views = { home: home, trip: trip, passport: passport, stamp: stamp, admin: admin, about: about };
    (views[r.name] || home)(r.arg);
    head.classList.toggle("on-hero", r.name === "home" || r.name === "");
    $$(".nav a").forEach(function (a) {
      var on = a.getAttribute("data-r") === (r.name === "stamp" ? "passport" : r.name);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    reveal();
  }
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });

  /* =========================================================
     HOME
     ========================================================= */
  function home() {
    main.innerHTML =
      '<section class="hero" aria-label="Loktak Lake, Manipur">' +
        '<img class="bg" src="img/loktak-hero.webp" alt="A house among reeds on Loktak Lake, Manipur, under a clear sky" />' +
        '<div class="word-clip"><h1 class="word" id="word">MANIPUR</h1></div>' +
        '<img class="fg" src="img/loktak-foreground.webp" alt="" aria-hidden="true" />' +
        '<div class="cta-row"><button class="btn light" data-go="plan">Plan my trip</button><a class="btn hero-ghost" href="#/passport">Craft passport</a></div>' +
        '<p class="credit">Loktak Lake. Photo: <a href="https://unsplash.com/photos/1JCJHh68syo" target="_blank" rel="noopener">Leeder Bose</a>, Unsplash License</p>' +
        '<p class="live"><span class="pulse" aria-hidden="true"></span><span id="liveText"></span></p>' +
      "</section>" +
      '<div class="phanek" aria-hidden="true"></div>' +

      '<section class="strip" aria-label="Today in Manipur"><div class="wrap" id="strip"></div></section>' +

      '<section class="block" id="plan"><div class="wrap">' +
        '<div class="block-head reveal"><div><p class="kicker">Trip builder</p><h2>Build your Manipur trip.</h2></div>' +
        '<p class="muted">Choose how many days you have and the places you want to see. We only suggest places close to the ones you pick, so you spend your time there, not on the road.</p></div>' +
        '<div class="builder reveal">' +
          '<div class="builder-top"><div>' +
            '<p class="label" id="dl">Days in Manipur</p>' +
            '<div class="stepper" role="group" aria-labelledby="dl">' +
              '<button type="button" id="dMinus" aria-label="One day fewer">&minus;</button>' +
              '<input id="dIn" type="number" inputmode="numeric" min="1" max="14" aria-label="Number of days" />' +
              '<button type="button" id="dPlus" aria-label="One day more">+</button>' +
            "</div>" +
            '<p class="dnote" id="dNote" aria-live="polite"></p><div id="dConfirm" aria-live="polite"></div>' +
          "</div>" +
          '<button class="btn" id="build">Open my trip</button></div>' +
          '<div class="bdays" id="bdays"></div>' +
        "</div>" +
        '<div class="allp" id="allp">' +
          "<h3>All places</h3>" +
          '<p class="label" id="il">Filter by interest</p>' +
          '<div class="chips" role="group" aria-labelledby="il">' +
            D.interests.map(function (i) { return '<button class="chip" data-i="' + i.id + '" aria-pressed="' + (ui.interests.indexOf(i.id) > -1) + '">' + esc(i.label) + "</button>"; }).join("") +
          "</div>" +
          '<input type="search" class="pq" id="pq" placeholder="Search places" aria-label="Search places" />' +
          '<p class="lcount muted" id="pcount" aria-live="polite"></p>' +
          '<ul class="plist" id="plist"></ul>' +
        "</div>" +
      "</div></section>" +

      '<section class="block" id="fests" style="background:var(--paper-2)"><div class="wrap">' +
        '<div class="block-head reveal"><div><p class="kicker">Festival calendar</p><h2>Time it with a festival.</h2></div>' +
        '<p class="muted">Meitei, Naga and Kuki festivals across the year. Tap a month, tap it again for the whole year. Green dots match your interests. Dates move each year, so confirm with Manipur Tourism.</p></div>' +
        '<div class="months reveal" id="months" role="group" aria-label="Months"></div>' +
        '<div class="fests" id="festList"></div>' +
      "</div></section>" +

      '<section class="block" id="listings"><div class="wrap">' +
        '<div class="block-head reveal"><div><p class="kicker">Stay, eat, go</p><h2>Local, and one tap away.</h2></div>' +
        '<p class="muted">Homestays, kitchens, guides and makers. Money goes straight to them. Contact buttons switch on once partners are verified.</p></div>' +
        '<div class="tabs reveal" role="tablist" id="tabs"></div>' +
        '<div class="lfilter"><input type="search" id="lq" placeholder="Search by name or what they offer" aria-label="Search listings" />' +
          '<select id="lregion" aria-label="Area"><option value="">All areas</option>' +
          Object.keys(D.regions).map(function (r) { return '<option value="' + r + '">' + esc(D.regions[r]) + "</option>"; }).join("") + "</select></div>" +
        '<p class="lcount muted" id="lcount" aria-live="polite"></p>' +
        '<ul class="list" id="listing"></ul>' +
        '<button class="btn ghost more" id="lmore" hidden>Show more</button>' +
      "</div></section>";

    // hero: the word sinks behind the hills as you scroll
    var word = $("#word");
    function par() { var y = Math.min(window.scrollY, window.innerHeight); word.style.transform = "translateY(" + (y * 0.28) + "px)"; }
    window.addEventListener("scroll", par, { passive: true }); par();
    cleanup.push(function () { window.removeEventListener("scroll", par); });

    $$("[data-go=plan]").forEach(function (b) { b.onclick = function () { scrollToId("plan"); }; });
    $$(".chip").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-i"), k = ui.interests.indexOf(id);
        if (k > -1) ui.interests.splice(k, 1); else ui.interests.push(id);
        b.setAttribute("aria-pressed", k === -1);
        renderPlaces(); renderFests();
      };
    });
    initBuilder();
    $("#lq").oninput = function () { ui.lq = this.value; ui.lshow = PAGE; renderListing(); };
    $("#lregion").onchange = function () { ui.lregion = this.value; ui.lshow = PAGE; renderListing(); };
    $("#lmore").onclick = function () { ui.lshow += PAGE; renderListing(); };
    $("#lq").value = ui.lq; $("#lregion").value = ui.lregion;
    refreshStrip(); renderBuilder(); renderMonths(); renderFests(); renderTabs();
  }

  function refreshStrip() {
    var el = document.getElementById("strip"); if (!el) return;
    var s = KC.getStatus(), n = { open: 0, advisory: 0, closed: 0 }, latest = 0;
    Object.keys(s).forEach(function (k) { n[s[k].state]++; latest = Math.max(latest, new Date(s[k].at).getTime()); });
    el.innerHTML =
      '<div class="stat"><span class="big">' + n.open + "</span><span>places open</span></div>" +
      '<div class="stat"><span class="big">' + n.advisory + "</span><span>advisories</span></div>" +
      '<div class="stat"><span class="big">' + n.closed + "</span><span>closed today</span></div>" +
      '<p class="note">Verified by Manipur Tourism, ' + KC.relTime(new Date(latest).toISOString()) + ". Demo data in this prototype.</p>";
    var lt = document.getElementById("liveText");
    if (lt) lt.textContent = n.open + " places open today";
  }

  /* ---------- trip builder: the traveller picks days and places ---------- */
  var T = null; // the trip being edited, saved on every change
  function newTrip(days) {
    var plan = []; for (var i = 1; i <= days; i++) plan.push({ day: i, stops: [] });
    return { days: days, plan: plan, created: new Date().toISOString() };
  }
  function allStops(t) { return (t || T).plan.reduce(function (a, d) { return a.concat(d.stops); }, []); }
  function dayOf(id) { for (var i = 0; i < T.plan.length; i++) if (T.plan[i].stops.indexOf(id) > -1) return i; return -1; }
  function spreadNote(stops) {
    var f = KC.spread(stops);
    return f ? '<p class="spread">' + esc(KC.placeById(f.b).name) + " is " + KC.fmtKm(f.km) + " from " + esc(KC.placeById(f.a).name) + ". Consider splitting this into two days.</p>" : "";
  }
  /* Up to 3 places not yet in the trip, within 15 km of the closest stop of this day. Distance only. */
  function nearby(stops) {
    var used = allStops();
    return D.places.filter(function (p) { return used.indexOf(p.id) === -1; }).map(function (p) {
      var best = null;
      stops.forEach(function (id) { var km = KC.distanceKm(KC.placeById(id), p); if (!best || km < best.km) best = { km: km, from: id }; });
      return { p: p, km: best.km, from: best.from };
    }).filter(function (x) { return x.km <= 15; }).sort(function (a, b) { return a.km - b.km; }).slice(0, 3);
  }
  function mutate(fn) {
    fn(T);
    T.days = T.plan.length;
    T.plan.forEach(function (d, i) { d.day = i + 1; });
    KC.saveTrip(T);
    renderBuilder();
  }
  function resize(n) { mutate(function (t) { while (t.plan.length < n) t.plan.push({ day: 0, stops: [] }); t.plan.length = n; }); }
  function setDays(v) {
    var n = parseInt(v, 10), note = "";
    if (isNaN(n)) n = T.days;
    if (n < 1 || n > 14) { n = Math.max(1, Math.min(14, n)); note = "Trips can be 1 to 14 days."; }
    $("#dNote").textContent = note;
    ui.confirm = null;
    var cut = T.plan.slice(n).filter(function (d) { return d.stops.length; });
    if (n < T.days && cut.length) { ui.confirm = { kind: "days", to: n }; renderBuilder(); return; }
    if (n !== T.days) resize(n); else renderBuilder();
  }
  function confirmBox(text, yes) {
    return '<div class="confirm" role="alert"><span>' + text + '</span><button class="btn small" data-act="' + yes + '">Remove</button><button class="btn ghost small" data-act="no">Keep</button></div>';
  }
  function listJoin(a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }

  function initBuilder() {
    T = KC.getTrip() || newTrip(2);
    ui.confirm = null;
    $("#dMinus").onclick = function () { setDays(T.days - 1); };
    $("#dPlus").onclick = function () { setDays(T.days + 1); };
    $("#dIn").onchange = function () { setDays(this.value); };
    $("#dIn").onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); setDays(this.value); } };
    $("#build").onclick = function () { location.hash = "#/trip"; };
    $("#pq").value = ui.pq;
    $("#pq").oninput = function () { ui.pq = this.value; renderPlaces(); };
    $("#plan").addEventListener("click", onBuilderClick);
    $("#plan").addEventListener("change", function (e) {
      var el = e.target;
      if (el.classList.contains("moveto") && el.value !== "") {
        var id = el.getAttribute("data-id"), to = +el.value;
        mutate(function (t) { var from = dayOf(id); t.plan[from].stops.splice(t.plan[from].stops.indexOf(id), 1); t.plan[to].stops.push(id); });
        toast(esc(KC.placeById(id).name) + " moved to Day " + (to + 1) + ".");
      }
      if (el.classList.contains("addday")) ui.addDay = +el.value + 1;
    });
  }
  function onBuilderClick(e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var act = b.getAttribute("data-act"), id = b.getAttribute("data-id"), day = +b.getAttribute("data-day");
    if (act === "up" || act === "down") mutate(function (t) {
      var s = t.plan[day].stops, i = s.indexOf(id), j = act === "up" ? i - 1 : i + 1;
      if (j >= 0 && j < s.length) { s[i] = s[j]; s[j] = id; }
    });
    else if (act === "remove") mutate(function (t) { var d = dayOf(id); if (d > -1) t.plan[d].stops.splice(t.plan[d].stops.indexOf(id), 1); });
    else if (act === "add") {
      var sel = b.parentNode.querySelector(".addday"), to = sel ? +sel.value : day;
      if (dayOf(id) === -1) mutate(function (t) { t.plan[to].stops.push(id); });
    }
    else if (act === "clear") { ui.confirm = { kind: "clear", day: day }; renderBuilder(); }
    else if (act === "clear-yes") { var cd = ui.confirm.day; ui.confirm = null; mutate(function (t) { t.plan[cd].stops = []; }); }
    else if (act === "days-yes") { var n = ui.confirm.to; ui.confirm = null; resize(n); }
    else if (act === "no") { ui.confirm = null; renderBuilder(); }
  }

  function renderBuilder() {
    if (!$("#bdays")) return;
    // Keep keyboard focus on the same control after a re-render.
    var a = document.activeElement, key = a && a.getAttribute && a.getAttribute("data-act") && a.getAttribute("data-id")
      ? '[data-act="' + a.getAttribute("data-act") + '"][data-id="' + a.getAttribute("data-id") + '"]' : null;
    $("#dIn").value = T.days;
    $("#dMinus").disabled = T.days <= 1; $("#dPlus").disabled = T.days >= 14;
    var c = ui.confirm;
    if (c && c.kind === "days") {
      var cut = T.plan.slice(c.to).filter(function (d) { return d.stops.length; });
      var n = cut.reduce(function (k, d) { return k + d.stops.length; }, 0), pl = n + " place" + (n > 1 ? "s" : "");
      $("#dConfirm").innerHTML = confirmBox(cut.length === 1 ? "Day " + cut[0].day + " has " + pl + ". Remove it?" :
        "Days " + listJoin(cut.map(function (d) { return d.day; })) + " have " + pl + ". Remove them?", "days-yes");
    } else $("#dConfirm").innerHTML = "";
    $("#build").disabled = !allStops().length;
    renderDays(); renderPlaces();
    if (key) { var el = $(key); if (el && !el.disabled) el.focus(); }
  }

  function renderDays() {
    var st = KC.getStatus();
    $("#bdays").innerHTML = T.plan.map(function (d, di) {
      var area = KC.dayArea(d.stops), last = d.stops.length - 1, h = "";
      h += '<section class="bday" aria-labelledby="bd' + di + '"><div class="bday-head"><div><h3 id="bd' + di + '">Day ' + d.day + "</h3>" +
        (area ? '<p class="area">' + esc(area) + "</p>" : "") + "</div>" +
        (d.stops.length ? '<button class="btn ghost small" data-act="clear" data-id="d' + di + '" data-day="' + di + '" aria-label="Clear Day ' + d.day + '">Clear day</button>' : "") + "</div>";
      if (ui.confirm && ui.confirm.kind === "clear" && ui.confirm.day === di)
        h += confirmBox("Remove all " + d.stops.length + " place" + (d.stops.length > 1 ? "s" : "") + " from Day " + d.day + "?", "clear-yes");
      if (!d.stops.length) return h + '<p class="empty">No places yet. Add one from the list below.</p></section>';
      h += '<ol class="bstops">' + d.stops.map(function (id, i) {
        var p = KC.placeById(id), nm = esc(p.name);
        return '<li class="bstop"><span class="nm">' + nm + '</span><span class="meta">' + esc(regionName(p.region)) + '</span><span class="pw" data-pill="' + id + '">' + pill(st[id]) + "</span>" +
          '<div class="ctl">' +
            '<button data-act="up" data-id="' + id + '" data-day="' + di + '" aria-label="Move ' + nm + ' up"' + (i === 0 ? " disabled" : "") + ">Up</button>" +
            '<button data-act="down" data-id="' + id + '" data-day="' + di + '" aria-label="Move ' + nm + ' down"' + (i === last ? " disabled" : "") + ">Down</button>" +
            '<button data-act="remove" data-id="' + id + '" aria-label="Remove ' + nm + " from Day " + d.day + '">Remove</button>' +
            (T.plan.length > 1 ? '<select class="moveto" data-id="' + id + '" aria-label="Move ' + nm + ' to another day"><option value="">Move to</option>' +
              T.plan.map(function (x, xi) { return xi === di ? "" : '<option value="' + xi + '">Day ' + x.day + "</option>"; }).join("") + "</select>" : "") +
          "</div></li>";
      }).join("") + "</ol>";
      h += spreadNote(d.stops);
      var near = nearby(d.stops);
      h += '<div class="near"><p class="label">Nearby</p>' + (near.length
        ? "<ul>" + near.map(function (x) {
            return "<li><span>" + esc(x.p.name) + ", " + KC.fmtKm(x.km) + " from " + esc(KC.placeById(x.from).name) + "</span>" +
              '<button class="btn ghost small" data-act="add" data-id="' + x.p.id + '" data-day="' + di + '" aria-label="Add ' + esc(x.p.name) + " to Day " + d.day + '">Add</button></li>';
          }).join("") + '</ul><p class="fine">Distances are straight-line and approximate.</p>'
        : '<p class="fine">Nothing else within 15 km. Browse all places below.</p>') + "</div>";
      return h + "</section>";
    }).join("");
  }

  function renderPlaces() {
    if (!$("#plist")) return;
    var q = ui.pq.trim().toLowerCase(), st = KC.getStatus();
    if (ui.addDay > T.days) ui.addDay = 1;
    var list = D.places.filter(function (p) {
      return (!ui.interests.length || p.tags.some(function (t) { return ui.interests.indexOf(t) > -1; })) &&
        (!q || (p.name + " " + regionName(p.region) + " " + p.blurb).toLowerCase().indexOf(q) > -1);
    });
    $("#pcount").textContent = "Showing " + list.length + " of " + D.places.length + " places";
    $("#plist").innerHTML = list.length ? list.map(function (p) {
      var d = dayOf(p.id), nm = esc(p.name), act;
      if (d > -1) act = '<span class="in">In Day ' + (d + 1) + '</span><button class="btn ghost small" data-act="remove" data-id="' + p.id + '" aria-label="Remove ' + nm + " from Day " + (d + 1) + '">Remove</button>';
      else act = '<select class="addday" data-id="' + p.id + '" aria-label="Day to add ' + nm + ' to">' +
        T.plan.map(function (x, xi) { return '<option value="' + xi + '"' + (xi === ui.addDay - 1 ? " selected" : "") + ">Add to Day " + x.day + "</option>"; }).join("") + "</select>" +
        '<button class="btn small" data-act="add" data-id="' + p.id + '" aria-label="Add ' + nm + ' to the chosen day">Add</button>';
      return '<li class="prow"><div><span class="nm">' + nm + '</span> <span class="meta">' + esc(regionName(p.region)) + '</span><p class="blurb">' + esc(p.blurb) + "</p>" +
        '<span class="pw" data-pill="' + p.id + '">' + pill(st[p.id]) + '</span></div><div class="pact">' + act + "</div></li>";
    }).join("") : '<li class="none muted">No places match. Clear the search or change the interests.</li>';
  }

  function refreshPills() {
    var st = KC.getStatus();
    $$("[data-pill]").forEach(function (el) {
      var s = st[el.getAttribute("data-pill")], v = s.state + s.note, before = el.getAttribute("data-v");
      if (before === v) return;
      el.innerHTML = pill(s); el.setAttribute("data-v", v);
      if (before !== null) el.firstChild.classList.add("flip");
    });
  }

  function eventsFor(m) {
    return D.events.filter(function (e) { return m === null || e.months.indexOf(m) > -1; });
  }
  function matches(e) { return e.tags.some(function (t) { return ui.interests.indexOf(t) > -1; }); }
  function renderMonths() {
    var now = new Date().getMonth();
    $("#months").innerHTML = D.months.map(function (m, i) {
      var evs = eventsFor(i);
      return '<button class="month' + (i === now ? " now" : "") + '" data-m="' + i + '" aria-pressed="' + (ui.month === i) + '">' + m +
        '<span class="dots">' + evs.map(function (e) { return '<i class="' + (matches(e) ? "match" : "") + '"></i>'; }).join("") + "</span></button>";
    }).join("");
    $$("[data-m]").forEach(function (b) {
      b.onclick = function () { var m = +b.getAttribute("data-m"); ui.month = ui.month === m ? null : m; renderMonths(); renderFests(); };
    });
  }
  function renderFests() {
    if (!$("#festList")) return;
    renderMonthsDots();
    var evs = eventsFor(ui.month);
    $("#festList").innerHTML = evs.length ? evs.map(function (e, i) {
      return '<article class="fest" style="animation-delay:' + (i * 50) + 'ms"><div class="when">' + esc(e.when) + ' <span class="who">' + esc(e.who) + "</span></div><h3>" + esc(e.name) + (matches(e) ? '<span class="tag">For you</span>' : "") +
        "</h3><p>" + esc(e.place) + ". " + esc(e.blurb) + "</p></article>";
    }).join("") : '<p class="muted" style="padding:20px 0">No major festival listed for ' + D.months[ui.month] + '. Try the months with dots.</p>';
  }
  function renderMonthsDots() {
    $$("[data-m]").forEach(function (b) {
      var i = +b.getAttribute("data-m");
      b.querySelector(".dots").innerHTML = eventsFor(i).map(function (e) { return '<i class="' + (matches(e) ? "match" : "") + '"></i>'; }).join("");
    });
  }

  var TABS = [["stay", "Stay"], ["eat", "Eat"], ["guide", "Guides"], ["craft", "Crafts"], ["move", "Getting there"]];
  function renderTabs() {
    $("#tabs").innerHTML = TABS.map(function (t) {
      var n = D.listings.filter(function (l) { return l.type === t[0]; }).length;
      return '<button role="tab" data-t="' + t[0] + '" aria-selected="' + (ui.tab === t[0]) + '">' + t[1] + ' <span class="n">' + n + "</span></button>";
    }).join("");
    $$("[data-t]").forEach(function (b) { b.onclick = function () { ui.tab = b.getAttribute("data-t"); ui.lshow = PAGE; renderTabs(); }; });
    renderListing();
  }
  /* Scales to many listings: filter by area and text, then page in 5 at a time.
     Areas on the visitor's saved trip come first. */
  function renderListing() {
    var q = ui.lq.trim().toLowerCase(), t = KC.getTrip();
    var onTrip = t ? allStops(t).map(function (id) { return KC.placeById(id).region; }) : [];
    var all = D.listings.filter(function (l) {
      return l.type === ui.tab && (!ui.lregion || l.region === ui.lregion) &&
        (!q || (l.name + " " + l.note + " " + regionName(l.region)).toLowerCase().indexOf(q) > -1);
    }).sort(function (a, b) { return (onTrip.indexOf(b.region) > -1) - (onTrip.indexOf(a.region) > -1); });
    var shown = all.slice(0, ui.lshow);
    $("#listing").innerHTML = shown.length ? shown.map(function (l) {
      var act = l.type === "move" ? "" : '<button class="btn ghost small" disabled title="Contact details are added once partners are verified">Call</button>';
      var near = onTrip.indexOf(l.region) > -1 ? '<span class="tag">On your trip</span>' : "";
      return '<li><span class="nm">' + esc(l.name) + near + '</span><span class="meta">' + esc(regionName(l.region)) + ". " + esc(l.note) + '</span><span class="act">' + act + "</span></li>";
    }).join("") : '<li class="none muted">Nothing here yet. Try another area or clear the search.</li>';
    $("#lcount").textContent = all.length ? "Showing " + shown.length + " of " + all.length : "";
    var left = all.length - shown.length, more = $("#lmore");
    more.hidden = left <= 0;
    more.textContent = "Show " + Math.min(left, PAGE) + " more";
  }

  /* =========================================================
     TRIP
     ========================================================= */
  function trip() {
    var t = KC.getTrip();
    if (!t || !allStops(t).length) {
      main.innerHTML = '<div class="wrap" style="padding:80px 24px"><p class="kicker">My trip</p><h1 style="font-size:clamp(40px,6vw,64px);margin-bottom:16px">No trip yet.</h1>' +
        '<p class="muted" style="max-width:520px">Choose how many days you have and the places you want to see. It takes a minute.</p><a class="btn" href="#/" style="margin-top:20px" data-plan>Build my trip</a></div>';
      $("[data-plan]").onclick = function (e) { e.preventDefault(); location.hash = "#/"; setTimeout(function () { scrollToId("plan"); }, 60); };
      return;
    }
    var st = KC.getStatus(), n = 0, places = allStops(t).length;
    var html = '<div class="wrap"><div class="trip-head"><div><p class="kicker">My trip</p><h1>' + t.days + " day" + (t.days > 1 ? "s" : "") + " in Manipur</h1>" +
      '<p class="muted" style="margin:10px 0 0">' + places + " place" + (places > 1 ? "s" : "") + " over " + t.days + " day" + (t.days > 1 ? "s" : "") + ". Status updates live from Manipur Tourism.</p></div>" +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="saveOff">Save for offline</button><a class="btn ghost" href="#/" id="edit">Edit trip</a></div></div>' +
      '<div class="trip-grid"><div>';
    t.plan.forEach(function (d) {
      if (!d.stops.length) return;
      html += '<section class="day"><div class="day-title"><b>Day ' + d.day + "</b><span>" + esc(KC.dayArea(d.stops)) + "</span></div>";
      d.stops.forEach(function (id) {
        n++; var p = KC.placeById(id), s = st[id];
        html += '<article class="stop" id="stop-' + id + '" data-id="' + id + '"><span class="n">' + n + "</span><div><h3>" + esc(p.name) + '</h3><p class="hours">' + esc(p.hours) + "</p>" +
          '<div class="st" data-st="' + id + '">' + pill(s) + verified(s) + "</div><p>" + esc(p.blurb) + '</p><p class="tip">Tip: ' + esc(p.tip) + "</p></div></article>";
      });
      html += spreadNote(d.stops) + "</section>";
    });
    html += '</div><aside class="side">' +
      '<div class="panel"><h3>Route</h3><div id="mapBox"></div><p class="muted" style="font-size:13px;margin:8px 0 0">Schematic map, not to scale. Tap a pin.</p></div>' +
      '<div class="panel"><h3>Inner Line Permit</h3><p class="muted" style="font-size:15px;margin:0 0 8px">Domestic visitors need an ILP. Tick off what you have.</p><div id="ilp"></div>' +
      '<a class="btn small" style="margin-top:12px" href="https://manipurilponline.mn.gov.in/" target="_blank" rel="noopener">Official ILP portal</a></div>' +
      '<div class="panel"><h3>Saved contacts</h3>' + D.contacts.map(function (c) { return '<div class="contact"><span>' + esc(c.label) + '</span><a href="tel:' + c.number + '">' + c.number + "</a></div>"; }).join("") + "</div>" +
      "</aside></div></div>";
    main.innerHTML = html;
    drawMap(t); drawIlp();
    $("#edit").onclick = function (e) { e.preventDefault(); location.hash = "#/"; setTimeout(function () { scrollToId("plan"); }, 60); };
    $("#saveOff").onclick = function () {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) toast("<b>Trip saved.</b> It will open with no signal.");
      else toast("<b>Trip saved on this device.</b> Full offline mode works on the live site.");
    };
    $$(".stop").forEach(function (s) { s.onclick = function () { highlight(s.getAttribute("data-id"), false); }; });
  }

  function refreshTripStatus() {
    var st = KC.getStatus();
    $$("[data-st]").forEach(function (el) {
      var id = el.getAttribute("data-st"), s = st[id];
      var before = el.getAttribute("data-v"), now = s.state + s.note + s.at;
      el.innerHTML = pill(s) + verified(s);
      if (before && before !== now) el.querySelector(".pill").classList.add("flip");
      el.setAttribute("data-v", now);
    });
    $$(".map .pin").forEach(function (g) { g.setAttribute("class", "pin " + pillCls(st[g.getAttribute("data-id")].state) + (ui.hl === g.getAttribute("data-id") ? " on" : "")); });
  }

  function highlight(id, scroll) {
    ui.hl = id;
    $$(".stop").forEach(function (s) { s.classList.toggle("hl", s.getAttribute("data-id") === id); });
    $$(".map .pin").forEach(function (g) { g.classList.toggle("on", g.getAttribute("data-id") === id); });
    if (scroll) { var el = document.getElementById("stop-" + id); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }
  }

  /* Schematic map: places projected from lat/lon. No tiles, so it works offline. */
  function drawMap(t) {
    var W = 400, H = 440, st = KC.getStatus(), pts = [], n = 0;
    var days = t.plan.filter(function (d) { return d.stops.length; }); // empty days get no pins or routes
    var LAKE = [[24.63, 93.79], [24.61, 93.845], [24.55, 93.875], [24.47, 93.865], [24.435, 93.815], [24.465, 93.77], [24.55, 93.755]];
    var ids = []; days.forEach(function (d) { d.stops.forEach(function (id) { ids.push(id); }); });
    var lats = ids.map(function (id) { return KC.placeById(id).lat; }), lons = ids.map(function (id) { return KC.placeById(id).lon; });
    if (ids.some(function (id) { return KC.placeById(id).region === "loktak"; })) LAKE.forEach(function (p) { lats.push(p[0]); lons.push(p[1]); });
    var la0 = Math.min.apply(null, lats), la1 = Math.max.apply(null, lats), lo0 = Math.min.apply(null, lons), lo1 = Math.max.apply(null, lons);
    var span = Math.max(la1 - la0, (lo1 - lo0) * (H / W), 0.08) * 1.3, cla = (la0 + la1) / 2, clo = (lo0 + lo1) / 2;
    var sLa = span, sLo = span * (W / H);
    function P(lat, lon) { return [W / 2 + (lon - clo) / sLo * W, H / 2 - (lat - cla) / sLa * H]; }
    days.forEach(function (d) { d.stops.forEach(function (id) { var p = KC.placeById(id); n++; var xy = P(p.lat, p.lon); pts.push({ id: id, n: n, x: xy[0], y: xy[1], tx: xy[0], ty: xy[1] }); }); });
    // spread pins that sit on top of each other (Imphal places are close together)
    pts.forEach(function (p, i) {
      var k = 0;
      while (pts.slice(0, i).some(function (q) { return Math.hypot(q.x - p.x, q.y - p.y) < 25; }) && k < 30) {
        var a = k * 0.9, r = 26 + k * 2; p.x = p.tx + Math.cos(a) * r; p.y = p.ty + Math.sin(a) * r; k++;
      }
      p.x = Math.max(14, Math.min(W - 14, p.x)); p.y = Math.max(14, Math.min(H - 14, p.y));
    });
    function routes() { // solid line within a day, faint dashed hop between days
      var out = "", k = 0;
      days.forEach(function (d, di) {
        var seg = pts.slice(k, k + d.stops.length);
        if (di > 0) { var a = pts[k - 1], b = seg[0]; out += '<line class="hop" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"/>'; }
        if (seg.length > 1) out += '<polyline class="route draw" style="animation-delay:' + (0.2 + di * 0.5) + 's" points="' + seg.map(function (p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ") + '"/>';
        k += d.stops.length;
      });
      return out;
    }
    var lake = LAKE.map(function (q) { var xy = P(q[0], q[1]); return xy[0].toFixed(1) + "," + xy[1].toFixed(1); });
    var lk = P(24.52, 93.81), im = P(24.81, 93.94);
    var svg = '<svg class="map" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Schematic map of your route">' +
      '<polygon class="water" points="' + lake.join(" ") + '"/>' +
      (lk[0] > 0 && lk[0] < W && lk[1] > 0 && lk[1] < H ? '<text class="lbl" x="' + (lk[0] + 30).toFixed(0) + '" y="' + (lk[1] + 4).toFixed(0) + '">Loktak Lake</text>' : "") +
      (im[0] > 0 && im[0] < W && im[1] > 0 && im[1] < H ? '<text class="lbl" x="' + (im[0] + 34).toFixed(0) + '" y="' + (im[1] - 26).toFixed(0) + '">Imphal</text>' : "") +
      routes() +
      pts.map(function (p) {
        var lead = (p.x !== p.tx || p.y !== p.ty) ? '<line x1="' + p.tx.toFixed(1) + '" y1="' + p.ty.toFixed(1) + '" x2="' + p.x.toFixed(1) + '" y2="' + p.y.toFixed(1) + '" stroke="#CFC4B1"/>' : "";
        return lead + '<g class="pin ' + pillCls(st[p.id].state) + '" data-id="' + p.id + '" tabindex="0" role="button" aria-label="Stop ' + p.n + ", " + esc(KC.placeById(p.id).name) + '">' +
          '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="12"/><text x="' + p.x.toFixed(1) + '" y="' + (p.y + 4).toFixed(1) + '">' + p.n + "</text></g>";
      }).join("") + "</svg>";
    $("#mapBox").innerHTML = svg;
    $$(".map .pin").forEach(function (g) {
      var go = function () { highlight(g.getAttribute("data-id"), true); };
      g.addEventListener("click", go);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    refreshTripStatus();
  }

  function drawIlp() {
    var c = KC.getChecks();
    $("#ilp").innerHTML = D.ilp.map(function (x, i) {
      return '<label class="check' + (c[i] ? " done" : "") + '"><input type="checkbox" data-c="' + i + '"' + (c[i] ? " checked" : "") + "><span>" + esc(x) + "</span></label>";
    }).join("");
    $$("[data-c]").forEach(function (b) { b.onchange = function () { KC.setCheck(+b.getAttribute("data-c"), b.checked); b.parentNode.classList.toggle("done", b.checked); }; });
  }

  /* =========================================================
     PASSPORT
     ========================================================= */
  function passport(justGot) {
    var got = KC.getStamps(), need = D.unlock.need, have = D.stamps.filter(function (s) { return got.indexOf(s.id) > -1; }).length;
    main.innerHTML = '<div class="passport"><p class="kicker">Craft passport</p><h1 style="font-size:clamp(40px,6vw,64px);margin-bottom:12px">Stamp the stall.</h1>' +
      '<p class="muted" style="max-width:560px;margin:0 0 28px">Scan the QR code at a potter\'s stall, a homestay or an Ima Keithel kitchen. Each stamp sends a visitor straight to a local maker. Zero commission.</p>' +
      '<div class="book"><div class="stamps">' +
      D.stamps.map(function (s) {
        var ok = got.indexOf(s.id) > -1;
        return '<div class="slot' + (ok ? " got" : "") + (ok && s.id === justGot ? " slam" : "") + '">' + (ok ? esc(s.name) + "<small>stamped</small>" : esc(s.name)) + "</div>";
      }).join("") + "</div>" +
      '<p class="label">' + have + " of " + need + " stamps</p>" +
      '<div class="meter" aria-hidden="true"><i style="width:' + (have / need * 100) + '%"></i></div>' +
      (have >= need
        ? '<div class="reward"><p class="kicker" style="margin:0 0 4px">Unlocked</p><h3>' + esc(D.unlock.reward) + '</h3><p style="margin:4px 0 0">Show this screen to the Andro Pottery Collective (sample).</p></div>'
        : '<div class="reward locked"><h3>' + (need - have) + " more stamp" + (need - have > 1 ? "s" : "") + " to go</h3><p style=\"margin:4px 0 0\">Unlocks: " + esc(D.unlock.reward) + ".</p></div>") +
      "</div>" +
      '<p class="muted" style="font-size:14px;margin-top:20px">Where to find the codes: ' + D.stamps.map(function (s) { return esc(s.where) + " (sample)"; }).join(", ") + ". " +
      '<button class="btn ghost small" id="resetStamps" style="margin-left:6px">Reset demo</button></p></div>';
    $("#resetStamps").onclick = function () { KC.resetStamps(); passport(); toast("Passport reset."); };
  }

  function stamp(id) {
    var s = D.stamps.filter(function (x) { return x.id === id; })[0];
    if (!s) { location.hash = "#/passport"; return; }
    var isNew = KC.addStamp(id);
    passport(id);
    toast(isNew ? "<b>Stamp collected:</b> " + esc(s.name) : "You already have the " + esc(s.name) + " stamp.");
  }

  /* =========================================================
     ADMIN
     ========================================================= */
  function admin() {
    if (!KC.isStaff()) {
      main.innerHTML = '<div class="wrap"><div class="login"><p class="kicker">Manipur Tourism staff</p><h1 style="font-size:44px;margin-bottom:8px">Staff login</h1>' +
        '<p class="muted" style="margin:0">Prototype PIN gate. Demo PIN: <b>2026</b>. Production uses real staff accounts.</p>' +
        '<form id="pinForm"><label class="sr" for="pin">PIN</label><input id="pin" inputmode="numeric" autocomplete="one-time-code" maxlength="4" placeholder="----" />' +
        '<p class="err" id="err"></p><button class="btn" style="width:100%">Sign in</button></form></div></div>';
      $("#pin").focus();
      $("#pinForm").onsubmit = function (e) {
        e.preventDefault();
        if ($("#pin").value === PIN) { KC.setStaff(true); admin(); toast("Signed in as Manipur Tourism staff."); }
        else { $("#err").textContent = "Wrong PIN. Try again."; $("#pin").value = ""; }
      };
      return;
    }
    var base = location.href.split("#")[0];
    main.innerHTML = '<div class="wrap admin"><div style="display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap">' +
      '<div><p class="kicker">Signed in as Manipur Tourism staff</p><h1>Place status</h1><p class="muted" style="margin:8px 0 0">Every change reaches tourist screens at once. Keep notes short.</p></div>' +
      '<div style="display:flex;gap:10px"><button class="btn ghost small" id="reset">Reset demo data</button><button class="btn small" id="out">Sign out</button></div></div>' +
      '<table class="table"><thead><tr><th>Place</th><th>Area</th><th>Status</th><th>Note for tourists</th><th>Updated</th></tr></thead><tbody id="rows"></tbody></table>' +
      '<div class="admin-grid"><div class="panel"><h3>Places saved in trips</h3><p class="muted" style="font-size:14px;margin:0 0 14px">Demand from trips planned on this device. Production counts every visitor.</p><div class="bars" id="bars"></div></div>' +
      '<div class="panel"><div style="display:flex;justify-content:space-between;align-items:baseline"><h3>Stall QR codes</h3><button class="btn ghost small no-print" onclick="window.print()">Print</button></div>' +
      '<p class="muted" style="font-size:14px;margin:0 0 14px">Print and place at each partner stall. Scanning adds a passport stamp.</p><div class="qrs">' +
      D.stamps.map(function (s) {
        var q = qrcode(0, "M"); q.addData(base + "#/stamp/" + s.id); q.make();
        return '<div class="qr"><div class="code">' + q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }) + "</div>" + esc(s.name) + "</div>";
      }).join("") + "</div></div></div></div>";
    renderAdminTable(); renderBars();
    $("#out").onclick = function () { KC.setStaff(false); admin(); };
    $("#reset").onclick = function () { KC.resetStatus(); toast("Demo data reset."); };
  }

  function renderAdminTable(soft) {
    var body = document.getElementById("rows"); if (!body) return;
    var st = KC.getStatus();
    if (soft) { // keep focus in note fields: only refresh controls and times
      D.places.forEach(function (p) {
        var s = st[p.id];
        $$('[data-p="' + p.id + '"] [data-s]').forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-s") === s.state); });
        var up = $('[data-p="' + p.id + '"] .updated'); if (up) up.textContent = KC.relTime(s.at);
      });
      return;
    }
    body.innerHTML = D.places.map(function (p) {
      var s = st[p.id];
      return '<tr data-p="' + p.id + '"><td class="nm">' + esc(p.name) + '</td><td class="muted">' + esc(D.regions[p.region]) + '</td><td><div class="seg" role="group" aria-label="Status for ' + esc(p.name) + '">' +
        ["open", "advisory", "closed"].map(function (k) { return '<button class="' + k + '" data-s="' + k + '" aria-pressed="' + (s.state === k) + '">' + KC.stateLabel(k).replace(" today", "") + "</button>"; }).join("") +
        '</div></td><td><input class="note-in" maxlength="60" value="' + esc(s.note) + '" aria-label="Note for ' + esc(p.name) + '" placeholder="e.g. Boats running till 5 PM"></td><td class="updated">' + KC.relTime(s.at) + "</td></tr>";
    }).join("");
    $$("#rows tr").forEach(function (tr) {
      var id = tr.getAttribute("data-p");
      $$("[data-s]", tr).forEach(function (b) {
        b.onclick = function () {
          var note = $(".note-in", tr).value.trim();
          KC.setStatus(id, b.getAttribute("data-s"), note);
          toast("Published: <b>" + esc(KC.placeById(id).name) + "</b> is now " + esc(KC.stateLabel(b.getAttribute("data-s"))));
        };
      });
      var inp = $(".note-in", tr);
      inp.onchange = function () { var s = KC.getStatus()[id]; KC.setStatus(id, s.state, inp.value.trim()); toast("Note published for <b>" + esc(KC.placeById(id).name) + "</b>"); };
    });
  }

  function renderBars() {
    var el = document.getElementById("bars"); if (!el) return;
    var count = {};
    KC.tripLog().forEach(function (t) { t.stops.forEach(function (id) { count[id] = (count[id] || 0) + 1; }); });
    var rows = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; }).slice(0, 7);
    var max = rows.length ? count[rows[0]] : 1;
    el.innerHTML = rows.length ? rows.map(function (id) {
      return '<div class="bar"><span>' + esc(KC.placeById(id).name) + '</span><span class="track"><i style="width:' + (count[id] / max * 100) + '%"></i></span><b>' + count[id] + "</b></div>";
    }).join("") : '<p class="muted" style="margin:0">No trips saved yet.</p>';
  }

  /* =========================================================
     ABOUT, PRIVACY, TERMS
     ========================================================= */
  function about(section) {
    main.innerHTML = '<article class="prose">' +
      '<p class="kicker">About</p><h1>Khongchat</h1>' +
      '<p>Khongchat means journey in Meiteilon. It gives visitors one reliable place to plan Manipur: a personal plan, place status verified by Manipur Tourism, a trip that still opens with no signal, and a craft passport that sends visitors to local makers.</p>' +
      '<p>Built for the Re-imagining Manipur Hackathon 2026 (Problem Statement 1: Smart Manipur Tourism Discovery Platform). It also covers light versions of Problem Statements 2, 5, 6 and 7.</p>' +
      "<h2>Why</h2><ul>" + D.sources.map(function (s) { return '<li><a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.label) + "</a></li>"; }).join("") + "</ul>" +
      "<h2>What is real and what is demo</h2><ul><li>Places and festivals are real. Map positions are approximate. Festival dates move each year.</li><li>Listings marked (sample) are invented for the prototype.</li><li>Place status is demo data entered from the staff dashboard.</li></ul>" +
      '<h2>Credits</h2><table><tr><th>Item</th><th>Licence</th></tr>' +
      "<tr><td>Hero photo: Loktak Lake, by Leeder Bose (Unsplash)</td><td>Unsplash License</td></tr>" +
      "<tr><td>Fraunces and IBM Plex Sans fonts</td><td>SIL Open Font License 1.1</td></tr>" +
      "<tr><td>qrcode-generator by Kazuhiko Arase</td><td>MIT</td></tr>" +
      "<tr><td>AI assistance: Claude (Anthropic) for planning, research, design and code, reviewed by the team</td><td>Disclosure</td></tr></table>" +
      '<h2 id="privacy">Privacy</h2><p>Khongchat has no accounts for visitors. Your interests, trip, permit checklist and passport stamps are stored only in this browser. Nothing is sent to a server. There are no analytics and no tracking cookies. Clearing your browser data removes everything.</p>' +
      '<h2 id="terms">Terms of use</h2><p>This is a prototype for a hackathon. Information is provided for planning only and may be out of date. Always check timings, permits and advisories with Manipur Tourism before you travel. Sample listings are not real businesses. Do not rely on this prototype in an emergency: call 112.</p>' +
      "</article>";
    if (section) setTimeout(function () { scrollToId(section); }, 50);
  }

  /* ---------- boot ---------- */
  net(); render();
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0 && window.top === window) navigator.serviceWorker.register("sw.js").catch(function () {});
})();
