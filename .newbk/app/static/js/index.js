/**
 * PRUTSIM Website - Main JavaScript File
 * Professional implementation with modern ES6+ features
 * Author: PRUTSIM Development Team
 * Version: 2.0.0
 */

'use strict';

/**
 * Main Application Class
 * Handles initialization and coordination of all website components
 */
class PRUTSIMApp {
  constructor() {
    this.config = {
      slideInterval: 4000,
      scrollThrottle: 100,
      swipeThreshold: 50,
      autoScrollDelay: 2000,
      parallaxFactor: 0.4
    };
    
    this.state = {
      isInitialized: false,
      components: new Map()
    };
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.state.isInitialized) return;

    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await this.waitForDOM();
      }

      // Initialize all components
      await this.initializeComponents();
      
      this.state.isInitialized = true;
      console.log('PRUTSIM App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PRUTSIM App:', error);
    }
  }

  /**
   * Wait for DOM to be ready
   */
  waitForDOM() {
    return new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }

  /**
   * Initialize all application components
   */
  async initializeComponents() {
    const components = [
      { name: 'animations', class: AnimationController },
      { name: 'carousel', class: CarouselController },
      { name: 'testimonials', class: TestimonialController },
      { name: 'noticeBoard', class: NoticeBoardController },
      { name: 'leadership', class: LeadershipController },
      { name: 'forms', class: FormController },
      { name: 'dateTime', class: DateTimeController },
      { name: 'captions', class: CaptionController }
    ];

    // Initialize parallax only on larger screens
    if (window.innerWidth > 768) {
      components.push({ name: 'parallax', class: ParallaxController });
    }

    for (const { name, class: ComponentClass } of components) {
      try {
        const component = new ComponentClass(this.config);
        await component.init();
        this.state.components.set(name, component);
      } catch (error) {
        console.warn(`Failed to initialize ${name}:`, error);
      }
    }
  }

  /**
   * Get a component by name
   */
  getComponent(name) {
    return this.state.components.get(name);
  }
}

/**
 * Base Component Class
 * Provides common functionality for all components
 */
class BaseComponent {
  constructor(config = {}) {
    this.config = config;
    this.isInitialized = false;
    this.eventListeners = [];
  }

  /**
   * Add event listener with automatic cleanup
   */
  addEventListener(element, event, handler, options = {}) {
    if (!element) return;
    
    element.addEventListener(event, handler, options);
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * Remove all event listeners
   */
  cleanup() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  /**
   * Throttle function execution
   */
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return (...args) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  /**
   * Debounce function execution
   */
  debounce(func, delay) {
    let timeoutId;
    
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
}

/**
 * Animation Controller
 * Handles scroll-based animations and visual effects
 */
class AnimationController extends BaseComponent {
  async init() {
    if (this.isInitialized) return;

    this.elements = document.querySelectorAll('.content, .feature-card, .achievement-card, .stat-card, .campus-card');
    
    if (this.elements.length > 0) {
      this.setupScrollAnimations();
    }

    this.isInitialized = true;
  }

  setupScrollAnimations() {
    const animateOnScroll = this.throttle(() => {
      this.elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
        
        if (isVisible) {
          element.classList.add('in-view');
        } else {
          element.classList.remove('in-view');
        }
      });
    }, this.config.scrollThrottle);

    this.addEventListener(window, 'scroll', animateOnScroll, { passive: true });
    
    // Run once on initial load
    animateOnScroll();
  }
}

/**
 * Carousel Controller
 * Manages main hero carousel with video support
 */
class CarouselController extends BaseComponent {
  async init() {
    if (this.isInitialized) return;

    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.carousel-item');
    this.indicatorsContainer = document.querySelector('.carousel-indicators');
    this.autoAdvanceTimer = null;

    if (this.slides.length === 0 || !this.indicatorsContainer) {
      return;
    }

    this.createIndicators();
    this.setupEventListeners();
    this.updateSlides();

    // Make moveSlide available globally for backward compatibility
    window.moveSlide = (direction) => this.moveSlide(direction);

    this.isInitialized = true;
  }

