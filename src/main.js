gsap.registerPlugin(ScrollTrigger, CustomEase, TextPlugin, ScrollToPlugin);

CustomEase.create("powerbuild", "0.5, 0.05, 0, 1");

gsap.defaults({
  ease: "powerbuild",
  duration: 0.8,
});

function initLenis() {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Store lenis instance globally so we can access it from other functions
  window.lenis = lenis;
}

function initSplit() {
  let lineTargets = document.querySelectorAll('[data-split="lines"]');
  let letterTargets = document.querySelectorAll('[data-split="letters"]');
  let splitTextLines = null;
  let splitTextLetters = [];

  function splitText() {
    if (splitTextLines) {
      splitTextLines.revert();
    }
    splitTextLetters.forEach((instance) => {
      if (instance) instance.revert();
    });
    splitTextLetters = [];

    // Lines
    splitTextLines = new SplitType(lineTargets, {
      types: "lines",
      lineClass: "single-line",
    });

    splitTextLines.lines.forEach((line) => {
      let wrapper = document.createElement("div");
      wrapper.classList.add("single-line-wrap");
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    // Letters
    splitTextLetters = Array.from(letterTargets).map((target) => {
      if (target.hasAttribute("split-ran")) return;
      return new SplitType(target, {
        types: "words, chars",
        charClass: "single-letter",
      });
    });

    splitTextLetters.forEach((instance) => {
      if (instance) {
        instance.elements[0].setAttribute("split-ran", "true");
        if (instance.elements[0].hasAttribute("data-letters-delay")) {
          instance.chars.forEach((letter, index) => {
            let delay = index / 150 + "s";
            letter.style.setProperty("transition-delay", delay);
          });
        }
      }
    });
  }

  // Workaround for splitting lines off screen – seems to work :)
  gsap.set(".hero-page", { display: "block", autoAlpha: 0 });

  // Perform the initial split
  splitText();

  // After split, immediately reset position
  gsap.set(".hero-page", { display: "none", autoAlpha: 1, clearProps: true });

  // Add a debounced resize event listener
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Only re-split text if window width is >= 992px
      if (window.innerWidth >= 992) {
        splitText();
        initRevealLines();
        initRevealRotate();
      }
    }, 300);
  });
}

function initBasicFormValidation() {
  const forms = document.querySelectorAll("[data-form-validate]");

  forms.forEach((form) => {
    const fields = form.querySelectorAll(
      "[data-validate] input, [data-validate] textarea"
    );
    const submitButtonDiv = form.querySelector("[data-submit]"); // The div wrapping the submit button
    const submitInput = submitButtonDiv.querySelector('input[type="submit"]'); // The actual submit button

    // Capture the form load time
    const formLoadTime = new Date().getTime(); // Timestamp when the form was loaded

    // Function to validate individual fields (input or textarea)
    const validateField = (field) => {
      const parent = field.closest("[data-validate]"); // Get the parent div
      const minLength = field.getAttribute("min");
      const maxLength = field.getAttribute("max");
      const type = field.getAttribute("type");
      let isValid = true;

      // Check if the field has content
      if (field.value.trim() !== "") {
        parent.classList.add("is--filled");
      } else {
        parent.classList.remove("is--filled");
      }

      // Validation logic for min and max length
      if (minLength && field.value.length < minLength) {
        isValid = false;
      }

      if (maxLength && field.value.length > maxLength) {
        isValid = false;
      }

      // Validation logic for email input type
      if (type === "email" && !/\S+@\S+\.\S+/.test(field.value)) {
        isValid = false;
      }

      // Add or remove success/error classes on the parent div
      if (isValid) {
        parent.classList.remove("is--error");
        parent.classList.add("is--success");
      } else {
        parent.classList.remove("is--success");
        parent.classList.add("is--error");
      }

      return isValid;
    };

    // Function to start live validation for a field
    const startLiveValidation = (field) => {
      field.addEventListener("input", function () {
        validateField(field);
      });
    };

    // Function to validate and start live validation for all fields, focusing on the first field with an error
    const validateAndStartLiveValidationForAll = () => {
      let allValid = true;
      let firstInvalidField = null;

      fields.forEach((field) => {
        const valid = validateField(field);
        if (!valid && !firstInvalidField) {
          firstInvalidField = field; // Track the first invalid field
        }
        if (!valid) {
          allValid = false;
        }
        startLiveValidation(field); // Start live validation for all fields
      });

      // If there is an invalid field, focus on the first one
      if (firstInvalidField) {
        firstInvalidField.focus();
      }

      return allValid;
    };

    // Anti-spam: Check if form was filled too quickly
    const isSpam = () => {
      const currentTime = new Date().getTime();
      const timeDifference = (currentTime - formLoadTime) / 1000; // Convert milliseconds to seconds
      return timeDifference < 5; // Return true if form is filled within 5 seconds
    };

    // Handle clicking the custom submit button
    submitButtonDiv.addEventListener("click", function () {
      // Validate the form first
      if (validateAndStartLiveValidationForAll()) {
        // Only check for spam after all fields are valid
        if (isSpam()) {
          alert("Form submitted too quickly. Please try again.");
          return; // Stop form submission
        }
        submitInput.click(); // Simulate a click on the <input type="submit">
      }
    });

    // Handle pressing the "Enter" key
    form.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault(); // Prevent the default form submission

        // Validate the form first
        if (validateAndStartLiveValidationForAll()) {
          // Only check for spam after all fields are valid
          if (isSpam()) {
            alert("Form submitted too quickly. Please try again.");
            return; // Stop form submission
          }
          submitInput.click(); // Trigger our custom form submission
        }
      }
    });
  });
}

