document.addEventListener("DOMContentLoaded", () => {
  console.log("Web cargada ✅");

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