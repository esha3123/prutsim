document.addEventListener('DOMContentLoaded', function() {
    // Navigation elements
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    const nav = document.querySelector('.nav');

    // Apply page transition effect to main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('page-transition');
    }

    // Add spacing to content to prevent crowding
    const content = document.querySelector('#content');
    if (content) {
        content.style.padding = '20px';
        content.style.margin = '0 auto';
        content.style.maxWidth = '1200px';
    }

    // Enhanced Mobile Navigation Toggle
    if (hamburger && navList) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = this.classList.contains('active');
            
            if (isOpen) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
    }

    function openMobileNav() {
        if (hamburger) hamburger.classList.add('active');
        if (navList) navList.classList.add('open');
        
        // Prevent body scroll when mobile menu is open
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        
        // Add backdrop
        addMobileNavBackdrop();
    }

    function closeMobileNav() {
        if (hamburger) hamburger.classList.remove('active');
        if (navList) navList.classList.remove('open');
        
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        
        // Remove backdrop
        removeMobileNavBackdrop();
        
        // Close all open dropdowns when closing mobile nav
        closeAllDropdowns();
    }

    function addMobileNavBackdrop() {
        const existingBackdrop = document.querySelector('.mobile-nav-backdrop');
        if (existingBackdrop) return;
        
        const backdrop = document.createElement('div');
        backdrop.className = 'mobile-nav-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(backdrop);
        
        // Fade in backdrop
        requestAnimationFrame(() => {
            backdrop.style.opacity = '1';
        });
        
        // Close nav when backdrop is clicked
        backdrop.addEventListener('click', closeMobileNav);
    }

    function removeMobileNavBackdrop() {
        const backdrop = document.querySelector('.mobile-nav-backdrop');
        if (backdrop) {
            backdrop.style.opacity = '0';
            setTimeout(() => {
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            }, 300);
        }
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.nav-item.dropdown .dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-submenu-menu.show').forEach(submenu => {
            submenu.classList.remove('show');
        });
        document.querySelectorAll('.nav-item.dropdown.show').forEach(item => {
            item.classList.remove('show');
        });
    }

    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 991) {
            if (!e.target.closest('.nav') && !e.target.closest('.mobile-nav-backdrop')) {
                if (navList && navList.classList.contains('open')) {
                    closeMobileNav();
                }
            }
        }
    });

    // Enhanced window resize handling
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 991) {
                // Desktop mode - ensure mobile nav is closed and reset dropdowns
                closeMobileNav();
                closeAllDropdowns();
                
                // Re-initialize desktop dropdowns
                initDesktopDropdowns();
            } else {
                // Mobile mode - ensure desktop dropdowns are closed
                closeAllDropdowns();
            }
        }, 150);
    });

    // Enhanced Dropdown Click Handling for Mobile/Tablet
    document.addEventListener('click', function(e) {
        const dropdownToggle = e.target.closest('.nav-link.dropdown-toggle');
        
        if (dropdownToggle && window.innerWidth <= 991) {
            e.preventDefault();
            e.stopPropagation();
            
            const parentItem = dropdownToggle.closest('.nav-item.dropdown');
            const dropdownMenu = parentItem.querySelector('.dropdown-menu');
            
            if (dropdownMenu) {
                const isOpen = dropdownMenu.classList.contains('show');
                
                // Close all other main dropdowns
                document.querySelectorAll('.nav-item.dropdown .dropdown-menu.show').forEach(menu => {
                    if (menu !== dropdownMenu) {
                        menu.classList.remove('show');
                        menu.parentElement.classList.remove('show');
                        // Close all submenus in other dropdowns
                        menu.querySelectorAll('.dropdown-submenu-menu.show').forEach(submenu => {
                            submenu.classList.remove('show');
                        });
                    }
                });
                
                // Toggle current dropdown
                if (isOpen) {
                    dropdownMenu.classList.remove('show');
                    parentItem.classList.remove('show');
                    // Close all submenus when closing main menu
                    dropdownMenu.querySelectorAll('.dropdown-submenu-menu.show').forEach(submenu => {
                        submenu.classList.remove('show');
                    });
                } else {
                    dropdownMenu.classList.add('show');
                    parentItem.classList.add('show');
                }
                
                // Add smooth animation
                dropdownMenu.style.animation = isOpen ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out';
            }
        }
        
        // Enhanced submenu click handling for mobile/tablet
        const submenuToggle = e.target.closest('.dropdown-submenu .dropdown-toggle');
        
        if (submenuToggle && window.innerWidth <= 991) {
            e.preventDefault();
            e.stopPropagation();
            
            const parentSubmenu = submenuToggle.closest('.dropdown-submenu');
            const submenuMenu = parentSubmenu.querySelector('.dropdown-submenu-menu');
            
            if (submenuMenu) {
                const isOpen = submenuMenu.classList.contains('show');
                
                // Close sibling submenus
                const parentDropdown = parentSubmenu.closest('.dropdown-menu');
                parentDropdown.querySelectorAll('.dropdown-submenu-menu.show').forEach(menu => {
                    if (menu !== submenuMenu) {
                        menu.classList.remove('show');
                    }
                });
                
                // Toggle current submenu
                if (isOpen) {
                    submenuMenu.classList.remove('show');
                } else {
                    submenuMenu.classList.add('show');
                }
                
                // Add smooth animation
                submenuMenu.style.animation = isOpen ? 'slideUp 0.25s ease-out' : 'slideDown 0.25s ease-out';
            }
        }
    });

    // Enhanced Desktop Dropdown Initialization
    function initDesktopDropdowns() {
        if (window.innerWidth < 992) return;
        
        // Clear existing timeout storage
        if (!window.navTimeouts) window.navTimeouts = new Map();
        
        // Main dropdown hover handling
        document.querySelectorAll('.nav-item.dropdown').forEach(function(dropdown) {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (!menu) return;
            
            // Mouse enter
            dropdown.addEventListener('mouseenter', function() {
                const timeoutKey = 'main-' + dropdown.dataset.dropdownId || Math.random();
                
                // Clear any existing timeout
                if (window.navTimeouts.has(timeoutKey)) {
                    clearTimeout(window.navTimeouts.get(timeoutKey));
                    window.navTimeouts.delete(timeoutKey);
                }
                
                // Show dropdown immediately
                menu.classList.add('show');
                dropdown.classList.add('show');
                
                // Smart positioning for viewport
                requestAnimationFrame(() => {
                    const rect = menu.getBoundingClientRect();
                    const viewport = window.innerWidth;
                    
                    if (rect.right > viewport - 20) {
                        menu.style.left = 'auto';
                        menu.style.right = '0';
                        menu.style.transform = 'translateX(0)';
                    }
                });
            });
            
            // Mouse leave
            dropdown.addEventListener('mouseleave', function() {
                const timeoutKey = 'main-' + dropdown.dataset.dropdownId || Math.random();
                
                const timeout = setTimeout(() => {
                    menu.classList.remove('show');
                    dropdown.classList.remove('show');
                    // Close all submenus
                    dropdown.querySelectorAll('.dropdown-submenu-menu.show').forEach(sub => {
                        sub.classList.remove('show');
                    });
                    window.navTimeouts.delete(timeoutKey);
                }, 200);
                
                window.navTimeouts.set(timeoutKey, timeout);
            });
        });
        
        // Submenu hover handling
        document.querySelectorAll('.dropdown-submenu').forEach(function(submenu) {
            const submenuMenu = submenu.querySelector('.dropdown-submenu-menu');
            if (!submenuMenu) return;
            
            // Mouse enter
            submenu.addEventListener('mouseenter', function() {
                const timeoutKey = 'sub-' + submenu.dataset.submenuId || Math.random();
                
                // Clear any existing timeout
                if (window.navTimeouts.has(timeoutKey)) {
                    clearTimeout(window.navTimeouts.get(timeoutKey));
                    window.navTimeouts.delete(timeoutKey);
                }
                
                // Close sibling submenus
                const parent = submenu.parentElement;
                parent.querySelectorAll(':scope > .dropdown-submenu > .dropdown-submenu-menu.show').forEach(sibling => {
                    if (sibling !== submenuMenu) {
                        sibling.classList.remove('show');
                    }
                });
                
                // Show current submenu
                submenuMenu.classList.add('show');
                
                // Smart positioning for viewport
                requestAnimationFrame(() => {
                    const rect = submenuMenu.getBoundingClientRect();
                    const viewport = window.innerWidth;
                    
                    if (rect.right > viewport - 20) {
                        submenuMenu.style.left = 'auto';
                        submenuMenu.style.right = '100%';
                        submenuMenu.style.marginLeft = '0';
                        submenuMenu.style.marginRight = '12px';
                    }
                });
            });
            
            // Mouse leave
            submenu.addEventListener('mouseleave', function() {
                const timeoutKey = 'sub-' + submenu.dataset.submenuId || Math.random();
                
                const timeout = setTimeout(() => {
                    submenuMenu.classList.remove('show');
                    // Close nested submenus too
                    submenuMenu.querySelectorAll('.dropdown-submenu-menu.show').forEach(nested => {
                        nested.classList.remove('show');
                    });
                    window.navTimeouts.delete(timeoutKey);
                }, 150);
                
                window.navTimeouts.set(timeoutKey, timeout);
            });
        });
    }

    // Initialize desktop dropdowns on load
    initDesktopDropdowns();

    // Close all dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-item.dropdown') && !e.target.closest('.dropdown-submenu')) {
            closeAllDropdowns();
        }
    });

    // Enhanced keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (window.innerWidth <= 991 && navList && navList.classList.contains('open')) {
                closeMobileNav();
            } else {
                closeAllDropdowns();
            }
        }
    });

    // Add smooth animations CSS if not present
    if (!document.querySelector('#nav-animations-css')) {
        const style = document.createElement('style');
        style.id = 'nav-animations-css';
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    max-height: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    max-height: 500px;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideUp {
                from {
                    opacity: 1;
                    max-height: 500px;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    max-height: 0;
                    transform: translateY(-10px);
                }
            }
        `;
        document.head.appendChild(style);
    }


    // Back to top button functionality
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        // Show/hide the button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Smooth scroll to top when clicked
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Form validation
    const formInputs = document.querySelectorAll('.m3-text-field input');
    
    formInputs.forEach((input) => {
        const validateInput = () => {
            const field = input.closest('.m3-text-field');
            if (field) {
                if (input.validity.valid) {
                    field.classList.remove('invalid');
                    field.classList.add('valid');
                } else {
                    field.classList.remove('valid');
                    field.classList.add('invalid');
                }
            }
        };
        
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', validateInput);
    });
    
    // Newsletter form
    const newsletterForm = document.querySelector('.m3-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailField = this.querySelector('input[type="email"]');
            
            if (emailField && emailField.validity.valid) {
                if (!this.querySelector('.m3-success-message')) {
                    const successMsg = document.createElement('div');
                    successMsg.textContent = 'Thank you for subscribing!';
                    successMsg.classList.add('m3-success-message');
                    
                    this.appendChild(successMsg);
                    emailField.value = '';
                    
                    setTimeout(() => {
                        successMsg.remove();
                    }, 3000);
                }
            }
        });
    }

    // Contact Form Functionality
    const contactBtn = document.createElement('div');
    contactBtn.className = 'floating-contact-btn';
    contactBtn.innerHTML = '<i class="material-icons">chat</i>';
    document.body.appendChild(contactBtn);

    const modalHtml = `
        <div class="contact-modal">
            <div class="contact-form-container">
                <button class="close-modal">&times;</button>
                <h2>Contact Us</h2>
                <form class="contact-form" id="contactForm">
                    <div class="form-group">
                        <input type="text" id="name" required placeholder="Your Name">
                    </div>
                    <div class="form-group">
                        <input type="tel" id="phone" required placeholder="Phone Number">
                    </div>
                    <div class="form-group">
                        <input type="email" id="email" required placeholder="Email Address">
                    </div>
                    <div class="form-group">
                        <textarea id="message" rows="4" required placeholder="Your Message"></textarea>
                    </div>
                    <div class="contact-actions">
                        <button type="submit" class="contact-btn primary">
                            <i class="material-icons">send</i>
                            Send Message
                        </button>
                        <a href="tel:+918356901298" class="contact-btn secondary">
                            <i class="material-icons">phone</i>
                            Call Now
                        </a>
                        <a href="https://wa.me/+918356901298" target="_blank" class="contact-btn secondary">
                            
                            WhatsApp
                        </a>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Event Listeners
    const modal = document.querySelector('.contact-modal');
    const closeBtn = document.querySelector('.close-modal');
    const contactForm = document.getElementById('contactForm');

    contactBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        modal.classList.remove('active');
        contactForm.reset();
    });
    
    // Bootstrap submenu dropdown functionality with hover support
    function initBootstrapSubmenus() {
        // Remove existing event listeners to prevent duplicates
        const existingElements = document.querySelectorAll('.dropdown-submenu > .dropdown-toggle');
        existingElements.forEach(el => {
            el.replaceWith(el.cloneNode(true));
        });
        
        // Handle submenu clicks on mobile
        document.querySelectorAll('.dropdown-submenu > .dropdown-toggle').forEach(function(element) {
            element.addEventListener('click', function(e) {
                // Only handle clicks on mobile
                if (window.innerWidth < 992) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const submenu = this.nextElementSibling;
                    const isOpen = submenu.classList.contains('show');
                    
                    // Close all other submenus at the same level
                    const parentDropdown = this.closest('.dropdown-menu');
                    parentDropdown.querySelectorAll('.dropdown-submenu-menu.show').forEach(function(openSubmenu) {
                        if (openSubmenu !== submenu) {
                            openSubmenu.classList.remove('show');
                        }
                    });
                    
                    // Toggle current submenu
                    if (isOpen) {
                        submenu.classList.remove('show');
                    } else {
                        submenu.classList.add('show');
                    }
                }
            });
        });
        
        // Close all dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-item.dropdown')) {
                document.querySelectorAll('.nav-item.dropdown.show').forEach(function(dropdown) {
                    dropdown.classList.remove('show');
                    const menu = dropdown.querySelector('.dropdown-menu');
                    if (menu) menu.classList.remove('show');
                });
                document.querySelectorAll('.dropdown-submenu-menu.show').forEach(function(submenu) {
                    submenu.classList.remove('show');
                });
            }
        });
    }
    
    // Initialize dropdowns
    initBootstrapSubmenus();
    
    // Re-initialize on window resize to handle desktop/mobile transitions
    if (!window.mainResizeTimeout) {
        window.addEventListener('resize', function() {
            clearTimeout(window.mainResizeTimeout);
            window.mainResizeTimeout = setTimeout(() => {
                // Clean up existing state
                document.querySelectorAll('.dropdown-submenu-menu.show, .nav-item.dropdown.show').forEach(el => {
                    el.classList.remove('show');
                });
                initBootstrapSubmenus();
            }, 250);
        });
    }
});

