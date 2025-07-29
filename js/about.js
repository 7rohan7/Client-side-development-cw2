document.addEventListener('DOMContentLoaded', function() {
    // Team card animation
    const teamCards = document.querySelectorAll('.team-card');
    
    const animateCards = () => {
        teamCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, 150 * index);
        });
    };

    // Stats counter animation
    const statNumbers = document.querySelectorAll('.stat-card h3');
    const duration = 2000; // Animation duration in ms
    const startValues = Array.from(statNumbers).map(() => 0);
    const targetValues = Array.from(statNumbers).map(el => {
        return parseInt(el.textContent.replace(/,/g, ''));
    });
    let startTime = null;

    const animateStats = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        statNumbers.forEach((el, i) => {
            const currentValue = Math.floor(progress * targetValues[i]);
            el.textContent = currentValue.toLocaleString();
        });

        if (progress < 1) {
            requestAnimationFrame(animateStats);
        }
    };

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('stats-section')) {
                    requestAnimationFrame(animateStats);
                }
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    // Observe sections
    document.querySelectorAll('.mission-section, .team-section, .stats-section')
        .forEach(section => observer.observe(section));

    // Initialize animations
    animateCards();

    // Smooth scroll for "Meet the Team" link
    $('a[href="#team"]').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#team').offset().top - 80
        }, 800);
    });

    // Social media hover effects
    $('.social-links a').hover(
        function() {
            $(this).css('transform', 'translateY(-3px)');
        },
        function() {
            $(this).css('transform', 'translateY(0)');
        }
    );
});