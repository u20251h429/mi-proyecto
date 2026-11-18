// Datos iniciales de reportes
const realtimeReports = [
  { id: "SP-2041", detail: "Ciberacoso por mensajería", time: "hace 2 min", priority: "Alta", featured: true },
  { id: "SP-2040", detail: "Difusión de imágenes", time: "hace 18 min", priority: "Alta", featured: false },
  { id: "SP-2039", detail: "Exclusión en grupos", time: "hace 1 h", priority: "Media", featured: false },
  { id: "SP-2038", detail: "Insultos en redes", time: "hace 3 h", priority: "Baja", featured: false }
];

const inboxReports = [
  { id: "SP-2041", type: "Ciberacoso por mensajería", severity: "Alta", received: "hace 2 min", status: "Pendiente", tag: "Atención Emocional" },
  { id: "SP-2040", type: "Difusión de imágenes", severity: "Alta", received: "hace 18 min", status: "Pendiente", tag: "Posible reincidente" },
  { id: "SP-2039", type: "Exclusión en grupos", severity: "Media", received: "hace 1 h", status: "Pendiente", tag: "" },
  { id: "SP-2038", type: "Insultos en redes", severity: "Baja", received: "hace 3 h", status: "En revisión", tag: "" },
  { id: "SP-2037", type: "Suplantación de identidad", severity: "Media", received: "ayer", status: "En revisión", tag: "" },
  { id: "SP-2036", type: "Amenazas por chat", severity: "Alta", received: "ayer", status: "En revisión", tag: "" }
];

// Notificación flotante
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.add("hidden"), 2500);
}

// Renderizar alertas en Panel General
function renderRealtime(filter = "") {
  const container = document.getElementById("realtime-list");
  if (!container) return;

  const q = filter.trim().toLowerCase();
  const filtered = realtimeReports.filter(
    (r) => !q || r.id.toLowerCase().includes(q) || r.detail.toLowerCase().includes(q)
  );

  container.innerHTML = filtered.map((r) => `
    <article class="report-item ${r.featured ? "featured" : ""}">
      <div>
        <p><strong>Reporte #${r.id}</strong> · Anónimo</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 2px;">${r.detail} · ${r.time}</p>
        <div class="tags-row">
          <span class="tag tag-${r.priority.toLowerCase()}">${r.priority}</span>
          ${r.featured ? '<span class="tag tag-emotional">♥ Atención Emocional</span>' : ""}
        </div>
      </div>
      <button class="btn-outline" onclick="switchView('tickets')">Revisar →</button>
    </article>
  `).join("");
}