function initHorizontalScroll() {
  let scrollContainer = document.querySelector(".scroll-container");
  let pinContainer = document.querySelector(".pin-container");
  let sectionsWrap = scrollContainer.querySelector(
    ".horizontal-sections__wrap"
  );
  let panels = sectionsWrap.querySelectorAll(".section");
  if (!scrollContainer || !pinContainer || !sectionsWrap) {
    console.error("Missing elements");
    return;
  }
  let totalWidth = 0;
  panels.forEach((panel) => {
    totalWidth += panel.offsetWidth;
  });

  const scrollDistance = totalWidth - window.innerWidth;

  gsap.set(scrollContainer, {
    height: `${scrollDistance}px`,
  });

  const horizontalScroll = gsap.to(sectionsWrap, {
    x: -scrollDistance,
    ease: "none",
    scrollTrigger: {
      trigger: scrollContainer,
      start: "top top",
      end: () => `+=${scrollDistance}`,
      scrub: true,
      pin: pinContainer,
      pinSpacing: true,
      invalidateOnRefresh: true,
    },
  });
  return horizontalScroll;
}

function initRevealLines(horizontalScrollTween) {
  let lineTargets = document.querySelectorAll('[data-reveal="lines"]');

  lineTargets.forEach((target) => {
    let lines = target.querySelectorAll(".single-line");
    let animationTarget = lines ? lines : target;
    gsap.from(animationTarget, {
      y: "120%",
      duration: 0.8,
      stagger: 0.075,
      scrollTrigger: {
        trigger: target,
        start: "left 85%",
        once: true,
        containerAnimation: horizontalScrollTween,
      },
    });
  });
}

function initRevealRotate(horizontalScrollTween) {
  let rotateTargets = document.querySelectorAll('[data-reveal="rotate"]');

  rotateTargets.forEach((target) => {
    let lines = target.querySelectorAll(".single-line");
    gsap.set(lines, {
      transformOrigin: "left",
    });
    gsap.from(lines, {
      rotate: "10deg",
      y: "120%",
      duration: 0.8,
      stagger: 0.075,
      scrollTrigger: {
        trigger: target,
        start: "left 85%",
        once: true,
        containerAnimation: horizontalScrollTween,
      },
    });
  });
}

