document.addEventListener("DOMContentLoaded", () => {
  console.log("Web cargada ✅");

  // Script NAVEGADOR nav
  const nav = document.querySelector(".nav");
const toggle = nav.querySelector(".nav-toggle");

toggle.addEventListener("click", () => {
  const abierto = nav.classList.toggle("abierto");
  toggle.setAttribute("aria-expanded", abierto);
  toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});

// Cerrar al tocar un link
nav.querySelectorAll(".nav-menu a").forEach((a) => {
  a.addEventListener("click", () => {
    nav.classList.remove("abierto");
    toggle.setAttribute("aria-expanded", "false");
  });
});

// Cerrar al tocar fuera del menú
document.addEventListener("click", (e) => {
  if (!nav.contains(e.target)) nav.classList.remove("abierto");
});

  // Script post instagram
  document.querySelectorAll(".ig-embed").forEach((wrap) => {
    const loader = wrap.querySelector(".ig-loader");
    if (!loader) return;
    const ocultar = () => loader.classList.add("oculto");

    // Vigilo el contenedor: cuando Instagram inserta su <iframe>, oculto la carga
    const obs = new MutationObserver(() => {
      const iframe = wrap.querySelector("iframe");
      if (iframe) {
        iframe.addEventListener("load", ocultar);
        obs.disconnect();
      }
    });
    obs.observe(wrap, { childList: true, subtree: true });

    // Red de seguridad por si el evento "load" no dispara
    setTimeout(ocultar, 6000);
  });

  // Ticker de novedades arriba
  function initTicker(ticker, speed = 70) { // píxeles por segundo
    const track = ticker.querySelector(".ticker-track");
    const contenido = track.innerHTML; // lo que querés repetir

    function setup() {
      track.innerHTML = "";

      // Crea un grupo con el contenido
      const crearGrupo = () => {
        const g = document.createElement("div");
        g.style.display = "flex";
        g.style.flexShrink = "0"; // que no se comprima
        g.innerHTML = contenido;
        return g;
      };

      // Necesito al menos dos para medir la distancia real entre repeticiones
      const g1 = crearGrupo();
      const g2 = crearGrupo();
      track.appendChild(g1);
      track.appendChild(g2);

      // ⬅️ CLAVE: distancia real entre el inicio de un grupo y el siguiente
      // (incluye gap, márgenes, espacios... lo que sea)
      const periodo = g2.getBoundingClientRect().left - g1.getBoundingClientRect().left;

      // Agrego grupos hasta cubrir la pantalla + un periodo extra
      while (track.scrollWidth < ticker.offsetWidth + periodo) {
        track.appendChild(crearGrupo());
      }

      let offset = 0;
      let last = null;
      let paused = false;

      function step(t) {
        if (last === null) last = t;
        const dt = (t - last) / 1000;
        last = t;
        if (!paused) {
          offset -= speed * dt;
          if (offset <= -periodo) offset += periodo; // reinicio exacto = sin salto
          track.style.transform = `translateX(${offset}px)`;
        }
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);

      ticker.addEventListener("mouseenter", () => (paused = true));
      ticker.addEventListener("mouseleave", () => { paused = false; last = null; });
    }

    // Espero a que las fuentes terminen de cargar antes de medir
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setup);
    } else {
      setup();
    }
  }

  document.querySelectorAll(".ticker").forEach((t) => initTicker(t));
});