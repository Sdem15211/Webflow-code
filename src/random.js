gsap.registerPlugin(ScrollTrigger, CustomEase);

let lenis;
let staggerDefault = 0.08;
let durationDefault = 0.8;

CustomEase.create("vigore-ease", "0.5, 0.05, 0, 1");

gsap.defaults({
  ease: "vigore-ease",
  duration: durationDefault,
});

gsap.config({ nullTargetWarn: false });

let isMobile = window.innerWidth < 480;
let isMobileLandscape = window.innerWidth < 768;
let isTablet = window.innerWidth < 992;

function initLenis() {
  lenis = new Lenis({ lerp: 0.08 });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function initCurrentYear() {
  const currentYear = new Date().getFullYear();
  const currentYearElements = document.querySelectorAll("[data-current-year]");
  if (currentYearElements.length > 0) {
    currentYearElements.forEach((currentYearElement) => {
      currentYearElement.textContent = currentYear;
    });
  }
}

function initSplit() {
  // Initialize SplitType after the entire window has loaded
  const lineTargets = document.querySelectorAll('[data-split="lines"]');
  const letterTargets = document.querySelectorAll('[data-split="letters"]');
  let splitTextLines = null;
  let splitTextLetters = [];

  function splitText() {
    // Revert previous SplitType instances if they exist
    if (splitTextLines) {
      splitTextLines.revert();
    }
    splitTextLetters.forEach((instance) => {
      if (instance) instance.revert();
    });
    splitTextLetters = [];

    // Split Lines
    splitTextLines = new SplitType(lineTargets, {
      types: "lines",
      lineClass: "single-line",
    });

    // Wrap each line in a .single-line-wrap div and handle background-clip
    splitTextLines.lines.forEach((line) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("single-line-wrap");

      const parent = line.closest('[data-split="lines"]');
      const computedStyles = window.getComputedStyle(parent);

      // Handle background-clip: text if applied
      if (
        computedStyles.webkitBackgroundClip === "text" ||
        computedStyles.backgroundClip === "text"
      ) {
        const bg = computedStyles.background;
        line.style.background = bg;
        line.style.backgroundClip = "text";
        line.style.webkitBackgroundClip = "text";
        line.style.color = "transparent"; // Ensure text is clipped to background
      }

      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    splitTextLetters = Array.from(letterTargets).map((target) => {
      return new SplitType(target, {
        types: "words,chars",
        charClass: "single-letter",
        wordClass: "single-word",
        tagName: "span",
      });
    });

    splitTextLetters.forEach((instance) => {
      if (instance) {
        if (instance.elements[0].hasAttribute("data-letters-delay")) {
          instance.chars.forEach((letter, index) => {
            const delay = index / 150 + "s";
            letter.style.setProperty("transition-delay", delay);
          });
        }
      }
    });
  }

  document.fonts.ready.then(() => {
    splitText();
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    if (window.innerWidth > 991) {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        splitText();
        initRevealScroll();
        initExpertise();
        initLoader();
      }, 300);
    }
  });
}

