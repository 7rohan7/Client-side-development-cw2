// Tracking System
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const startBtn = document.getElementById('startTrackingBtn');
    const pauseBtn = document.getElementById('pauseTrackingBtn');
    const stopBtn = document.getElementById('stopTrackingBtn');
    const modal = document.getElementById('trackingModal');
    const timeDisplay = document.getElementById('trackingTime');
    const stepsDisplay = document.getElementById('trackingSteps');
    const caloriesDisplay = document.getElementById('trackingCalories');

    // Tracking variables
    let trackingInterval;
    let startTime;
    let steps = 0;
    let calories = 0;
    let isPaused = false;

    // Start Tracking
    startBtn.addEventListener('click', startTracking);

    function startTracking() {
        // Reset previous data
        resetTracking();
        
        // Start new session
        startTime = new Date();
        modal.style.display = 'flex';
        
        // Update every second
        trackingInterval = setInterval(updateTracking, 1000);
        
        // Simulate step detection (shake device in real app)
        window.addEventListener('devicemotion', handleMotion);
        document.addEventListener('click', simulateStep); // Fallback for desktop
        
        // Update button states
        startBtn.disabled = true;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        pauseBtn.onclick = pauseTracking;
    }

    // Update tracking display
    function updateTracking() {
        if (isPaused) return;
        
        const now = new Date();
        const elapsed = new Date(now - startTime);
        
        // Format time as HH:MM:SS
        timeDisplay.textContent = [
            elapsed.getUTCHours().toString().padStart(2, '0'),
            elapsed.getUTCMinutes().toString().padStart(2, '0'),
            elapsed.getUTCSeconds().toString().padStart(2, '0')
        ].join(':');
        
        // Calculate calories (0.04 cal per step)
        calories = Math.floor(steps * 0.04);
        caloriesDisplay.textContent = calories;
    }

    // Motion detection (simplified)
    function handleMotion(event) {
        const acceleration = event.accelerationIncludingGravity;
        const threshold = 15; // Sensitivity
        
        if (Math.abs(acceleration.x) > threshold || 
            Math.abs(acceleration.y) > threshold) {
            steps++;
            stepsDisplay.textContent = steps;
        }
    }

    // Desktop fallback
    function simulateStep() {
        steps++;
        stepsDisplay.textContent = steps;
    }

    // Pause/Resume
    function pauseTracking() {
        isPaused = !isPaused;
        
        if (isPaused) {
            clearInterval(trackingInterval);
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            startTime = new Date(Date.now() - (new Date() - startTime));
            trackingInterval = setInterval(updateTracking, 1000);
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
    }

    // Stop tracking
    stopBtn.addEventListener('click', function() {
        clearInterval(trackingInterval);
        window.removeEventListener('devicemotion', handleMotion);
        document.removeEventListener('click', simulateStep);
        
        // Save session
        saveSession({
            duration: timeDisplay.textContent,
            steps: steps,
            calories: calories,
            date: new Date().toISOString()
        });
        
        // Reset UI
        modal.style.display = 'none';
        startBtn.disabled = false;
        resetTracking();
    });

    // Save to localStorage
    function saveSession(session) {
        const sessions = JSON.parse(localStorage.getItem('trackingSessions') || '[]');
        sessions.push(session);
        localStorage.setItem('trackingSessions', JSON.stringify(sessions));
    }

    // Reset counters
    function resetTracking() {
        steps = 0;
        calories = 0;
        isPaused = false;
        timeDisplay.textContent = '00:00:00';
        stepsDisplay.textContent = '0';
        caloriesDisplay.textContent = '0';
    }
});