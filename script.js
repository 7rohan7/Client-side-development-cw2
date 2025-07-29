$(document).ready(function() {
    // Login Form Handler (Existing Code)
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        clearErrors();
        
        const email = $('#email').val().trim();
        const password = $('#password').val().trim();
        let isValid = true;
        
        if (!email) {
            showError('emailError', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!password) {
            showError('passwordError', 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            showError('passwordError', 'Password must be at least 8 characters');
            isValid = false;
        }
        
        if (isValid) {
            simulateLogin();
        }
    });

    // NEW: Logout System for All Pages
    $(document).on('click', '#logoutLink, .logout-btn', function(e) {
        e.preventDefault();
        
        // Clear all authentication data
        localStorage.removeItem('fitTrackCurrentUser');
        localStorage.removeItem('fitTrackProfileData');
        localStorage.removeItem('fitTrackHealthData');
        
        // Show notification
        toastNotification('Logging out...', 'info');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);
    });

    // Forgot Password (Existing Code)
    $('#forgotPassword').click(function(e) {
        e.preventDefault();
        alert('Password reset link will be sent to your email if it exists in our system.');
    });
    
    // Helper Functions
    function isValidEmail(email) {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(email);
    }
    
    function showError(elementId, message) {
        $(`#${elementId}`).text(message).css('color', '#e74c3c');
        $(`#${elementId.replace('Error', '')}`).addClass('error-border');
    }
    
    function clearErrors() {
        $('.error-message').text('');
        $('input').removeClass('error-border');
    }
    
    function simulateLogin() {
        $('.btn-login').prop('disabled', true).text('Logging in...');
        
        // Simulate API call
        setTimeout(() => {
            // Store user data in localStorage
            const userData = {
                email: $('#email').val().trim(),
                name: $('#email').val().trim().split('@')[0],
                lastLogin: new Date().toISOString()
            };
            localStorage.setItem('fitTrackCurrentUser', JSON.stringify(userData));
            
            $('.btn-login').prop('disabled', false).text('Login');
            toastNotification('Login successful!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }, 1500);
    }

    // NEW: Toast Notification Function
    function toastNotification(message, type) {
        const toast = $(`<div class="toast ${type}">${message}</div>`);
        $('body').append(toast);
        
        toast.fadeIn(300).delay(3000).fadeOut(400, function() {
            $(this).remove();
        });
    }

    // NEW: Check Authentication State
    function checkAuth() {
        const user = JSON.parse(localStorage.getItem('fitTrackCurrentUser'));
        const isLoginPage = window.location.pathname.includes('login.html');
        
        if (user && isLoginPage) {
            window.location.href = 'dashboard.html';
        } else if (!user && !isLoginPage) {
            window.location.href = 'login.html';
        }
    }
    
    // Run auth check on page load
    checkAuth();
});