function initRevealOpacity(horizontalScrollTween) {
  let opacityTargets = document.querySelectorAll('[data-reveal="opacity"]');

  opacityTargets.forEach((target) => {
    gsap.from(target, {
      opacity: 0,
      duration: 1,
      stagger: 0.075,
      scrollTrigger: {
        trigger: target,
        start: "left 85%",
        once: true,
        containerAnimation: horizontalScrollTween,
      },
    });
  });
}

function initParallax(horizontalScrollTween) {
  const parallaxTriggers = document.querySelectorAll(
    '[data-parallax="trigger"]'
  );

  parallaxTriggers.forEach((trigger) => {
    const direction =
      trigger.getAttribute("data-parallax-direction") || "horizontal";
    const scrubValue =
      parseFloat(trigger.getAttribute("data-parallax-scrub")) || true;
    const startValue =
      parseFloat(trigger.getAttribute("data-parallax-start")) || -5;
    const endValue =
      parseFloat(trigger.getAttribute("data-parallax-end")) || 20;
    const scrollStart =
      trigger.getAttribute("data-parallax-scroll-start") || "left right";
    const scrollEnd =
      trigger.getAttribute("data-parallax-scroll-end") || "right left";
    const target = trigger.querySelector('[data-parallax="target"]') || trigger;
    const property = direction === "horizontal" ? "xPercent" : "yPercent";

    gsap.fromTo(
      target,
      {
        [property]: startValue,
      },
      {
        [property]: endValue,
        ease: "none",
        scrollTrigger: {
          trigger: trigger,
          start: scrollStart,
          end: scrollEnd,
          scrub: scrubValue,
          containerAnimation: horizontalScrollTween,
        },
      }
    );
  });
}

function initRevealLinesMobile() {
  let lineTargets = document.querySelectorAll('[data-reveal="lines"]');

  lineTargets.forEach((target) => {
    let lines = target.querySelectorAll(".single-line");
    let animationTarget = lines ? lines : target;
    gsap.from(animationTarget, {
      y: "120%",
      duration: 0.8,
      stagger: 0.075,
      scrollTrigger: {
        trigger: target,
        start: "top 85%",
        once: true,
      },
    });
  });
}

function initRevealRotateMobile() {
  let rotateTargets = document.querySelectorAll('[data-reveal="rotate"]');

  rotateTargets.forEach((target) => {
    let lines = target.querySelectorAll(".single-line");
    gsap.set(lines, {
      transformOrigin: "left",
    });
    gsap.from(lines, {
      rotate: "10deg",
      y: "120%",
      duration: 0.8,
      stagger: 0.075,
      scrollTrigger: {
        trigger: target,
        start: "top 85%",
        once: true,
      },
    });
  });
}

function initRevealOpacityMobile() {
  let opacityTargets = document.querySelectorAll('[data-reveal="opacity"]');

  opacityTargets.forEach((target) => {
    gsap.from(target, {
      opacity: 0,
      duration: 1,
      stagger: 0.075,
      scrollTrigger: {
        trigger: target,
        start: "top 85%",
        once: true,
      },
    });
  });
}

function initParallaxMobile() {
  const parallaxTriggers = document.querySelectorAll(
    '[data-parallax="trigger"]'
  );

  parallaxTriggers.forEach((trigger) => {
    const direction =
      trigger.getAttribute("data-parallax-direction") || "vertical";
    const scrubValue =
      parseFloat(trigger.getAttribute("data-parallax-scrub")) || true;
    const startValue =
      parseFloat(trigger.getAttribute("data-parallax-start")) || -5;
    const endValue =
      parseFloat(trigger.getAttribute("data-parallax-end")) || 20;
    const scrollStart =
      trigger.getAttribute("data-parallax-scroll-start") || "top bottom";
    const scrollEnd =
      trigger.getAttribute("data-parallax-scroll-end") || "bottom top";
    const target = trigger.querySelector('[data-parallax="target"]') || trigger;
    const property = direction === "horizontal" ? "xPercent" : "yPercent";

    gsap.fromTo(
      target,
      {
        [property]: startValue,
      },
      {
        [property]: endValue,
        ease: "none",
        scrollTrigger: {
          trigger: trigger,
          start: scrollStart,
          end: scrollEnd,
          scrub: scrubValue,
        },
      }
    );
  });
}