  createIndicators() {
    this.slides.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.classList.add('indicator');
      indicator.addEventListener('click', () => this.goToSlide(index));
      this.indicatorsContainer.appendChild(indicator);
    });

    this.indicators = document.querySelectorAll('.indicator');
  }

  setupEventListeners() {
    // Add keyboard navigation
    this.addEventListener(document, 'keydown', (e) => {
      if (e.key === 'ArrowLeft') this.moveSlide(-1);
      if (e.key === 'ArrowRight') this.moveSlide(1);
    });
  }

  updateSlides() {
    if (!this.slides[this.currentSlide] || !this.indicators[this.currentSlide]) {
      return;
    }

    // Stop all videos and remove active classes
    this.slides.forEach(slide => {
      const video = slide.querySelector('video');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      slide.classList.remove('active');
    });

    this.indicators.forEach(indicator => indicator.classList.remove('active'));

    // Activate current slide
    this.slides[this.currentSlide].classList.add('active');
    this.indicators[this.currentSlide].classList.add('active');

    // Handle video playback
    const currentVideo = this.slides[this.currentSlide].querySelector('video');
    if (currentVideo) {
      this.playVideo(currentVideo);
    }

    this.scheduleNextSlide();
  }

  async playVideo(video) {
    try {
      video.currentTime = 0;
      await video.play();
    } catch (error) {
      console.log("Auto-play prevented:", error);
    }
  }

  moveSlide(direction) {
    this.currentSlide += direction;
    if (this.currentSlide >= this.slides.length) this.currentSlide = 0;
    if (this.currentSlide < 0) this.currentSlide = this.slides.length - 1;
    this.updateSlides();
  }

  goToSlide(index) {
    if (index < 0 || index >= this.slides.length) return;
    this.currentSlide = index;
    this.updateSlides();
  }

  scheduleNextSlide() {
    clearTimeout(this.autoAdvanceTimer);
    
    const currentVideo = this.slides[this.currentSlide].querySelector('video');
    
    if (currentVideo) {
      currentVideo.removeEventListener('ended', this.handleVideoEnd);
      currentVideo.addEventListener('ended', this.handleVideoEnd.bind(this));
    } else {
      this.autoAdvanceTimer = setTimeout(() => this.moveSlide(1), 5000);
    }
  }

  handleVideoEnd() {
    this.moveSlide(1);
  }
}

/**
 * Testimonial Controller
 * Manages testimonial and recruiter carousels
 */
class TestimonialController extends BaseComponent {
  async init() {
    if (this.isInitialized) return;

    this.containers = document.querySelectorAll('.testimonial-carousel-container');
    this.carousels = new Map();

    this.containers.forEach(container => {
      this.initializeCarousel(container);
    });

    this.isInitialized = true;
  }

  initializeCarousel(container) {
    const slides = container.querySelectorAll('.testimonial-slide');
    const dots = container.querySelectorAll('.testimonial-dot span');
    
    if (slides.length === 0 || dots.length === 0) return;

    const carousel = new TestimonialCarousel(container, slides, dots, this.config);
    this.carousels.set(container, carousel);
  }
}

/**
 * Individual Testimonial Carousel
 */
class TestimonialCarousel {
  constructor(container, slides, dots, config) {
    this.container = container;
    this.slides = slides;
    this.dots = dots;
    this.config = config;
    this.currentIndex = 0;
    this.intervalId = null;
    this.touchStartX = 0;
    this.touchEndX = 0;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startAutoSlide();
    this.showSlide(0);
  }

