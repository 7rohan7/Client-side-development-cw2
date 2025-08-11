document.addEventListener('DOMContentLoaded', function() {

    const addWorkoutBtn = document.getElementById('add-workout-btn');
    const logMealBtn = document.getElementById('log-meal-btn');
    const addWorkoutModal = document.getElementById('add-workout-modal');
    const logMealModal = document.getElementById('log-meal-modal');
    const closeWorkoutModalBtn = document.getElementById('close-workout-modal');
    const closeMealModalBtn = document.getElementById('close-meal-modal');
    const workoutForm = document.getElementById('workout-form');
    const mealForm = document.getElementById('meal-form');
    const caloriesBurnedCard = document.getElementById('calories-burned');
    const resetBtn = document.getElementById('reset-btn');

    function showModal(modal) {
        modal.style.display = 'flex';
    }

    function hideModal(modal) {
        modal.style.display = 'none';
    }

    addWorkoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showModal(addWorkoutModal);
    });

    logMealBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showModal(logMealModal);
    });

    $('#close-workout-modal').on('click', function() {
        hideModal(addWorkoutModal);
    });

    closeMealModalBtn.addEventListener('click', function() {
        hideModal(logMealModal);
    });

    window.addEventListener('click', function(e) {
        if (e.target === addWorkoutModal) {
            hideModal(addWorkoutModal);
        }
        if (e.target === logMealModal) {
            hideModal(logMealModal);
        }
    });

    // --- Chart Data and Initialization ---

    let workoutMinutesData = JSON.parse(localStorage.getItem('workoutMinutesData')) || [0, 0, 0, 0, 0, 0, 0];
    let caloriesConsumedData = JSON.parse(localStorage.getItem('caloriesConsumedData')) || [0, 0, 0, 0, 0, 0, 0];
    let caloriesBurnedData = JSON.parse(localStorage.getItem('caloriesBurnedData')) || [0, 0, 0, 0, 0, 0, 0];
    
    function updateCaloriesBurnedCard() {
        const totalCaloriesBurned = caloriesBurnedData.reduce((acc, curr) => acc + curr, 0);
        caloriesBurnedCard.textContent = `${totalCaloriesBurned} kcal`;
    }

    // Data for the weekly activity chart
    const weeklyActivityData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Workout Minutes',
            data: workoutMinutesData,
            backgroundColor: 'rgba(52, 152, 219, 0.8)', 
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1,
            barPercentage: 0.5
        }]
    };

    // Configuration for the weekly activity chart
    const weeklyActivityConfig = {
        type: 'bar',
        data: weeklyActivityData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        },
    };

    // Initialize the weekly activity chart
    const weeklyActivityChart = new Chart(
        document.getElementById('activityChart'),
        weeklyActivityConfig
    );

    // Data for the calorie chart
    const calorieData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Calories Consumed',
                data: caloriesConsumedData,
                borderColor: 'rgba(231, 76, 60, 1)', 
                backgroundColor: 'rgba(231, 76, 60, 0.5)',
                tension: 0.1,
                pointRadius: 5
            },
            {
                label: 'Calories Burned',
                data: caloriesBurnedData,
                borderColor: 'rgba(46, 204, 113, 1)', 
                backgroundColor: 'rgba(46, 204, 113, 0.5)',
                tension: 0.1,
                pointRadius: 5
            }
        ]
    };

    // Configuration for the calorie chart
    const calorieConfig = {
        type: 'line',
        data: calorieData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    };

    // Initialize the calorie chart
    const calorieChart = new Chart(
        document.getElementById('calorieChart'),
        calorieConfig
    );
    
    weeklyActivityChart.update();
    calorieChart.update();
    updateCaloriesBurnedCard();

    // --- Form Submission Logic ---

    workoutForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const dayIndex = parseInt(document.getElementById('workout-day').value);
        const minutes = parseInt(document.getElementById('workout-minutes').value);
        const burned = parseInt(document.getElementById('calories-burned-input').value);

        if (!isNaN(dayIndex) && !isNaN(minutes) && !isNaN(burned)) {
            workoutMinutesData[dayIndex] += minutes;
            caloriesBurnedData[dayIndex] += burned;

            localStorage.setItem('workoutMinutesData', JSON.stringify(workoutMinutesData));
            localStorage.setItem('caloriesBurnedData', JSON.stringify(caloriesBurnedData));
            
            weeklyActivityChart.update();
            calorieChart.update();
            updateCaloriesBurnedCard();

            workoutForm.reset();
            hideModal(addWorkoutModal);
        }
    });

    mealForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const dayIndex = parseInt(document.getElementById('meal-day').value);
        const consumed = parseInt(document.getElementById('calories-consumed').value);

        if (!isNaN(dayIndex) && !isNaN(consumed)) {
            caloriesConsumedData[dayIndex] += consumed;
            
            localStorage.setItem('caloriesConsumedData', JSON.stringify(caloriesConsumedData));
            
            calorieChart.update();

            mealForm.reset();
            hideModal(logMealModal);
        }
    });

    // --- New Functionality ---
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            // Reset local storage
            localStorage.removeItem('workoutMinutesData');
            localStorage.removeItem('caloriesConsumedData');
            localStorage.removeItem('caloriesBurnedData');

            // Reset chart data arrays to zero
            workoutMinutesData = [0, 0, 0, 0, 0, 0, 0];
            caloriesConsumedData = [0, 0, 0, 0, 0, 0, 0];
            caloriesBurnedData = [0, 0, 0, 0, 0, 0, 0];
            
            // Update chart data
            weeklyActivityChart.data.datasets[0].data = workoutMinutesData;
            calorieChart.data.datasets[0].data = caloriesConsumedData;
            calorieChart.data.datasets[1].data = caloriesBurnedData;

            // Update charts and calorie card
            weeklyActivityChart.update();
            calorieChart.update();
            updateCaloriesBurnedCard();
            
            alert('All data has been reset.');
        }
    });
});