function initIntroAnimation() {
  const startPage = document.querySelector(".start-page");
  const searchPage = document.querySelector(".search-page");
  const heroPage = document.querySelector(".hero-page");
  const nav = document.querySelector(".nav");
  const startButton = startPage.querySelector(".play-button");
  const startText = startPage.querySelector('[data-start="text"]');
  const playSvg = startPage.querySelector(".play-svg");
  const logoWrap = document.querySelector(".logo-wrap");
  const singleLines = document.querySelectorAll(".hero-page .single-line");
  const scrollPrompt = document.querySelector(".p-scroll");

  const playMovieBtn = document.querySelector(".play-movie");
  const movieCircle = playMovieBtn?.querySelector("#movie-circle");
  const movieText = playMovieBtn?.querySelector('[data-movie="text"]');
  const movieArrow = playMovieBtn?.querySelector(".play-movie__arrow");
  const movieSvgContainer = movieCircle?.closest("svg");

  gsap.set(logoWrap, {
    left: "50%",
    top: "50%",
    xPercent: -50,
    yPercent: -50,
    transformOrigin: "center center",
    autoAlpha: 0,
  });

  if (
    playMovieBtn &&
    movieCircle &&
    movieText &&
    movieArrow &&
    movieSvgContainer
  ) {
    const movieCircleLength = movieCircle.getTotalLength();
    gsap.set(movieCircle, {
      strokeDasharray: movieCircleLength,
      strokeDashoffset: movieCircleLength,
    });
    gsap.set(movieSvgContainer, {
      rotation: -180,
      transformOrigin: "center center",
    });
    gsap.set([movieArrow, movieText], {
      scale: 0.5,
      autoAlpha: 0,
      transformOrigin: "center center",
    });
    gsap.set(playMovieBtn, { autoAlpha: 0 });
  } else {
    console.warn(
      "Could not find all elements for play movie button animation."
    );
  }

  const heroTimeline = gsap.timeline({
    paused: true,
  });

  heroTimeline
    .to(logoWrap, {
      autoAlpha: 1,
      duration: 1.2,
      scale: 1.2,
      ease: "power3.out",
    })
    .to(logoWrap, {
      left: 0,
      top: "2.5em",
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      width: "8em",
      duration: 1,
    })
    .from(
      singleLines,
      {
        yPercent: 120,
        stagger: 0.075,
      },
      ">-0.8"
    )
    .from(
      scrollPrompt,
      {
        autoAlpha: 0,
        duration: 0.5,
      },
      "<0.3"
    )
    .from(
      nav,
      {
        autoAlpha: 0,
        duration: 0.5,
      },
      "<0.1"
    );

  if (playMovieBtn && movieCircle && movieText && movieArrow) {
    heroTimeline
      .to(playMovieBtn, { autoAlpha: 1, duration: 0.1 }, "<-0.3")
      .to(movieCircle, { strokeDashoffset: 0, duration: 1.2 }, "<")
      .to(
        [movieText, movieArrow],
        { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.1 },
        ">-0.3"
      );
  }

  const searchbarTimeline = gsap.timeline({
    paused: true,
    onComplete: () => {
      gsap.to(searchPage, {
        autoAlpha: 0,
        duration: 0.5,
        onComplete: () => {
          gsap.set(searchPage, { display: "none" });
          gsap.set(heroPage, { display: "flex" });
          gsap.set(nav, { display: "block" });
          gsap.to(heroPage, {
            autoAlpha: 1,
            onComplete: () => {
              heroTimeline.play();
              sessionStorage.setItem("introPlayed", "true");
            },
          });
        },
      });
    },
  });

  searchbarTimeline
    .to('[data-search="text"]', {
      text: "Ik zoek marketing voor industrie, bouw en ontwikkeling",
      duration: 2,
      ease: "none",
    })
    .to(
      '[data-search="search"]',
      {
        scale: 0.9,
        duration: 0.25,
        yoyo: true,
        repeat: 1,
      },
      ">0.5"
    );

  const introPlayed = sessionStorage.getItem("introPlayed");

  if (introPlayed === "true") {
    gsap.set(startPage, { autoAlpha: 0, display: "none" });
    gsap.set(searchPage, { autoAlpha: 0, display: "none" });
    gsap.set(nav, { display: "block", autoAlpha: 0 });
    gsap.set(heroPage, { display: "flex", autoAlpha: 1 });

    gsap.delayedCall(0.1, () => {
      heroTimeline.play();
    });
  } else {
    const circlePath = startPage.querySelector("#start-circle");
    const svgElement = circlePath?.closest("svg");
    gsap.set([searchPage, heroPage, nav], { autoAlpha: 0, display: "none" });
    gsap.set(startPage, { autoAlpha: 1, display: "flex" });
    gsap.set(startText, { text: "" });
    gsap.set(playSvg, {
      scale: 0,
      autoAlpha: 0,
      transformOrigin: "center center",
    });

    const startPageTimeline = gsap.timeline({ delay: 0.5 });
    if (window.innerWidth <= 991 && circlePath && svgElement) {
      const length = circlePath.getTotalLength();
      startPageTimeline
        .set(circlePath, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 1,
        })
        .set(
          svgElement,
          {
            rotation: -180,
            scaleX: -1,
            transformOrigin: "center center",
          },
          "<"
        )
        .to(
          circlePath,
          {
            strokeDashoffset: 0,
            duration: 1.0,
          },
          "<"
        );
    }
    startPageTimeline
      .to(
        startText,
        {
          text: "press to start the experience",
          duration: 1,
          ease: "none",
        },
        ">-0.2"
      )
      .to(
        playSvg,
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: "back.out(1.5)",
        },
        ">"
      );

    startButton.addEventListener("click", () => {
      startPageTimeline.kill();
      gsap.to(startPage, {
        autoAlpha: 0,
        duration: 0.3,
        onComplete: () => {
          gsap.set(startPage, { display: "none" });
          gsap.set(searchPage, { display: "flex" });
          gsap.to(searchPage, {
            autoAlpha: 1,
            duration: 1,
            ease: "power3.out",
            onComplete: () => {
              searchbarTimeline.play();
            },
          });
        },
      });
    });
  }
}

