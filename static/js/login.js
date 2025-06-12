const jwtName = 'jtw';


// toggle between password visibility
const password = document.getElementById('password');
const showPassword = document.getElementById('show-password');
showPassword.addEventListener('click',hide_seek);

let id;
function hide_seek(event) {
    event.preventDefault();
    if (password.type === 'password') {
        clearTimeout(id);
        password.type = 'text';
        // hide password after 4 seconds
        console.log("showing pass");
        id = setTimeout(() => {
            console.log("hiding pass");
            password.type = 'password';
        },4000);
    }else if(password.type === 'text'){
        clearTimeout(id);
        password.type = 'password';
    }
}

const loginBtn = document.getElementById('login-button');
const errMsg = document.getElementById('error-message');
let errId;
loginBtn.addEventListener('click', () => {
    console.log(`login btn --${loginBtn.className}-- clicked`);
    const userNameOrEmail = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const handler = () => {
        console.log('handling....');
        errMsg.style.display = 'block';
        errMsg.style.color = 'red';
        errMsg.textContent = 'Please enter a username and password';
    }

    const hide = () => {
        console.log('hiding....');
        errMsg.style.display = 'none';
    }
    if (!password || !userNameOrEmail) {
        clearTimeout(errId);
        handler();
        errId = setTimeout(hide, 8000);
        return;
    }

    login(userNameOrEmail, password).then(r => {
        console.log(`auth success ---${r}---`);
    }).catch(e => {
        console.log(`auth failed ---${e}---`);
    });
});

async function login(usernameOrEmail, password) {
    try {
        const Host = document.location.host;
        console.log(`Host --${Host}--`);
        const response = await fetch(`/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameOrEmail,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorParagraph = document.getElementById('error-message');
            errorParagraph.style.display = 'block'; // unhide;
            errorParagraph.textContent = data.error || "authentication gone wrong";
            return;
        }

        console.log(`jwt from auth/signin --${data.jwt}--`);
        localStorage.setItem("jwt", data.jwt);
        window.location.href = '/profile';
    } catch (error) {
        const errorParagraph = document.getElementById('error-message');
        errorParagraph.style.display = 'block'; // unhide;
        errorParagraph.textContent = error.message;
        const id = setTimeout(() => {
            errorParagraph.style.display = 'none'; // hide;
        },3000);
        clearTimeout(id);
    }
}
