gsap.registerPlugin(ScrollTrigger, CustomEase);

let lenis;
let staggerDefault = 0.08;
let durationDefault = 0.8;

CustomEase.create("simon-ease", "0.5, 0.05, 0, 1");

gsap.defaults({
  ease: "simon-ease",
  duration: durationDefault,
  overwrite: "auto",
});

gsap.config({ nullTargetWarn: false });

function initLenis() {
  lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  function initScrollToAnchorLenis() {
    document.querySelectorAll("[data-anchor-target]").forEach((element) => {
      element.addEventListener("click", function () {
        const targetScrollToAnchorLenis =
          this.getAttribute("data-anchor-target");

        lenis.scrollTo(targetScrollToAnchorLenis, {
          easing: (x) =>
            x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
          duration: 1.2,
          offset: 100, // Option to create an offset when there is a fixed navigation for example
        });
      });
    });
  }
  initScrollToAnchorLenis();
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

function initBrusselsTime() {
  const updateTime = () => {
    const brusselsTime = new Date().toLocaleTimeString("en-US", {
      timeZone: "Europe/Brussels",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });

    const timeElements = document.querySelectorAll("[data-time]");
    if (timeElements.length > 0) {
      timeElements.forEach((timeElement) => {
        timeElement.textContent = brusselsTime;
      });
    }
  };

  // Update immediately
  updateTime();

  // Update every minute
  setInterval(updateTime, 60000);
}

function initSplit() {
  // Initialize SplitType after the entire window has loaded
  const lineTargets = document.querySelectorAll('[data-split="lines"]');
  const letterTargets = document.querySelectorAll('[data-split="letters"]');
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

    // Split Lines
    splitTextLines = new SplitType(lineTargets, {
      types: "lines",
      lineClass: "single-line",
    });

    splitTextLines.lines.forEach((line) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("single-line-wrap");

      const parent = line.closest('[data-split="lines"]');
      const computedStyles = window.getComputedStyle(parent);

      if (
        computedStyles.webkitBackgroundClip === "text" ||
        computedStyles.backgroundClip === "text"
      ) {
        const bg = computedStyles.background;
        line.style.background = bg;
        line.style.backgroundClip = "text";
        line.style.webkitBackgroundClip = "text";
        line.style.color = "transparent";
      }

      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    // Split Letters
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

  splitText();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    if (window.innerWidth > 991) {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        splitText();
        initRevealScroll();
        initRevealOpacity();
        initFaq();
        initExpertise();
        initHeroLoad();
      }, 300);
    }
  });
}

function initLenisCheckScrollUpDown() {
  // Only initialize scroll checking if Lenis is active
  if (!lenis) return;

  var lastScrollTop = 0;
  var threshold = 50;
  var thresholdTop = 50;

  var scrollHandler = function (e) {
    var nowScrollTop = e.targetScroll;

    if (Math.abs(lastScrollTop - nowScrollTop) >= threshold) {
      // Check Scroll Direction
      if (nowScrollTop > lastScrollTop) {
        document.body.setAttribute("data-scrolling-direction", "down");
      } else {
        document.body.setAttribute("data-scrolling-direction", "up");
      }
      lastScrollTop = nowScrollTop;

      // Check if Scroll Started
      if (nowScrollTop > thresholdTop) {
        document.body.setAttribute("data-scrolling-started", "true");
      } else {
        document.body.setAttribute("data-scrolling-started", "false");
      }
    }
  };

  function startCheckScroll() {
    lenis.on("scroll", scrollHandler);
  }

  startCheckScroll();
}