function initCircleHoverAnimation() {
  const playButton = document.querySelector(".play-button");
  const circlePath = document.querySelector("#start-circle");

  if (!playButton || !circlePath) {
    console.error("Play button or circle path not found for hover animation.");
    return;
  }

  const svgElement = circlePath.closest("svg");
  if (!svgElement) {
    console.error("SVG element containing the circle path not found.");
    return;
  }

  const length = circlePath.getTotalLength();

  gsap.set(circlePath, {
    strokeDasharray: length,
    strokeDashoffset: length,
    opacity: 1,
  });

  gsap.set(svgElement, {
    rotation: -180,
    scaleX: -1,
    transformOrigin: "center center",
  });

  const hoverTimelineEnter = gsap.timeline({ paused: true });
  hoverTimelineEnter.to(circlePath, {
    strokeDashoffset: 0,
    duration: 0.8,
  });

  const hoverTimelineLeave = gsap.timeline({ paused: true });
  hoverTimelineLeave.to(circlePath, {
    strokeDashoffset: length,
    duration: 0.5,
    ease: "power1.inOut",
  });

  playButton.addEventListener("mouseenter", () => {
    hoverTimelineLeave.pause();
    hoverTimelineEnter.play(0);
  });

  playButton.addEventListener("mouseleave", () => {
    hoverTimelineEnter.pause();
    hoverTimelineLeave.play(0);
  });
}