function initLoad() {
  let header = document.querySelector(".header");
  let hero = document.querySelector("[data-hero-section]");
  let image = hero.querySelector("[hero-img]");
  let lines = hero.querySelectorAll(".single-line");
  let buttons = hero.querySelectorAll("[hero-button]");

  let mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    let tl = gsap.timeline({
      delay: 0.3,
      defaults: {
        ease: "vigore-ease",
        duration: 1.2,
      },
      onComplete: () => {
        ScrollTrigger.refresh();
      },
    });

    tl.set(hero, { autoAlpha: 1 })
      .set(
        image,
        { clipPath: "polygon(15% 100%, 40% 100%, 40% 100%, 15% 100%)" },
        "<"
      )
      .to(image, {
        clipPath: "polygon(15% 40%, 40% 40%, 40% 100%, 15% 100%)",
        duration: 0.8,
        ease: "expo.out",
      })
      .to(
        image,
        {
          clipPath: "polygon(15% 20%, 40% 20%, 40% 85%, 15% 85%)",
          duration: 0.8,
        },
        "<0.4"
      )
      .to(image, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
      })
      .to(
        lines,
        {
          y: 0,
          stagger: staggerDefault,
        },
        "<0.1"
      )
      .from(header, { y: "-100%" }, "<")
      .from(
        buttons,
        { autoAlpha: 0, duration: 0.6, stagger: staggerDefault },
        "<0.5"
      );

    return () => tl.kill(); // cleanup if media query changes
  });

  // animations that run on all screen sizes

  mm.add("(max-width: 767px)", () => {
    let tlBase = gsap.timeline({
      delay: 0.3,
      defaults: {
        ease: "vigore-ease",
        duration: 1.2,
      },
      onComplete: () => {
        ScrollTrigger.refresh();
      },
    });

    tlBase
      .set(hero, { autoAlpha: 1 })
      .to(
        lines,
        {
          y: 0,
          stagger: staggerDefault,
        },
        "<0.1"
      )
      .from(header, { y: "-100%" }, "<")
      .from(
        buttons,
        { autoAlpha: 0, duration: 0.6, stagger: staggerDefault },
        "<0.5"
      );

    return () => tlBase.kill(); // cleanup if media query changes
  });

  gsap.to(hero, {
    y: "-8em",
    z: "-24em",
    rotateX: "10deg",
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

function initTextScroll() {
  let targets = document.querySelectorAll('[data-reveal="scroll"]');

  targets.forEach((target) => {
    let lines = target.querySelectorAll(".single-line");
    gsap.to(lines, {
      y: 0,
      duration: durationDefault + 0.2,
      stagger: staggerDefault,
      scrollTrigger: {
        trigger: target,
        start: "top 90%",
        once: true,
      },
    });
  });
}

function initRevealScroll() {
  let targets = document.querySelectorAll('[data-item-reveal="scroll"]');
  targets.forEach((target) => {
    let startValue = target.getAttribute("data-item-start") || "90";

    gsap.from(target, {
      autoAlpha: 0,
      scrollTrigger: {
        trigger: target,
        start: `top ${startValue}%`,
        once: true,
      },
    });
  });
}

function initParallax() {
  let triggers = document.querySelectorAll('[data-parallax="trigger"]');

  triggers.forEach((trigger) => {
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
      { [property]: startValue },
      {
        [property]: endValue,
        ease: "none",
        scrollTrigger: {
          trigger: trigger,
          start: scrollStart,
          end: scrollEnd,
          // start: `clamp(${scrollStart})`,
          // end: `clamp(${scrollEnd})`,
          scrub: scrubValue,
        },
      }
    );
  });
}

function initTextRevealOpacity() {
  let targets = document.querySelectorAll('[text-effect="opacity"]');

  targets.forEach((target) => {
    let letters = target.querySelectorAll(".single-letter");
    gsap.from(letters, {
      opacity: 0.2,
      stagger: 1,
      ease: "none",
      scrollTrigger: {
        trigger: target,
        start: "top 95%",
        end: "bottom 50%",
        scrub: 0.3,
        once: true,
      },
    });
  });
}

function initDrawSvg() {
  const path = document.querySelector("#svg-circle");

  const pathLength = path.getTotalLength();

  gsap.set(path, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  });

  gsap.to(path, {
    strokeDashoffset: 0,
    duration: 1,
    ease: "vigore-ease",
    scrollTrigger: {
      trigger: path,
      start: "top 60%",
      once: true,
    },
  });
}

