const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
let timers = [];

// ---------- revelar ao rolar ----------
const io = new IntersectionObserver((itens) => {
  itens.forEach((i) => { if (i.isIntersecting) { i.target.classList.add("visivel"); io.unobserve(i.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
function prepararRevelar() {
  document.querySelectorAll(".revelar").forEach((el) => {
    el.classList.remove("visivel");
    const naCapa = el.parentElement.closest(".cartao");
    el.style.transitionDelay = naCapa ? `${200 + [...naCapa.querySelectorAll(".revelar")].indexOf(el) * 110}ms` : "0ms";
    io.observe(el);
  });
}

// ---------- envelope (abre sozinho) ----------
const capa = document.getElementById("capa");
const ETAPAS = ["entrou", "abrindo", "tirando", "pousou", "final"];
const passo = (ms, fn) => timers.push(setTimeout(fn, semMovimento ? 0 : ms));
function liberar() {
  document.body.classList.remove("travado");
  prepararRevelar();
  // garantia: depois do fade, todos os textos da carta ficam visíveis de vez
  timers.push(setTimeout(() => capa.classList.add("texto-ok"), 2000));
}
function abrir() {
  timers.forEach(clearTimeout); timers = [];
  passo(100, () => capa.classList.add("entrou"));     // envelope chega perto da tela
  passo(1500, () => capa.classList.add("abrindo"));   // selo some, aba abre
  passo(2900, () => capa.classList.add("tirando"));   // a carta começa a sair
  passo(3900, () => capa.classList.add("pousou"));    // envelope desce, carta vem para a frente
  // o texto só aparece quando a carta parou de vez (sem tremor)
  passo(5900, () => { capa.classList.add("final"); liberar(); });
}
async function quandoPronto() {
  const imgs = ["img/carta.webp", "img/selo.webp", "img/papel.webp"].map((src) => {
    const i = new Image(); i.src = src; return i.decode().catch(() => {});
  });
  await Promise.race([Promise.all([document.fonts?.ready, ...imgs]), new Promise((r) => setTimeout(r, 3000))]);
  abrir();
}
function pular() {
  timers.forEach(clearTimeout); timers = [];
  capa.classList.add("sem-transicao", ...ETAPAS.slice(0, 4));
  void capa.offsetWidth;
  capa.classList.remove("sem-transicao");
  capa.classList.add("final");
  liberar();
}
function rever() {
  timers.forEach(clearTimeout); timers = [];
  document.documentElement.style.scrollBehavior = "auto";
  scrollTo(0, 0);
  document.documentElement.style.scrollBehavior = "";
  document.body.classList.add("travado");
  capa.classList.add("sem-transicao");
  capa.classList.remove(...ETAPAS, "texto-ok");
  void capa.offsetWidth;
  capa.classList.remove("sem-transicao");
  abrir();
}
document.getElementById("pular").addEventListener("click", pular);
document.getElementById("rever").addEventListener("click", rever);
quandoPronto();

// ---------- contagem regressiva ----------
const alvo = new Date("2026-12-05T10:00:00-03:00").getTime();
const campos = Object.fromEntries([...document.querySelectorAll("#relogio b")].map((b) => [b.dataset.u, b]));
const dois = (n) => String(n).padStart(2, "0");
function tique() {
  const falta = alvo - Date.now();
  if (falta <= 0) {
    document.getElementById("relogio").hidden = true;
    document.querySelector(".relogio-fim").hidden = false;
    return;
  }
  const s = Math.floor(falta / 1000);
  campos.d.textContent = dois(Math.floor(s / 86400));
  campos.h.textContent = dois(Math.floor(s / 3600) % 24);
  campos.m.textContent = dois(Math.floor(s / 60) % 60);
  campos.s.textContent = dois(s % 60);
  setTimeout(tique, 1000);
}
tique();

// ---------- salvar na agenda (.ics) ----------
document.getElementById("agenda").addEventListener("click", () => {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Convite Eduardo//PT-BR", "BEGIN:VEVENT",
    "UID:eduardo-primeira-comunhao-20261205", "DTSTAMP:20261110T000000Z",
    "DTSTART:20261205T130000Z", "DTEND:20261205T190000Z",
    "SUMMARY:Primeira Comunhão de Eduardo",
    "LOCATION:Igreja Nossa Senhora de Fátima",
    "DESCRIPTION:Cerimônia às 10h na Igreja Nossa Senhora de Fátima.\\nRecepção às 12h na Av. Boa Viagem\\, 2554.",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "primeira-comunhao-eduardo.ics" });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});
