// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Ensure GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.error('GSAP is not loaded!');
        return;
    }

    // Ensure ScrollTrigger is loaded
    if (typeof ScrollTrigger === 'undefined') {
        console.error('ScrollTrigger is not loaded!');
        return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Set initial states - this avoids the need for CSS changes
    gsap.set('.hero', { opacity: 0, y: 30 });
    gsap.set('.caption-card', { opacity: 0, y: -20 });
    gsap.set('.notices', { opacity: 0, x: -50 });
    gsap.set('.vision', { opacity: 0, y: 50 });
    gsap.set('.message-carousel', { opacity: 0, scale: 0.95 });
    gsap.set('.about-text', { opacity: 0, x: -50 });
    gsap.set('.about-image', { opacity: 0, x: 50 });
    gsap.set('.stat-card', { opacity: 0, y: 30 });
    gsap.set('.feature-card', { opacity: 0, y: 40 });

    // Create timeline for initial animations
    const tl = gsap.timeline({
        onStart: () => console.log('Starting initial animations')
    });

    // Hero section animation
    tl.to('.hero', {
        duration: 1.5,
        opacity: 1,
        y: 0,
        ease: 'power3.out'
    })
    .to('.caption-card', {
        duration: 1,
        opacity: 1,
        y: 0,
        ease: 'power2.out'
    }, '-=0.5');

    // Notice board animation with ScrollTrigger
    gsap.to('.notices', {
        scrollTrigger: {
            trigger: '.notices',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            markers: false // Set to true for debugging
        },
        duration: 1,
        opacity: 1,
        x: 0,
        ease: 'power2.out'
    });

    // Vision & Mission animation
    gsap.to('.vision', {
        scrollTrigger: {
            trigger: '.vision',
            start: 'top 75%',
            toggleActions: 'play none none reverse'
        },
        duration: 1.2,
        opacity: 1,
        y: 0,
        ease: 'power3.out'
    });

    // Message carousel animation
    gsap.to('.message-carousel', {
        scrollTrigger: {
            trigger: '.message-carousel',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        duration: 1,
        opacity: 1,
        scale: 1,
        ease: 'power2.out'
    });

    // About section animations
    const aboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 75%',
            toggleActions: 'play none none reverse'
        }
    });

    aboutTl.to('.about-text', {
        duration: 1,
        opacity: 1,
        x: 0,
        ease: 'power2.out'
    })
    .to('.about-image', {
        duration: 1,
        opacity: 1,
        x: 0,
        ease: 'power2.out'
    }, '-=0.7');

    // Stats section animation with stagger effect
    gsap.to('.stat-card', {
        scrollTrigger: {
            trigger: '.stats',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        opacity: 1,
        y: 0,
        stagger: {
            each: 0.2,
            ease: 'power2.out'
        }
    });

    // Features section animation
    gsap.to('.feature-card', {
        scrollTrigger: {
            trigger: '.features',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        opacity: 1,
        y: 0,
        stagger: {
            each: 0.2,
            ease: 'back.out(1.2)'
        }
    });
    
    // Add hover animations for cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                duration: 0.3,
                y: -5,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.3,
                y: 0,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                ease: 'power2.out'
            });
        });
    });
    
    // Add hover animations for stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                duration: 0.3,
                y: -5,
                scale: 1.05,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.3,
                y: 0,
                scale: 1,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                ease: 'power2.out'
            });
        });
    });
});
