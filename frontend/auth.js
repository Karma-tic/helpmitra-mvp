document.addEventListener('DOMContentLoaded', () => {
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const tasksLink = document.getElementById('tasks-link');

    // Button switching logic
    showSignupBtn.addEventListener('click', () => {
        showSignupBtn.classList.add('active');
        showLoginBtn.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    showLoginBtn.addEventListener('click', () => {
        showLoginBtn.classList.add('active');
        showSignupBtn.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    });

    // Check for an active session on page load
    if (localStorage.getItem('isLoggedIn')) {
        document.querySelector('.auth-box').style.display = 'none';
        tasksLink.style.display = 'block';
    }

    // Handle Sign Up form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const role = document.getElementById('role-select').value;

        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await res.json();
        if (res.status === 201) {
            alert('Sign up successful! You can now log in.');
            showLoginBtn.click();
        } else {
            alert('Error: ' + data.message);
        }
    });

    // Handle Log In form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.status === 200) {
            alert('Login successful! Welcome, ' + data.user.name);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', data.user.name);
            window.location.href = '/tasks'; // Redirect to the tasks page
        } else {
            alert('Error: ' + data.message);
        }
    });
});