  setupEventListeners() {
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.showSlide(index);
        this.resetAutoSlide();
      });
    });

    // Touch/swipe support
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });

    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.pauseAutoSlide());
    this.container.addEventListener('mouseleave', () => this.startAutoSlide());
  }

  showSlide(index) {
    // Remove active classes
    this.slides.forEach(slide => slide.classList.remove('active'));
    this.dots.forEach(dot => dot.classList.remove('active'));

    // Calculate correct indices
    const slideIndex = index % this.slides.length;
    const dotIndex = index % this.dots.length;

    // Activate current slide and dot
    this.slides[slideIndex].classList.add('active');
    this.dots[dotIndex].classList.add('active');

    this.currentIndex = index;
  }

  nextSlide() {
    this.showSlide(this.currentIndex + 1);
  }

  previousSlide() {
    this.showSlide(this.currentIndex - 1 + this.slides.length);
  }

  handleSwipe() {
    const diff = this.touchEndX - this.touchStartX;
    
    if (Math.abs(diff) > this.config.swipeThreshold) {
      if (diff > 0) {
        this.previousSlide();
      } else {
        this.nextSlide();
      }
      this.resetAutoSlide();
    }
  }

  startAutoSlide() {
    this.pauseAutoSlide();
    this.intervalId = setInterval(() => this.nextSlide(), this.config.slideInterval);
  }

  pauseAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resetAutoSlide() {
    this.startAutoSlide();
  }
}

/**
 * Notice Board Controller
 * Manages notice fetching and auto-scrolling
 */
class NoticeBoardController extends BaseComponent {
  async init() {
    if (this.isInitialized) return;

    this.currentPage = 1;
    this.perPage = 5;
    this.loading = false;
    this.autoScrollInterval = null;
    this.isAutoScrolling = false;

    this.elements = {
      content: document.getElementById('generalNoticeContent'),
      container: document.getElementById('generalNoticesContainer'),
      loadMoreBtn: document.getElementById('loadMoreGeneralButton')
    };

    if (!this.elements.content) return;

    this.setupLoadMore();
    await this.fetchNotices(this.currentPage);

    // Export for backward compatibility
    window.switchNoticeTab = () => this.switchNoticeTab();

    this.isInitialized = true;
  }

  setupAutoScroll() {
    const { content } = this.elements;

    if (!content) {
      console.error('Content element not found for auto-scroll setup');
      return;
    }

    console.log('Setting up auto-scroll for notice board');
    console.log('Content dimensions:', {
      scrollHeight: content.scrollHeight,
      clientHeight: content.clientHeight,
      hasScrollableContent: content.scrollHeight > content.clientHeight
    });

    const startAutoScroll = () => {
      if (this.isAutoScrolling || !content) return;

      console.log('Starting auto-scroll...');
      this.isAutoScrolling = true;
      this.autoScrollInterval = setInterval(() => {
        const { scrollHeight, clientHeight, scrollTop } = content;

        if (scrollTop + clientHeight >= scrollHeight - 5) {
          console.log('Reached bottom, scrolling to top');
          content.scrollTop = 0;
        } else {
          content.scrollTop += 1;
        }
      }, 50);
    };

    const stopAutoScroll = () => {
      if (this.autoScrollInterval) {
        console.log('Stopping auto-scroll');
        clearInterval(this.autoScrollInterval);
        this.autoScrollInterval = null;
      }
      this.isAutoScrolling = false;
    };

    this.addEventListener(content, 'mouseenter', () => {
      console.log('Mouse entered notice area - pausing scroll');
      stopAutoScroll();
    });
    
    this.addEventListener(content, 'mouseleave', () => {
      console.log('Mouse left notice area - resuming scroll');
      startAutoScroll();
    });

    // Start auto-scroll immediately if there's scrollable content
    if (content.scrollHeight > content.clientHeight) {
      console.log('Content is scrollable, starting auto-scroll in 1 second');
      setTimeout(() => startAutoScroll(), 1000);
    } else {
      console.log('Content is not scrollable - not enough content to scroll');
    }
  }

  setupLoadMore() {
    if (this.elements.loadMoreBtn) {
      this.addEventListener(this.elements.loadMoreBtn, 'click', () => {
        if (!this.loading) {
          this.currentPage++;
          this.fetchNotices(this.currentPage);
        }
      });
    }
  }