function initLoader() {
  if (sessionStorage.getItem("visited")) {
    let loader = document.querySelector(".loader");
    if (loader) {
      loader.style.display = "none";
    }
    let bgImage = document.querySelector("[data-hero='img']");
    if (bgImage) {
      gsap.set(bgImage, { filter: "blur(0px)", scale: 1 });
    }
    return;
  }

  sessionStorage.setItem("visited", "true");

  let loader = document.querySelector(".loader");
  let loaderLeft = loader.querySelector(".loader-inner.is--left");
  let loaderRight = loader.querySelector(".loader-inner.is--right");
  let bgImage = document.querySelector("[data-hero='img']");

  let loaderTl = gsap.timeline({
    defaults: {
      ease: "simon-ease",
      duration: 1,
    },
  });

  loaderTl
    .set(bgImage, { filter: "blur(15px)", scale: 1.2 })
    .set(loader, { display: "flex" })
    .set(loaderLeft, { y: "50%" })
    .set(loaderRight, { y: "33%" })
    .to(loaderLeft, { y: "0%" })
    .to(loaderRight, { y: "0%" }, "<0.1")
    .to(loaderLeft, { y: "-50%" }, ">")
    .to(loaderRight, { y: "-33%" }, "<0.1")
    .to(loaderRight, { y: "-67%" }, ">")
    .to(loaderLeft, { y: "-100%" }, ">")
    .to(loaderRight, { y: "-100%" }, "<0.1")
    .to(
      bgImage,
      { filter: "blur(0px)", scale: 1, duration: 2.5, ease: "simon-ease" },
      "<0.1"
    );
}

function initHeroLoad() {
  let hero = document.querySelector(".container.is--hero");
  let nav = document.querySelector("[hero-nav]");
  let navItems = nav.querySelectorAll("[data-nav-reveal]");
  let heading = hero.querySelector(".hero-heading");
  let headingLines = heading.querySelectorAll(".hero-h-line");
  let subheading = hero.querySelector(".hero-subheading__text-wrapper");
  let subheadingLines = subheading.querySelectorAll(".single-line");
  let button = hero.querySelector("[data-hero-button]");
  let eyebrow = hero.querySelector("[data-hero-eyebrow]");

  let heroTl = gsap.timeline({
    defaults: {
      ease: "simon-ease",
      duration: 1.2,
    },
    delay: sessionStorage.getItem("visited") ? 0 : 4,
  });

  heroTl
    .set(nav, { display: "block" })
    .set(hero, { display: "block" })
    .fromTo(
      headingLines,
      { y: "120%" },
      { y: 0, autoAlpha: 1, stagger: 0.075 },
      "<0"
    )
    .to(subheadingLines, { y: 0, autoAlpha: 1, stagger: 0.075 }, "<0.5")
    .from(button, { autoAlpha: 0 }, "<0.1")
    .from(eyebrow, { autoAlpha: 0 }, "<")
    .fromTo(navItems, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.05 }, "<");
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

