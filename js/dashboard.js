document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Mobile menu toggle
    setupMobileMenu();

    // Highlight active link
    highlightActiveLink();

    // Set user profile info
    displayUserInfo(currentUser);

    // Setup logout functionality
    setupLogout();

    // Check for workout success message
    checkForWorkoutSuccess();

    // Load all dashboard data
    loadDashboardData(currentUser);
});

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            this.setAttribute('aria-expanded', mainNav.classList.contains('active'));
        });
    }
}

function highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    const navLinks = document.querySelectorAll('.main-nav a, .footer-section a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').toLowerCase();
        if (currentPage === linkPage || 
            (currentPage.includes('workout') && linkPage.includes('workout'))) {
            link.classList.add('active');
        }
    });
}

function displayUserInfo(user) {
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.name || 'Profile';
    }
}

function setupLogout() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
}

function checkForWorkoutSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('workoutSaved')) {
        const calories = urlParams.get('calories') || 0;
        showNotification(`Workout saved! ${calories} kcal burned`, 'success');
        
        // Clean URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function loadDashboardData(user) {
    loadUserStats(user);
    loadWorkoutStats(user);
    initializeCharts(user);
    loadRecentActivities(user.fitnessStats?.workouts || []);
}

function loadUserStats(user) {
    if (user.healthData) {
        const weightElement = document.getElementById('currentWeight');
        const heightElement = document.getElementById('userHeight');
        const bmiElement = document.getElementById('bmiValue');
        
        if (weightElement) weightElement.textContent = user.healthData.weight || '--';
        if (heightElement) heightElement.textContent = user.healthData.height || '--';
        
        if (bmiElement && user.healthData.weight && user.healthData.height) {
            const heightInMeters = user.healthData.height / 100;
            const bmi = (user.healthData.weight / (heightInMeters * heightInMeters)).toFixed(1);
            bmiElement.textContent = bmi;
            
            // Add BMI category
            const bmiCategory = getBmiCategory(bmi);
            bmiElement.nextElementSibling.textContent = bmiCategory;
        }
    }
}

function getBmiCategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function loadWorkoutStats(user) {
    const workouts = user.fitnessStats?.workouts || [];
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalWorkouts = workouts.length;
    
    document.getElementById('caloriesBurned').textContent = totalCalories;
    document.getElementById('totalWorkouts').textContent = totalWorkouts;
}

function initializeCharts(user) {
    const workouts = user.fitnessStats?.workouts || [];
    
    // Weekly Activity Chart
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        new Chart(activityCtx.getContext('2d'), {
            type: 'bar',
            data: getWeeklyActivityData(workouts),
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Minutes' }
                    }
                }
            }
        });
    }

    // Calorie Chart
    const calorieCtx = document.getElementById('calorieChart');
    if (calorieCtx) {
        new Chart(calorieCtx.getContext('2d'), {
            type: 'doughnut',
            data: getCalorieData(workouts),
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

function getWeeklyActivityData(workouts) {
    // Group workouts by day of week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityData = Array(7).fill(0);
    
    workouts.forEach(workout => {
        const day = new Date(workout.date).getDay();
        activityData[day] += workout.duration || 0;
    });
    
    return {
        labels: days,
        datasets: [{
            label: 'Activity Minutes',
            data: activityData,
            backgroundColor: 'rgba(74, 144, 226, 0.7)'
        }]
    };
}

function getCalorieData(workouts) {
    const totalBurned = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const avgConsumed = 2000; // This should come from nutrition data
    
    return {
        labels: ['Burned', 'Consumed'],
        datasets: [{
            data: [totalBurned, avgConsumed],
            backgroundColor: ['rgba(74, 144, 226, 0.7)', 'rgba(231, 76, 60, 0.7)']
        }]
    };
}

function loadRecentActivities(workouts) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    if (workouts.length === 0) {
        activityList.innerHTML = '<p class="no-activities">No workouts recorded yet</p>';
        return;
    }

    // Sort by date (newest first) and limit to 3
    const recentWorkouts = [...workouts]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    activityList.innerHTML = recentWorkouts.map(workout => `
        <div class="activity-item" onclick="navigateToWorkout('${workout.id}')">
            <div class="activity-icon">
                <i class="fas ${getWorkoutIcon(workout.type)}"></i>
            </div>
            <div class="activity-details">
                <h4>${formatWorkoutType(workout.type)}</h4>
                <p>${workout.duration} mins • ${workout.calories} kcal</p>
                <span>${formatWorkoutDate(workout.date)}</span>
            </div>
        </div>
    `).join('');
}

// Helper functions
function getWorkoutIcon(type) {
    const icons = {
        running: 'fa-running',
        cycling: 'fa-biking',
        swimming: 'fa-swimmer',
        yoga: 'fa-spa',
        'weight-training': 'fa-dumbbell'
    };
    return icons[type.toLowerCase()] || 'fa-heartbeat';
}

function formatWorkoutType(type) {
    return type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatWorkoutDate(dateString) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Global function for navigation
window.navigateToWorkout = function(workoutId) {
    window.location.href = `workout-details.html?id=${workoutId}`;
};