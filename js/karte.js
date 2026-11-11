// Bausteine, Looks und der gemeinsame Karten-Renderer (Baukasten, Galerie, Freigabe).
(function () {
  const BAUSTEINE = [
    { gruppe: "Wo?", items: [
      ["draussen", "🌲", "Draußen"], ["labor", "🧪", "Im Labor"], ["werkstatt", "🛠️", "In der Werkstatt"],
      ["buehne", "🎭", "Auf der Bühne"], ["kueche", "🍳", "In der Küche"], ["stadt", "🏙️", "Unterwegs"],
      ["online", "💻", "Online"], ["halle", "🏐", "In der Halle"], ["studio", "🎙️", "Im Studio"], ["wasser", "🌊", "Am Wasser"],
    ]},
    { gruppe: "Mit wem?", items: [
      ["betrieb", "🏭", "Mit einem Betrieb"], ["uni", "🎓", "Mit einer Uni"], ["profis", "⭐", "Mit Profis"],
      ["partner", "🌍", "Mit einer Partnerschule"], ["juengere", "🧒", "Für Jüngere"], ["publikum", "👥", "Für Publikum"],
    ]},
    { gruppe: "Was entsteht?", items: [
      ["film", "🎬", "Ein Film"], ["game", "🎮", "Ein Game / eine App"], ["event", "🎉", "Ein Event"],
      ["produkt", "📦", "Ein echtes Produkt"], ["ausstellung", "🖼️", "Eine Ausstellung"], ["wettbewerb", "🏆", "Ein Wettbewerb"],
      ["reise", "✈️", "Eine Reise"], ["podcast", "🎧", "Ein Podcast"], ["schein", "📜", "Ein Zertifikat"], ["show", "🎤", "Eine Show"],
    ]},
    { gruppe: "Wie?", items: [
      ["praxis", "✋", "Viel Praxis"], ["team", "🤝", "Im Team"], ["solo", "🧠", "Eigenes Projekt"],
      ["experiment", "💥", "Ausprobieren"], ["challenge", "⚡", "Challenges"], ["ruhig", "🌙", "Ganz entspannt"],
    ]},
  ];
  const B_INDEX = {};
  BAUSTEINE.forEach(g => g.items.forEach(([id, icon, label]) => { B_INDEX[id] = { icon, label }; }));

  const THEMES = [
    { id: "neon", name: "Neon" },
    { id: "magazin", name: "Magazin" },
    { id: "retro", name: "Retro-Game" },
    { id: "poster", name: "Poster" },
    { id: "minimal", name: "Clean" },
  ];

  const HINTERGRUENDE = [
    { id: "aurora", name: "Polarlicht" },
    { id: "grid", name: "Synthwave" },
    { id: "sterne", name: "Weltall" },
    { id: "wellen", name: "Wellen" },
    { id: "blasen", name: "Blasen" },
    { id: "verlauf", name: "Farbfluss" },
    { id: "streifen", name: "Speed" },
    { id: "ruhe", name: "Ruhig" },
  ];

  const FARBEN = ["#ff3d7f", "#00d9c0", "#ffd23f", "#7c5cff", "#ff7a1a", "#2ea8ff", "#b6ff3d", "#e23b4e"];

  const WELTEN = [
    { id: "forum", name: "Forum" }, { id: "arena", name: "Arena" }, { id: "studio", name: "Studio" },
    { id: "labor", name: "Labor" }, { id: "freiraum", name: "Freiraum" },
  ];

  const STICKER = ["🚀","🔥","⚡","💡","🎯","🌈","🧬","🤖","🎸","⚽","🏔️","🛸","🦖","🐙","🍕","🌍","🎨","📸","🧩","💎","👾","🌋","🏄","🧪","🎲","🦄","☕","🛹","🌵","🪐","❤️","✨"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function youtubeId(url) {
    if (!url) return null;
    const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/))([\w-]{11})/);
    return m ? m[1] : (/^[\w-]{11}$/.test(url) ? url : null);
  }

  function hintergrundHTML(id) {
    switch (id) {
      case "aurora": return '<i class="b1"></i><i class="b2"></i><i class="b3"></i>';
      case "grid": return '<i class="sonne"></i><i class="boden"></i>';
      case "sterne": return '<i class="s1"></i><i class="s2"></i><i class="s3"></i>';
      case "wellen": return '<i class="w1"></i><i class="w2"></i><i class="w3"></i>';
      case "blasen": return Array.from({ length: 9 }, (_, i) => `<i class="bl" style="--i:${i}"></i>`).join("");
      case "streifen": return '<i class="st"></i>';
      default: return "";
    }
  }

  // data: { titel, untertitel, satz, theme, bg, farbe, welt, bausteine:[id|{eigen}], sticker:[{e,x,y,s,r}], bild, video, klasse }
  function render(data, opts) {
    opts = opts || {};
    const d = Object.assign({ theme: "neon", bg: "aurora", farbe: FARBEN[0], bausteine: [], sticker: [] }, data || {});
    const el = document.createElement("article");
    el.className = `wk-karte theme-${d.theme} bg-${d.bg}` + (d.bild ? " hat-bild" : "") + (opts.still ? " still" : "");
    el.style.setProperty("--akzent", d.farbe);
    const n = (d.titel || "").length, laengstes = Math.max(0, ...String(d.titel || "").split(/\s+/).map(w => w.length));
    let tf = n <= 14 ? 1 : n <= 22 ? .84 : n <= 32 ? .7 : n <= 45 ? .58 : .5;
    if (laengstes > 9) tf = Math.min(tf, 9 / laengstes * 1.05);
    if (d.theme === "poster" && n > 14) tf *= .85;
    el.style.setProperty("--tf", tf.toFixed(3));
    const welt = WELTEN.find(w => w.id === d.welt);
    const chips = (d.bausteine || []).map((b, i) => {
      const info = typeof b === "string" ? B_INDEX[b] : (b && b.eigen ? { icon: "✏️", label: b.eigen } : null);
      if (!info) return "";
      return `<li class="wk-chip" data-i="${i}"><span>${esc(info.icon)}</span>${esc(info.label)}</li>`;
    }).join("");
    const vid = youtubeId(d.video);
    el.innerHTML = `
      <div class="wk-bg">${hintergrundHTML(d.bg)}</div>
      ${d.bild ? `<div class="wk-foto" style="background-image:url('${d.bild.replace(/'/g, "%27")}')"></div>` : ""}
      <div class="wk-scrim"></div>
      <div class="wk-inhalt">
        <header class="wk-kopf">
          <span class="wk-label">Wunschkurs</span>
          ${welt ? `<span class="wk-welt">${esc(welt.name)}</span>` : ""}
        </header>
        <h2 class="wk-titel">${esc(d.titel || (opts.platzhalter ? "Dein Kurstitel" : ""))}</h2>
        ${d.untertitel ? `<p class="wk-unter">${esc(d.untertitel)}</p>` : ""}
        <ul class="wk-chips">${chips || (opts.platzhalter ? '<li class="wk-chip leer">Bausteine hierher ziehen</li>' : "")}</ul>
        ${vid ? `<button class="wk-video" type="button" data-video="${vid}" style="background-image:url('https://img.youtube.com/vi/${vid}/hqdefault.jpg')"><span>▶</span></button>` : ""}
        ${d.satz ? `<blockquote class="wk-satz">${esc(d.satz)}</blockquote>` : (opts.platzhalter ? '<blockquote class="wk-satz leer">Der wichtigste Satz: Warum sollte man diesen Kurs wählen?</blockquote>' : "")}
        <footer class="wk-fuss"><span>BG/BRG Knittelfeld</span>${d.klasse ? `<span>${esc(d.klasse.toUpperCase())}</span>` : ""}</footer>
      </div>
      <div class="wk-sticker">${(d.sticker || []).map((s, i) =>
        `<span class="stk" data-i="${i}" style="left:${(s.x * 100).toFixed(2)}%;top:${(s.y * 100).toFixed(2)}%;--s:${s.s || 1};--r:${s.r || 0}deg">${esc(s.e)}</span>`).join("")}</div>
    `;
    return el;
  }

  window.WK_KARTE = { render, BAUSTEINE, B_INDEX, THEMES, HINTERGRUENDE, FARBEN, WELTEN, STICKER, youtubeId, esc };
})();
