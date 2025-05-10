// toggle between password visibility
const password = document.getElementById('password');
const showPassword = document.getElementById('show-password');
showPassword.addEventListener('click',hide_seek);

function hide_seek(event) {
    event.preventDefault();
    if (password.type === 'password') {
        password.type = 'text';
    }else if(password.type === 'text'){
        password.type = 'password';
    }
}

