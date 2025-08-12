document.addEventListener('DOMContentLoaded', function() {
    console.log("Nutrition page loaded successfully.");

    const modal = document.getElementById('add-food-modal');
    const addFoodForm = document.getElementById('add-food-form');

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;


// Show the modal when the "Add Food" button is clicked
$('#add-food-btn').on('click', function() {
    $('#add-food-modal').css('display', 'flex');
});

// Hide the modal when the close button is clicked
$('.close-btn').on('click', function() {
    $('#add-food-modal').css('display', 'none');
});

// Hide the modal when clicking outside of it
$(window).on('click', function(event) {
    if ($(event.target).is('#add-food-modal')) {
        $('#add-food-modal').css('display', 'none');
    }
});

    // Handle form submission
    if (addFoodForm) {
        addFoodForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const foodName = document.getElementById('food-name').value;
            const calories = parseInt(document.getElementById('calories').value);
            const protein = parseInt(document.getElementById('protein').value);
            const carbs = parseInt(document.getElementById('carbs').value);
            const fats = parseInt(document.getElementById('fats').value);
            const mealType = document.getElementById('meal-type').value;

            // Update the total nutrition values
            totalCalories += calories;
            totalProtein += protein;
            totalCarbs += carbs;
            totalFats += fats;

            // Update the summary cards
            updateNutritionSummary();

            // Add the new food item to the food diary
            addFoodToDiary(mealType, foodName, calories, protein, carbs, fats);
            
            // Clear the form and close the modal
            addFoodForm.reset();
            modal.style.display = 'none';
        });
    }

    function updateNutritionSummary() {
        document.querySelector('.summary-card:nth-child(1) .summary-value').innerHTML = `${totalCalories}/2000 <small>kcal</small>`;
        document.querySelector('.summary-card:nth-child(2) .summary-value').innerHTML = `${totalProtein}/150 <small>g</small>`;
        document.querySelector('.summary-card:nth-child(3) .summary-value').innerHTML = `${totalCarbs}/250 <small>g</small>`;
        document.querySelector('.summary-card:nth-child(4) .summary-value').innerHTML = `${totalFats}/70 <small>g</small>`;
    }

    function addFoodToDiary(meal, foodName, calories, protein, carbs, fats) {
        const mealCard = document.querySelector(`.food-card[data-meal="${meal}"]`);
        const foodItemsContainer = mealCard.querySelector('.food-items');
        
        // Remove "No foods added yet" message if present
        const noFoodNote = foodItemsContainer.querySelector('.food-card-note');
        if (noFoodNote) {
            foodItemsContainer.removeChild(noFoodNote);
        }

        // Create a new food item element
        const foodItemDiv = document.createElement('div');
        foodItemDiv.classList.add('food-item');
        foodItemDiv.innerHTML = `
            <span>${foodName}</span>
            <span>${calories} kcal</span>
        `;
        
        foodItemsContainer.appendChild(foodItemDiv);

        // Update the meal's total calories
        let currentMealCalories = parseInt(mealCard.querySelector('.food-card-value').textContent);
        currentMealCalories += calories;
        mealCard.querySelector('.food-card-value').innerHTML = `${currentMealCalories} <small>kcal</small>`;
    }
});