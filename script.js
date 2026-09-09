const audio = document.getElementById("audio");
const volume = document.getElementById("volume");
const volText = document.getElementById("volText");
const musicToggle = document.getElementById("musicToggle");
const lyrics = document.getElementById("lyrics");
const scenes = [...document.querySelectorAll(".scene")];
let current = 1;
let started = false;
let twistTimer = null;

// Exact LRC timestamps supplied for this audio.
const lyricLines = [
  [22.68, "Yo, dari awal aku tahu, you're the one,"],
  [25.22, "Hati ini klik, kayak lagu yang pas di drum."],
  [27.72, "Cinta ini nyata, bukan cuma khayalan,"],
  [30.06, "Kamu dan aku, it's a perfect connection."],
  [32.59, "Cinta in my heart, you light up my soul,"],
  [35.17, "Tanpa dirimu, hidupku not whole."],
  [37.72, "We ride together, till the end of the road,"],
  [40.05, "Cinta in my heart, baby, you’re my goal."],
  [42.52, "Ku bawa cinta ini kaya flow di beat,"],
  [44.77, "Bukan sementara, this love is legit."],
  [46.97, "Kamu bintang terang di malam gelap,"],
  [49.34, "Aku janji setia, takkan pernah lepas."],
  [51.77, "Let’s build this dream, kita buat cerita,"],
  [54.28, "Dari nol ke atas, sampai jadi legenda."],
  [56.70, "You and me, babe, di setiap langkah,"],
  [59.20, "Cinta ini kuat, takkan pernah patah."],
  [62.31, "Cinta in my heart, you light up my soul,"],
  [64.81, "Tanpa dirimu, hidupku not whole."],
  [67.34, "We ride together, till the end of the road,"],
  [72.66, "Cinta in my heart, baby, you’re my girl."],
  [79.59, "Cinta in my heart, you light up my soul,"],
  [85.06, "Tanpa dirimu, hidupku not whole."],
  [89.55, "We ride together, till the end of the road,"],
  [94.41, "Cinta in my heart, baby, you’re my girl."],
  [161.77, "Yo, dari awal aku tahu, you're the one,"],
  [163.82, "Hati ini klik, kayak lagu yang pas di drum."],
  [166.59, "Cinta ini nyata, bukan cuma khayalan,"],
  [168.73, "Kamu dan aku, it's a perfect connection."],
  [171.14, "Cinta in my heart, you light up my soul,"],
  [173.65, "Tanpa dirimu, hidupku not whole."],
  [176.16, "We ride together, till the end of the road,"],
  [178.57, "Cinta in my heart, baby, you’re my goal."],
  [181.08, "Ku bawa cinta ini kaya flow di beat,"],
  [183.33, "Bukan sementara, this love is legit."],
  [185.55, "Kamu bintang terang di malam gelap,"],
  [187.85, "Aku janji setia, takkan pernah lepas."],
  [190.37, "Let’s build this dream, kita buat cerita,"],
  [192.85, "Dari nol ke atas, sampai jadi legenda."],
  [195.32, "You and me, babe, di setiap langkah,"],
  [197.70, "Cinta ini kuat, takkan pernah patah."],
  [200.79, "Cinta in my heart, you light up my soul,"],
  [203.40, "Tanpa dirimu, hidupku not whole."],
  [206.22, "We ride together, till the end of the road,"],
  [210.81, "Cinta in my heart, baby, you’re my girl."],
  [219.12, "Cinta in my heart, you light up my soul,"],
  [223.72, "Tanpa dirimu, hidupku not whole."],
  [228.61, "We ride together, till the end of the road,"],
  [233.92, "Cinta in my heart, baby, you’re my girl."]
];

function show(n) {
  const target = document.querySelector(`[data-scene="${n}"]`);
  if (!target) return;
  scenes.forEach(scene => scene.classList.remove("active"));
  target.classList.add("active");
  current = n;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Paste your Google Apps Script Web App URL here after deployment.
const CONFIG={endpoint:"https://script.google.com/macros/s/AKfycbyU8ALj3Nkm7ZVTf1EUe2cHEXbodJs_mxrzBpnfwO7BO4J61A-7G0LeW5ijZI5Qjyxtxg/exec"};
function getSessionId(){let id=localStorage.getItem("biya_session");if(!id){id=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random());localStorage.setItem("biya_session",id)}return id;}
function save(key,value){
  value = String(value ?? "").trim();
  // Never allow an empty answer to be submitted.
  if (!value) {
    toast("Isi jawaban dulu ya 🤍");
    return false;
  }

  localStorage.setItem("biya_"+key,value);
  if(CONFIG.endpoint){
    fetch(CONFIG.endpoint,{
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({key,value,sessionId:getSessionId(),timestamp:new Date().toISOString()}),
      mode:"no-cors"
    }).catch(()=>{});
  }
  toast(CONFIG.endpoint?"Jawaban terkirim 🤍":"Jawaban disimpan di perangkat 🤍");
  return true;
}

function toast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 1600);
}

