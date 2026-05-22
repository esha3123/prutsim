document.addEventListener('DOMContentLoaded', function() {
    // Get all sections
    const sections = document.querySelectorAll('.section');
    
    // Hide all sections initially except the first one
    sections.forEach((section, index) => {
        if (index !== 0) {
            section.style.display = 'none';
        }
    });

    // Add click event listeners to navigation buttons
    document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', function(e) {
            // Skip if it's an external link (has target="_blank")
            if (this.getAttribute('target') === '_blank') {
                return;
            }
            
            e.preventDefault();
            
            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Remove active class from all buttons
            document.querySelectorAll('.view-button').forEach(btn => {
                btn.classList.remove('active-section');
            });
            
            // Add active class to clicked button
            this.classList.add('active-section');
            
            // Show the corresponding section
            const targetId = this.getAttribute('href').substring(1);
            if (targetId) {
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.style.display = 'block';
                    // Smooth scroll to the section
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});
