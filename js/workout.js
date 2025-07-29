// Enhanced Workout Module with better validation and accessibility
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('fitTrackCurrentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Set username if available
    if (currentUser.name) {
        document.getElementById('userName').textContent = currentUser.name;
    }

    // DOM Elements
    const workoutForm = document.getElementById('workoutForm');
    const refreshBtn = document.getElementById('refreshWorkouts');
    const notification = document.getElementById('notification');
    const workoutContainer = document.getElementById('recommendedWorkouts');
    const timerTemplate = document.getElementById('timerTemplate');

    // Form elements for validation
    const formInputs = {
        workoutType: document.getElementById('workoutType'),
        duration: document.getElementById('duration'),
        calories: document.getElementById('calories'),
        workoutDate: document.getElementById('workoutDate')
    };

    // Sample workout data (would be replaced with API calls)
    const sampleWorkouts = [
        {
            id: 1,
            type: 'running',
            title: 'Morning Run',
            duration: 30,
            calories: 250,
            difficulty: 'beginner'
        },
        {
            id: 2,
            type: 'weight-training',
            title: 'Upper Body Workout',
            duration: 45,
            calories: 320,
            difficulty: 'intermediate'
        },
        {
            id: 3,
            type: 'cycling',
            title: 'Evening Cycling',
            duration: 40,
            calories: 400,
            difficulty: 'advanced'
        }
    ];

    // Initialize
    renderWorkouts(sampleWorkouts);
    setCurrentDate();
    setupFormValidation();

    // Form submission with enhanced validation
    workoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateWorkoutForm()) {
            return;
        }

        const workoutData = {
            type: formInputs.workoutType.value,
            duration: parseInt(formInputs.duration.value),
            calories: parseInt(formInputs.calories.value),
            date: formInputs.workoutDate.value || new Date().toISOString().split('T')[0],
            userId: currentUser.id,
            notes: document.getElementById('workoutNotes')?.value || ''
        };

        saveWorkout(workoutData);
        showNotification('Workout saved successfully!', 'success');
        workoutForm.reset();
        setCurrentDate();
    });

    // Refresh button with animation
    refreshBtn.addEventListener('click', function() {
        this.classList.add('rotating');
        setTimeout(() => {
            this.classList.remove('rotating');
        }, 1000);
        
        showNotification('Workouts refreshed!', 'info');
        renderWorkouts(sampleWorkouts);
    });

    // Setup real-time form validation
    function setupFormValidation() {
        // Add event listeners for real-time validation
        Object.values(formInputs).forEach(input => {
            input.addEventListener('input', function() {
                validateField(this.id);
            });
            input.addEventListener('blur', function() {
                validateField(this.id);
            });
        });
    }

    // Enhanced field validation
    function validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}Error`);
        
        if (!field) return true;
        
        let isValid = true;
        let errorMessage = '';
        
        // Check required fields
        if (field.required && !field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Field-specific validation
        if (isValid) {
            switch(fieldId) {
                case 'duration':
                    if (field.value < 1 || field.value > 300) {
                        isValid = false;
                        errorMessage = 'Duration must be between 1-300 minutes';
                    }
                    break;
                case 'calories':
                    if (field.value < 1 || field.value > 2000) {
                        isValid = false;
                        errorMessage = 'Calories must be between 1-2000';
                    }
                    break;
                case 'workoutDate':
                    const selectedDate = new Date(field.value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate > today) {
                        isValid = false;
                        errorMessage = 'Date cannot be in the future';
                    }
                    break;
            }
        }
        
        // Update UI
        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            errorElement.textContent = '';
            errorElement.classList.remove('visible');
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('visible');
        }
        
        return isValid;
    }

    // Validate entire form
    function validateWorkoutForm() {
        let isValid = true;
        
        // Validate each field
        Object.keys(formInputs).forEach(fieldId => {
            if (!validateField(fieldId)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showNotification('Please correct the errors in the form', 'error');
            // Focus on first invalid field
            const firstInvalid = document.querySelector('.invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
        
        return isValid;
    }

    // Render workout cards with START buttons
    function renderWorkouts(workouts) {
        workoutContainer.innerHTML = workouts.map(workout => `
            <div class="workout-card ${workout.type}" tabindex="0">
                <div class="workout-badge ${workout.difficulty}" aria-label="Difficulty level: ${workout.difficulty}">
                    ${workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
                </div>
                <h3>
                    <i class="fas ${getWorkoutIcon(workout.type)}" aria-hidden="true"></i>
                    ${workout.title}
                </h3>
                <div class="workout-meta">
                    <span><i class="fas fa-clock" aria-hidden="true"></i> ${workout.duration} min</span>
                    <span><i class="fas fa-fire" aria-hidden="true"></i> ${workout.calories} kcal</span>
                </div>
                <p>${getWorkoutDescription(workout.type)}</p>
                <button class="start-workout-btn" 
                        data-type="${workout.type}"
                        data-duration="${workout.duration}"
                        data-calories="${workout.calories}"
                        aria-label="Start ${workout.title} workout">
                    <i class="fas fa-play" aria-hidden="true"></i> Start Workout
                </button>
            </div>
        `).join('');

        // Add event listeners to all start buttons
        document.querySelectorAll('.start-workout-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.dataset.type;
                const duration = this.dataset.duration;
                const calories = this.dataset.calories;
                startWorkout(type, duration, calories);
            });
            
            // Add keyboard support
            btn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const type = this.dataset.type;
                    const duration = this.dataset.duration;
                    const calories = this.dataset.calories;
                    startWorkout(type, duration, calories);
                }
            });
        });
    }

    // Start workout functionality with enhanced timer
    function startWorkout(type, duration, calories) {
        // Auto-fill the form
        formInputs.workoutType.value = type;
        formInputs.duration.value = duration;
        formInputs.calories.value = calories;
        
        // Show notification
        showNotification(`Preparing ${type} workout...`, 'info');
        
        // Start timer
        startWorkoutTimer(type, parseInt(duration));
    }

    // Enhanced workout timer function
    function startWorkoutTimer(type, duration) {
        const timerClone = timerTemplate.content.cloneNode(true);
        const timerOverlay = timerClone.querySelector('.workout-timer-overlay');
        const timerTitle = timerClone.querySelector('#timerTitle');
        const timerDisplay = timerClone.querySelector('.timer-display');
        const progressBar = timerClone.querySelector('.progress-bar');
        
        timerTitle.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Workout`;
        timerDisplay.textContent = formatTime(duration * 60);
        
        document.body.appendChild(timerClone);
        
        let secondsLeft = duration * 60;
        let isPaused = false;
        let timerInterval;
        const totalSeconds = duration * 60;
        
        // Calculate progress bar width
        function updateProgressBar() {
            const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        function updateTimer() {
            if (!isPaused) {
                secondsLeft--;
                timerDisplay.textContent = formatTime(secondsLeft);
                updateProgressBar();
                
                if (secondsLeft <= 0) {
                    clearInterval(timerInterval);
                    showNotification('Workout completed!', 'success');
                    setTimeout(() => {
                        timerOverlay.classList.remove('active');
                        setTimeout(() => {
                            timerOverlay.remove();
                        }, 300);
                    }, 2000);
                }
            }
        }
        
        timerOverlay.classList.add('active');
        timerInterval = setInterval(updateTimer, 1000);
        
        // Pause button
        timerOverlay.querySelector('.btn-pause').addEventListener('click', function() {
            isPaused = !isPaused;
            this.innerHTML = isPaused ? 
                '<i class="fas fa-play"></i> Resume' : 
                '<i class="fas fa-pause"></i> Pause';
            this.setAttribute('aria-label', isPaused ? 'Resume workout' : 'Pause workout');
        });
        
        // Stop button
        timerOverlay.querySelector('.btn-stop').addEventListener('click', function() {
            clearInterval(timerInterval);
            timerOverlay.classList.remove('active');
            setTimeout(() => {
                timerOverlay.remove();
            }, 300);
            showNotification('Workout saved!', 'success');
        });
        
        // Close on ESC
        timerOverlay.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                clearInterval(timerInterval);
                timerOverlay.classList.remove('active');
                setTimeout(() => {
                    timerOverlay.remove();
                }, 300);
            }
        });
    }

    // Helper function to format time
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Enhanced notification system
    function showNotification(message, type) {
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                           type === 'error' ? 'fa-exclamation-circle' : 
                           'fa-info-circle'}" aria-hidden="true"></i>
            <span>${message}</span>
        `;
        notification.className = `notification ${type} show`;
        
        // Make sure screen readers announce the notification
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

    // Save workout to localStorage
    function saveWorkout(workout) {
        const workouts = JSON.parse(localStorage.getItem('fitTrackWorkouts') || '[]');
        workouts.push({
            ...workout,
            id: Date.now()
        });
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
});