async function startMusic() {
  audio.loop = false;
  audio.volume = Number(volume.value);
  try {
    await audio.play();
    started = true;
    musicToggle.textContent = "❚❚";
    syncLyrics();
  } catch (error) {
    // The click itself is a valid user gesture; if playback still fails,
    // keep the UI usable and let the music button retry.
    started = true;
    musicToggle.textContent = "▶";
  }
}

volume.addEventListener("input", () => {
  const value = Number(volume.value);
  audio.volume = value;
  volText.textContent = `${Math.round(value * 100)}%`;
  if (value === 0) musicToggle.textContent = "🔇";
  else if (audio.paused) musicToggle.textContent = "▶";
  else musicToggle.textContent = "❚❚";
});

musicToggle.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
      started = true;
      musicToggle.textContent = Number(volume.value) === 0 ? "🔇" : "❚❚";
    } catch (_) {
      musicToggle.textContent = "▶";
    }
  } else {
    audio.pause();
    musicToggle.textContent = "▶";
  }
});

function syncLyrics() {
  const t = audio.currentTime || 0;

  // Exact instrumental windows from the LRC.
  if (t < 22.68 || (t >= 101.83 && t < 161.77)) {
    lyrics.textContent = "Instrumen";
    lyrics.classList.remove("lyric-active");
    return;
  }

  // Final instrumental begins exactly at 04:00.43.
  if (t >= 240.43) {
    lyrics.textContent = "thank u cantik:)";
    lyrics.classList.add("lyric-active");
    return;
  }

  // Find the last lyric whose exact timestamp has been reached.
  let line = "Instrumen";
  for (let i = lyricLines.length - 1; i >= 0; i--) {
    if (t >= lyricLines[i][0]) {
      line = lyricLines[i][1];
      break;
    }
  }

  lyrics.textContent = line;
  lyrics.classList.toggle("lyric-active", line !== "Instrumen");
}

// timeupdate is supplemented by a short polling loop because browser audio
// timeupdate frequency varies between browsers and can otherwise make lyric
// changes feel late relative to the supplied timestamps.
audio.addEventListener("timeupdate", syncLyrics);
audio.addEventListener("seeking", syncLyrics);
audio.addEventListener("loadedmetadata", syncLyrics);
syncLyrics();
setInterval(syncLyrics, 50);

document.querySelector(".start")?.addEventListener("click", async () => {
  await startMusic();
  confetti();
  show(2);
});

document.querySelectorAll(".next").forEach(button => {
  button.addEventListener("click", () => show(current + 1));
});

document.querySelectorAll(".save-next").forEach(button => {
  button.addEventListener("click", () => {
    const card = button.closest(".card");
    const field = card?.querySelector("[data-key]");
    if (!field) return;

    const value = field.value.trim();
    if (!value) {
      toast("Isi jawaban dulu ya 🤍");
      field.focus();
      field.classList.add("input-error");
      setTimeout(() => field.classList.remove("input-error"), 700);
      return;
    }

    if (save(field.dataset.key, value)) show(current + 1);
  });
});

document.querySelectorAll(".save-choice").forEach(button => {
  button.addEventListener("click", () => {
    save(button.dataset.key, button.dataset.value);
    show(current + 1);
  });
});

document.querySelectorAll(".other-btn").forEach(button => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    target?.classList.add("show");
  });
});

document.querySelectorAll("textarea[data-key], input[data-key]").forEach(field => {
  try {
    const value = localStorage.getItem(`biya_${field.dataset.key}`);
    if (value !== null) field.value = value;
  } catch (_) {}
});

document.getElementById("finishBtn")?.addEventListener("click", () => {
  show(19);
  clearTimeout(twistTimer);
  twistTimer = setTimeout(() => {
    document.getElementById("twistBtn")?.classList.remove("hidden");
  }, 4000);
});

document.getElementById("twistBtn")?.addEventListener("click", () => show(20));

function confetti() {
  for (let i = 0; i < 65; i++) {
    const e = document.createElement("i");
    e.style.position = "fixed";
    e.style.left = `${Math.random() * 100}vw`;
    e.style.top = "-10px";
    e.style.width = "7px";
    e.style.height = "11px";
    e.style.borderRadius = "2px";
    e.style.background = ["#f3a9c0", "#d97f9e", "#f8d7e2", "#d8c5e8", "#fff"][Math.floor(Math.random() * 5)];
    e.style.zIndex = "100";
    e.style.transform = `rotate(${Math.random() * 360}deg)`;
    e.style.transition = `top ${2 + Math.random() * 2}s linear, transform ${2 + Math.random() * 2}s linear`;
    document.body.appendChild(e);
    requestAnimationFrame(() => {
      e.style.top = "110vh";
      e.style.transform += ` rotate(${360 + Math.random() * 720}deg)`;
    });
    setTimeout(() => e.remove(), 4500);
  }
}


audio.addEventListener("ended", () => {
  audio.pause();
  musicToggle.textContent = "▶";
  lyrics.textContent = "thank u cantik:)";
  lyrics.classList.add("lyric-active");
});
