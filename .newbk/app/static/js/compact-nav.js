// Compact Navigation JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Navigation elements
    const hamburger = document.querySelector('.compact-hamburger');
    const navList = document.querySelector('.compact-nav-list');
    
    // Mobile navigation toggle
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
    }

    function closeMobileNav() {
        if (hamburger) hamburger.classList.remove('active');
        if (navList) navList.classList.remove('open');
        closeAllDropdowns();
    }

    function closeAllDropdowns() {
        document.querySelectorAll('.compact-dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
        document.querySelectorAll('.compact-submenu-menu.show').forEach(submenu => {
            submenu.classList.remove('show');
        });
    }

    // Dropdown click handling for mobile
    document.addEventListener('click', function(e) {
        const dropdownToggle = e.target.closest('.compact-nav-link.dropdown-toggle');
        
        if (dropdownToggle && window.innerWidth <= 991) {
            e.preventDefault();
            e.stopPropagation();
            
            const parentItem = dropdownToggle.closest('.compact-nav-item.dropdown');
            const dropdownMenu = parentItem.querySelector('.compact-dropdown-menu');
            
            if (dropdownMenu) {
                const isOpen = dropdownMenu.classList.contains('show');
                
                // Close other dropdowns
                document.querySelectorAll('.compact-dropdown-menu.show').forEach(menu => {
                    if (menu !== dropdownMenu) {
                        menu.classList.remove('show');
                    }
                });
                
                // Toggle current dropdown
                if (isOpen) {
                    dropdownMenu.classList.remove('show');
                } else {
                    dropdownMenu.classList.add('show');
                }
            }
        }
        
        // Submenu click handling for mobile
        const submenuToggle = e.target.closest('.compact-dropdown-submenu .dropdown-toggle');
        
        if (submenuToggle && window.innerWidth <= 991) {
            e.preventDefault();
            e.stopPropagation();
            
            const parentSubmenu = submenuToggle.closest('.compact-dropdown-submenu');
            const submenuMenu = parentSubmenu.querySelector('.compact-submenu-menu');
            
            if (submenuMenu) {
                const isOpen = submenuMenu.classList.contains('show');
                
                // Close sibling submenus
                const parentDropdown = parentSubmenu.closest('.compact-dropdown-menu');
                parentDropdown.querySelectorAll('.compact-submenu-menu.show').forEach(menu => {
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
            }
        }
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 991) {
            if (!e.target.closest('.compact-nav') && navList && navList.classList.contains('open')) {
                closeMobileNav();
            }
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.compact-nav-item.dropdown')) {
            closeAllDropdowns();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 991) {
            closeMobileNav();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (window.innerWidth <= 991 && navList && navList.classList.contains('open')) {
                closeMobileNav();
            } else {
                closeAllDropdowns();
            }
        }
    });

    // Smart positioning for dropdowns near screen edges
    function adjustDropdownPosition() {
        if (window.innerWidth > 991) {
            document.querySelectorAll('.compact-dropdown-menu').forEach(menu => {
                const rect = menu.getBoundingClientRect();
                const viewport = window.innerWidth;
                
                if (rect.right > viewport - 20) {
                    menu.style.left = 'auto';
                    menu.style.right = '0';
                }
            });
            
            document.querySelectorAll('.compact-submenu-menu').forEach(submenu => {
                const rect = submenu.getBoundingClientRect();
                const viewport = window.innerWidth;
                
                if (rect.right > viewport - 20) {
                    submenu.style.left = 'auto';
                    submenu.style.right = '100%';
                    submenu.style.marginLeft = '0';
                    submenu.style.marginRight = '2px';
                }
            });
        }
    }

    // Apply smart positioning on hover
    document.querySelectorAll('.compact-nav-item.dropdown').forEach(item => {
        item.addEventListener('mouseenter', adjustDropdownPosition);
    });
});
