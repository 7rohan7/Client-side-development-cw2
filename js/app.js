class App {
    static init() {
        this.checkAuth();
        this.setCurrentPage();
        this.setupLogout();
    }

    static checkAuth() {
        const publicPages = ['index.html', 'login.html', 'signup.html'];
        const currentPage = location.pathname.split('/').pop();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser && !publicPages.includes(currentPage)) {
            location.href = 'login.html';
        }
        
        if (currentUser && publicPages.includes(currentPage)) {
            location.href = 'dashboard.html';
        }
    }

    static setCurrentPage() {
        const currentPage = location.pathname.split('/').pop();
        document.querySelectorAll('.main-nav a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    static setupLogout() {
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            location.href = 'login.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => App.init());