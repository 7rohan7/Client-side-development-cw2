document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('fitTrackCurrentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize elements
    const notification = document.getElementById('notification');
    const workoutForm = document.getElementById('workoutForm');
    const refreshBtn = document.getElementById('refreshWorkouts');
    const workoutContainer = document.getElementById('recommendedWorkouts');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const logoutLink = document.getElementById('logoutLink');
    const userNameElement = document.getElementById('userName');

    // Form elements
    const formInputs = {
        workoutType: document.getElementById('workoutType'),
        duration: document.getElementById('duration'),
        calories: document.getElementById('calories'),
        workoutDate: document.getElementById('workoutDate')
    };

    // Set user name if available
    if (currentUser && currentUser.name) {
        userNameElement.textContent = currentUser.name;
    }

    // Sample workout data
    const sampleWorkouts = [
        { id: 1, type: 'running', title: 'Morning Run', duration: 30, calories: 250, difficulty: 'beginner' },
        { id: 2, type: 'weight-training', title: 'Upper Body Workout', duration: 45, calories: 320, difficulty: 'intermediate' },
        { id: 3, type: 'cycling', title: 'Evening Cycling', duration: 40, calories: 400, difficulty: 'advanced' },
        { id: 4, type: 'swimming', title: 'Pool Session', duration: 35, calories: 300, difficulty: 'intermediate' },
        { id: 5, type: 'yoga', title: 'Morning Yoga', duration: 50, calories: 200, difficulty: 'beginner' }
    ];

    // Initial render
    renderWorkouts(sampleWorkouts);
    setCurrentDate();

    // Form submission
    workoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const workoutData = {
            type: formInputs.workoutType.value,
            duration: parseInt(formInputs.duration.value),
            calories: parseInt(formInputs.calories.value),
            date: formInputs.workoutDate.value || new Date().toISOString().split('T')[0],
            userId: currentUser.id
        };

        if (!validateWorkoutForm(workoutData)) return;

        // Add save animation
        const submitBtn = workoutForm.querySelector('button[type="submit"]');
        submitBtn.classList.add('pulse');
        
        saveWorkout(workoutData);
        showNotification('Workout saved successfully!', 'success');
        workoutForm.reset();
        setCurrentDate();

        // Remove animation after delay
        setTimeout(() => {
            submitBtn.classList.remove('pulse');
        }, 1500);
    });

    // Refresh button click
    refreshBtn.addEventListener('click', function() {
        this.classList.add('rotating');
        setTimeout(() => this.classList.remove('rotating'), 1000);
        showNotification('Workouts refreshed!', 'info');
        renderWorkouts(sampleWorkouts);
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', function() {
        mainNav.classList.toggle('show');
        this.setAttribute('aria-expanded', mainNav.classList.contains('show'));
    });

    // Logout functionality
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Logging out...', 'info');
        setTimeout(() => {
            localStorage.removeItem('fitTrackCurrentUser');
            window.location.href = 'login.html';
        }, 1000);
    });

    // Render workout cards
    function renderWorkouts(workouts) {
        if (!workouts || workouts.length === 0) {
            workoutContainer.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-dumbbell"></i>
                    <p>No recommended workouts available</p>
                    <button class="primary-btn" onclick="location.reload()">
                        <i class="fas fa-sync-alt"></i> Try Again
                    </button>
                </div>
            `;
            return;
        }

        workoutContainer.innerHTML = workouts.map(workout => `
            <div class="workout-card">
                <div class="workout-badge ${workout.difficulty}" aria-label="Difficulty: ${workout.difficulty}">
                    ${workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
                </div>
                <div class="workout-card-content">
                    <h3><i class="fas ${getWorkoutIcon(workout.type)}"></i> ${workout.title}</h3>
                    <div class="workout-meta">
                        <span><i class="fas fa-clock"></i> ${workout.duration} min</span>
                        <span><i class="fas fa-fire"></i> ${workout.calories} kcal</span>
                    </div>
                    <p>${getWorkoutDescription(workout.type)}</p>
                    <button class="start-workout-btn" 
                            data-type="${workout.type}"
                            data-duration="${workout.duration}"
                            data-calories="${workout.calories}"
                            aria-label="Start ${workout.title} workout">
                        <i class="fas fa-play"></i> Start Workout
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to start buttons
        document.querySelectorAll('.start-workout-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.dataset.type;
                const duration = this.dataset.duration;
                const calories = this.dataset.calories;
                startWorkout(type, duration, calories);
            });
        });
    }

    // Start workout function
    function startWorkout(type, duration, calories) {
        formInputs.workoutType.value = type;
        formInputs.duration.value = duration;
        formInputs.calories.value = calories;
        showNotification(`Preparing ${type} workout...`, 'info');
        startWorkoutTimer(type, parseInt(duration));
    }

    // Workout timer function
    function startWorkoutTimer(type, duration) {
        const timerOverlay = document.createElement('div');
        timerOverlay.className = 'workout-timer-overlay';
        timerOverlay.innerHTML = `
            <div class="workout-timer">
                <h3>${type.charAt(0).toUpperCase() + type.slice(1)} Workout</h3>
                <div class="progress-container">
                    <div class="progress-bar" style="width: 100%"></div>
                </div>
                <div class="timer-display">${formatTime(duration * 60)}</div>
                <div class="timer-actions">
                    <button class="timer-btn btn-pause"><i class="fas fa-pause"></i> Pause</button>
                    <button class="timer-btn btn-stop"><i class="fas fa-stop"></i> Stop</button>
                </div>
            </div>
        `;

        document.body.appendChild(timerOverlay);
        setTimeout(() => timerOverlay.classList.add('active'), 10);

        let secondsLeft = duration * 60;
        let isPaused = false;
        let timerInterval;
        const totalSeconds = duration * 60;
        const progressBar = timerOverlay.querySelector('.progress-bar');
        const timerDisplay = timerOverlay.querySelector('.timer-display');

        function updateTimer() {
            if (!isPaused) {
                secondsLeft--;
                timerDisplay.textContent = formatTime(secondsLeft);
                const progressPercent = (secondsLeft / totalSeconds) * 100;
                progressBar.style.width = `${progressPercent}%`;
                
                if (secondsLeft <= 0) {
                    clearInterval(timerInterval);
                    showNotification('Workout completed!', 'success');
                    setTimeout(() => {
                        timerOverlay.classList.remove('active');
                        setTimeout(() => timerOverlay.remove(), 300);
                    }, 1500);
                }
            }
        }

        timerInterval = setInterval(updateTimer, 1000);

        // Pause button
        timerOverlay.querySelector('.btn-pause').addEventListener('click', function() {
            isPaused = !isPaused;
            this.innerHTML = isPaused ? 
                '<i class="fas fa-play"></i> Resume' : 
                '<i class="fas fa-pause"></i> Pause';
        });

        // Stop button
        timerOverlay.querySelector('.btn-stop').addEventListener('click', function() {
            clearInterval(timerInterval);
            timerOverlay.classList.remove('active');
            setTimeout(() => timerOverlay.remove(), 300);
            showNotification('Workout saved!', 'success');
        });
    }

    // Show notification
    function showNotification(message, type) {
        const icon = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 
                     'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        notification.className = `notification ${type} show`;
        notification.setAttribute('aria-live', 'assertive');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Set current date in form
    function setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        formInputs.workoutDate.value = today;
    }

    // Validate workout form
    function validateWorkoutForm(data) {
        if (!data.type || !data.duration || !data.calories) {
            showNotification('Please fill all required fields', 'error');
            return false;
        }
        if (data.duration < 1 || data.duration > 300) {
            showNotification('Duration must be between 1-300 minutes', 'error');
            return false;
        }
        if (data.calories < 1 || data.calories > 2000) {
            showNotification('Calories must be between 1-2000', 'error');
            return false;
        }
        return true;
    }

    // Save workout to localStorage
    function saveWorkout(workout) {
        const workouts = JSON.parse(localStorage.getItem('fitTrackWorkouts') || '[]');
        workouts.push({ ...workout, id: Date.now() });
        localStorage.setItem('fitTrackWorkouts', JSON.stringify(workouts));
    }

    // Helper functions
    function getWorkoutIcon(type) {
        const icons = {
            running: 'fa-running',
            cycling: 'fa-bicycle',
            swimming: 'fa-swimmer',
            'weight-training': 'fa-dumbbell',
            yoga: 'fa-spa'
        };
        return icons[type] || 'fa-heartbeat';
    }

    function getWorkoutDescription(type) {
        const descriptions = {
            running: 'Improve cardiovascular health with this energizing run.',
            cycling: 'Build endurance while enjoying the scenery.',
            swimming: 'Full-body workout with low joint impact.',
            'weight-training': 'Build strength and muscle tone.',
            yoga: 'Improve flexibility and mental clarity.'
        };
        return descriptions[type] || 'Great workout for overall fitness.';
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
});