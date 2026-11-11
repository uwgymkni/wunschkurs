// Bausteine, Looks und der gemeinsame Karten-Renderer (Baukasten, Galerie, Freigabe).
(function () {
  const BAUSTEINE = [
    { gruppe: "Wo?", items: [
      ["draussen", "trees", "Draußen"], ["labor", "flask-conical", "Im Labor"], ["werkstatt", "wrench", "In der Werkstatt"],
      ["buehne", "theater", "Auf der Bühne"], ["kueche", "chef-hat", "In der Küche"], ["stadt", "building-2", "Unterwegs"],
      ["online", "laptop", "Online"], ["halle", "volleyball", "In der Halle"], ["studio", "mic", "Im Studio"], ["wasser", "waves", "Am Wasser"],
    ]},
    { gruppe: "Mit wem?", items: [
      ["betrieb", "factory", "Mit einem Betrieb"], ["uni", "graduation-cap", "Mit einer Uni"], ["profis", "star", "Mit Profis"],
      ["partner", "globe", "Mit einer Partnerschule"], ["juengere", "smile", "Für Jüngere"], ["publikum", "users", "Für Publikum"],
    ]},
    { gruppe: "Was entsteht?", items: [
      ["film", "clapperboard", "Ein Film"], ["game", "gamepad-2", "Ein Game / eine App"], ["event", "party-popper", "Ein Event"],
      ["produkt", "package", "Ein echtes Produkt"], ["ausstellung", "frame", "Eine Ausstellung"], ["wettbewerb", "trophy", "Ein Wettbewerb"],
      ["reise", "plane", "Eine Reise"], ["podcast", "headphones", "Ein Podcast"], ["schein", "award", "Ein Zertifikat"], ["show", "mic-vocal", "Eine Show"],
    ]},
    { gruppe: "Wie?", items: [
      ["praxis", "hand", "Viel Praxis"], ["team", "handshake", "Im Team"], ["solo", "brain", "Eigenes Projekt"],
      ["experiment", "flask-round", "Ausprobieren"], ["challenge", "zap", "Challenges"], ["ruhig", "moon", "Ganz entspannt"],
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

  // Sticker im Aufkleber-Look: Icons und kurze Text-Sticker
  const STICKER = [
    ["rocket","#ff3d7f"],["flame","#ff7a1a"],["zap","#ffd23f"],["lightbulb","#ffd23f"],["target","#e23b4e"],["crown","#ffd23f"],
    ["trophy","#ffb000"],["gamepad-2","#7c5cff"],["guitar","#e23b4e"],["music","#2ea8ff"],["mic-vocal","#ff3d7f"],["camera","#14213d"],
    ["palette","#ff7a1a"],["dumbbell","#14213d"],["volleyball","#2ea8ff"],["bike","#00b39e"],["mountain","#00b39e"],["sailboat","#2ea8ff"],
    ["telescope","#7c5cff"],["orbit","#7c5cff"],["atom","#00d9c0"],["dna","#ff3d7f"],["microscope","#00b39e"],["cpu","#14213d"],
    ["bot","#2ea8ff"],["puzzle","#b6ff3d"],["dices","#e23b4e"],["gem","#00d9c0"],["sparkles","#ffd23f"],["heart","#ff3d7f"],
    ["paw-print","#ff7a1a"],["leaf","#3fbf5f"],["sprout","#3fbf5f"],["sun","#ffb000"],["pizza","#ff7a1a"],["ice-cream-cone","#ff9ec7"],
    ["coffee","#8b5a3c"],["plane","#2ea8ff"],["compass","#14213d"],["drama","#7c5cff"],["shirt","#ff3d7f"],["piggy-bank","#ff9ec7"],
  ].map(([n, c]) => ({ t: "i", n, c }));
  ["LEVEL UP", "NO LIMITS", "LET'S GO", "100 %", "MEIN DING", "NEU", "WOW", "NEXT LEVEL", "TOP SECRET", "JA!"].forEach((v, i) =>
    STICKER.push({ t: "t", v, c: FARBEN[i % FARBEN.length] }));

  function stickerHTML(s) {
    if (s.t === "t") return `<b class="stk-text" style="--sc:${s.c}">${esc(s.v)}</b>`;
    if (s.t === "i") return `<b class="stk-icon" style="--sc:${s.c}">${window.WK_ICON ? WK_ICON(s.n) : ""}</b>`;
    return esc(s.e || "");
  }

  // Einfacher Wortfilter (zusätzlich zur Freigabe durch Lehrkräfte)
  const SPERR_TEIL = ["fick","fuck","porn","wichs","hure","nutte","schlampe","penis","vagina","titten","sex","pussy","bitch","nigg","neger","kanake","fotze","schwuchtel","hurensohn","arschloch","onlyfans","nackt","nude","kokain","koks","kiffen","hitler","nazi","vergewalt","pimmel","schwanz","muschi","dildo","kondom","whore","slut","shit","scheiss","scheiß","kotz","töten","toeten","umbringen"];
  const SPERR_WORT = ["arsch","sau","spast","spasti","opfer","dick","cock","gay","schwul","behindi","huso","alk","saufen","bier","wodka","heil","drogen","gras","weed","joint","furz","kacke","pisse","lutscher"];
  function normal(t) {
    return String(t || "").toLowerCase().replace(/0/g,"o").replace(/1/g,"i").replace(/3/g,"e").replace(/4/g,"a").replace(/5/g,"s").replace(/7/g,"t").replace(/@/g,"a").replace(/\$/g,"s");
  }
  function pruefen(text) {
    const n = normal(text), kompakt = n.replace(/[^a-zäöüß]/g, "");
    if (SPERR_TEIL.some(w => kompakt.includes(w))) return true;
    const woerter = n.split(/[^a-zäöüß]+/);
    return SPERR_WORT.some(w => woerter.includes(w));
  }
  function kartePruefen(d) {
    const texte = [d.titel, d.untertitel, d.satz].concat((d.bausteine || []).filter(b => b && b.eigen).map(b => b.eigen));
    return texte.some(pruefen);
  }

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
      const info = typeof b === "string" ? B_INDEX[b] : (b && b.eigen ? { icon: "pencil", label: b.eigen } : null);
      if (!info) return "";
      return `<li class="wk-chip" data-i="${i}">${window.WK_ICON ? WK_ICON(info.icon) : ""}${esc(info.label)}</li>`;
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
        ${vid ? `<button class="wk-video" type="button" data-video="${vid}" style="background-image:url('https://img.youtube.com/vi/${vid}/hqdefault.jpg')"><span>${window.WK_ICON ? WK_ICON("play") : "▶"}</span></button>` : ""}
        ${d.satz ? `<blockquote class="wk-satz">${esc(d.satz)}</blockquote>` : (opts.platzhalter ? '<blockquote class="wk-satz leer">Der wichtigste Satz: Warum sollte man diesen Kurs wählen?</blockquote>' : "")}
        <footer class="wk-fuss"><span>BG/BRG Knittelfeld</span>${d.klasse ? `<span>${esc(d.klasse.toUpperCase())}</span>` : ""}</footer>
      </div>
      <div class="wk-sticker">${(d.sticker || []).map((s, i) =>
        `<span class="stk" data-i="${i}" style="left:${(s.x * 100).toFixed(2)}%;top:${(s.y * 100).toFixed(2)}%;--s:${s.s || 1};--r:${s.r || 0}deg">${stickerHTML(s)}</span>`).join("")}</div>
    `;
    return el;
  }

  window.WK_KARTE = { render, stickerHTML, pruefen, kartePruefen, BAUSTEINE, B_INDEX, THEMES, HINTERGRUENDE, FARBEN, WELTEN, STICKER, youtubeId, esc };
})();
