(() => {
  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navigation = document.querySelector("[data-navigation]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 16);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const closeNavigation = () => {
    navToggle?.setAttribute("aria-expanded", "false");
    navigation?.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navigation?.classList.toggle("is-open", !isOpen);
    document.body.style.overflow = isOpen ? "" : "hidden";
  });

  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  const reveals = document.querySelectorAll(".reveal");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 }
    );
    reveals.forEach((element) => revealObserver.observe(element));
  }

  const book = document.querySelector("[data-parallax-book]");
  if (book && !reducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      book.style.setProperty("--book-rx", `${y * -4}deg`);
      book.style.setProperty("--book-ry", `${x * 6}deg`);
    });
  }

  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
    const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
    const previousButton = document.querySelector("[data-carousel-previous]");
    const nextButton = document.querySelector("[data-carousel-next]");
    const status = carousel.querySelector("[data-carousel-status]");
    let activeIndex = 0;
    let autoplayTimer = 0;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.hidden = slideIndex !== activeIndex;
      });
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute("aria-current", String(dotIndex === activeIndex));
      });
      if (status) status.textContent = `${activeIndex + 1} / ${slides.length}`;
    };

    const stopAutoplay = () => window.clearTimeout(autoplayTimer);
    const startAutoplay = () => {
      stopAutoplay();
      if (reducedMotion.matches || document.hidden || slides.length < 2) return;
      autoplayTimer = window.setTimeout(() => {
        showSlide(activeIndex + 1);
        startAutoplay();
      }, 6000);
    };
    const selectSlide = (index) => {
      showSlide(index);
      startAutoplay();
    };

    previousButton?.addEventListener("click", () => selectSlide(activeIndex - 1));
    nextButton?.addEventListener("click", () => selectSlide(activeIndex + 1));
    dots.forEach((dot, dotIndex) => dot.addEventListener("click", () => selectSlide(dotIndex)));
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") selectSlide(activeIndex - 1);
      if (event.key === "ArrowRight") selectSlide(activeIndex + 1);
    });
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) startAutoplay();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });
    startAutoplay();
  }

  const citationButton = document.querySelector("[data-copy-citation]");
  const citationText = document.querySelector("[data-citation-text]");
  const citationLabel = citationButton?.querySelector("[data-copy-label]");
  const citationStatus = document.querySelector("#citation-status");
  let citationResetTimer = 0;

  const copyCitation = async () => {
    if (!citationButton || !citationText || !citationLabel || !citationStatus) return;

    try {
      const text = citationText.textContent;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(citationText);
        selection?.removeAllRanges();
        selection?.addRange(range);
        const copied = document.execCommand("copy");
        selection?.removeAllRanges();
        if (!copied) throw new Error("Copy command failed");
      }

      window.clearTimeout(citationResetTimer);
      citationButton.classList.add("is-copied");
      citationLabel.textContent = "Referencia copiada";
      citationStatus.textContent = "Referencia BibTeX copiada al portapapeles.";
      citationResetTimer = window.setTimeout(() => {
        citationButton.classList.remove("is-copied");
        citationLabel.textContent = "Copiar referencia";
      }, 2600);
    } catch (error) {
      citationStatus.textContent = "No se pudo copiar la referencia. Seleccioná el texto y copialo manualmente.";
      citationLabel.textContent = "Seleccioná el texto";
    }
  };

  citationButton?.addEventListener("click", copyCitation);

  const canvas = document.querySelector("#neural-field");
  if (!canvas || reducedMotion.matches) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let particles = [];
  let visible = true;

  const makeParticles = () => {
    const count = Math.min(72, Math.max(28, Math.floor((width * height) / 24000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 1.2 + 0.45,
      accent: Math.random() > 0.78,
    }));
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    makeParticles();
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const next = particles[nextIndex];
        const dx = particle.x - next.x;
        const dy = particle.y - next.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 128) continue;

        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(next.x, next.y);
        context.strokeStyle = `rgba(139, 92, 246, ${(1 - distance / 128) * 0.16})`;
        context.lineWidth = 0.7;
        context.stroke();
      }

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = particle.accent ? "rgba(245, 158, 11, 0.62)" : "rgba(183, 154, 255, 0.48)";
      context.fill();
    });

    if (visible) animationFrame = window.requestAnimationFrame(draw);
  };

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    window.cancelAnimationFrame(animationFrame);
    if (visible) draw();
  });

  resize();
  draw();
  visibilityObserver.observe(canvas);
  new ResizeObserver(resize).observe(canvas);
})();
