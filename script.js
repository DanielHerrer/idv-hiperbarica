/* ============================================================
   Hyper - Instituto de la Visión
   Lógica de interfaz:
     1. Navegación mobile (hamburguesa)
     2. Loader del post de Instagram
     3. Ticker de novedades
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Web cargada ✅");

  initNav();
  initInstagramLoader();
  initWhatsApp();
  initReveal();
  document.querySelectorAll(".ticker").forEach((t) => initTicker(t));
});

/* ------------------------------------------------------------
   0. Reveal al hacer scroll
   Aparición suave y escalonada de bloques. Respeta a quien
   prefiere menos movimiento y funciona aun sin IntersectionObserver.
   ------------------------------------------------------------ */
function initReveal() {
  const selectores = [
    ".info-home > *",
    ".title-vitality",
    ".card",
    ".ig-embed",
    ".info-card",
    ".head-recharge > *",
    ".recharde-div",
    ".head-performance > *",
    ".li-performance",
    ".img-performance",
  ];
  const elementos = document.querySelectorAll(selectores.join(","));
  if (!elementos.length) return;

  const sinMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Sin IntersectionObserver o con movimiento reducido: se muestra todo ya
  if (sinMovimiento || !("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("reveal", "is-visible"));
    return;
  }

  const obs = new IntersectionObserver(
    (entradas, observer) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const el = entrada.target;
        // Escalonado según posición dentro de su grupo
        const hermanos = Array.from(el.parentElement.children).filter((n) =>
          n.classList.contains("reveal")
        );
        const i = Math.max(0, hermanos.indexOf(el));
        el.style.transitionDelay = `${Math.min(i * 90, 360)}ms`;
        el.classList.add("is-visible");
        observer.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  elementos.forEach((el) => {
    el.classList.add("reveal");
    obs.observe(el);
  });
}

/* ------------------------------------------------------------
   1. Navegación mobile
   ------------------------------------------------------------ */
function initNav() {
  const nav = document.querySelector(".nav");
  const toggle = nav?.querySelector(".nav-toggle");
  if (!nav || !toggle) return;

  const setEstado = (abierto) => {
    nav.classList.toggle("abierto", abierto);
    toggle.setAttribute("aria-expanded", String(abierto));
    toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  };

  // Abrir / cerrar con el botón
  toggle.addEventListener("click", () =>
    setEstado(!nav.classList.contains("abierto"))
  );

  // Cerrar al tocar un link del menú
  nav.querySelectorAll(".nav-menu a").forEach((a) =>
    a.addEventListener("click", () => setEstado(false))
  );

  // Cerrar al tocar fuera del nav
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) setEstado(false);
  });

  // Cerrar con la tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setEstado(false);
  });
}

/* ------------------------------------------------------------
   2. Loader del post de Instagram
   Oculta la pantalla de carga cuando el embed inserta su iframe.
   ------------------------------------------------------------ */
function initInstagramLoader() {
  document.querySelectorAll(".ig-embed").forEach((wrap) => {
    const loader = wrap.querySelector(".ig-loader");
    if (!loader) return;

    const ocultar = () => loader.classList.add("oculto");

    // Vigilo el contenedor: cuando Instagram inserta su <iframe>, oculto la carga
    const obs = new MutationObserver(() => {
      const iframe = wrap.querySelector("iframe");
      if (!iframe) return;
      iframe.addEventListener("load", ocultar, { once: true });
      obs.disconnect();
    });
    obs.observe(wrap, { childList: true, subtree: true });

    // Red de seguridad por si el evento "load" nunca dispara
    setTimeout(ocultar, 6000);
  });
}

/* ------------------------------------------------------------
   3. Widget flotante de WhatsApp
   Abre / cierra el popup de chat.
   ------------------------------------------------------------ */
function initWhatsApp() {
  const widget = document.querySelector(".wa-widget");
  if (!widget) return;

  const fab = widget.querySelector(".wa-fab");
  const closeBtn = widget.querySelector(".wa-popup-close");
  const popup = widget.querySelector(".wa-popup");

  const setEstado = (abierto) => {
    widget.classList.toggle("abierto", abierto);
    fab?.setAttribute("aria-expanded", String(abierto));
    popup?.setAttribute("aria-hidden", String(!abierto));
  };

  fab?.addEventListener("click", () => setEstado(true));
  closeBtn?.addEventListener("click", () => setEstado(false));

  // Cerrar con la tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setEstado(false);
  });
}

/* ------------------------------------------------------------
   4. Ticker de novedades
   speed = píxeles por segundo
   ------------------------------------------------------------ */
function initTicker(ticker, speed = 70) {
  const track = ticker.querySelector(".ticker-track");
  if (!track) return;

  const contenido = track.innerHTML; // patrón que se repite
  let rafId = null;
  let paused = false;

  const crearGrupo = () => {
    const g = document.createElement("div");
    g.style.display = "flex";
    g.style.flexShrink = "0"; // que no se comprima
    g.innerHTML = contenido;
    return g;
  };

  function setup() {
    if (rafId) cancelAnimationFrame(rafId);
    track.innerHTML = "";

    // Necesito al menos dos grupos para medir la distancia real entre repeticiones
    const g1 = crearGrupo();
    const g2 = crearGrupo();
    track.append(g1, g2);

    // Distancia real entre el inicio de un grupo y el siguiente
    // (incluye gap, márgenes, espacios... lo que sea)
    const periodo =
      g2.getBoundingClientRect().left - g1.getBoundingClientRect().left;

    // Agrego grupos hasta cubrir la pantalla + un periodo extra
    while (track.scrollWidth < ticker.offsetWidth + periodo) {
      track.appendChild(crearGrupo());
    }

    let offset = 0;
    let last = null;

    const step = (t) => {
      if (last === null) last = t;
      const dt = (t - last) / 1000;
      last = t; // se actualiza siempre -> al reanudar no hay salto
      if (!paused) {
        offset -= speed * dt;
        if (offset <= -periodo) offset += periodo; // reinicio exacto, sin salto
        track.style.transform = `translateX(${offset}px)`;
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }

  // Pausa al pasar el mouse
  ticker.addEventListener("mouseenter", () => (paused = true));
  ticker.addEventListener("mouseleave", () => (paused = false));

  // Pausa cuando la pestaña no está visible (ahorra CPU)
  document.addEventListener("visibilitychange", () => {
    paused = document.hidden;
  });

  // Re-mide si cambia el tamaño de la ventana (con debounce)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 200);
  });

  // Espero a que las fuentes carguen antes de medir
  if (document.fonts?.ready) {
    document.fonts.ready.then(setup);
  } else {
    setup();
  }
}