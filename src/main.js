gsap.registerPlugin(ScrollTrigger, CustomEase, TextPlugin);

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

  // Stop scrolling initially
  lenis.stop();

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
      splitText();
      // initTextScroll();
      // initLoad();
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
      { [property]: startValue },
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

function initIntroAnimation() {
  const startPage = document.querySelector(".start-page");
  const searchPage = document.querySelector(".search-page");
  const heroPage = document.querySelector(".hero-page");
  const nav = document.querySelector(".nav");
  const startButton = startPage.querySelector(".play-button");
  const logoWrap = document.querySelector(".logo-wrap");
  const singleLines = document.querySelectorAll(".hero-page .single-line");
  const playMovieBtn = document.querySelector(".play-movie");
  const scrollPrompt = document.querySelector(".p-scroll");

  gsap.set(logoWrap, {
    left: "50%",
    top: "50%",
    xPercent: -50,
    yPercent: -50,
    transformOrigin: "center center",
    scale: 2.5,
    autoAlpha: 0,
  });

  const heroTimeline = gsap.timeline({
    paused: true,
    onComplete: () => {
      // Enable scrolling after hero animation completes
      if (window.lenis) window.lenis.start();
    },
  });

  heroTimeline
    .to(logoWrap, {
      autoAlpha: 1,
      scale: 3,
      duration: 1.5,
      ease: "power3.out",
    })
    .to(logoWrap, {
      left: 0,
      top: "2.5em",
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      duration: 1.2,
    })
    .from(
      singleLines,
      {
        yPercent: 120,
        stagger: 0.075,
        duration: 0.8,
      },
      ">-0.8"
    )
    .from(
      playMovieBtn,
      {
        autoAlpha: 0,
        duration: 0.8,
      },
      "<"
    )
    .from(
      scrollPrompt,
      {
        autoAlpha: 0,
        duration: 0.5,
      },
      ">-0.2"
    )
    .from(
      nav,
      {
        autoAlpha: 0,
        duration: 0.5,
      },
      "<"
    );

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
            stagger: 0.1,
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
      duration: 2.5,
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

  // --- Check if intro has already played in this session ---
  const introPlayed = sessionStorage.getItem("introPlayed");

  if (introPlayed === "true") {
    gsap.set(startPage, { autoAlpha: 0, display: "none" });
    gsap.set(searchPage, { autoAlpha: 0, display: "none" });
    gsap.set(nav, { display: "block", autoAlpha: 0 });
    gsap.set(heroPage, { display: "flex", autoAlpha: 1 });

    gsap.delayedCall(0.1, () => heroTimeline.play());

    if (window.lenis) {
      window.lenis.start();
    } else {
      console.warn("Lenis instance not found when trying to start scrolling.");
    }
  } else {
    gsap.set([searchPage, heroPage, nav], { autoAlpha: 0, display: "none" });
    gsap.set(startPage, { autoAlpha: 1, display: "flex" });

    startButton.addEventListener("click", () => {
      gsap.to(startPage, {
        autoAlpha: 0,
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

document.addEventListener("DOMContentLoaded", () => {
  initLenis();
  initSplit();
  initBasicFormValidation();
  initIntroAnimation();
  const horizontalScrollTween = initHorizontalScroll();
  if (horizontalScrollTween) {
    initRevealLines(horizontalScrollTween);
    initRevealRotate(horizontalScrollTween);
    initRevealOpacity(horizontalScrollTween);
    initParallax(horizontalScrollTween);
  }
});