function initMobileMenu() {
  let menu = document.querySelector(".nav-menu");
  if (!menu) return;
  let navFadeTargets = document.querySelectorAll("[data-fade-target]");
  let menuFadeTargets = menu.querySelectorAll("[data-menu-reveal]");
  let menuLinks = menu.querySelectorAll(".nav-menu-link__wrapper");
  let menuButton = document.querySelector(".menu-button");
  let menuBg = document.querySelector(".menu-bg");
  let menuBtnInner = menuButton.querySelector(".menu-button__inner");
  let contactMobile = document.querySelector(".nav-contact__mobile");
  let menuOpen = false;

  let tl = gsap.timeline();

  const openMenu = () => {
    menuOpen = true;

    tl.clear()
      .set([menu, menuBg], { display: "block" })
      .fromTo(menuBg, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
      .to(menuBtnInner, { translateY: "-50%" }, "<")
      .fromTo(
        navFadeTargets,
        { autoAlpha: 1, y: "0em" },
        { autoAlpha: 0, y: "-3em", stagger: 0.01 },
        "<"
      )
      .fromTo(menu, { yPercent: -120 }, { yPercent: 0 }, "<0.1")
      .fromTo(
        menuFadeTargets,
        { autoAlpha: 0, yPercent: 50 },
        { autoAlpha: 1, yPercent: 0, stagger: 0.05 },
        "<0.1"
      );
  };

  const closeMenu = () => {
    menuOpen = false;

    tl.clear()
      .to(menu, { yPercent: -120 })
      .to(menuBtnInner, { translateY: "0%" }, "<")
      .to(menuBg, { autoAlpha: 0 }, "<")
      .to(
        navFadeTargets,
        { autoAlpha: 1, y: "0em", stagger: { each: 0.05, from: "end" } },
        "<0.1"
      )
      .set(menu, { display: "none" });
  };

  menuButton.addEventListener("click", () => {
    menuOpen ? closeMenu() : openMenu();
  });

  menuBg.addEventListener("click", () => {
    closeMenu();
  });

  let mm = gsap.matchMedia();

  mm.add("(max-width: 767px)", () => {
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    contactMobile.addEventListener("click", () => {
      closeMenu();
    });
  });
}
initMobileMenu();

function initRevealScroll() {
  let targets = document.querySelectorAll('[data-reveal="scroll"]');

  if (!targets.length) return; // Exit if no targets found

  targets.forEach((target) => {
    let lines = target.querySelectorAll(".single-line");
    if (!lines.length) return; // Skip if no lines found in this target

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

function initRevealOpacity() {
  let targets = document.querySelectorAll('[data-reveal="opacity"]');
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
        start: "top 80%",
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

    tl.from(row, { y: 80 })
      .to(
        headingLine,
        {
          y: 0,
        },
        "<0.1"
      )
      .to(
        descriptionLines,
        {
          y: 0,
          stagger: 0.075,
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

function initBento() {
  let section = document.querySelector(".bento-grid");

  requestAnimationFrame(() => {
    // performance
    let performanceImg = section.querySelector(".performance-card__visual");

    gsap.fromTo(
      performanceImg,
      { translateX: 35 },
      {
        translateX: 0,
        ease: "none",
        scrollTrigger: {
          trigger: performanceImg,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.3,
        },
      }
    );
    // conversion
    let conversionCard = section.querySelector(".grid-card.conversion");
    let bars = conversionCard.querySelectorAll(".bar");

    gsap.set(bars, {
      transformOrigin: "bottom",
    });

    gsap.from(bars, {
      scaleY: 0,
      ease: "simon-ease",
      duration: 1.2,
      stagger: 0.1,
      scrollTrigger: {
        trigger: conversionCard,
        start: "top 95%", // Adjusted start for mobile
        once: true,
      },
    });

    const line = conversionCard.querySelector(".arrowline");
    const arrowhead = conversionCard.querySelector(".arrowhead");
    const pathLength = line.getTotalLength();

    gsap.set(line, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength - 2,
    });

    gsap.set(arrowhead, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" });

    gsap.to(line, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: conversionCard,
        start: "top 85%", // Adjusted start for mobile
        once: true,
      },
      onComplete: () => {
        gsap.to(arrowhead, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.5)",
        });
      },
    });
  });
}

function initWorks() {
  let section = document.querySelector("[section-works]");
  let works = section.querySelectorAll(".work-base");
  let cursorItem = section.querySelector(".cursor");

  let mm = gsap.matchMedia();

  mm.add("(min-width: 992px)", () => {
    let xOffset = 4;
    let yOffset = 50;
    let cursorIsOnRight = false;

    gsap.set(cursorItem, { xPercent: xOffset, yPercent: yOffset });

    let xTo = gsap.quickTo(cursorItem, "x", { ease: "power3" });
    let yTo = gsap.quickTo(cursorItem, "y", { ease: "power3" });

    const getCursorEdgeThreshold = () => {
      return cursorItem.offsetWidth + 16;
    };

    window.addEventListener("mousemove", (e) => {
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let scrollY = window.scrollY;
      let cursorX = e.clientX;
      let cursorY = e.clientY + scrollY; // Adjust cursorY to account for scroll

      // Default offsets
      let xPercent = xOffset;
      let yPercent = yOffset;

      // Adjust X offset dynamically based on cursor width
      let cursorEdgeThreshold = getCursorEdgeThreshold();
      if (cursorX > windowWidth - cursorEdgeThreshold) {
        cursorIsOnRight = true;
        xPercent = -100;
      } else {
        cursorIsOnRight = false;
      }

      // Adjust Y offset if in the bottom 10% of the current viewport
      if (cursorY > scrollY + windowHeight * 0.9) {
        yPercent = -120;
      }

      gsap.to(cursorItem, {
        xPercent: xPercent,
        yPercent: yPercent,
        duration: 0.9,
        ease: "power3",
      });
      xTo(cursorX);
      yTo(cursorY - scrollY);
    });

    works.forEach((work) => {
      let image = work.querySelector(".work-img");
      let overlay = work.querySelector(".work-overlay");
      let videoWrapper = work.querySelector(".work-video__wrapper");
      let video = work.querySelector(".work-video__video");

      work.addEventListener("mouseenter", () => {
        gsap.to(overlay, {
          opacity: 0.2,
          ease: "power4.out",
        });
        gsap.to(videoWrapper, { autoAlpha: 1, ease: "power4.out" });
        gsap.to(image, {
          filter: "blur(15px)",
          opacity: 0.75,
          ease: "power4.out",
        });
        video.play();
      });

      work.addEventListener("mouseleave", () => {
        gsap.to(overlay, { autoAlpha: 0, ease: "power4.out" });
        gsap.to(videoWrapper, {
          autoAlpha: 0,
          ease: "power4.out",
          duration: 0.4,
        });
        gsap.to(image, { filter: "blur(0px)", opacity: 1, ease: "power4.out" });
        setTimeout(() => {
          video.pause();
          video.currentTime = 0;
        }, 200);
      });
    });
  });

  mm.add("(max-width: 991px)", () => {
    works.forEach((work) => {
      let video = work.querySelector(".work-video__video");
      gsap.to(video, {
        scrollTrigger: {
          trigger: work,
          start: "top 90%", // Adjust to when you want it to start playing
          end: "bottom 10%", // Adjust to when you want it to pause
          onEnter: () => video.play(),
          onLeave: () =>
            setTimeout(() => {
              video.pause();
              video.currentTime = 0;
            }, 200),
          onEnterBack: () => video.play(),
          onLeaveBack: () =>
            setTimeout(() => {
              video.pause();
              video.currentTime = 0;
            }, 200),
        },
      });
    });
  });
}

function initTimeline() {
  requestAnimationFrame(() => {
    let wrappers = document.querySelectorAll('[data-process="wrapper"]');

    wrappers.forEach((wrapper) => {
      let contentWrap = wrapper.querySelector('[data-process="content-wrap"]');
      let contentItems = contentWrap.querySelectorAll(
        '[data-process="content-item"]'
      );
      let timeline = wrapper.querySelector('[data-process="timeline"]');
      let buttons = timeline.querySelectorAll('[data-process="button"]');
      let progressBar = timeline.querySelector('[data-process="progress-bar"]');

      // Define progress values for different breakpoints
      const progressValues = {
        desktop: [2.5, 42.5, 82.5, 97.5], // >= 992px
        tablet: [3.5, 43.5, 83.5, 96.5], // >= 569px
        mobileLandscape: [8, 49, 80, 92], // <= 568px
        mobile: [10, 50, 80, 92], // <= 479px
      };

      let activeButton = buttons[0];
      let activeContent = contentItems[0];
      let isAnimating = false;

      function animateTimelineEntrance() {
        const processTimeline = wrapper.querySelector(".process-timeline");
        const timelineItems = wrapper.querySelectorAll(
          ".process-timeline__item"
        );

        // Set initial states
        gsap.set(processTimeline, { autoAlpha: 0 });
        timelineItems.forEach((item, i) => {
          const point = item.querySelector(".process-timeline__item-point");
          const line = item.querySelector(".process-timeline__item-line");
          const button = item.querySelector('[data-process="button"]');

          gsap.set(point, { autoAlpha: 0, scale: 0 });
          gsap.set(line, {
            scaleY: 0,
            transformOrigin: i % 2 === 0 ? "bottom center" : "top center",
          });
          gsap.set(button, { autoAlpha: 0, scale: 0.8 });
        });

        const entranceTl = gsap.timeline({
          defaults: { ease: "power2.out" },
        });

        // Fade in timeline container
        entranceTl.to(processTimeline, {
          autoAlpha: 1,
          duration: 0.2,
        });

        // Collect all elements for staggered animation
        const points = [...timelineItems].map((item) =>
          item.querySelector(".process-timeline__item-point")
        );
        const lines = [...timelineItems].map((item) =>
          item.querySelector(".process-timeline__item-line")
        );
        const buttons = [...timelineItems].map((item) =>
          item.querySelector('[data-process="button"]')
        );

        // Animate all elements with stagger
        entranceTl
          .to(
            points,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.3,
              stagger: 0.1,
            },
            0
          )
          .to(
            lines,
            {
              scaleY: 1,
              duration: 0.3,
              stagger: 0.1,
            },
            0.1
          )
          .to(
            buttons,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.3,
              stagger: 0.1,
            },
            0.2
          );

        return entranceTl;
      }

      // Function to get progress values based on screen width
      function getProgressValue(index) {
        const width = window.innerWidth;
        if (width >= 992) {
          return progressValues.desktop[index];
        } else if (width >= 569) {
          return progressValues.tablet[index];
        } else if (width <= 479) {
          return progressValues.mobile[index];
        } else {
          return progressValues.mobileLandscape[index];
        }
      }

      function updateTimelineElements(button, isActive) {
        const itemContainer = button.closest(".process-timeline__item");
        if (itemContainer) {
          const line = itemContainer.querySelector(
            ".process-timeline__item-line"
          );
          const point = itemContainer.querySelector(
            ".process-timeline__item-point"
          );

          if (isActive) {
            line?.classList.add("active");
            point?.classList.add("active");
          } else {
            line?.classList.remove("active");
            point?.classList.remove("active");
          }
        }
      }

      function switchPhase(index, initial = false) {
        if (!initial && (isAnimating || buttons[index] === activeButton))
          return;
        isAnimating = true;

        const outgoingContent = activeContent;
        const incomingContent = contentItems[index];

        let outgoingTitle =
          outgoingContent.querySelector('[data-process="fade"]') || [];
        let outgoingLines = outgoingContent.querySelectorAll(".single-line");

        let incomingTitle = incomingContent.querySelector(
          '[data-process="fade"]'
        );
        let incomingLines = incomingContent.querySelectorAll(".single-line");
        const timeline = gsap.timeline({
          defaults: {
            ease: "simon-ease",
          },
          onComplete: () => {
            if (!initial) {
              outgoingContent && outgoingContent.classList.remove("active");
            }
            activeContent = incomingContent;
            isAnimating = false;
          },
        });

        incomingContent.classList.add("active");

        if (initial) {
          timeline
            .to(progressBar, {
              width: getProgressValue(index) + "%",
              duration: 0.8,
              ease: "power3.out",
            })
            .to(
              incomingTitle,
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.8,
                ease: "power3.out",
              },
              "<0.1"
            )
            .to(
              incomingLines,
              {
                y: 0,
                autoAlpha: 1,
                stagger: 0.075,
                duration: 0.8,
                ease: "power3.out",
              },
              "<"
            );
        } else {
          timeline
            .to(
              outgoingLines,
              { y: "-2em", duration: 0.8, ease: "power3.out" },
              0
            )
            .to(
              outgoingTitle,
              { y: "-2em", autoAlpha: 0, duration: 0.8, ease: "power3.out" },
              0
            )
            .to(
              progressBar,
              {
                width: getProgressValue(index) + "%",
                duration: 0.8,
                ease: "power3.out",
              },
              0
            )
            .fromTo(
              incomingLines,
              {
                y: "2em",
                duration: 0.8,
                ease: "power3.out",
              },
              {
                y: 0,
                stagger: 0.075,
                duration: 0.8,
                ease: "power3.out",
              },
              0.4
            )
            .fromTo(
              incomingTitle,
              { y: "2em", autoAlpha: 0, duration: 0.8, ease: "power3.out" },
              { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" },
              0.4
            );
        }

        // Remove active class from previous button and its siblings
        if (activeButton) {
          activeButton.classList.remove("active");
          updateTimelineElements(activeButton, false);
        }

        // Add active class to new button and its siblings
        buttons[index].classList.add("active");
        updateTimelineElements(buttons[index], true);

        activeButton = buttons[index];
      }

      // Set initial progress bar width
      gsap.set(progressBar, {
        width: getProgressValue(0) + "%",
      });

      // Set initial active states for the first button's siblings
      updateTimelineElements(buttons[0], true);

      // Set initial state of first content
      const firstContent = contentItems[0];
      const firstTitle = firstContent.querySelector('[data-process="fade"]');
      const firstLines = firstContent.querySelectorAll(".single-line");
      gsap.set(firstTitle, { autoAlpha: 0, y: 0 });
      gsap.set(firstLines, { autoAlpha: 0, y: 0 });

      // Initialize timeline when section comes into view
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top 80%",
        once: true,
        onEnter: () => {
          // Start both animations immediately
          animateTimelineEntrance();
          switchPhase(0, true);
        },
      });

      buttons.forEach((button, i) => {
        button.addEventListener("click", () => switchPhase(i));
      });

      contentItems[0].classList.add("active");
      buttons[0].classList.add("active");

      // Handle resize events
      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          // Update progress bar width based on current screen size and active button
          const currentIndex = Array.from(buttons).indexOf(activeButton);
          gsap.to(progressBar, {
            width: getProgressValue(currentIndex) + "%",
            duration: 0.4,
            ease: "power3.out",
          });
        }, 250);
      });
    });
  });
}

