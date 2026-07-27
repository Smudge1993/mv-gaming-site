(() => {
  const config = window.MV_SITE || {};
  const isPlaceholder = (value) => !value || value.includes("YOUR-") || value.includes("YOUR_");

  const configureLinks = (selector, url) => {
    document.querySelectorAll(selector).forEach((link) => {
      if (isPlaceholder(url)) {
        link.classList.add("is-disabled");
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => event.preventDefault());
        return;
      }
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  };

  configureLinks(".js-discord-link", config.discordInvite);
  configureLinks(".js-star-citizen-link", config.starCitizenOrganisation);

  const note = document.querySelector("[data-config-note]");
  if (note && !isPlaceholder(config.discordInvite) && !isPlaceholder(config.starCitizenOrganisation)) {
    note.remove();
  }

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const header = document.querySelector("[data-header]");
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const closeMenu = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
  };

  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    nav?.classList.toggle("is-open", !open);
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  // Soundtrack: attempt audible autoplay. Browsers may block this until the
  // first user gesture, so that first gesture is also used as a fallback.
  const soundtrack = document.querySelector("[data-soundtrack]");
  const soundButton = document.querySelector("[data-sound-toggle]");
  const soundLabel = document.querySelector("[data-sound-label]");
  let autoplayBlocked = false;

  const updateSoundControl = () => {
    if (!soundtrack || !soundButton || !soundLabel) return;

    const isMuted = soundtrack.muted;
    const isBlocked = soundtrack.paused && autoplayBlocked;

    soundButton.classList.toggle("is-muted", isMuted);
    soundButton.classList.toggle("is-blocked", isBlocked);
    soundButton.setAttribute("aria-pressed", String(isMuted));

    if (isBlocked) {
      soundLabel.textContent = "Play music";
      soundButton.setAttribute("aria-label", "Play soundtrack");
    } else if (isMuted) {
      soundLabel.textContent = "Unmute";
      soundButton.setAttribute("aria-label", "Unmute soundtrack");
    } else {
      soundLabel.textContent = "Mute";
      soundButton.setAttribute("aria-label", "Mute soundtrack");
    }
  };

  const attemptPlayback = async () => {
    if (!soundtrack) return false;
    try {
      await soundtrack.play();
      autoplayBlocked = false;
      updateSoundControl();
      return true;
    } catch (error) {
      autoplayBlocked = true;
      updateSoundControl();
      return false;
    }
  };

  if (soundtrack && soundButton) {
    soundtrack.volume = 0.28;
    soundtrack.muted = localStorage.getItem("mv-sc-muted") === "true";
    updateSoundControl();

    attemptPlayback();

    const unlockAudio = async (event) => {
      // Let the dedicated sound button handle its own first click.
      if (event?.target?.closest?.("[data-sound-toggle]")) return;

      if (soundtrack.paused) {
        await attemptPlayback();
      }

      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };

    document.addEventListener("pointerdown", unlockAudio);
    document.addEventListener("keydown", unlockAudio);

    soundButton.addEventListener("click", async (event) => {
      event.stopPropagation();

      if (soundtrack.paused) {
        soundtrack.muted = false;
        localStorage.setItem("mv-sc-muted", "false");
        await attemptPlayback();
      } else {
        soundtrack.muted = !soundtrack.muted;
        localStorage.setItem("mv-sc-muted", String(soundtrack.muted));
        updateSoundControl();
      }
    });

    soundtrack.addEventListener("play", updateSoundControl);
    soundtrack.addEventListener("pause", updateSoundControl);
    soundtrack.addEventListener("volumechange", updateSoundControl);
  }

  // Slowly rotating OpenCTM Super Hornet viewer.
  const viewer = document.querySelector("[data-ship-viewer]");
  if (viewer) {
    const canvas = viewer.querySelector("[data-model-canvas]");
    const status = viewer.querySelector("[data-model-status]");
    const modelUrl = viewer.dataset.modelUrl;

    const showViewerError = (message) => {
      if (!status) return;
      status.classList.add("is-error");
      status.innerHTML = message;
    };

    if (!window.THREE || !window.CTM || !THREE.CTMLoader) {
      showViewerError("The 3D viewer could not load. The rest of the fleet page is still available.");
    } else {
      try {
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.gammaOutput = true;
        renderer.gammaFactor = 2.2;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
        camera.position.set(3.3, 1.7, 5.2);

        const shipGroup = new THREE.Group();
        shipGroup.rotation.x = -0.12;
        scene.add(shipGroup);

        scene.add(new THREE.HemisphereLight(0xc8f4ff, 0x071017, 1.15));

        const keyLight = new THREE.DirectionalLight(0xd9f8ff, 1.45);
        keyLight.position.set(4, 5, 5);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x3fb8db, 1.05);
        rimLight.position.set(-4, 2, -4);
        scene.add(rimLight);

        const fillLight = new THREE.PointLight(0x6ed8ef, 0.75, 12);
        fillLight.position.set(0, -2, 3);
        scene.add(fillLight);

        const loader = new THREE.CTMLoader();
        const modelTimeout = window.setTimeout(() => {
          if (status?.isConnected) {
            showViewerError("The Super Hornet model is taking too long to load. Refresh the page to try again.");
          }
        }, 15000);

        let shipMesh = null;
        let dragging = false;
        let previousX = 0;
        let rotationVelocity = 0;

        loader.load(
          modelUrl,
          (geometry) => {
            window.clearTimeout(modelTimeout);
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();

            const bounds = geometry.boundingBox;
            const centre = new THREE.Vector3();
            const size = new THREE.Vector3();
            bounds.getCenter(centre);
            bounds.getSize(size);

            geometry.translate(-centre.x, -centre.y, -centre.z);

            const largestDimension = Math.max(size.x, size.y, size.z) || 1;
            const scale = 3.6 / largestDimension;

            const material = new THREE.MeshStandardMaterial({
              color: 0x91a8b3,
              metalness: 0.72,
              roughness: 0.38,
              side: THREE.DoubleSide
            });

            shipMesh = new THREE.Mesh(geometry, material);
            shipMesh.scale.setScalar(scale);
            shipMesh.rotation.z = -0.04;
            shipGroup.add(shipMesh);

            if (status) status.remove();
          },
          { useWorker: false }
        );

        const resizeRenderer = () => {
          const width = viewer.clientWidth;
          const height = viewer.clientHeight;
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
        };

        resizeRenderer();
        window.addEventListener("resize", resizeRenderer);

        if ("ResizeObserver" in window) {
          const resizeObserver = new ResizeObserver(resizeRenderer);
          resizeObserver.observe(viewer);
        }

        viewer.addEventListener("pointerdown", (event) => {
          dragging = true;
          previousX = event.clientX;
          rotationVelocity = 0;
          viewer.setPointerCapture?.(event.pointerId);
        });

        viewer.addEventListener("pointermove", (event) => {
          if (!dragging) return;
          const delta = event.clientX - previousX;
          previousX = event.clientX;
          shipGroup.rotation.y += delta * 0.008;
          rotationVelocity = delta * 0.0018;
        });

        const endDrag = () => {
          dragging = false;
        };
        viewer.addEventListener("pointerup", endDrag);
        viewer.addEventListener("pointercancel", endDrag);
        viewer.addEventListener("pointerleave", endDrag);

        let viewerVisible = true;
        if ("IntersectionObserver" in window) {
          const visibilityObserver = new IntersectionObserver((entries) => {
            viewerVisible = entries[0]?.isIntersecting ?? true;
          }, { threshold: 0.02 });
          visibilityObserver.observe(viewer);
        }

        const clock = new THREE.Clock();
        const animate = () => {
          requestAnimationFrame(animate);
          const delta = Math.min(clock.getDelta(), 0.04);

          if (viewerVisible) {
            if (!dragging) {
              shipGroup.rotation.y += (0.16 * delta) + rotationVelocity;
              rotationVelocity *= 0.94;
            }
            renderer.render(scene, camera);
          }
        };
        animate();
      } catch (error) {
        console.error(error);
        showViewerError("The Super Hornet model could not be displayed in this browser.");
      }
    }
  }

  const revealElements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach((element) => observer.observe(element));
  }
})();