function initModalBasic() {
  const modals = document.querySelectorAll("[data-modal-name]");
  const modalTargets = document.querySelectorAll("[data-modal-target]");

  modalTargets.forEach((modalTarget) => {
    modalTarget.addEventListener("click", function () {
      const modalTargetName = this.getAttribute("data-modal-target");

      modalTargets.forEach((target) =>
        target.setAttribute("data-modal-status", "not-active")
      );
      modals.forEach((modal) =>
        modal.setAttribute("data-modal-status", "not-active")
      );

      document
        .querySelector(`[data-modal-target="${modalTargetName}"]`)
        .setAttribute("data-modal-status", "active");
      document
        .querySelector(`[data-modal-name="${modalTargetName}"]`)
        .setAttribute("data-modal-status", "active");
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((closeBtn) => {
    closeBtn.addEventListener("click", closeAllModals);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });

  function closeAllModals() {
    modalTargets.forEach((target) =>
      target.setAttribute("data-modal-status", "not-active")
    );
    modals.forEach((modal) =>
      modal.setAttribute("data-modal-status", "not-active")
    );
  }
}

function initCardsTooltip() {
  let cursorItem = document.querySelector(".cursor");
  let cursorParagraph = cursorItem.querySelector("p");
  let targets = document.querySelectorAll("[data-cursor]");
  let xOffset = 3;
  let yOffset = 75;
  let cursorIsOnRight = false;
  let currentTarget = null;
  let lastText = "";

  gsap.set(cursorItem, { xPercent: xOffset, yPercent: yOffset });

  let xTo = gsap.quickTo(cursorItem, "x", { ease: "power4" });
  let yTo = gsap.quickTo(cursorItem, "y", { ease: "power4" });

  const getCursorEdgeThreshold = () => {
    return cursorItem.offsetWidth + 16;
  };

  window.addEventListener("mousemove", (e) => {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let scrollY = window.scrollY;
    let cursorX = e.clientX;
    let cursorY = e.clientY + scrollY;

    let xPercent = xOffset;
    let yPercent = yOffset;

    let cursorEdgeThreshold = getCursorEdgeThreshold();
    if (cursorX > windowWidth - cursorEdgeThreshold) {
      cursorIsOnRight = true;
      xPercent = -100;
    } else {
      cursorIsOnRight = false;
    }

    if (cursorY > scrollY + windowHeight * 0.9) {
      yPercent = -120;
    }

    if (currentTarget) {
      let newText = currentTarget.getAttribute("data-cursor");
      if (newText !== lastText) {
        cursorParagraph.innerHTML = newText;
        lastText = newText;

        cursorEdgeThreshold = getCursorEdgeThreshold();
      }
    }

    gsap.to(cursorItem, {
      xPercent: xPercent,
      yPercent: yPercent,
      duration: 0.1,
      ease: "power3",
    });
    xTo(cursorX);
    yTo(cursorY - scrollY);
  });

  // Add a mouse enter listener for each link that has a data-cursor attribute
  targets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      currentTarget = target; // Set the current target

      let newText = target.getAttribute("data-cursor");

      // Update only if the text changes
      if (newText !== lastText) {
        cursorParagraph.innerHTML = newText;
        lastText = newText;

        // Recalculate edge awareness whenever the text changes
        let cursorEdgeThreshold = getCursorEdgeThreshold();
      }
    });
  });
}

