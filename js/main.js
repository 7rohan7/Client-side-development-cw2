/**
 * FitTrack Pro - Main JavaScript File (Updated with About Page)
 * Common functionality across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // Authentication & Page Protection
    // =============================================
    const publicPages = [
        'index.html', 
        'login.html', 
        'signup.html', 
        'about.html'  // Added About page to public pages
    ];

    const protectedPages = [
        'dashboard.html', 
        'workout.html', 
        'nutrition.html', 
        'profile.html',
        'settings.html'
    ];

    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    const currentUser = JSON.parse(localStorage.getItem('fitTrackCurrentUser')) || null;

    // Check if current page is protected
    if (protectedPages.includes(currentPage) && !currentUser) {
        if (!window.location.href.includes('login.html')) {
            sessionStorage.setItem('redirectAfterLogin', currentPage);
            window.location.href = "login.html";
        }
        return;
    }

    // Check if user is already logged in but on auth page
    if (currentUser && publicPages.includes(currentPage) && !['index.html', 'about.html'].includes(currentPage)) {
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || 'dashboard.html';
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectTo;
        return;
    }

    // =============================================
    // Safe UI Functionality
    // =============================================

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');

    if (mobileMenuBtn && mainNav) {
        const toggleMenu = function(e) {
            if (e.target.closest('#mobileMenuBtn')) {
                e.preventDefault();
                mainNav.classList.toggle('active');
                mobileMenuBtn.setAttribute('aria-expanded', mainNav.classList.contains('active'));
            }
        };
        document.addEventListener('click', toggleMenu);
    }

    // User Menu Dropdown with About page support
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        const dropdown = userMenu.querySelector('.dropdown');
        const profileLink = userMenu.querySelector('a[href="profile.html"]');
        
        if (dropdown) {
            // Profile link authentication check
            if (profileLink) {
                profileLink.addEventListener('click', function(e) {
                    if (!currentUser) {
                        e.preventDefault();
                        sessionStorage.setItem('redirectAfterLogin', 'profile.html');
                        window.location.href = 'login.html';
                    }
                });
            }
            
            // Dropdown toggle functionality
            userMenu.addEventListener('click', function(e) {
                if (e.target.closest('a') && !e.target.closest('.dropdown a')) {
                    e.preventDefault();
                    dropdown.classList.toggle('show');
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.user-menu')) {
                    dropdown.classList.remove('show');
                }
            });
        }
    }

    // Active Link Highlight (Updated for About page)
    function highlightActiveLink() {
        try {
            const page = window.location.pathname.split('/').pop().toLowerCase();
            const navLinks = document.querySelectorAll('.main-nav a:not([href^="#"]), .footer-section a:not([href^="#"])');

            navLinks.forEach(link => {
                const linkPage = link.getAttribute('href').toLowerCase();
                link.classList.toggle('active', 
                    page === linkPage || 
                    (page.includes('workout') && linkPage.includes('workout')) ||
                    (page.includes('nutrition') && linkPage.includes('nutrition')) ||
                    (page.includes('about') && linkPage.includes('about'))
                );
            });
        } catch (e) {
            console.error('Link highlighting error:', e);
        }
    }

    // Smooth Scrolling
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(targetId);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        history.pushState(null, null, targetId);
                    }
                }
            });
        });
    }

    // Logout Setup
    function setupLogout() {
        const logoutLinks = document.querySelectorAll('#logoutLink, .logout-btn');
        logoutLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                logout();
            });
        });
    }

    // Notification System
    function setupNotifications() {
        window.showNotification = function(message, type = 'success', duration = 3000) {
            const notification = document.getElementById('notification');
            if (!notification) return;

            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.remove('hidden');

            setTimeout(() => {
                notification.classList.add('hidden');
            }, duration);
        };
    }

    // Initialize features
    highlightActiveLink();
    setupSmoothScrolling();
    setupLogout();
    setupNotifications();

    if (currentUser && typeof updateUserDisplay === 'function') {
        updateUserDisplay();
    }
});

// Utility Functions
window.validateEmail = function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

window.formatDate = function(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

window.handleApiError = function(error) {
    console.error('API Error:', error);
    if (typeof showNotification === 'function') {
        showNotification(error.message || 'An error occurred', 'error');
    }
};