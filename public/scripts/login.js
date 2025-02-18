document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const { token } = await res.json();
        localStorage.setItem('token', token);
        alert('Login successful!');
        window.location.href = 'admin.html';
    } catch (err) {
        alert(`Error: ${err.message}`);
        console.error(err);
    }
});