function initMenu() {
  let navWrap = document.querySelector(".nav");
  let state = navWrap.getAttribute("data-nav");
  let overlay = navWrap.querySelector(".overlay");
  let menu = navWrap.querySelector(".menu");
  let bgPanels = navWrap.querySelectorAll(".bg-panel");
  let menuToggles = document.querySelectorAll("[data-menu-toggle]");
  let menuLinks = navWrap.querySelectorAll(".menu-link");
  let fadeTargets = navWrap.querySelectorAll("[data-menu-fade]");
  let menuButton = document.querySelector(".menu-button");
  let menuButtonTexts = menuButton.querySelectorAll("p");
  let menuButtonIcon = menuButton.querySelector(".menu-button-icon");

  let tl = gsap.timeline({
    defaults: { duration: 0.7, ease: "vigore-ease" },
  });

  const openNav = () => {
    navWrap.setAttribute("data-nav", "open");

    tl.clear()
      .set(navWrap, { display: "block" })
      .set(menu, { xPercent: 0 }, "<")
      .set(menuButton, { color: "var(--color-light)" })
      .fromTo(
        menuButtonTexts,
        { yPercent: 0 },
        { yPercent: -100, stagger: 0.2 }
      )
      .fromTo(menuButtonIcon, { rotate: 0 }, { rotate: 315 }, "<")
      .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
      .fromTo(
        bgPanels,
        { xPercent: 101 },
        { xPercent: 0, stagger: 0.12, duration: 0.575 },
        "<"
      )
      .fromTo(
        menuLinks,
        { yPercent: 140, rotate: 10 },
        { yPercent: 0, rotate: 0, stagger: 0.05 },
        "<+=0.35"
      )
      .fromTo(
        fadeTargets,
        { autoAlpha: 0, yPercent: 50 },
        { autoAlpha: 1, yPercent: 0, stagger: 0.04 },
        "<+=0.2"
      );
  };

  const closeNav = () => {
    navWrap.setAttribute("data-nav", "closed");

    tl.clear()
      .to(overlay, { autoAlpha: 0 }, "<")
      .to(menu, { xPercent: 120 }, "<")
      .to(menuButtonTexts, { yPercent: 0 }, "<")
      .to(menuButtonIcon, { rotate: 0 }, "<")
      .set(navWrap, { display: "none" });
  };

  // Toggle menu open / close depending on its current state
  menuToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      state = navWrap.getAttribute("data-nav");
      if (state === "open") {
        closeNav();
      } else {
        openNav();
      }
    });
  });

  // If menu is open, you can close it using the "escape" key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navWrap.getAttribute("data-nav") === "open") {
      closeNav();
    }
  });
}

function initHeadings() {
  let headings = document.querySelectorAll(".section-heading");

  headings.forEach((heading) => {
    let text = heading.querySelector(".section-heading__text");
    let tl = gsap.timeline({
      defaults: { duration: 0.5, ease: "vigore-ease" },
      scrollTrigger: {
        trigger: heading,
        start: "top 90%",
        once: true,
      },
    });

    tl.set(heading, { width: "0%" })
      .set(heading, { autoAlpha: 1 })
      .to(heading, { width: "auto" })
      .to(text, { opacity: 1 }, "<0.3");
  });
}

function initCards() {
  let cards = document.querySelectorAll(".lineup-card");
  let section = document.querySelector("[section-cards]");

  let mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 70%",
        once: true,
        scrub: 1,
      },
    });

    tl.from(cards, {
      x: "90%",
      y: "30%",
      stagger: 0.025,
      ease: "power4.inOut",
    });
  });
}

function initSteps() {
  let steps = document.querySelectorAll("[data-step]");

  steps.forEach((step, index) => {
    let title = step.querySelector(".cel-title__wrap");
    let bg = step.querySelector(".step-bg");
    let text = step.querySelectorAll(".single-line");

    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      gsap.from(step, {
        opacity: 0,
        xPercent: -100 * (index + 1),
        stagger: 0.4,
        duration: 1.8,
        ease: "vigore-ease",
        scrollTrigger: {
          trigger: step,
          start: "top 75%",
          once: true,
        },
      });
    });

    let tl = gsap.timeline({
      defaults: { ease: "vigore-ease", overwrite: true },
      paused: true,
    });

    tl.to(bg, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0 100%)",
      duration: 1,
    })
      .to(title, { yPercent: -75, duration: 0.8 }, "<")
      .to(text, { y: 0, stagger: staggerDefault, duration: 0.8 }, "<");

    step.addEventListener("mouseenter", () => {
      tl.timeScale(1).play(); // normal speed forward
    });

    step.addEventListener("mouseleave", () => {
      tl.timeScale(1.4).reverse(); // normal speed forward
    });
  });
}
//-------------------------------------------------------//
//----------------------- Inits ----------------------- //
//-------------------------------------------------------//

document.addEventListener("DOMContentLoaded", () => {
  initLenis();
  initCurrentYear();
  initSplit();
  initLoad();
  initTextScroll();
  initRevealScroll();
  initParallax();
  initTextRevealOpacity();
  initSteps();
  initDrawSvg();
  initModalBasic();
  initCardsTooltip();
  initMenu();
  initHeadings();
  initCards();
});
