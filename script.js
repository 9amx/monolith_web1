/* ============================================
   monolithmedia — SCRIPTS
   All interactivity, animations, and effects
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {

  // ============================================
  // 1. GSAP MENU OVERLAY ANIMATION
  // ============================================
  const burgerBtn = document.getElementById("burgerBtn");
  const menuClose = document.getElementById("menuClose");
  const menuOverlay = document.getElementById("menuOverlay");
  const menuLinks = document.querySelectorAll(".menu-overlay__link");
  let isMenuOpen = false;

  // Setup initial state for menu link text
  gsap.set(".menu-overlay__link-inner", { y: 400 });

  // Create GSAP timeline
  const menuTimeline = gsap.timeline({ paused: true });

  menuTimeline.to(".menu-overlay", {
    duration: 1,
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    ease: "power4.inOut"
  });

  menuTimeline.to(".menu-overlay__link-inner", {
    duration: 0.6,
    y: 0,
    stagger: 0.12,
    ease: "power4.out"
  }, "-=0.6");

  // Burger button click
  if (burgerBtn) {
    burgerBtn.addEventListener("click", function () {
      if (isMenuOpen) {
        menuTimeline.reverse();
        this.classList.remove("active");
      } else {
        menuTimeline.play();
        this.classList.add("active");
      }
      isMenuOpen = !isMenuOpen;
    });
  }

  // Close button click
  if (menuClose) {
    menuClose.addEventListener("click", function () {
      menuTimeline.reverse();
      burgerBtn?.classList.remove("active");
      isMenuOpen = false;
    });
  }

  // Close on link click
  menuLinks.forEach(link => {
    link.addEventListener("click", function () {
      menuTimeline.reverse();
      burgerBtn?.classList.remove("active");
      isMenuOpen = false;
    });
  });

  // ============================================
  // 2. SCROLL ANIMATIONS (IntersectionObserver)
  // ============================================
  const animElements = document.querySelectorAll(
    ".anim-fade-up, .anim-fade-in, .anim-fade-left, .anim-fade-right, .anim-zoom"
  );

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        animObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  animElements.forEach(el => animObserver.observe(el));

  // ============================================
  // 3. COUNTER ANIMATION
  // ============================================
  const counters = document.querySelectorAll(".counter");

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute("data-target"));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease out cubic
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(start + (target - start) * easedProgress);

          counter.textContent = current;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        }

        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  // ============================================
  // 4. SHOWREEL SCROLL PERSPECTIVE EFFECT
  // ============================================
  const showreelWrapper = document.getElementById("showreelWrapper");

  if (showreelWrapper && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: showreelWrapper,
      start: "top 80%",
      end: "center center",
      onEnter: () => showreelWrapper.classList.add("scrolled"),
      onLeaveBack: () => showreelWrapper.classList.remove("scrolled"),
      scrub: false,
    });
  }

  // ============================================
  // 5. SHOWREEL VIDEO PLAY
  // ============================================
  const showreelPlay = document.getElementById("showreelPlay");
  const showreelThumb = document.getElementById("showreelThumb");

  if (showreelPlay && showreelWrapper) {
    showreelPlay.addEventListener("click", function () {
      const iframe = document.createElement("iframe");
      iframe.src = "https://drive.google.com/file/d/16LpsC7XaHPnax_rCael2yXmzkukE-j07/preview";
      iframe.className = "showreel__iframe";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      showreelWrapper.appendChild(iframe);
      showreelPlay.style.display = "none";
      if (showreelThumb) showreelThumb.style.display = "none";
    });
  }

  // ============================================
  // 6. REVIEWS SLIDER
  // ============================================
  const reviewsTrack = document.getElementById("reviewsTrack");
  const reviewPrev = document.getElementById("reviewPrev");
  const reviewNext = document.getElementById("reviewNext");
  let reviewIndex = 0;

  if (reviewsTrack && reviewPrev && reviewNext) {
    const reviewCards = reviewsTrack.querySelectorAll(".review-card");
    const totalReviews = reviewCards.length;

    function updateReviewSlider() {
      const translateX = -(reviewIndex * 100);
      reviewsTrack.style.transform = `translateX(${translateX}%)`;
    }

    reviewNext.addEventListener("click", function () {
      reviewIndex = (reviewIndex + 1) % totalReviews;
      updateReviewSlider();
    });

    reviewPrev.addEventListener("click", function () {
      reviewIndex = (reviewIndex - 1 + totalReviews) % totalReviews;
      updateReviewSlider();
    });

    // Auto-advance every 2.5 seconds for a faster feel
    let reviewAutoPlay = setInterval(() => {
      reviewIndex = (reviewIndex + 1) % totalReviews;
      updateReviewSlider();
    }, 2500);

    // Pause on hover
    const reviewSlider = document.querySelector(".reviews__slider");
    if (reviewSlider) {
      reviewSlider.addEventListener("mouseenter", () => clearInterval(reviewAutoPlay));
      reviewSlider.addEventListener("mouseleave", () => {
        reviewAutoPlay = setInterval(() => {
          reviewIndex = (reviewIndex + 1) % totalReviews;
          updateReviewSlider();
        }, 2500);
      });
    }
  }

  // ============================================
  // 7. FAQ ACCORDION
  // ============================================
  const faqItems = document.querySelectorAll(".faq__item");

  faqItems.forEach(item => {
    const question = item.querySelector(".faq__question");

    question.addEventListener("click", function () {
      const isActive = item.classList.contains("active");

      // Close all others
      faqItems.forEach(i => i.classList.remove("active"));

      // Toggle current
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  // ============================================
  // 8. WORKS TABS
  // ============================================
  const worksTabs = document.querySelectorAll(".works__tab");
  const worksContents = document.querySelectorAll(".works__content");

  worksTabs.forEach(tab => {
    tab.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Update active tab
      worksTabs.forEach(t => t.classList.remove("active"));
      this.classList.add("active");

      // Show active content
      worksContents.forEach(content => {
        content.classList.remove("active");
        if (content.getAttribute("data-tab") === targetTab) {
          content.classList.add("active");
        }
      });

      // PAUSE PREVIOUS VIDEOS ON TAB CHANGE
      const allWorksVideos = document.querySelectorAll('.works__content video');
      allWorksVideos.forEach(v => v.pause());
    });
  });

  // ============================================
  // 8.5 CUSTOM WORKS VIDEO PLAYER
  // ============================================
  const customVideos = document.querySelectorAll(".custom-video");
  customVideos.forEach(video => {
    video.addEventListener("click", function () {
      if (this.classList.contains("playing")) return;
      
      const videoId = this.getAttribute("data-video-id");
      const videoExt = this.getAttribute("data-ext") || ".mp4";
      const videoEl = document.createElement("video");
      
      // Play local video file instead of YouTube iframe
      videoEl.src = `works_videos/${videoId}${videoExt}`;
      videoEl.controls = true;
      videoEl.style.position = "absolute";
      videoEl.style.top = "0";
      videoEl.style.left = "0";
      videoEl.style.width = "100%";
      videoEl.style.height = "100%";
      videoEl.style.zIndex = "3";
      videoEl.style.objectFit = "contain";
      videoEl.style.backgroundColor = "#000";
      
      this.appendChild(videoEl);
      this.classList.add("playing");
      
      // Hide the thumbnail and play button
      const thumb = this.querySelector(".custom-video__thumb");
      const playBtn = this.querySelector(".custom-video__play");
      if (thumb) thumb.style.display = "none";
      if (playBtn) playBtn.style.display = "none";
      
      // Initialize Plyr for modern UI
      if (typeof Plyr !== 'undefined') {
        const player = new Plyr(videoEl, {
          controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
          hideControls: false,
        });
        player.play();
      } else {
        videoEl.play();
      }
    });
  });

  // ============================================
  // 9. SMOOTH SCROLL FOR NAVIGATION
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ============================================
  // 10. ROTATING TEXT ANIMATION
  // ============================================
  const rotatingWords = document.querySelectorAll(".rotating-text__word");

  if (rotatingWords.length > 0) {
    let currentWord = 0;
    const wordCount = rotatingWords.length;

    // Set first word visible
    rotatingWords[0].style.opacity = "1";
    rotatingWords[0].style.position = "relative";
    rotatingWords[0].style.transform = "translateY(0)";

    setInterval(() => {
      // Hide current
      rotatingWords[currentWord].style.opacity = "0";
      rotatingWords[currentWord].style.position = "absolute";
      rotatingWords[currentWord].style.transform = "translateY(-100%)";

      // Next word
      currentWord = (currentWord + 1) % wordCount;

      // Show next
      rotatingWords[currentWord].style.opacity = "1";
      rotatingWords[currentWord].style.position = "relative";
      rotatingWords[currentWord].style.transform = "translateY(0)";
      rotatingWords[currentWord].style.transition = "all 0.5s ease";
    }, 2500);
  }

  // ============================================
  // 11. NAVBAR SCROLL EFFECT
  // ============================================
  const navbar = document.getElementById("navbar");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      navbar.style.background = "rgba(0, 0, 0, 0.95)";
      navbar.style.backdropFilter = "blur(20px)";
    } else {
      navbar.style.background = "linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)";
    }

    lastScroll = currentScroll;
  });

  // ============================================
  // 12. GSAP SCROLL ANIMATIONS (Enhanced)
  // ============================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Cool split text effect for stats heading
    const statsHeading = document.querySelector(".stats__heading");
    if (statsHeading) {
      const text = statsHeading.textContent;
      const words = text.split(' ');
      statsHeading.innerHTML = words.map(word =>
        `<span class="word" style="display:inline-block;transition:color 0.3s;">${word}</span>`
      ).join(' ');

      const wordSpans = statsHeading.querySelectorAll('.word');

      ScrollTrigger.create({
        trigger: statsHeading,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
          wordSpans.forEach((word, i) => {
            gsap.to(word, {
              color: "#ffffff",
              delay: i * 0.05,
              duration: 0.3,
              ease: "power2.out"
            });
          });
        }
      });
    }

    // Parallax-like effect on approach section images
    document.querySelectorAll('.approach__step-visual').forEach(visual => {
      gsap.fromTo(visual, {
        y: 30,
        opacity: 0.8
      }, {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: visual,
          start: "top 85%",
          end: "bottom 50%",
          scrub: 1
        }
      });
    });
  }

  // ============================================
  // 13. PRELOADER / REVEAL ANIMATION
  // ============================================
  // Quick page reveal
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.5s ease";
  requestAnimationFrame(() => {
    document.body.style.opacity = "1";
  });

  // ============================================
  // 14. PAYMENT METHODS & COPY TO CLIPBOARD
  // ============================================
  const paymentBtns = document.querySelectorAll(".payment-btn");
  const paymentDetails = document.getElementById("paymentDetails");
  const paymentDetailsTitle = document.getElementById("paymentDetailsTitle");
  const paymentPasswordPrompt = document.getElementById("paymentPasswordPrompt");
  const paymentDetailsGrid = document.getElementById("paymentDetailsGrid");
  const paymentPasswordInput = document.getElementById("paymentPasswordInput");
  const paymentPasswordSubmit = document.getElementById("paymentPasswordSubmit");
  const paymentPasswordError = document.getElementById("paymentPasswordError");

  if (paymentBtns.length > 0 && paymentDetails) {
    paymentBtns.forEach(btn => {
      btn.addEventListener("click", function() {
        // Update Title
        if (paymentDetailsTitle) {
          const method = this.getAttribute("data-method");
          if (method) {
            paymentDetailsTitle.textContent = `Bank Details for ${method}`;
          }
        }

        if (paymentDetails.style.display === "none" || paymentDetails.style.display === "") {
          paymentDetails.style.display = "block";
          // Small delay to allow display:block to apply before scrolling
          setTimeout(() => {
            paymentDetails.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
        
        // Highlight active button
        paymentBtns.forEach(b => {
          b.style.borderColor = "rgba(255,255,255,0.1)";
          b.style.boxShadow = "none";
        });
        this.style.borderColor = "var(--green-primary)";
        this.style.boxShadow = "0 0 15px rgba(0, 255, 0, 0.2)";
      });
    });
  }

  // Password Verification Logic via Backend API
  if (paymentPasswordSubmit && paymentPasswordInput) {
    async function verifyPassword() {
      const password = paymentPasswordInput.value;
      const originalBtnText = paymentPasswordSubmit.textContent;
      
      paymentPasswordSubmit.textContent = "Checking...";
      paymentPasswordSubmit.disabled = true;

      try {
        const response = await fetch('/api/bank-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Success! Populate the DOM
          document.getElementById('valBankName').textContent = result.data.bankName;
          document.getElementById('valAcNumber').textContent = result.data.acNumber;
          document.getElementById('valFirstName').textContent = result.data.firstName;
          document.getElementById('valLastName').textContent = result.data.lastName;
          document.getElementById('valSwiftCode').textContent = result.data.swiftCode;
          document.getElementById('valBranchCode').textContent = result.data.branchCode;
          document.getElementById('valRoutingNo').textContent = result.data.routingNo;
          document.getElementById('valCountry').textContent = result.data.country;
          document.getElementById('valCity').textContent = result.data.city;
          document.getElementById('valPostcode').textContent = result.data.postcode;
          document.getElementById('valBranch').textContent = result.data.branch;
          document.getElementById('valEmail').innerHTML = `<a href="mailto:${result.data.email}" style="color: #fff; text-decoration: none;">${result.data.email}</a>`;
          document.getElementById('valAddress').textContent = result.data.address;

          // Reveal the details
          paymentPasswordPrompt.style.display = "none";
          paymentDetailsGrid.style.display = "grid";
          paymentPasswordError.style.display = "none";
        } else {
          // Failure
          paymentPasswordError.style.display = "block";
          paymentPasswordError.textContent = result.message || "Incorrect password. Please try again.";
          paymentPasswordInput.value = "";
        }
      } catch (error) {
        console.error("Error verifying password:", error);
        paymentPasswordError.style.display = "block";
        paymentPasswordError.textContent = "Server error. Please try again later.";
      } finally {
        paymentPasswordSubmit.textContent = originalBtnText;
        paymentPasswordSubmit.disabled = false;
      }
    }

    paymentPasswordSubmit.addEventListener("click", verifyPassword);
    
    paymentPasswordInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        verifyPassword();
      }
    });
  }

  const copyBtns = document.querySelectorAll(".copy-btn");
  
  if (copyBtns.length > 0) {
    copyBtns.forEach(btn => {
      btn.addEventListener("click", function() {
        const valueSpan = this.parentElement.querySelector(".copy-value");
        if (valueSpan) {
          const textToCopy = valueSpan.innerText.trim();
          
          navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHTML = this.innerHTML;
            this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            this.style.color = "#fff";
            
            setTimeout(() => {
              this.innerHTML = originalHTML;
              this.style.color = "var(--green-primary)";
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy text: ', err);
          });
        }
      });
    });
  }

});

