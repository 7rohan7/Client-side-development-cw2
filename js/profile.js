document.addEventListener('DOMContentLoaded', function() {
    // 1. Authentication Check
    const currentUser = JSON.parse(localStorage.getItem('fitTrackCurrentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // 2. DOM Elements
    const notification = document.getElementById('notification');
    const profileForm = document.getElementById('profileForm');
    const healthForm = document.getElementById('healthForm');
    const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const activityFilter = document.getElementById('activityFilter');
    const timeFilter = document.getElementById('timeFilter');
    const logoutLink = document.getElementById('logoutLink');
    const userNameElement = document.getElementById('userName');
    const profileUserNameElement = document.getElementById('profileUserName');

    // 3. Initialize Data
    loadProfileData();
    loadActivityHistory();

    // 4. Logout System (Newly Added)
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('fitTrackCurrentUser');
            localStorage.removeItem('fitTrackProfileData');
            localStorage.removeItem('fitTrackHealthData');
            showNotification('Logging out...', 'info');
            setTimeout(() => window.location.href = 'login.html', 800);
        });
    }

    // 5. Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 6. Form Submissions
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const updatedData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            bio: document.getElementById('bio').value
        };
        updateProfile(updatedData);
    });

    healthForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const healthData = {
            height: parseFloat(document.getElementById('height').value),
            weight: parseFloat(document.getElementById('weight').value),
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value
        };
        if (validateHealthData(healthData)) saveHealthData(healthData);
    });

    // 7. Avatar Upload
    uploadAvatarBtn.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = e => {
            const file = e.target.files[0];
            if (file) uploadAvatar(file);
        };
        input.click();
    });

    // 8. Activity Filters
    activityFilter.addEventListener('change', loadActivityHistory);
    timeFilter.addEventListener('change', loadActivityHistory);

    // ============= FUNCTIONS ============= //

    function loadProfileData() {
        const userData = JSON.parse(localStorage.getItem('fitTrackCurrentUser')) || {};
        const healthData = JSON.parse(localStorage.getItem('fitTrackHealthData')) || {};
        
        document.getElementById('firstName').value = userData.firstName || '';
        document.getElementById('lastName').value = userData.lastName || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('bio').value = userData.bio || '';
        document.getElementById('height').value = healthData.height || '';
        document.getElementById('weight').value = healthData.weight || '';
        document.getElementById('age').value = healthData.age || '';
        document.getElementById('gender').value = healthData.gender || 'male';
        profileUserNameElement.textContent = `${userData.firstName || 'User'} ${userData.lastName || 'Name'}`;
        userNameElement.textContent = `${userData.firstName || 'Profile'}`;
        
        if (userData.joinDate) {
            const joinDate = new Date(userData.joinDate);
            document.getElementById('memberSince').textContent = 
                `Member since ${joinDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        }
        
        document.getElementById('totalWorkouts').textContent = localStorage.getItem('totalWorkouts') || '0';
        document.getElementById('totalCalories').textContent = localStorage.getItem('totalCalories') || '0';
    }

    function loadActivityHistory() {
        const filter = activityFilter.value;
        const timeRange = timeFilter.value;
        let activities = JSON.parse(localStorage.getItem('workouts') || '[]');
        
        if (filter !== 'all') activities = activities.filter(a => a.type === filter);
        if (timeRange !== 'all') {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - (timeRange === '7days' ? 7 : 30));
            activities = activities.filter(a => new Date(a.date) >= cutoffDate);
        }
        
        renderActivities(activities);
    }

    function renderActivities(activities) {
        const activityList = document.getElementById('activityList');
        activityList.innerHTML = activities.length === 0 ? `
            <div class="empty-state">
                <i class="fas fa-dumbbell"></i>
                <p>No activities found</p>
            </div>
        ` : activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <h4>${getActivityName(activity.type)}</h4>
                    <div class="activity-meta">
                        <span><i class="fas fa-clock"></i> ${activity.duration} min</span>
                        <span><i class="fas fa-fire"></i> ${activity.calories} kcal</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(activity.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function updateProfile(data) {
        try {
            localStorage.setItem('fitTrackProfileData', JSON.stringify(data));
            showNotification('Profile updated!', 'success');
            const fullName = `${data.firstName} ${data.lastName}`.trim();
            if (fullName) {
                userNameElement.textContent = fullName;
                profileUserNameElement.textContent = fullName;
                const user = JSON.parse(localStorage.getItem('fitTrackCurrentUser')) || {};
                user.name = fullName;
                localStorage.setItem('fitTrackCurrentUser', JSON.stringify(user));
            }
        } catch (error) {
            console.error('Profile save error:', error);
            showNotification('Save failed!', 'error');
        }
    }

    function updateHealthData(data) {
        try {
            localStorage.setItem('fitTrackHealthData', JSON.stringify(data));
            showNotification('Health data saved!', 'success');
        } catch (error) {
            console.error('Health data error:', error);
            showNotification('Save failed!', 'error');
        }
    }

    function uploadAvatar(file) {
        if (!file.type.match('image.*')) {
            showNotification('Please select an image', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('userAvatar').src = e.target.result;
            const userData = JSON.parse(localStorage.getItem('fitTrackCurrentUser')) || {};
            userData.avatar = e.target.result;
            localStorage.setItem('fitTrackCurrentUser', JSON.stringify(userData));
            showNotification('Avatar updated!', 'success');
        };
        reader.readAsDataURL(file);
    }

    function validateHealthData(data) {
        if (isNaN(data.height) || data.height < 100 || data.height > 250) {
            showNotification('Height must be 100-250cm', 'error');
            return false;
        }
        if (isNaN(data.weight) || data.weight < 30 || data.weight > 200) {
            showNotification('Weight must be 30-200kg', 'error');
            return false;
        }
        if (isNaN(data.age) || data.age < 12 || data.age > 120) {
            showNotification('Age must be 12-120 years', 'error');
            return false;
        }
        return true;
    }

    function showNotification(message, type) {
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        notification.className = `notification-toast ${type} show`;
        setTimeout(() => notification.classList.remove('show'), 3000);
    }

    function getActivityIcon(type) {
        const icons = {
            running: 'fa-running',
            cycling: 'fa-bicycle',
            'weight-training': 'fa-dumbbell'
        };
        return icons[type] || 'fa-heartbeat';
    }

    function getActivityName(type) {
        const names = {
            running: 'Running Session',
            cycling: 'Cycling Session',
            'weight-training': 'Weight Training'
        };
        return names[type] || 'Workout Session';
    }
});