function initMagneticEffect() {
  const magnets = document.querySelectorAll("[data-magnetic-strength]");
  if (window.innerWidth <= 991) return;

  // Helper to kill tweens and reset an element.
  const resetEl = (el, immediate) => {
    if (!el) return;
    gsap.killTweensOf(el);
    (immediate ? gsap.set : gsap.to)(el, {
      x: "0em",
      y: "0em",
      rotate: "0deg",
      clearProps: "all",
      ...(!immediate && { ease: "elastic.out(1, 0.3)", duration: 1.6 }),
    });
  };

  const resetOnEnter = (e) => {
    const m = e.currentTarget;
    resetEl(m, true);
    resetEl(m.querySelector("[data-magnetic-inner-target]"), true);
  };

  const moveMagnet = (e) => {
    const m = e.currentTarget,
      b = m.getBoundingClientRect(),
      strength = parseFloat(m.getAttribute("data-magnetic-strength")) || 35,
      inner = m.querySelector("[data-magnetic-inner-target]"),
      innerStrength =
        parseFloat(m.getAttribute("data-magnetic-strength-inner")) || strength,
      offsetX = ((e.clientX - b.left) / m.offsetWidth - 0.5) * (strength / 16),
      offsetY = ((e.clientY - b.top) / m.offsetHeight - 0.5) * (strength / 16);

    gsap.to(m, {
      x: offsetX + "em",
      y: offsetY + "em",
      rotate: "0.001deg",
      ease: "power4.out",
      duration: 1.6,
    });

    if (inner) {
      const innerOffsetX =
          ((e.clientX - b.left) / m.offsetWidth - 0.5) * (innerStrength / 16),
        innerOffsetY =
          ((e.clientY - b.top) / m.offsetHeight - 0.5) * (innerStrength / 16);
      gsap.to(inner, {
        x: innerOffsetX + "em",
        y: innerOffsetY + "em",
        rotate: "0.001deg",
        ease: "power4.out",
        duration: 2,
      });
    }
  };

  const resetMagnet = (e) => {
    const m = e.currentTarget,
      inner = m.querySelector("[data-magnetic-inner-target]");
    gsap.to(m, {
      x: "0em",
      y: "0em",
      ease: "elastic.out(1, 0.3)",
      duration: 1.6,
      clearProps: "all",
    });
    if (inner) {
      gsap.to(inner, {
        x: "0em",
        y: "0em",
        ease: "elastic.out(1, 0.3)",
        duration: 2,
        clearProps: "all",
      });
    }
  };

  magnets.forEach((m) => {
    m.addEventListener("mouseenter", resetOnEnter);
    m.addEventListener("mousemove", moveMagnet);
    m.addEventListener("mouseleave", resetMagnet);
  });
}

function initVideoLightbox() {
  const playButton = document.querySelector(".play-movie");
  const videoLightbox = document.querySelector(".video-lightbox");
  const closeButton = document.querySelector(".video-lightbox__close");
  const videoWrapper = document.querySelector(".video-lightbox__video-wrapper");
  const video = document.querySelector(".video-lightbox__video");

  gsap.set(videoLightbox, { autoAlpha: 0, display: "none" });
  gsap.set(videoWrapper, { scale: 0.9, y: 15 });
  gsap.set(closeButton, { autoAlpha: 0 });

  function openLightbox() {
    gsap.set(videoLightbox, { display: "flex" });

    const tl = gsap.timeline();
    tl.to(videoLightbox, {
      autoAlpha: 1,
      duration: 0.4,
      ease: "power2.out",
    })
      .to(
        videoWrapper,
        {
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power4.out",
        },
        0
      )
      .to(
        closeButton,
        {
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.3"
      );

    // Play the video
    video.play();
  }

  // Close lightbox function
  function closeLightbox() {
    // Animate closing
    const tl = gsap.timeline({
      onComplete: function () {
        gsap.set(videoLightbox, { display: "none" });
        // Reset video position
        video.pause();
        video.currentTime = 0;
      },
    });

    tl.to(closeButton, {
      autoAlpha: 0,
      duration: 0.2,
      ease: "power2.in",
    })
      .to(
        videoWrapper,
        {
          scale: 0.9,
          y: 15,
          duration: 0.3,
          ease: "power4.in",
        },
        0
      )
      .to(
        videoLightbox,
        {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        "-=0.2"
      );
  }

  // Event listeners
  playButton.addEventListener("click", openLightbox);
  closeButton.addEventListener("click", closeLightbox);

  // Close when clicking outside the video wrapper
  videoLightbox.addEventListener("click", function (e) {
    // Check if the click is outside the video wrapper
    // This works by checking if the video wrapper contains the clicked element
    if (!videoWrapper.contains(e.target) && e.target !== closeButton) {
      closeLightbox();
    }
  });

  // Optional: Close on escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && videoLightbox.style.display !== "none") {
      closeLightbox();
    }
  });
}