  async fetchNotices(page, type = 'general') {
    try {
      this.loading = true;
      console.log(`Fetching notices - Page: ${page}, Type: ${type}`);
      
      const response = await fetch(`/api/notices?page=${page}&per_page=${this.perPage}&type=general`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Notices fetched:', data);

      if (!this.elements.content) {
        console.error('Notice content element not found!');
        return;
      }

      // if (!data.notices || data.notices.length === 0) {
      //   console.log('No notices returned from API');
      //   // Add some dummy notices for testing if no notices are returned
      //   if (page === 1) {
      //     this.addDummyNotices();
      //   }
      //   return;
      // }

      data.notices.forEach(notice => {
        console.log('Creating notice element for:', notice.title);
        const noticeElement = this.createNoticeElement(notice);
        this.elements.content.appendChild(noticeElement);
        console.log('Notice element created and appended:', noticeElement);
      });

      // Always add extra dummy notices to ensure scrollable content for testing
      // if (page === 1) {
      //   this.addDummyNotices();
      // }

      console.log(`Added ${data.notices.length} notices to the DOM`);
      console.log('Content scroll height:', this.elements.content.scrollHeight);
      console.log('Content client height:', this.elements.content.clientHeight);

      if (this.elements.loadMoreBtn) {
        this.elements.loadMoreBtn.style.display = data.has_next ? 'block' : 'none';
      }

      // Setup auto-scroll after notices are loaded
      if (page === 1) {
        setTimeout(() => {
          console.log('Setting up auto-scroll...');
          this.setupAutoScroll();
        }, 500);
      }

    } catch (error) {
      console.error('Error fetching notices:', error);
      // Add dummy notices for testing if API fails
      if (page === 1) {
        console.log('Adding dummy notices for testing...');
        this.addDummyNotices();
        setTimeout(() => {
          this.setupAutoScroll();
        }, 500);
      }
    } finally {
      this.loading = false;
    }
  }

  // Add dummy notices for testing when API fails or returns no data
  addDummyNotices() {
    const dummyNotices = [
      { title: "Admission Open for Academic Year 2025-26", date_uploaded: "2025-08-01", url: "#" },
      { title: "Important: Fee Payment Deadline Extended", date_uploaded: "2025-08-02", url: "#" },
      { title: "Workshop on Digital Marketing - Register Now", date_uploaded: "2025-08-03", url: "#" },
      { title: "Library Timing Changes for Exam Period", date_uploaded: "2025-08-04", url: "#" },
      { title: "Campus Placement Drive by Tech Companies", date_uploaded: "2025-08-05", url: "#" },
      { title: "Sports Meet Registration Last Date", date_uploaded: "2025-08-06", url: "#" },
      { title: "Cultural Fest 2025 - Call for Participants", date_uploaded: "2025-08-07", url: "#" },
      { title: "Guest Lecture on AI and Machine Learning", date_uploaded: "2025-08-08", url: "#" },
      { title: "Final Semester Examination Schedule Released", date_uploaded: "2025-08-09", url: "#" },
      { title: "Industry Visit to Mumbai Tech Park", date_uploaded: "2025-08-10", url: "#" },
      { title: "Student Council Election Nominations Open", date_uploaded: "2025-08-11", url: "#" },
      { title: "Annual Day Celebrations - Save the Date", date_uploaded: "2025-08-12", url: "#" }
    ];

    dummyNotices.forEach(notice => {
      const noticeElement = this.createNoticeElement(notice);
      this.elements.content.appendChild(noticeElement);
    });

    console.log(`Added ${dummyNotices.length} dummy notices for testing`);
    console.log('Content scroll height after dummy notices:', this.elements.content.scrollHeight);
    console.log('Content client height after dummy notices:', this.elements.content.clientHeight);
  }

  createNoticeElement(notice) {
    const noticeElement = document.createElement('div');
    noticeElement.className = 'notice';
    noticeElement.innerHTML = `
      <span class="notice-date">${this.formatDate(notice.date_uploaded)}</span>
      <a href="${notice.url}" target="_blank" class="notice-link">
        <span class="notice-title-text">${notice.title}</span>
        <span class="material-icons notice-icon">arrow_forward</span>
      </a>
    `;
    return noticeElement;
  }

  formatDate(dateString) {
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  }

  switchNoticeTab() {
    const tab = document.getElementById('generalNoticeTab');
    const container = document.getElementById('generalNoticesContainer');
    
    if (tab) tab.classList.add('active');
    if (container) container.style.display = 'block';
  }
}

/**
 * Leadership Controller
 * Manages leadership slideshow
 */
class LeadershipController extends BaseComponent {
  async init() {
    if (this.isInitialized) return;

    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.message-slide');
    this.indicators = document.querySelectorAll('.message-indicator');

    if (this.slides.length === 0 || this.indicators.length === 0) {
      return;
    }

    this.setupEventListeners();
    this.showSlide(0);
    this.startAutoAdvance();

    this.isInitialized = true;
  }

