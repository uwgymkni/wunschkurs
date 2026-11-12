// Schlanke Anbindung an Supabase über die REST-Schnittstelle (ohne Zusatzbibliothek).
(function () {
  const C = window.WK_CONFIG;
  const REST = C.url + "/rest/v1/" + C.tabelle;

  function headers(token, extra) {
    const h = { apikey: C.key, "Content-Type": "application/json" };
    if (token) h.Authorization = "Bearer " + token;
    return Object.assign(h, extra || {});
  }

  async function check(res) {
    if (res.ok) return res;
    let msg = res.status + "";
    try { const j = await res.json(); msg = j.message || j.error_description || j.msg || JSON.stringify(j); } catch (e) {}
    const err = new Error(msg); err.status = res.status; throw err;
  }

  const api = {
    // Schüler:in reicht eine Karte ein (ohne Login)
    async einreichen({ klasse, titel, satz, karte }) {
      const res = await fetch(REST, {
        method: "POST",
        headers: headers(null, { Prefer: "return=minimal" }),
        body: JSON.stringify({ klasse, titel, satz, karte }),
      });
      await check(res);
    },

    // Galerie: freigegebene Karten (ohne Login)
    async freigegebene(klasse) {
      let q = "?select=id,erstellt,klasse,titel,satz,karte&status=in.(neu,frei)&order=erstellt.asc&limit=200";
      if (klasse) q += "&klasse=eq." + encodeURIComponent(klasse);
      const res = await fetch(REST + q, { headers: headers() });
      await check(res);
      return res.json();
    },

    // Lehrkraft: Anmeldung
    async anmelden(email, passwort) {
      const res = await fetch(C.url + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ email, password: passwort }),
      });
      await check(res);
      const j = await res.json();
      const s = { token: j.access_token, refresh: j.refresh_token, bis: Date.now() + (j.expires_in - 60) * 1000, email };
      try { sessionStorage.setItem("wk_session", JSON.stringify(s)); } catch (e) {}
      return s;
    },

    async sitzung() {
      let s = null;
      try { s = JSON.parse(sessionStorage.getItem("wk_session") || "null"); } catch (e) {}
      if (!s) return null;
      if (Date.now() < s.bis) return s;
      try {
        const res = await fetch(C.url + "/auth/v1/token?grant_type=refresh_token", {
          method: "POST", headers: headers(), body: JSON.stringify({ refresh_token: s.refresh }),
        });
        await check(res);
        const j = await res.json();
        s = { token: j.access_token, refresh: j.refresh_token, bis: Date.now() + (j.expires_in - 60) * 1000, email: s.email };
        sessionStorage.setItem("wk_session", JSON.stringify(s));
        return s;
      } catch (e) {
        sessionStorage.removeItem("wk_session");
        return null;
      }
    },

    abmelden() { try { sessionStorage.removeItem("wk_session"); } catch (e) {} },

    async alle(token, status, klasse) {
      let q = "?select=id,erstellt,klasse,titel,satz,karte,status&order=erstellt.desc&limit=500";
      if (status) q += "&status=eq." + status;
      if (klasse) q += "&klasse=eq." + encodeURIComponent(klasse);
      const res = await fetch(REST + q, { headers: headers(token) });
      await check(res);
      return res.json();
    },

    async klassen(token) {
      const res = await fetch(REST + "?select=klasse&limit=2000", { headers: headers(token) });
      await check(res);
      const rows = await res.json();
      return [...new Set(rows.map(r => r.klasse).filter(Boolean))].sort();
    },

    async status(token, ids, status) {
      const res = await fetch(REST + "?id=in.(" + ids.join(",") + ")", {
        method: "PATCH",
        headers: headers(token, { Prefer: "return=minimal" }),
        body: JSON.stringify({ status }),
      });
      await check(res);
    },

    async loeschen(token, ids) {
      const res = await fetch(REST + "?id=in.(" + ids.join(",") + ")", {
        method: "DELETE", headers: headers(token, { Prefer: "return=minimal" }),
      });
      await check(res);
    },
  };

  window.WK_API = api;
})();