function initNavLinks() {
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');

  if (!navLinks.length) {
    console.warn("No navigation links starting with # found.");
    return;
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default anchor jump

      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        let horizontalScrollTrigger;
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === document.querySelector(".scroll-container")) {
            horizontalScrollTrigger = st;
          }
        });

        if (horizontalScrollTrigger) {
          // Calculate the vertical scroll value needed to bring the target element
          // to the start of the horizontal scroll container (offsetLeft 0)
          const scrollContainer = document.querySelector(".scroll-container");
          const pinContainer = document.querySelector(".pin-container");
          const sectionsWrap = scrollContainer.querySelector(
            ".horizontal-sections__wrap"
          );

          if (!scrollContainer || !pinContainer || !sectionsWrap) {
            console.error(
              "Horizontal scroll elements not found for nav calculation."
            );
            return;
          }

          // Total horizontal scroll distance possible
          const maxScrollX =
            sectionsWrap.scrollWidth - pinContainer.offsetWidth;
          // Target element's horizontal position within the scrolling container
          const targetX = targetElement.offsetLeft;
          // Proportion of the total scroll distance needed to reach the target
          const scrollProportion = targetX / maxScrollX;

          // Total vertical distance the ScrollTrigger covers
          const triggerScrollHeight =
            horizontalScrollTrigger.end - horizontalScrollTrigger.start;

          // Calculate the target vertical scroll position
          const targetScrollY =
            horizontalScrollTrigger.start +
            scrollProportion * triggerScrollHeight;

          // Now use ScrollToPlugin to scroll the window to that calculated position
          gsap.to(window, {
            scrollTo: {
              y: targetScrollY,
              autoKill: false, // Prevent interruption by user scroll
            },
            duration: 1.2,
            ease: "powerbuild", // Your custom ease
            overwrite: true,
          });
        } else {
          console.warn("Could not find the horizontal ScrollTrigger instance.");
          // Fallback: Try direct element scroll (might not align correctly)
          gsap.to(window, {
            scrollTo: targetElement,
            duration: 1.2,
            ease: "powerbuild",
            offsetY: 100,
          }); // Added offset for visibility
        }
      } else {
        console.warn(`Target element not found for selector: ${targetId}`);
      }
    });
  });
}

initLenis();
initSplit();
initBasicFormValidation();
initIntroAnimation();
initMagneticEffect();
initVideoLightbox();
let mm = gsap.matchMedia();
mm.add("(min-width: 992px)", () => {
  initCircleHoverAnimation();
  const horizontalScrollTween = initHorizontalScroll();
  if (horizontalScrollTween) {
    initRevealLines(horizontalScrollTween);
    initRevealRotate(horizontalScrollTween);
    initRevealOpacity(horizontalScrollTween);
    initParallax(horizontalScrollTween);
  }
  initNavLinks();
});

mm.add("(max-width: 991px)", () => {
  initRevealLinesMobile();
  initRevealRotateMobile();
  initRevealOpacityMobile();
  initParallaxMobile();
});
