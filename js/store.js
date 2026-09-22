/* Shared state for the Khongchat prototype.
   Storage: localStorage (works offline, per device).
   Live sync: BroadcastChannel + storage events, so the dashboard and tourist
   pages update instantly when open in the same browser.
   To make sync work across phones, swap save/load of STATUS for Supabase
   realtime (see PROMPTS.md). */
(function () {
  var D = window.KC_DATA;
  var K = { status: "kc_status_v1", trip: "kc_trip_v1", stamps: "kc_stamps_v1" };
  var chan = ("BroadcastChannel" in window) ? new BroadcastChannel("khongchat") : null;
  var listeners = [];

  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function defaultStatus() {
    var s = {};
    var today = new Date();
    D.places.forEach(function (p) {
      s[p.id] = { state: "open", note: "", at: today.toISOString() };
    });
    s.takmu = { state: "advisory", note: "Weather dependent. Call before going.", at: today.toISOString() };
    s.imakeithel = { state: "advisory", note: "Closes 4 PM.", at: today.toISOString() };
    return s;
  }

  var KC = {
    data: D,
    placeById: function (id) { return D.places.filter(function (p) { return p.id === id; })[0]; },

    getStatus: function () {
      var s = read(K.status, null), def = defaultStatus(), changed = !s;
      s = s || {};
      // Places added after a device first saved status start with the default.
      Object.keys(def).forEach(function (id) { if (!s[id]) { s[id] = def[id]; changed = true; } });
      if (changed) write(K.status, s);
      return s;
    },
    setStatus: function (id, state, note) {
      var s = KC.getStatus();
      s[id] = { state: state, note: note || "", at: new Date().toISOString() };
      write(K.status, s);
      if (chan) chan.postMessage({ type: "status", id: id });
      emit({ type: "status", id: id });
    },
    resetStatus: function () { write(K.status, defaultStatus()); if (chan) chan.postMessage({ type: "status" }); emit({ type: "status" }); },

    getTrip: function () { return read(K.trip, null); },
    saveTrip: function (t) {
      write(K.trip, t);
      // Demand log for the dashboard chart (in production: a saved_trips table).
      var log = read("kc_triplog_v1", []);
      log.push({ stops: t.plan.reduce(function (a, d) { return a.concat(d.stops); }, []), at: t.created });
      write("kc_triplog_v1", log.slice(-200));
      if (chan) chan.postMessage({ type: "trip" });
    },
    tripLog: function () { return read("kc_triplog_v1", []); },

    getChecks: function () { return read("kc_ilp_v1", {}); },
    setCheck: function (i, v) { var c = read("kc_ilp_v1", {}); c[i] = v; write("kc_ilp_v1", c); },

    isStaff: function () { try { return sessionStorage.getItem("kc_staff") === "1"; } catch (e) { return false; } },
    setStaff: function (v) { try { v ? sessionStorage.setItem("kc_staff", "1") : sessionStorage.removeItem("kc_staff"); } catch (e) {} },

    getStamps: function () { return read(K.stamps, []); },
    addStamp: function (id) {
      var st = KC.getStamps();
      var isNew = st.indexOf(id) === -1;
      if (isNew) { st.push(id); write(K.stamps, st); }
      if (chan) chan.postMessage({ type: "stamp", id: id });
      return isNew;
    },
    resetStamps: function () { write(K.stamps, []); },

    onChange: function (fn) { listeners.push(fn); },

    /* Rule-based personalised planner.
       Scores each place by interest matches, gives each day one region
       (so travel time stays short), picks the best 3-4 stops per region.
       Longer trips add hill districts, then second days in regions with
       stops left over. */
    plan: function (interests, days) {
      var hills = D.hillRegions;
      function isHill(r) { return hills.indexOf(r) !== -1; }
      var scored = D.places.map(function (p) {
        var score = p.tags.filter(function (t) { return interests.indexOf(t) !== -1; }).length;
        return { p: p, score: score };
      }).filter(function (x) { return x.score > 0; });

      var byRegion = {};
      scored.forEach(function (x) { (byRegion[x.p.region] = byRegion[x.p.region] || []).push(x); });
      var regions = Object.keys(byRegion).map(function (r) {
        var list = byRegion[r].sort(function (a, b) { return b.score - a.score; });
        var total = list.slice(0, 4).reduce(function (n, x) { return n + x.score; }, 0);
        return { region: r, list: list, total: total };
      });
      // Hills need a full day of travel: only include them from day 3.
      if (days < 3) regions = regions.filter(function (r) { return !isHill(r.region); });
      // Imphal first (most visitors land there), then the strongest matches.
      regions.sort(function (a, b) { return (b.region === "imphal") - (a.region === "imphal") || b.total - a.total; });
      var picked = regions.slice(0, days);
      // Valley days first, hill days at the end of the trip.
      picked.sort(function (a, b) { return isHill(a.region) - isHill(b.region); });

      var out = [], CAP = 4;
      picked.forEach(function (r) { r.used = CAP; out.push({ region: r.region, stops: r.list.slice(0, CAP) }); });
      // Days still free: a second day where a region has stops left over.
      var more = true;
      while (out.length < days && more) {
        more = false;
        for (var i = 0; i < picked.length && out.length < days; i++) {
          var r = picked[i];
          if (r.list.length > r.used) {
            var at = out.map(function (d) { return d.region; }).lastIndexOf(r.region) + 1;
            out.splice(at, 0, { region: r.region, stops: r.list.slice(r.used, r.used + CAP) });
            r.used += CAP; more = true;
          }
        }
      }
      out = out.map(function (d, i) { return { day: i + 1, region: d.region, stops: d.stops.map(function (x) { return x.p.id; }) }; });
      return { interests: interests, days: days, plan: out, created: new Date().toISOString() };
    },

    relTime: function (iso) {
      var d = new Date(iso);
      var mins = Math.round((Date.now() - d.getTime()) / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return mins + " min ago";
      var h = d.getHours(), m = d.getMinutes();
      var ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
      return "today " + h + ":" + (m < 10 ? "0" : "") + m + " " + ap;
    },

    stateLabel: function (s) {
      return s === "open" ? "Open" : s === "advisory" ? "Advisory" : "Closed today";
    }
  };

  function emit(msg) { listeners.forEach(function (fn) { fn(msg); }); }
  if (chan) chan.onmessage = function (e) { emit(e.data); };
  window.addEventListener("storage", function (e) {
    if (e.key === K.status) emit({ type: "status" });
    if (e.key === K.stamps) emit({ type: "stamp" });
    if (e.key === "kc_triplog_v1") emit({ type: "trip" });
  });

  window.KC = KC;
})();
