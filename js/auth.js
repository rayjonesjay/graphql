// auth.js
const jwtName = 'jtw'
export const domain = 'learn.zone01kisumu.ke'


async function login(usernameOrEmail, password) {
    const credentials = btoa(`${usernameOrEmail}:${password}`);
    try {
        const response = await fetch(`https://${domain}/auth/signin`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();

        console.log("/login data",data);

        localStorage.setItem(jwtName, data.jwt);
        window.location.href = 'index.html';
    } catch (error) {
        document.getElementById('error-message').textContent = error.message;
    }
}

function logout() {
    localStorage.removeItem(jwtName);
    window.location.href = 'login.html';
}