// Renderizar tabla del Buzón de Alertas
let currentTab = "main";
function renderInbox() {
  const tbody = document.getElementById("inbox-tbody");
  const empty = document.getElementById("inbox-empty");
  if (!tbody) return;

  if (currentTab === "spam") {
    tbody.innerHTML = "";
    empty.textContent = "No hay reportes en Posible Spam.";
    empty.classList.remove("hidden");
    return;
  }

  const sev = document.getElementById("filter-severity")?.value || "Todas";
  const typ = document.getElementById("filter-type")?.value || "Todas";
  const search = (document.getElementById("inbox-search")?.value || "").trim().toLowerCase();

  const list = inboxReports.filter((r) =>
    (sev === "Todas" || r.severity === sev) &&
    (typ === "Todas" || r.type === typ) &&
    (!search || r.id.toLowerCase().includes(search) || r.type.toLowerCase().includes(search))
  );

  if (list.length === 0) {
    tbody.innerHTML = "";
    empty.textContent = "No se encontraron reportes con esos filtros.";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  tbody.innerHTML = list.map((r) => `
    <tr>
      <td><input type="checkbox" aria-label="Seleccionar ${r.id}" /></td>
      <td><strong>#${r.id}</strong></td>
      <td>Anónimo</td>
      <td>${r.type}</td>
      <td><span class="tag tag-${r.severity.toLowerCase()}">${r.severity}</span></td>
      <td>${r.received}</td>
      <td>${r.status}</td>
      <td><button class="link-btn" onclick="switchView('tickets')">Abrir ›</button></td>
    </tr>
  `).join("");
}

// Cambio de vistas en la versión Web
function switchView(viewName) {
  const titles = {
    dashboard: "Panel general del clima escolar",
    inbox: "Buzón de alertas anonimizadas",
    tickets: "Gestión de tickets"
  };

  document.querySelectorAll(".view-section").forEach((sec) => sec.classList.add("hidden"));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-btn[data-view]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  const titleEl = document.getElementById("page-title");
  if (titleEl && titles[viewName]) titleEl.textContent = titles[viewName];

  document.getElementById("sidebar")?.classList.remove("open");
}

// Inicialización general
document.addEventListener("DOMContentLoaded", () => {
  renderRealtime();
  renderInbox();

  // Navegación lateral
  document.querySelectorAll(".nav-btn[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  document.querySelectorAll("[data-switch]").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.switch));
  });

  document.querySelectorAll("[data-notice]").forEach((btn) => {
    btn.addEventListener("click", () => showToast(btn.dataset.notice));
  });

  // Menú móvil
  document.getElementById("menu-toggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("open");
  });

  // Buscadores y filtros
  document.getElementById("global-search")?.addEventListener("input", (e) => {
    renderRealtime(e.target.value);
  });

  ["filter-severity", "filter-type", "inbox-search"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderInbox);
    document.getElementById(id)?.addEventListener("change", renderInbox);
  });

  // Pestañas del buzón
  document.querySelectorAll(".tab-btn").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.dataset.tab;
      renderInbox();
    });
  });

  // Chat y estado del ticket
  document.getElementById("chat-send")?.addEventListener("click", () => {
    const input = document.getElementById("chat-input");
    const box = document.getElementById("chat-messages");
    if (!input || !input.value.trim()) return;
    const msg = document.createElement("div");
    msg.className = "msg outgoing";
    msg.textContent = input.value.trim();
    box.appendChild(msg);
    input.value = "";
    showToast("Mensaje enviado de forma segura");
  });

  document.getElementById("ticket-status")?.addEventListener("change", (e) => {
    const log = document.getElementById("audit-log");
    const li = document.createElement("li");
    li.innerHTML = `<strong>Ahora</strong> · Estado cambiado a "${e.target.value}"`;
    log?.prepend(li);
    showToast(`Estado actualizado a "${e.target.value}"`);
  });

  // Lógica de la App Móvil (pages/movil.html)
  document.querySelectorAll("[data-mob]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.mob;
      document.querySelectorAll(".phone-screen").forEach((s) => s.classList.add("hidden"));
      document.getElementById(`mob-${target}`)?.classList.remove("hidden");
    });
  });

  document.getElementById("sos-btn")?.addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("active");
  });

  // Temporizador de respiración guiada
  let remaining = 42;
  let paused = false;
  setInterval(() => {
    const timerEl = document.getElementById("breath-timer");
    if (!timerEl || paused || remaining <= 0) return;
    remaining--;
    const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
    const secs = String(remaining % 60).padStart(2, "0");
    timerEl.textContent = `${mins}:${secs}`;
    const bar = document.getElementById("breath-bar");
    if (bar) bar.style.width = `${Math.min(100, (remaining / 60) * 100)}%`;

    const cycle = remaining % 12;
    const phase = cycle > 8 ? "Inhala" : cycle > 4 ? "Sostén" : "Exhala";
    const phaseEl = document.getElementById("breath-phase");
    if (phaseEl) phaseEl.textContent = remaining === 0 ? "Listo" : phase;
  }, 1000);

  document.getElementById("toggle-pause")?.addEventListener("click", (e) => {
    paused = !paused;
    e.target.textContent = paused ? "Continuar" : "Pausar";
  });

  document.getElementById("add-minute")?.addEventListener("click", () => {
    remaining += 60;
  });

  // Envío de reporte anónimo móvil
  document.getElementById("send-report-btn")?.addEventListener("click", () => {
    const desc = document.getElementById("rep-desc");
    const err = document.getElementById("rep-error");
    if (!desc || !desc.value.trim()) {
      err?.classList.remove("hidden");
      return;
    }
    err?.classList.add("hidden");
    document.querySelectorAll(".phone-screen").forEach((s) => s.classList.add("hidden"));
    document.getElementById("mob-sent")?.classList.remove("hidden");
  });

  document.getElementById("copy-code-btn")?.addEventListener("click", (e) => {
    navigator.clipboard?.writeText("SP-7K4Q-92");
    e.target.textContent = "Código copiado ✓";
  });
});
// ================= LÓGICA APP APODERADO =================
  let currentGScreen = "registration";
  let gLinkSeconds = 600;
  let gLinked = false;
  let gPin = "";
  let gMapZoom = 1;

  function setGuardianScreen(screen) {
    currentGScreen = screen;
    document.querySelectorAll(".g-screen").forEach((el) => el.classList.add("hidden"));
    document.getElementById(`g-${screen}`)?.classList.remove("hidden");

    const nav = document.getElementById("g-bottom-nav");
    const backIcon = document.getElementById("g-back-icon");
    if (nav) {
      if (screen === "registration" || screen === "link") nav.classList.add("hidden");
      else nav.classList.remove("hidden");
    }
    if (backIcon) {
      backIcon.textContent = screen === "registration" ? "close" : "arrow_back";
    }

    document.querySelectorAll(".g-nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.gscreen === screen || (screen === "incidents" && btn.dataset.gscreen === "pin"));
    });
  }

  document.querySelectorAll("[data-gscreen]").forEach((btn) => {
    btn.addEventListener("click", () => setGuardianScreen(btn.dataset.gscreen));
  });

  document.getElementById("g-back-btn")?.addEventListener("click", () => {
    if (currentGScreen === "registration") window.location.href = "../index.html";
    else if (currentGScreen === "link") setGuardianScreen("registration");
    else setGuardianScreen("summary");
  });

  // Temporizador código de vinculación
  setInterval(() => {
    const timerEl = document.getElementById("g-link-timer");
    if (!timerEl || currentGScreen !== "link" || gLinked || gLinkSeconds <= 0) return;
    gLinkSeconds--;
    const m = Math.floor(gLinkSeconds / 60);
    const s = String(gLinkSeconds % 60).padStart(2, "0");
    timerEl.textContent = `${m}:${s}`;
  }, 1000);

  document.getElementById("g-regen-code")?.addEventListener("click", () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const boxes = document.querySelectorAll("#g-code-boxes span");
    boxes.forEach((box) => {
      box.textContent = chars[Math.floor(Math.random() * chars.length)];
    });
    gLinkSeconds = 600;
    showToast("Nuevo código generado");
  });

  document.getElementById("g-sim-accept")?.addEventListener("click", () => {
    gLinked = true;
    document.getElementById("g-link-pending")?.classList.add("hidden");
    document.getElementById("g-link-success")?.classList.remove("hidden");
  });

  document.getElementById("g-unlink-btn")?.addEventListener("click", () => {
    gLinked = false;
    gLinkSeconds = 600;
    document.getElementById("g-link-success")?.classList.add("hidden");
    document.getElementById("g-link-pending")?.classList.remove("hidden");
  });

  // Switch descanso nocturno
  document.getElementById("g-night-switch")?.addEventListener("change", (e) => {
    const st = document.getElementById("g-night-status");
    if (st) st.textContent = e.target.checked ? "✓ Programación activa para todos los días" : "⏸ Programación pausada";
  });

  // Zoom mapa SOS
  document.getElementById("g-zoom-in")?.addEventListener("click", () => {
    gMapZoom = Math.min(1.35, gMapZoom + 0.1);
    const canvas = document.getElementById("g-map-canvas");
    if (canvas) canvas.style.transform = `scale(${gMapZoom})`;
  });

  document.getElementById("g-zoom-out")?.addEventListener("click", () => {
    gMapZoom = Math.max(0.9, gMapZoom - 0.1);
    const canvas = document.getElementById("g-map-canvas");
    if (canvas) canvas.style.transform = `scale(${gMapZoom})`;
  });

  document.getElementById("g-pin-marker")?.addEventListener("click", () => {
    document.getElementById("g-map-tooltip")?.classList.toggle("hidden");
  });

  // Teclado PIN (1234)
  function updatePinDots() {
    document.querySelectorAll("#g-pin-dots span").forEach((dot, i) => {
      dot.classList.toggle("filled", i < gPin.length);
    });
  }

  document.querySelectorAll("[data-digit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (gPin.length >= 4) return;
      gPin += btn.dataset.digit;
      updatePinDots();
      const err = document.getElementById("g-pin-error");
      if (err) err.textContent = "";
      if (gPin.length === 4) {
        setTimeout(() => {
          if (gPin === "1234") {
            gPin = "";
            updatePinDots();
            setGuardianScreen("incidents");
          } else {
            if (err) err.textContent = "PIN incorrecto. Prueba con 1234.";
            gPin = "";
            updatePinDots();
          }
        }, 180);
      }
    });
  });

  document.getElementById("g-del-btn")?.addEventListener("click", () => {
    gPin = gPin.slice(0, -1);
    updatePinDots();
  });

  document.getElementById("g-bio-btn")?.addEventListener("click", () => setGuardianScreen("incidents"));

  // Pestañas Historial / Actas y Firma digital
  document.querySelectorAll(".g-seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".g-seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("g-tab-history")?.classList.toggle("hidden", btn.dataset.gtab !== "history");
      document.getElementById("g-tab-agreements")?.classList.toggle("hidden", btn.dataset.gtab !== "agreements");
    });
  });

  document.getElementById("g-sign-btn")?.addEventListener("click", (e) => {
    e.currentTarget.textContent = "🔒 Acta firmada y bloqueada";
    e.currentTarget.style.background = "#059669";
    showToast("Acta firmada digitalmente");
  });

  // Chat con el tutor
  document.getElementById("g-chat-send")?.addEventListener("click", () => {
    const input = document.getElementById("g-chat-input");
    const feed = document.getElementById("g-chat-feed");
    if (!input || !input.value.trim()) return;
    const div = document.createElement("div");
    div.className = "g-bubble me";
    div.textContent = input.value.trim();
    feed?.appendChild(div);
    input.value = "";
    showToast("Mensaje enviado al tutor");
  });