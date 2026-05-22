/**
 * Message page functionality
 * Handles the read more/less toggle for leadership messages and parallax effects
 */

// Toggle message content
function toggleMessage(id) {
    const dots = document.getElementById(`dots-${id}`);
    const moreText = document.getElementById(`more-${id}`);
    const btnText = document.getElementById(`btn-${id}`);
  
    if (moreText.style.display === "block") {
        dots.style.display = "inline";
        btnText.innerHTML = "Read more";
        moreText.style.display = "none";
    } else {
        dots.style.display = "none";
        btnText.innerHTML = "Read less";
        moreText.style.display = "block";
    }
}

// Toggle vision/mission content
function toggleContent(id) {
    const content = document.querySelector(`#${id} .expandable-content`);
    const expandedContent = content.querySelector('.expanded-content');
    const btn = content.querySelector('.expand-btn');
    
    if (expandedContent.style.display === 'block') {
        expandedContent.style.display = 'none';
        btn.textContent = 'Read More';
    } else {
        expandedContent.style.display = 'block';
        btn.textContent = 'Read Less';
    }
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
    const parallaxSection = document.querySelector('.parallax-section');
    const achievementSection = document.querySelector('.achievements');
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    let lastScrollPos = window.pageYOffset;
    let parallaxEnabled = window.innerWidth > 768;
    let ticking = false;

    // Initialize achievement cards
    achievementCards.forEach(card => {
        // Set initial state but don't hide completely
        card.style.opacity = '0.01';
        card.style.transform = 'translateY(30px)';
        card.style.willChange = 'transform, opacity';
    });

    // Only enable parallax on desktop
    if (achievementSection && parallaxEnabled) {
        function updateParallax() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = achievementSection.getBoundingClientRect();
                    const scrolled = window.pageYOffset;
                    const viewportHeight = window.innerHeight;
                    
                    // Check if section is in viewport
                    if (rect.top < viewportHeight && rect.bottom > 0) {
                        // Calculate parallax effect
                        const speed = 0.4;
                        const yPos = -(scrolled * speed);
                        achievementSection.style.backgroundPosition = `center ${yPos}px`;
                        
                        // Calculate how much of the section is visible
                        const sectionVisibility = Math.min(
                            (viewportHeight - rect.top) / viewportHeight,
                            rect.bottom / viewportHeight
                        );
                        
                        // Add visible class when more than 10% visible
                        if (sectionVisibility > 0.1) {
                            achievementSection.classList.add('in-view');
                        } else {
                            achievementSection.classList.remove('in-view');
                        }
                        
                        // Handle cards visibility
                        achievementCards.forEach((card, index) => {
                            const cardRect = card.getBoundingClientRect();
                            const cardVisibility = (viewportHeight - cardRect.top) / viewportHeight;
                            
                            if (cardVisibility > 0.1) {
                                card.classList.add('in-view');
                                // Add staggered animation delay
                                card.style.transitionDelay = `${index * 150}ms`;
                            }
                        });
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        }

        // Add scroll event listener with passive flag for better performance
        window.addEventListener('scroll', updateParallax, { passive: true });

        // Handle window resize
        window.addEventListener('resize', () => {
            parallaxEnabled = window.innerWidth > 768;
            if (!parallaxEnabled) {
                achievementSection.style.backgroundPosition = 'center center';
                achievementCards.forEach(card => {
                    card.style.opacity = '1';
                    card.style.transform = 'none';
                });
            }
        });

        // Initial update
        updateParallax();
    } else {
        // On mobile, just show the cards without effects
        achievementCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'none';
        });
    }
});
