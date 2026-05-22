document.addEventListener('DOMContentLoaded', function() {
    const facultyMembers = document.querySelectorAll('.faculty-member');
    const imageModal = document.getElementById('imageModal');
    const closeImageModal = document.querySelector('.close-image-modal');
    const modalImage = document.getElementById('modalImage');
    const sectionBtns = document.querySelectorAll('.section-btn');
    
    // Section switching functionality
    sectionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.dataset.section;
            
            // Update button states
            sectionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update section visibility
            document.querySelectorAll('.staff-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Staff images data - mapping to detail template images
    const staffImages = {
        // Faculty Members - will show their detail template images
        'shrikesh': '/static/images/staff-details/shrikesh-details.jpg',
        'prashant': '/static/images/staff-details/prashant-details.jpg',
        'jayant': '/static/images/staff-details/jayant-details.jpg',
        'duvannadhan': '/static/images/staff-details/duvannadhan-details.jpg',
        'sameen': '/static/images/staff-details/sameen-details.jpg',
        'diana': '/static/images/staff-details/diana-details.jpg',
        'naveen': '/static/images/staff-details/naveen-details.jpg',
        'deepika': '/static/images/staff-details/deepika-details.jpg',
        
        // Non-Teaching Staff - will show their detail template images
        'ganesh': '/static/images/staff-details/ganesh-details.jpg',
        'vinayak': '/static/images/staff-details/vinayak-details.jpg',
        'sandip': '/static/images/staff-details/sandip-details.jpg',
        'shruti': '/static/images/staff-details/shruti-details.jpg',
        'deepak': '/static/images/staff-details/deepak-details.jpg',
        'komika': '/static/images/staff-details/komika-details.jpg'
    };

    // Click handlers for staff members - opens enlarged detail image
    facultyMembers.forEach(member => {
        member.addEventListener('click', () => {
            const staffId = member.dataset.facultyId;
            const detailImagePath = staffImages[staffId] || '/static/images/default-detail-template.jpg';
            
            // Set the detail template image
            modalImage.src = detailImagePath;
            modalImage.alt = `${staffId} Details`;
            
            // Show the modal
            imageModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // Modal close handlers
    closeImageModal.addEventListener('click', () => {
        imageModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal.style.display === 'block') {
            imageModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});