  setupEventListeners() {
    // Indicator clicks
    this.indicators.forEach((indicator, index) => {
      this.addEventListener(indicator, 'click', () => this.showSlide(index));
    });

    // Navigation buttons
    const prevBtn = document.querySelector('.message-prev');
    const nextBtn = document.querySelector('.message-next');

    if (prevBtn) {
      this.addEventListener(prevBtn, 'click', (e) => {
        e.preventDefault();
        this.previousSlide();
      });
    }

    if (nextBtn) {
      this.addEventListener(nextBtn, 'click', (e) => {
        e.preventDefault();
        this.nextSlide();
      });
    }
  }

  showSlide(index) {
    if (index < 0 || index >= this.slides.length) return;

    // Remove active classes
    this.slides.forEach(slide => slide.classList.remove('active'));
    this.indicators.forEach(indicator => indicator.classList.remove('active'));

    // Activate current slide and indicator
    this.slides[index].classList.add('active');
    if (this.indicators[index]) {
      this.indicators[index].classList.add('active');
    }

    // Update counter
    const counter = document.querySelector('.message-count');
    if (counter) {
      counter.textContent = `${index + 1}/${this.slides.length}`;
    }

    this.currentSlide = index;
  }

  nextSlide() {
    const next = (this.currentSlide + 1) % this.slides.length;
    this.showSlide(next);
  }

  previousSlide() {
    const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prev);
  }

  startAutoAdvance() {
    if (this.slides.length > 1) {
      setInterval(() => this.nextSlide(), 5000);
    }
  }
}

/**
 * Form Controller
 * Manages form validation and interactions
 */
class FormController extends BaseComponent {
  async init() {
    if (this.isInitialized) return;

    this.setupFormValidation();
    this.setupNewsletterForm();

    this.isInitialized = true;
  }

  setupFormValidation() {
    const formInputs = document.querySelectorAll('.m3-text-field input');

    formInputs.forEach(input => {
      const validateInput = () => {
        const field = input.closest('.m3-text-field');
        if (!field) return;

        if (input.validity.valid) {
          field.classList.remove('invalid');
          field.classList.add('valid');
        } else {
          field.classList.remove('valid');
          field.classList.add('invalid');
        }
      };

      this.addEventListener(input, 'blur', validateInput);
      this.addEventListener(input, 'input', validateInput);
    });
  }

  setupNewsletterForm() {
    const newsletterForm = document.querySelector('.m3-form');
    if (!newsletterForm) return;

    this.addEventListener(newsletterForm, 'submit', (e) => {
      e.preventDefault();
      
      const emailField = newsletterForm.querySelector('input[type="email"]');
      if (emailField && emailField.validity.valid) {
        this.showSuccessMessage(newsletterForm, 'Thank you for subscribing!');
        emailField.value = '';
      }
    });
  }