function initFaq() {
  let faqItems = document.querySelectorAll(".accordion-css__item");

  faqItems.forEach((item) => {
    let title = item.querySelector(".single-line");
    let icon = item.querySelector(".accordion-css__item-icon");
    let divider = item.querySelector(".faq-divider");

    gsap.set(divider, { transformOrigin: "left center" });

    let tl = gsap.timeline({
      defaults: {
        ease: "simon-ease",
        duration: 0.8,
      },
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
        once: true,
      },
    });

    tl.to(title, {
      y: 0,
    })
      .from(
        icon,
        {
          autoAlpha: 0,
        },
        "<"
      )
      .from(
        divider,
        {
          scaleX: 0,
        },
        "<"
      );
  });

  document
    .querySelectorAll("[data-accordion-css-init]")
    .forEach((accordion) => {
      const closeSiblings =
        accordion.getAttribute("data-accordion-close-siblings") === "true";

      accordion.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle) return; // Exit if the clicked element is not a toggle

        const singleAccordion = toggle.closest("[data-accordion-status]");
        if (!singleAccordion) return; // Exit if no accordion container is found

        const isActive =
          singleAccordion.getAttribute("data-accordion-status") === "active";
        singleAccordion.setAttribute(
          "data-accordion-status",
          isActive ? "not-active" : "active"
        );

        // When [data-accordion-close-siblings="true"]
        if (closeSiblings && !isActive) {
          accordion
            .querySelectorAll('[data-accordion-status="active"]')
            .forEach((sibling) => {
              if (sibling !== singleAccordion)
                sibling.setAttribute("data-accordion-status", "not-active");
            });
        }
      });
    });
}

function initHero() {
  let hero = document.querySelector("[data-section='hero']");
  if (!hero) return; // Safety check for hero section

  let heroImage = hero.querySelector("[data-hero='img']");
  if (!heroImage) return; // Safety check for hero image

  gsap.to(heroImage, {
    translateY: "150",
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: 0.2,
    },
  });
}

//-------------------------------------------------------//
//----------------------- Inits ----------------------- //
//-------------------------------------------------------//

document.addEventListener("DOMContentLoaded", () => {
  initLenis();
  initCurrentYear();
  initBrusselsTime();
  initParallax();
  initSplit();
  initLenisCheckScrollUpDown();
  initHeroLoad();
  initLoader();
  initHero();
  initRevealScroll();
  initRevealOpacity();
  initHeadings();
  initExpertise();
  initBento();
  initWorks();
  initTimeline();
  initFaq();
  ScrollTrigger.refresh();
});
