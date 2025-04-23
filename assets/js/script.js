'use strict';



/**
 * add event on element
 */

const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
}



/**
 * toggle navbar
 */

const navbar = document.querySelector("[data-navbar]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const navToggler = document.querySelector("[data-nav-toggler]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  navToggler.classList.toggle("active");
}

addEventOnElem(navToggler, "click", toggleNavbar);

const closeNavbar = function () {
  navbar.classList.remove("active");
  navToggler.classList.remove("active");
}

addEventOnElem(navLinks, "click", closeNavbar);



/**
 * header active
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
});


function showFullscreenImage(imageSrc) {
  const overlay = document.getElementById('fullscreenOverlay');
  const image = document.getElementById('fullscreenImage');

  image.src = imageSrc;
  overlay.classList.add('active');
}

function hideFullscreenImage() {
  const overlay = document.getElementById('fullscreenOverlay');
  overlay.classList.remove('active');

  // Wait for the fade-out transition to complete before clearing the image source
  setTimeout(() => {
    const image = document.getElementById('fullscreenImage');
    image.src = '';
  }, 500); // Match the CSS transition duration
}

// Reveal on scroll functionality
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const revealCallback = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
};

const revealObserver = new IntersectionObserver(revealCallback, observerOptions);

// Observe all elements with reveal classes
document.addEventListener('DOMContentLoaded', () => {
  // General reveal elements
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  reveals.forEach(element => revealObserver.observe(element));

  // Timeline items
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.2}s`;
    revealObserver.observe(item);
  });

  // Pricing cards
  const pricingCards = document.querySelectorAll('.pricing-card');
  pricingCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.2}s`;
    revealObserver.observe(card);
  });

  // Skills items
  const skillsItems = document.querySelectorAll('.skills-item');
  skillsItems.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.transitionDelay = `${index * 0.2}s`;
    revealObserver.observe(item);
  });
});

// Countdown Timer
function startCountdown() {
  // Set the initial countdown time (48 hours)
  let hours = 48;
  let minutes = 0;
  let seconds = 0;

  // Check if there's a stored countdown in localStorage
  const storedCountdown = localStorage.getItem('discountCountdown');
  if (storedCountdown) {
    const countdownData = JSON.parse(storedCountdown);
    const now = new Date().getTime();
    
    // If the stored end time is in the future, use it
    if (countdownData.endTime > now) {
      const timeLeft = countdownData.endTime - now;
      hours = Math.floor(timeLeft / (1000 * 60 * 60));
      minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    } else {
      // If expired, set a new countdown
      const endTime = now + (48 * 60 * 60 * 1000);
      localStorage.setItem('discountCountdown', JSON.stringify({ endTime }));
    }
  } else {
    // If no stored countdown, create one
    const now = new Date().getTime();
    const endTime = now + (48 * 60 * 60 * 1000);
    localStorage.setItem('discountCountdown', JSON.stringify({ endTime }));
  }

  // Update the HTML elements
  updateCountdownDisplay(hours, minutes, seconds);

  // Start the countdown interval
  const countdownInterval = setInterval(() => {
    if (seconds > 0) {
      seconds--;
    } else {
      if (minutes > 0) {
        minutes--;
        seconds = 59;
      } else {
        if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Countdown finished
          clearInterval(countdownInterval);
          // Reset the countdown
          hours = 48;
          minutes = 0;
          seconds = 0;
          
          // Update localStorage with new end time
          const now = new Date().getTime();
          const endTime = now + (48 * 60 * 60 * 1000);
          localStorage.setItem('discountCountdown', JSON.stringify({ endTime }));
        }
      }
    }

    // Update the display
    updateCountdownDisplay(hours, minutes, seconds);
    
    // Update localStorage
    const now = new Date().getTime();
    const endTime = now + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000);
    localStorage.setItem('discountCountdown', JSON.stringify({ endTime }));
  }, 1000);
}

function updateCountdownDisplay(hours, minutes, seconds) {
  const hoursElement = document.getElementById('countdown-hours');
  const minutesElement = document.getElementById('countdown-minutes');
  const secondsElement = document.getElementById('countdown-seconds');
  
  if (hoursElement && minutesElement && secondsElement) {
    hoursElement.textContent = hours.toString().padStart(2, '0');
    minutesElement.textContent = minutes.toString().padStart(2, '0');
    secondsElement.textContent = seconds.toString().padStart(2, '0');
  }
}

// Initialize the countdown when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  startCountdown();
});

// Reviews Slider
document.addEventListener('DOMContentLoaded', function() {
  const reviewsTrack = document.querySelector('.reviews-track');
  const reviewSlides = document.querySelectorAll('.review-slide');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if (!reviewsTrack || !reviewSlides.length || !prevBtn || !nextBtn) return;
  
  let slideWidth = reviewSlides[0].offsetWidth;
  let slidesToShow = 1;
  let currentPosition = 0;
  let scrollSpeed = 1; // pixels per frame
  let animationFrame;
  let isAutoscrolling = false;
  
  // Clone slides for infinite looping
  function setupInfiniteLoop() {
    // First, clear any existing clones
    const existingSlides = Array.from(reviewsTrack.children);
    existingSlides.forEach((slide, index) => {
      if (index >= reviewSlides.length) {
        reviewsTrack.removeChild(slide);
      }
    });
    
    // Clone all slides and append them
    reviewSlides.forEach(slide => {
      const clone = slide.cloneNode(true);
      clone.classList.add('clone');
      reviewsTrack.appendChild(clone);
    });
    
    
    // Set initial position
    currentPosition = 0;
    updateTrackPosition(false);
  }
  
  // Determine how many slides to show based on screen width
  function updateSlidesConfig() {
    slideWidth = reviewSlides[0].offsetWidth;
    
    if (window.innerWidth >= 1200) {
      slidesToShow = 3;
      scrollSpeed = 0.5; // slower on larger screens
    } else if (window.innerWidth >= 992) {
      slidesToShow = 2.5;
      scrollSpeed = 0.6;
    } else if (window.innerWidth >= 768) {
      slidesToShow = 2;
      scrollSpeed = 0.8;
    } else {
      slidesToShow = 1; // Changed from 1.2 to 1 to prevent overflow on mobile
      scrollSpeed = 1;
    }
    
    setupInfiniteLoop();
  }
  
  // Update track position with smooth animation
  function updateTrackPosition(animate = true) {
    if (!animate) {
      reviewsTrack.style.transition = 'none';
    } else {
      reviewsTrack.style.transition = 'transform 0.3s ease';
    }
    
    reviewsTrack.style.transform = `translateX(${-currentPosition}px)`;
    
    // Update active slide based on center position
    const centerPosition = currentPosition + (window.innerWidth / 2);
    const slideIndex = Math.floor(centerPosition / slideWidth) % reviewSlides.length;
    
    // Force a reflow before re-enabling transitions
    if (!animate) {
      reviewsTrack.offsetHeight;
      reviewsTrack.style.transition = 'transform 0.3s ease';
    }
    
    // Check if we need to reset position for continuous loop
    const totalSlidesWidth = slideWidth * reviewSlides.length;
    if (currentPosition >= totalSlidesWidth) {
      // If we've scrolled past all original slides, reset to beginning
      setTimeout(() => {
        currentPosition = 0;
        updateTrackPosition(false);
      }, 0);
    }
  }
  
  // Continuous smooth scrolling animation
  function smoothScroll() {
    if (!isAutoscrolling) return;
    
    currentPosition += scrollSpeed;
    updateTrackPosition(false);
    
    // Check if we need to reset the position
    const totalSlidesWidth = slideWidth * reviewSlides.length;
    if (currentPosition >= totalSlidesWidth) {
      currentPosition = 0;
    }
    
    animationFrame = requestAnimationFrame(smoothScroll);
  }
  
  // Start auto-scrolling
  function startAutoScroll() {
    if (isAutoscrolling) return;
    
    isAutoscrolling = true;
    animationFrame = requestAnimationFrame(smoothScroll);
  }
  
  // Stop auto-scrolling
  function stopAutoScroll() {
    isAutoscrolling = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  }
  
  // Manual navigation (faster speed but same continuous effect)
  function jumpNext() {
    const jumpAmount = slideWidth; // Jump one full slide
    currentPosition += jumpAmount;
    updateTrackPosition(true);
  }
  
  function jumpPrev() {
    const jumpAmount = slideWidth; // Jump one full slide
    currentPosition -= jumpAmount;
    
    // Handle negative position for reverse loop
    if (currentPosition < 0) {
      const totalSlidesWidth = slideWidth * reviewSlides.length;
      currentPosition = totalSlidesWidth - slideWidth;
    }
    
    updateTrackPosition(true);
  }
  
  // Event listeners
  nextBtn.addEventListener('click', jumpNext);
  prevBtn.addEventListener('click', jumpPrev);
  
  // Handle window resize
  window.addEventListener('resize', updateSlidesConfig);
  
  // Scroll-based animation
  const reviewsSection = document.querySelector('.reviews');
  let isVisible = false;
  
  // Check if reviews section is visible in viewport
  function checkVisibility() {
    if (!reviewsSection) return;
    
    const rect = reviewsSection.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // If reviews section is visible
    if (rect.top <= windowHeight * 0.75 && rect.bottom >= windowHeight * 0.25) {
      if (!isVisible) {
        isVisible = true;
        // Start autoplay when section becomes visible
        startAutoScroll();
      }
    } else {
      if (isVisible) {
        isVisible = false;
        // Stop autoplay when section is not visible
        stopAutoScroll();
      }
    }
  }
  
  // Add touch/swipe support with increased sensitivity
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartTime = 0;
  
  reviewsTrack.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartTime = new Date().getTime();
    stopAutoScroll(); // Stop auto-scrolling on touch
  }, { passive: true });
  
  reviewsTrack.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const touchEndTime = new Date().getTime();
    handleSwipe(touchEndTime - touchStartTime);
    
    // Resume auto-scrolling after a delay
    setTimeout(() => {
      if (isVisible) startAutoScroll();
    }, 1000);
  }, { passive: true });
  
  function handleSwipe(swipeDuration) {
    const swipeDistance = touchEndX - touchStartX;
    const swipeThreshold = 30;
    
    // Calculate swipe velocity for dynamic scrolling
    const swipeVelocity = Math.abs(swipeDistance / swipeDuration);
    
    if (swipeDistance < -swipeThreshold) {
      // Left swipe
      const jumpAmount = Math.max(slideWidth, slideWidth * swipeVelocity * 2);
      currentPosition += jumpAmount;
      updateTrackPosition(true);
    } else if (swipeDistance > swipeThreshold) {
      // Right swipe
      const jumpAmount = Math.max(slideWidth, slideWidth * swipeVelocity * 2);
      currentPosition -= jumpAmount;
      
      // Handle negative position for reverse loop
      if (currentPosition < 0) {
        const totalSlidesWidth = slideWidth * reviewSlides.length;
        currentPosition = totalSlidesWidth - slideWidth;
      }
      
      updateTrackPosition(true);
    }
  }
  
  // Listen for scroll events
  window.addEventListener('scroll', checkVisibility);
  
  // Initialize slider
  updateSlidesConfig();
  checkVisibility();
  
  // Pause autoplay on hover
  reviewsTrack.addEventListener('mouseenter', () => {
    stopAutoScroll();
  });
  
  reviewsTrack.addEventListener('mouseleave', () => {
    if (isVisible) startAutoScroll();
  });
});

// Loading Screen
window.addEventListener('load', function() {
  const loader = document.querySelector('.loader-wrapper');
  
  // Start fade out after a shorter delay
  setTimeout(() => {
    loader.classList.add('fade-out');
    
    // Remove from DOM after fade out
    setTimeout(() => {
      loader.remove();
    }, 300); // Match the CSS transition duration
  }, 800); // Reduced from 1000ms to 800ms
});

// Discount Popup
function showDiscountPopup() {
  // Check if popup was already shown in this session
  if (sessionStorage.getItem('popupShown')) {
    return;
  }
  
  const popup = document.getElementById('discountPopup');
  if (popup) {
    popup.classList.add('show');
    sessionStorage.setItem('popupShown', 'true');
  }
}

// Close popup when clicking the close button
document.getElementById('closePopup')?.addEventListener('click', () => {
  const popup = document.getElementById('discountPopup');
  if (popup) {
    popup.classList.remove('show');
  }
});

// Show popup after 10 seconds
setTimeout(showDiscountPopup, 10000);

// Close popup when clicking outside
window.addEventListener('click', (e) => {
  const popup = document.getElementById('discountPopup');
  if (e.target === popup) {
    popup.classList.remove('show');
  }
});

// Video loading optimization
document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('previewVideo');
  const loadingSpinner = document.querySelector('.video-loading');
  
  if (!video) return;

  // Create intersection observer for video
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Video is in viewport, start loading
        video.load();
        videoObserver.unobserve(video);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });

  // Observe the video container
  videoObserver.observe(video);

  // Hide loading spinner when video is ready
  video.addEventListener('loadeddata', function() {
    loadingSpinner.style.display = 'none';
  });

  // Show loading spinner if video needs to buffer
  video.addEventListener('waiting', function() {
    loadingSpinner.style.display = 'flex';
  });

  // Hide loading spinner when video can play
  video.addEventListener('canplay', function() {
    loadingSpinner.style.display = 'none';
  });

  // Handle video errors
  video.addEventListener('error', function() {
    console.error('Video loading error:', video.error);
    loadingSpinner.style.display = 'none';
  });
});


