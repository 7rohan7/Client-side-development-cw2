document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addFoodBtn = document.getElementById('addFoodBtn');
    const foodModal = document.getElementById('foodModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const foodForm = document.getElementById('foodForm');
    
    // Sample nutrition data
    let nutritionData = {
        calories: { consumed: 0, goal: 2000 },
        protein: { consumed: 0, goal: 150 },
        carbs: { consumed: 0, goal: 250 },
        fats: { consumed: 0, goal: 70 },
        meals: {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        }
    };
    
    // Load saved data from localStorage
    function loadNutritionData() {
        const savedData = localStorage.getItem('fitTrackNutritionData');
        if (savedData) {
            nutritionData = JSON.parse(savedData);
            updateNutritionSummary();
            updateMealLists();
        }
    }
    
    // Save data to localStorage
    function saveNutritionData() {
        localStorage.setItem('fitTrackNutritionData', JSON.stringify(nutritionData));
    }
    
    // Update the nutrition summary cards
    function updateNutritionSummary() {
        document.getElementById('caloriesConsumed').textContent = nutritionData.calories.consumed;
        document.getElementById('proteinConsumed').textContent = nutritionData.protein.consumed;
        document.getElementById('carbsConsumed').textContent = nutritionData.carbs.consumed;
        document.getElementById('fatsConsumed').textContent = nutritionData.fats.consumed;
        
        // Update progress bars
        document.getElementById('caloriesProgress').style.width = `${Math.min(100, (nutritionData.calories.consumed / nutritionData.calories.goal) * 100)}%`;
        document.getElementById('proteinProgress').style.width = `${Math.min(100, (nutritionData.protein.consumed / nutritionData.protein.goal) * 100)}%`;
        document.getElementById('carbsProgress').style.width = `${Math.min(100, (nutritionData.carbs.consumed / nutritionData.carbs.goal) * 100)}%`;
        document.getElementById('fatsProgress').style.width = `${Math.min(100, (nutritionData.fats.consumed / nutritionData.fats.goal) * 100)}%`;
    }
    
    // Update the meal lists
    function updateMealLists() {
        updateMealList('breakfast');
        updateMealList('lunch');
        updateMealList('dinner');
        updateMealList('snacks');
    }
    
    function updateMealList(mealType) {
        const mealList = document.getElementById(`${mealType}List`);
        const meals = nutritionData.meals[mealType];
        
        // Clear existing items except the empty message
        const emptyMessage = mealList.querySelector('.empty-message');
        mealList.innerHTML = '';
        if (emptyMessage) mealList.appendChild(emptyMessage);
        
        if (meals.length === 0) {
            if (!emptyMessage) {
                const msg = document.createElement('li');
                msg.className = 'empty-message';
                msg.textContent = 'No foods added yet';
                mealList.appendChild(msg);
            }
            return;
        }
        
        // Remove empty message if there are items
        if (emptyMessage) emptyMessage.remove();
        
        // Calculate total calories for this meal
        let mealCalories = 0;
        
        // Add each food item
        meals.forEach((food, index) => {
            mealCalories += food.calories;
            
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="food-name">${food.name}</span>
                <span class="food-calories">${food.calories} kcal</span>
                <button class="delete-food" data-meal="${mealType}" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            mealList.appendChild(li);
        });
        
        // Update meal calories in header
        const mealHeader = document.querySelector(`#${mealType}List`).closest('.meal-card').querySelector('.meal-calories');
        if (mealHeader) {
            mealHeader.textContent = `${mealCalories} kcal`;
        }
    }
    
    // Modal functions
    function openModal() {
        foodModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        foodModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        foodForm.reset();
    }
    
    // Event Listeners
    addFoodBtn.addEventListener('click', openModal);
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal when clicking outside
    foodModal.addEventListener('click', function(e) {
        if (e.target === foodModal) {
            closeModal();
        }
    });
    
    // Form submission
    foodForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const foodName = document.getElementById('foodName').value;
        const foodMeal = document.getElementById('foodMeal').value;
        const foodAmount = document.getElementById('foodAmount').value;
        const foodUnit = document.getElementById('foodUnit').value;
        const foodCalories = parseInt(document.getElementById('foodCalories').value);
        const foodProtein = parseInt(document.getElementById('foodProtein').value) || 0;
        const foodCarbs = parseInt(document.getElementById('foodCarbs').value) || 0;
        const foodFats = parseInt(document.getElementById('foodFats').value) || 0;
        
        // Create food object
        const foodItem = {
            name: foodName,
            amount: foodAmount,
            unit: foodUnit,
            calories: foodCalories,
            protein: foodProtein,
            carbs: foodCarbs,
            fats: foodFats,
            date: new Date().toISOString()
        };
        
        // Add to nutrition data
        nutritionData.meals[foodMeal].push(foodItem);
        nutritionData.calories.consumed += foodCalories;
        nutritionData.protein.consumed += foodProtein;
        nutritionData.carbs.consumed += foodCarbs;
        nutritionData.fats.consumed += foodFats;
        
        // Save and update UI
        saveNutritionData();
        updateNutritionSummary();
        updateMealLists();
        
        // Show success notification
        showNotification('Food added successfully!', 'success');
        
        // Close modal
        closeModal();
    });
    
    // Delete food item
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-food')) {
            const btn = e.target.closest('.delete-food');
            const mealType = btn.dataset.meal;
            const index = parseInt(btn.dataset.index);
            
            // Get the food item being deleted
            const foodItem = nutritionData.meals[mealType][index];
            
            // Update nutrition data
            nutritionData.calories.consumed -= foodItem.calories;
            nutritionData.protein.consumed -= foodItem.protein;
            nutritionData.carbs.consumed -= foodItem.carbs;
            nutritionData.fats.consumed -= foodItem.fats;
            
            // Remove from array
            nutritionData.meals[mealType].splice(index, 1);
            
            // Save and update UI
            saveNutritionData();
            updateNutritionSummary();
            updateMealLists();
            
            // Show notification
            showNotification('Food removed successfully!', 'success');
        }
    });
    
    // Notification function
    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
    
    // Initialize
    loadNutritionData();
});