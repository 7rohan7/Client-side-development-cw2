// Enhanced Auth System with Complete Validation
class AuthSystem {
    static init() {
        // Initialize users array from localStorage
        this.users = JSON.parse(localStorage.getItem('fitTrackUsers')) || [];
        
        // Add demo user if empty (for testing)
        if (this.users.length === 0) {
            this.users.push({
                name: "Test User",
                email: "user@example.com",
                password: "password123",
                healthData: {
                    height: 175,
                    weight: 70,
                    age: 30,
                    gender: "male"
                }
            });
            this.saveUsers();
        }
        
        this.bindEvents();
        this.checkAuthState();
    }

    static bindEvents() {
        // Signup Form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateAndSignup();
            });

            // Real-time validation
            document.getElementById('name')?.addEventListener('input', () => this.validateName());
            document.getElementById('email')?.addEventListener('input', () => this.validateEmail());
            document.getElementById('password')?.addEventListener('input', () => this.validatePassword());
            document.getElementById('confirmPassword')?.addEventListener('input', () => this.validateConfirmPassword());
            document.getElementById('height')?.addEventListener('input', () => this.validateHeight());
            document.getElementById('weight')?.addEventListener('input', () => this.validateWeight());
            document.getElementById('age')?.addEventListener('input', () => this.validateAge());
            document.getElementById('gender')?.addEventListener('change', () => this.validateGender());
            document.getElementById('terms')?.addEventListener('change', () => this.validateTerms());
        }

        // Login Form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateAndLogin();
            });

            // Real-time validation for login
            document.getElementById('email')?.addEventListener('input', () => this.validateLoginEmail());
            document.getElementById('password')?.addEventListener('input', () => this.validateLoginPassword());
        }
    }

    // Signup Validation
    static validateAndSignup() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const termsChecked = document.getElementById('terms').checked;

        let isValid = true;

        // Reset all errors
        this.clearAllErrors();

        // Name validation
        if (!name) {
            this.showError('nameError', 'Full name is required');
            isValid = false;
        } else if (name.length < 3) {
            this.showError('nameError', 'Name must be at least 3 characters');
            isValid = false;
        }

        // Email validation
        if (!email) {
            this.showError('emailError', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('emailError', 'Please enter a valid email');
            isValid = false;
        } else if (this.emailExists(email)) {
            this.showError('emailError', 'Email already registered');
            isValid = false;
        }

        // Password validation
        if (!password) {
            this.showError('passwordError', 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            this.showError('passwordError', 'Password must be at least 8 characters');
            isValid = false;
        }

        // Confirm password
        if (!confirmPassword) {
            this.showError('confirmError', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showError('confirmError', 'Passwords do not match');
            isValid = false;
        }

        // Health data validation
        if (!height || height < 100 || height > 250) {
            this.showError('heightError', 'Please enter a valid height (100-250 cm)');
            isValid = false;
        }

        if (!weight || weight < 30 || weight > 200) {
            this.showError('weightError', 'Please enter a valid weight (30-200 kg)');
            isValid = false;
        }

        if (!age || age < 12 || age > 120) {
            this.showError('ageError', 'Please enter a valid age (12-120)');
            isValid = false;
        }

        if (!gender) {
            this.showError('genderError', 'Please select your gender');
            isValid = false;
        }

        // Terms checkbox
        if (!termsChecked) {
            this.showError('termsError', 'You must accept the terms');
            isValid = false;
        }

        if (isValid) {
            this.attemptSignup(name, email, password, height, weight, age, gender);
        }
    }

    static attemptSignup(name, email, password, height, weight, age, gender) {
        const btn = document.querySelector('#signupForm button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner">⏳</span> Creating account...';

        setTimeout(() => {
            try {
                this.registerUser(name, email, password, height, weight, age, gender);
                alert('Registration successful! Please login.');
                window.location.href = "login.html";
            } catch (error) {
                this.showError('emailError', error.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Create Account';
            }
        }, 1500);
    }

    // Login Methods
    static validateAndLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        let isValid = true;

        // Reset errors
        this.clearError('emailError');
        this.clearError('passwordError');

        // Email validation
        if (!email) {
            this.showError('emailError', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('emailError', 'Please enter a valid email');
            isValid = false;
        }

        // Password validation
        if (!password) {
            this.showError('passwordError', 'Password is required');
            isValid = false;
        }

        if (isValid) {
            this.attemptLogin(email, password);
        }
    }

    static attemptLogin(email, password) {
        const btn = document.querySelector('#loginForm button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner">⏳</span> Logging in...';

        setTimeout(() => {
            try {
                const user = this.authenticate(email, password);
                this.setCurrentUser(user);
                window.location.href = "dashboard.html";
            } catch (error) {
                this.showError('passwordError', error.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Login';
            }
        }, 1000);
    }

    // Health data validation methods
    static validateHeight() {
        const height = document.getElementById('height').value;
        if (!height || height < 100 || height > 250) {
            this.showError('heightError', 'Height must be 100-250 cm');
        } else {
            this.clearError('heightError');
        }
    }

    static validateWeight() {
        const weight = document.getElementById('weight').value;
        if (!weight || weight < 30 || weight > 200) {
            this.showError('weightError', 'Weight must be 30-200 kg');
        } else {
            this.clearError('weightError');
        }
    }

    static validateAge() {
        const age = document.getElementById('age').value;
        if (!age || age < 12 || age > 120) {
            this.showError('ageError', 'Age must be 12-120');
        } else {
            this.clearError('ageError');
        }
    }

    static validateGender() {
        const gender = document.getElementById('gender').value;
        if (!gender) {
            this.showError('genderError', 'Please select gender');
        } else {
            this.clearError('genderError');
        }
    }

    // Authentication methods
    static authenticate(email, password) {
        const user = this.users.find(u => u.email === email);
        if (!user) throw new Error("Email not found");
        if (user.password !== password) throw new Error("Incorrect password");
        return user;
    }

    static registerUser(name, email, password, height, weight, age, gender) {
        const newUser = { 
            name, 
            email, 
            password,
            healthData: {
                height: parseInt(height),
                weight: parseFloat(weight),
                age: parseInt(age),
                gender
            },
            fitnessStats: {
                lastUpdated: new Date().toISOString(),
                activities: []
            }
        };
        this.users.push(newUser);
        this.saveUsers();
    }

    // Helper Methods
    static saveUsers() {
        localStorage.setItem('fitTrackUsers', JSON.stringify(this.users));
    }

    static emailExists(email) {
        return this.users.some(user => user.email === email);
    }

    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    static clearError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }

    static clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    static setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    static checkAuthState() {
        const currentPage = window.location.pathname.split('/').pop();
        const protectedPages = ['dashboard.html'];
        const authPages = ['login.html', 'signup.html'];

        const user = this.getCurrentUser();

        if (user && authPages.includes(currentPage)) {
            window.location.href = "dashboard.html";
        } else if (!user && protectedPages.includes(currentPage)) {
            window.location.href = "login.html";
        }
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => AuthSystem.init());