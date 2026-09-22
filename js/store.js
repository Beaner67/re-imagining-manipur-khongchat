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

    /* Trip shape: { days, plan: [{ day, stops: [placeId] }], created }.
       Older saves also had interests and plan[].region: keep the stops, drop the rest. */
    getTrip: function () {
      var t = read(K.trip, null);
      if (!t || !t.plan) return null;
      var days = Math.max(1, Math.min(14, Math.max(t.days || 0, t.plan.length)));
      var plan = [];
      for (var i = 0; i < days; i++) {
        var d = t.plan[i];
        plan.push({ day: i + 1, stops: d && d.stops ? d.stops.filter(function (id) { return KC.placeById(id); }) : [] });
      }
      return { days: days, plan: plan, created: t.created || new Date().toISOString() };
    },
    saveTrip: function (t) {
      write(K.trip, t);
      // Demand log for the dashboard chart (in production: a saved_trips table).
      // One entry per trip, replaced on each edit, so saving on every change does not inflate counts.
      var stops = t.plan.reduce(function (a, d) { return a.concat(d.stops); }, []);
      var log = read("kc_triplog_v1", []).filter(function (e) { return e.at !== t.created; });
      if (stops.length) log.push({ stops: stops, at: t.created });
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

    /* Area of a day: the most common region among its stops (ties go to the first added). */
    dayArea: function (stops) {
      if (!stops.length) return "";
      var n = {}, best = null;
      stops.forEach(function (id) { var r = KC.placeById(id).region; n[r] = (n[r] || 0) + 1; if (!best || n[r] > n[best]) best = r; });
      return (n[best] === stops.length ? "" : "Mostly ") + D.regions[best];
    },

    /* Widest pair of stops in a day, if more than 40 km apart: { a, b, km } where b was added later. */
    spread: function (stops) {
      var far = null;
      for (var i = 0; i < stops.length; i++) for (var j = i + 1; j < stops.length; j++) {
        var km = KC.distanceKm(KC.placeById(stops[i]), KC.placeById(stops[j]));
        if (km > 40 && (!far || km > far.km)) far = { a: stops[i], b: stops[j], km: km };
      }
      return far;
    },

    fmtKm: function (km) { return km < 1 ? "under 1 km" : Math.round(km) + " km"; },

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

  // Great-circle distance in km between two places (haversine).
  KC.distanceKm = function (a, b) {
    var R = 6371, toRad = function (d) { return d * Math.PI / 180; };
    var dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  window.KC = KC;
})();
