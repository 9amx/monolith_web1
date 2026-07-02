/* ============================================
   COOL ANIMATIONS & EFFECTS (JS)
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {

  // Check if it's a touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ============================================
  // 1. CUSTOM CURSOR & FOLLOWER
  // ============================================
  if (!isTouchDevice) {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    const follower = document.createElement('div');
    follower.classList.add('custom-cursor-follower');
    document.body.appendChild(follower);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let followerX = mouseX;
    let followerY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function renderCursor() {
      // Direct fast follow for main dot
      cursorX += (mouseX - cursorX) * 0.5;
      cursorY += (mouseY - cursorY) * 0.5;
      
      // Smooth delayed follow for the outer ring
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;

      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      follower.style.transform = `translate(${followerX}px, ${followerY}px)`;

      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover effects on links and buttons
    const hoverElements = document.querySelectorAll('a, button, .faq__question, .works__tab');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        follower.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        follower.classList.remove('hovering');
      });
    });
  }

  // ============================================
  // 2. SCROLL PROGRESS BAR
  // ============================================
  const progressBar = document.getElementById('scrollProgress') || document.querySelector('.scroll-progress');

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    if (progressBar) progressBar.style.width = `${scrollPercent}%`;
  });

  // ============================================
  // 3. MAGNETIC BUTTONS & LINKS
  // ============================================
  if (!isTouchDevice && typeof gsap !== 'undefined') {
    const magneticElements = document.querySelectorAll('.btn-primary, .burger, .menu-overlay__link');
    
    magneticElements.forEach(el => {
      // Wrap element to isolate hover area if it's not the burger
      let wrapper = el;
      if (!el.classList.contains('burger') && !el.classList.contains('menu-overlay__link')) {
        wrapper = document.createElement('div');
        wrapper.classList.add('magnetic-wrap');
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
      }

      wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          duration: 0.5,
          x: x * 0.25,
          y: y * 0.25,
          ease: "power3.out"
        });
      });

      wrapper.addEventListener('mouseleave', () => {
        gsap.to(el, {
          duration: 0.9,
          x: 0,
          y: 0,
          ease: "elastic.out(1, 0.4)"
        });
      });
    });
  }

  // ============================================
  // 4. 3D TILT EFFECT ON CARDS
  // ============================================
  if (!isTouchDevice && typeof gsap !== 'undefined') {
    const serviceCards = document.querySelectorAll('.service-card, .comparison__card, .approach__step-visual');
    
    serviceCards.forEach(card => {
      card.classList.add('tilt-card');
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // max 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;
        
        gsap.to(card, {
          duration: 0.45,
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1200,
          ease: "power2.out"
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          duration: 0.8,
          rotateX: 0,
          rotateY: 0,
          ease: "elastic.out(1, 0.4)"
        });
      });
    });
  }

  // ============================================
  // 5. HERO AMBIENT BOKEH PARALLAX
  // ============================================
  const float1 = document.querySelector('.hero__floating-element--1');
  const float2 = document.querySelector('.hero__floating-element--2');

  if (float1 && float2 && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // Mouse Parallax
    if (!isTouchDevice) {
      window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 50;
        const y = (e.clientY / window.innerHeight - 0.5) * 50;
        gsap.to(float1, { duration: 1.2, x: x, y: y, ease: "power2.out" });
        gsap.to(float2, { duration: 1.8, x: -x * 1.3, y: -y * 1.3, ease: "power2.out" });
      });
    }

    // Scroll Parallax (Move down as user scrolls)
    gsap.to(float1, {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
    gsap.to(float2, {
      yPercent: 40,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  // ============================================
  // 6. CHARACTER REVEAL ANIMATION (Custom Split)
  // ============================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const heroTitle = document.querySelector('.hero__title');
    
    if (heroTitle) {
      // Only do this if it hasn't been split already
      if (!heroTitle.classList.contains('split-done')) {
        heroTitle.classList.add('split-done');
        
        // Simple manual split for the text (preserving the .highlight span)
        const highlightSpan = heroTitle.querySelector('.highlight');
        let highlightHtml = '';
        if (highlightSpan) {
          highlightHtml = highlightSpan.outerHTML;
          heroTitle.removeChild(highlightSpan);
        }
        
        const text = heroTitle.textContent.trim();
        heroTitle.innerHTML = '';
        
        // Split regular text into words -> chars
        const words = text.split(' ');
        words.forEach(word => {
          const wordDiv = document.createElement('span');
          wordDiv.style.display = 'inline-block';
          wordDiv.style.whiteSpace = 'nowrap';
          wordDiv.style.marginRight = '0.25em';
          
          word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('char');
            charSpan.innerHTML = char === ' ' ? '&nbsp;' : char;
            wordDiv.appendChild(charSpan);
          });
          
          heroTitle.appendChild(wordDiv);
        });
        
        // Add highlight back
        if (highlightHtml) {
          heroTitle.insertAdjacentHTML('beforeend', highlightHtml);
          // Animate the highlight separately
          gsap.fromTo(heroTitle.querySelector('.highlight'), 
            { opacity: 0, scale: 0.8 }, 
            { opacity: 1, scale: 1, duration: 1, delay: 0.8, ease: "elastic.out(1, 0.5)" }
          );
        }

        // Animate characters
        gsap.to('.char', {
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          stagger: 0.03,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 0.2
        });
      }
    }
  }

  // ============================================
  // 7. SITEWIDE SCROLL REVEAL ANIMATIONS
  // ============================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Staggered reveals for all section cards
    const cardSections = document.querySelectorAll('.services__grid, .reviews__grid, .approach__steps, .faq__list');
    
    cardSections.forEach(section => {
      const cards = section.querySelectorAll('.service-card, .review-card, .approach__step, .faq__item');
      if (cards.length > 0) {
        gsap.fromTo(cards, 
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: section,
              start: "top 85%", // Reveal when section is 85% into viewport
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });

    // Reveal section titles smoothly
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
      gsap.fromTo(title, 
        { y: 30, opacity: 0, rotationX: -15 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: title,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
    // Dynamic Number Counters
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      if (!isNaN(target)) {
        // Initialize at 0
        counter.innerText = '0';
        
        ScrollTrigger.create({
          trigger: counter,
          start: "top 95%",
          once: true,
          onEnter: () => {
            gsap.to(counter, {
              innerHTML: target,
              duration: 2,
              ease: "power2.out",
              snap: { innerHTML: 1 },
              onUpdate: function() {
                counter.innerHTML = Math.round(this.targets()[0].innerHTML);
              }
            });
          }
        });
      }
    });
  }

});
