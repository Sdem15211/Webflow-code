gsap.registerPlugin(ScrollTrigger, CustomEase);

let lenis;
let staggerDefault = 0.08;
let durationDefault = 0.8;

CustomEase.create("simon-ease", "0.5, 0.05, 0, 1");

gsap.defaults({
  ease: "simon-ease",
  duration: durationDefault,
});

gsap.config({ nullTargetWarn: false });

let isMobile = window.innerWidth < 480;
let isMobileLandscape = window.innerWidth < 768;
let isTablet = window.innerWidth < 992;

function initLenis() {
  lenis = new Lenis();

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
      // if (target.hasAttribute("split-ran")) return;
      return new SplitType(target, {
        types: "words,chars",
        charClass: "single-letter",
        wordClass: "single-word",
        tagName: "span",
      });
    });

    splitTextLetters.forEach((instance) => {
      if (instance) {
        // instance.elements[0].setAttribute("split-ran", "true");
        if (instance.elements[0].hasAttribute("data-letters-delay")) {
          instance.chars.forEach((letter, index) => {
            let delay = index / 150 + "s";
            letter.style.setProperty("transition-delay", delay);
          });
        }
      }
    });
  }

  splitText();

  // Add a debounced resize event listener
  let resizeTimeout;
  window.addEventListener("resize", () => {
    // Only run on non-mobile devices (width > 991px)
    if (window.innerWidth > 991) {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        splitText();
        initTextScroll();
        // initLoad();
      }, 300);
    }
  });
}

function initHeadings() {
  let headings = document.querySelectorAll(".heading");

  headings.forEach((heading) => {
    let text = heading.querySelector("h2");
    let line = heading.querySelector(".heading__line");

    let wrapper = document.createElement("div");
    wrapper.classList.add("single-line-wrap");
    text.parentNode.insertBefore(wrapper, text);
    wrapper.appendChild(text);

    gsap.set(text, {
      y: "120%",
    });

    let headingTl = gsap.timeline({
      defaults: {
        ease: "simon-ease",
        duration: 1,
      },
      scrollTrigger: {
        trigger: heading,
        start: "top 90%",
      },
    });

    headingTl
      .to(text, {
        y: 0,
      })
      .from(
        line,
        {
          scaleX: 0,
          opacity: 0,
        },
        "<0.4"
      );
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
          scrub: scrubValue,
        },
      }
    );
  });
}

function initExpertise() {
  let section = document.querySelector("[section-expertise]");

  let headings = section.querySelectorAll(".expertise-heading");

  headings.forEach((heading) => {
    gsap.from(heading, {
      opacity: 0,
      ease: "simon-ease",
      scrollTrigger: {
        trigger: heading,
        start: "top 90%",
        once: true,
      },
    });
  });

  let expertiseRows = section.querySelectorAll(".expertise-row");
  expertiseRows.forEach((row) => {
    let heading = row.querySelector(".expertise-subheading");
    let headingLine = heading.querySelector(".single-line");
    let description = row.querySelector(".expertise-desc");
    let descriptionLines = description.querySelectorAll(".single-line");
    let line = row.querySelector(".divider");

    gsap.set(line, { scaleX: 0 });

    let tl = gsap.timeline({
      defaults: {
        ease: "simon-ease",
        duration: 0.8,
      },
      scrollTrigger: {
        trigger: row,
        start: "top 90%",
        once: true,
      },
    });

    tl.to(headingLine, {
      y: 0,
    })
      .to(
        descriptionLines,
        {
          y: 0,
          stagger: 0.025,
        },
        "<"
      )
      .to(
        line,
        {
          scaleX: 1,
        },
        "<0.1"
      );
  });

  let expertiseCta = section.querySelector(".expertise-cta");
  let divider = expertiseCta.querySelector(".divider-gradient");
  let ctaText = expertiseCta.querySelectorAll(".single-line");
  let ctaButton = expertiseCta.querySelector(".btn-group");

  gsap.set(divider, { scaleX: 0 });
  gsap.set(ctaButton, { autoAlpha: 0 });
  let tl = gsap.timeline({
    defaults: {
      ease: "simon-ease",
      duration: 0.8,
    },
    scrollTrigger: {
      trigger: expertiseCta,
      start: "top 90%",
      once: true,
    },
  });

  tl.to(ctaText, {
    y: 0,
    stagger: 0.025,
  })
    .to(divider, { scaleX: 1 }, "<0.1")
    .to(ctaButton, { autoAlpha: 1 }, "<0.1");
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
  initTextScroll();
  initHeadings();
  initExpertise();
  // initLoad();
  // initRevealScroll();
  initParallax();
  // initCardsTooltip();
  // initMenu();
});