  showSuccessMessage(form, message) {
    const successMsg = document.createElement('div');
    successMsg.textContent = message;
    successMsg.classList.add('m3-success-message');

    form.appendChild(successMsg);

    setTimeout(() => {
      if (successMsg.parentNode) {
        successMsg.remove();
      }
    }, 3000);
  }
}

/**
 * Date Time Controller
 * Manages live date and time display
 */
class DateTimeController extends BaseComponent {
  async init() {
    if (this.isInitialized) return;

    this.dateTimeElement = document.getElementById('dateTime');
    if (!this.dateTimeElement) return;

    this.updateDateTime();
    this.startClock();

    this.isInitialized = true;
  }

  updateDateTime() {
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };

    this.dateTimeElement.textContent = now.toLocaleString('en-US', options);
  }

  startClock() {
    setInterval(() => this.updateDateTime(), 1000);
  }
}

/**
 * Caption Controller
 * Manages hero caption animations
 */
class CaptionController extends BaseComponent {
  async init() {
    if (this.isInitialized) return;

    this.captions = [
      { title: "Join Us Today", text: "Experience world-class education and vibrant campus life." },
      { title: "Your Future Starts Here", text: "Explore endless learning opportunities at PRUTSIM." },
      { title: "Learn, Grow, Succeed", text: "Join a community that fosters innovation and success." },
      { title: "Be a Part of Excellence", text: "Shape your career with our top-notch faculty and resources." }
    ];

    this.currentIndex = 0;
    this.titleElement = document.getElementById('caption-title');
    this.textElement = document.getElementById('caption-text');

    if (!this.titleElement || !this.textElement) return;

    this.startCaptionRotation();

    this.isInitialized = true;
  }

  startCaptionRotation() {
    setInterval(() => this.changeCaption(), 4000);
  }

  changeCaption() {
    this.currentIndex = (this.currentIndex + 1) % this.captions.length;

    // Fade out
    this.titleElement.style.opacity = '0';
    this.textElement.style.opacity = '0';

    setTimeout(() => {
      // Change content
      this.titleElement.textContent = this.captions[this.currentIndex].title;
      this.textElement.textContent = this.captions[this.currentIndex].text;

      // Fade in
      this.titleElement.style.opacity = '1';
      this.textElement.style.opacity = '1';
    }, 500);
  }
}

/**
 * Parallax Controller
 * Manages parallax scrolling effects
 */
class ParallaxController extends BaseComponent {
  async init() {
    if (this.isInitialized) return;

    this.parallaxSections = document.querySelectorAll('.parallax-section');
    if (this.parallaxSections.length === 0) return;

    this.setupParallaxScrolling();

    this.isInitialized = true;
  }

  setupParallaxScrolling() {
    const updateParallax = this.throttle(() => {
      this.parallaxSections.forEach(section => {
        const scrolled = window.pageYOffset;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const distanceFromTop = sectionTop - scrolled;
        const isInView = distanceFromTop < window.innerHeight && distanceFromTop + sectionHeight > 0;

        if (isInView) {
          const yPos = Math.round(distanceFromTop * this.config.parallaxFactor);
          section.style.backgroundPosition = `center ${yPos}px`;
        }
      });
    }, this.config.scrollThrottle);

    this.addEventListener(window, 'scroll', updateParallax, { passive: true });
    updateParallax();
  }
}

/**
 * Global utility functions for backward compatibility
 */
window.toggleContent = function(id) {
  const content = document.querySelector(`#${id} .expanded-content`);
  const button = document.querySelector(`#${id} .expand-btn`);

  if (!content || !button) return;

  if (content.classList.contains('show')) {
    content.classList.remove('show');
    button.textContent = 'Read More';
  } else {
    content.classList.add('show');
    button.textContent = 'Read Less';
  }
};

// Initialize the application
const app = new PRUTSIMApp();
app.init();