// Wait for DOM and GSAP to be ready
(function() {
  // Preload images utility function
  const preloadImages = (selector = 'img') => {
    return new Promise((resolve) => {
      if (typeof imagesLoaded === 'undefined') {
        resolve();
        return;
      }
      imagesLoaded(document.querySelectorAll(selector), {background: true}, resolve);
    });
  };

  // Manual text splitting - replaces SplitText
  const splitTextIntoChars = (element) => {
    if (!element) return null;
    
    const text = element.textContent.trim();
    const chars = [];
    
    // Clear and wrap each character in a span
    element.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        element.appendChild(document.createTextNode(' '));
      } else {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        span.style.display = 'inline-block';
        element.appendChild(span);
        chars.push(span);
      }
    }
    
    return { chars: chars };
  };

  // Initialize when everything is ready
  const initScrollAnimations = () => {
    // Check if GSAP and plugins are available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initScrollAnimations, 200);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Find the first scroll-grid-section that contains a grid
    const scrollSections = document.querySelectorAll('.scroll-grid-section');
    if (!scrollSections.length) {
      return;
    }

    // Get the first section with the grid
    const firstSection = scrollSections[0];
    const grid = firstSection.querySelector('.grid');
    if (!grid) {
      return;
    }

    const gridImages = grid.querySelectorAll('.grid__item-imgwrap');
    const marqueeInner = firstSection.querySelector('.mark > .mark__inner');
    
    // Get text element from second section
    const textSection = scrollSections[1];
    const textElement = textSection ? textSection.querySelector('.text') : null;
    
    // Get full grid from third section
    const gridFullSection = scrollSections[2];
    const gridFull = gridFullSection ? gridFullSection.querySelector('.grid--full') : null;

    // Split text manually instead of using SplitText
    let splitTextEl = null;
    if (textElement) {
      splitTextEl = splitTextIntoChars(textElement);
    }

    const isLeftSide = (element) => {
      const elementCenter = element.getBoundingClientRect().left + element.offsetWidth / 2;
      const viewportCenter = window.innerWidth / 2;
      return elementCenter < viewportCenter;
    };

    const animateScrollGrid = () => {
      if (!gridImages.length) return;
      gridImages.forEach(imageWrap => {
        const imgEl = imageWrap.querySelector('.grid__item-img');
        const leftSide = isLeftSide(imageWrap);

        gsap.timeline({
          scrollTrigger: {
            trigger: imageWrap,
            start: 'top bottom+=10%',
            end: 'bottom top-=25%',
            scrub: true,
          }
        })
        .from(imageWrap, {
          startAt: { filter: 'blur(0px) brightness(100%) contrast(100%)' },
          z: 300,
          rotateX: 70,
          rotateZ: leftSide ? 5 : -5,
          xPercent: leftSide ? -40 : 40,
          skewX: leftSide ? -20 : 20,
          yPercent: 100,
          filter: 'blur(7px) brightness(0%) contrast(400%)',
          ease: 'sine',
        })
        .to(imageWrap, {
          z: 300,
          rotateX: -50,
          rotateZ: leftSide ? -1 : 1,
          xPercent: leftSide ? -20 : 20,
          skewX: leftSide ? 10 : -10,
          filter: 'blur(4px) brightness(0%) contrast(500%)',
          ease: 'sine.in',
        })
        .from(imgEl, {
          scaleY: 1.8,
          ease: 'sine',
        }, 0)
        .to(imgEl, {
          scaleY: 1.8,
          ease: 'sine.in'
        }, '>');
      });
    };

    const animateMarquee = () => {
      if (!marqueeInner || !grid) return;
      gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      })
      .fromTo(marqueeInner, {
        x: '100vw'
      }, {
        x: '-100%',
        ease: 'sine',
      });
    };

    const animateTextElement = () => {
      if (!textElement || !splitTextEl || !splitTextEl.chars || !splitTextEl.chars.length) return;
      
      // Set all characters to red
      splitTextEl.chars.forEach(char => {
        char.style.color = '#dc2626';
      });
      
      gsap.timeline({
        scrollTrigger: {
          trigger: textElement,
          start: 'top bottom',
          end: 'center center-=25%',
          scrub: true,
        }
      })
      .from(splitTextEl.chars, {
        ease: 'sine',
        yPercent: 300,
        autoAlpha: 0,
        color: '#dc2626',
        stagger: {
          each: 0.04,
          from: 'center'
        }
      })
      .set(splitTextEl.chars, {
        color: '#dc2626'
      });
    };

    const animateGridFull = () => {
      if (!gridFull) return;
      const gridFullItems = gridFull.querySelectorAll('.grid__item');
      
      const numColumns = getComputedStyle(gridFull).getPropertyValue('grid-template-columns').split(' ').length;
      const middleColumnIndex = Math.floor(numColumns / 2);

      const columns = Array.from({ length: numColumns }, () => []);
      gridFullItems.forEach((item, index) => {
        const columnIndex = index % numColumns;
        columns[columnIndex].push(item);
      });

      columns.forEach((columnItems, columnIndex) => {
        const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.2;

        gsap.timeline({
          scrollTrigger: {
            trigger: gridFull,
            start: 'top bottom',
            end: 'center center',
            scrub: true,
          }
        })
        .from(columnItems, {
          yPercent: 450,
          autoAlpha: 0,
          delay: delayFactor,
          ease: 'sine',
        })
        .from(columnItems.map(item => item.querySelector('.grid__item-img')), {
          transformOrigin: '50% 0%',
          ease: 'sine',
        }, 0);
      });
    };

    const init = () => {
      animateScrollGrid();
      animateMarquee();
      if (splitTextEl && splitTextEl.chars && splitTextEl.chars.length) animateTextElement();
      if (gridFull) animateGridFull();
      
      // Refresh ScrollTrigger after initialization
      setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 100);
    };

    // Preload images and initialize
    preloadImages('.scroll-grid-section .grid__item-img').then(() => {
      init();
    }).catch(() => {
      init();
    });
  };

  // Wait for GSAP and DOM to be ready
  const waitForGSAP = () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      initScrollAnimations();
    } else {
      setTimeout(waitForGSAP, 100);
    }
  };

  // Wait for DOM first
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(waitForGSAP, 100);
    });
  } else {
    setTimeout(waitForGSAP, 100);
  }
})();
