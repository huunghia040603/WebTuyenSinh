const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
    console.log('Chuyển sang chế độ Đăng ký');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
    console.log('Chuyển sang chế độ Đăng nhập');
});

// Set trạng thái ban đầu theo đường dẫn
const path = window.location.pathname;
if (path.includes('/dangky')) {
    container.classList.add("active");
    console.log('Tải trang ở chế độ Đăng ký (dựa trên URL)');
} else {
    container.classList.remove("active");
    console.log('Tải trang ở chế độ Đăng nhập (mặc định hoặc dựa trên URL)');
}

// --- Logic Mưa Logo (giữ nguyên) ---
const logoRain = document.getElementById('logoRain');
const logoSrcs = ['/static/images/logo12.png'];
let logos = [];
let animationFrameId;
let intervalId;

function random(min, max) { return Math.random() * (max - min) + min; }

function createLogoDrop() {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const img = document.createElement('img');
    img.src = logoSrcs[Math.floor(Math.random() * logoSrcs.length)];
    img.className = 'logo-drop';
    const size = random(40, 110);
    img.style.width = size + 'px';
    img.style.height = size + 'px';
    img.style.left = random(0, screenW - size) + 'px';
    img.style.top = '-' + size + 'px';
    img.style.opacity = random(0.7, 1);
    img.style.transform = `rotate(${random(-30, 30)}deg)`;
    logoRain.appendChild(img);
    return { el: img, size, x: parseFloat(img.style.left), y: -size, speed: random(1.2, 2.8), opacity: parseFloat(img.style.opacity), fading: false };
}

function animateLogos() {
    const screenH = window.innerHeight;
    for (let i = logos.length - 1; i >= 0; --i) {
        const logo = logos[i];
        logo.y += logo.speed;
        logo.el.style.top = logo.y + 'px';

        if (!logo.fading && logo.y + logo.size > screenH * 0.9) {
            logo.fading = true;
        }
        if (logo.fading) {
            logo.opacity -= 0.02;
            if (logo.opacity <= 0) {
                logoRain.removeChild(logo.el);
                logos.splice(i, 1);
                continue;
            }
            logo.el.style.opacity = logo.opacity;
        }
    }
    animationFrameId = requestAnimationFrame(animateLogos);
}

function startLogoRain() {
    if (!intervalId) {
        intervalId = setInterval(() => {
            if (logos.length < 50) {
                const logo = createLogoDrop();
                logos.push(logo);
            }
        }, 350);
    }
    if (!animationFrameId) {
        animateLogos();
    }
}

function stopLogoRain() {
    clearInterval(intervalId);
    intervalId = null;
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;

    while (logoRain.firstChild) {
        logoRain.removeChild(logoRain.firstChild);
    }
    logos = [];
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopLogoRain();
    } else {
        startLogoRain();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    startLogoRain();
    console.log('DOM đã tải, khởi động hiệu ứng mưa logo.');
});

window.addEventListener('resize', () => { });
// --- Kết thúc Logic Mưa Logo ---

// --- Logic Đăng nhập/Đăng ký API ---
// Đặt BASE_API_URL là URL gốc của API auth
const BASE_API_URL = 'https://timtruonghoc.pythonanywhere.com/';

// Hàm helper để parse full name
function parseFullName(fullName) {
    let firstName = '';
    let lastName = '';
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length > 1) {
        lastName = nameParts.pop();
        firstName = nameParts.join(' ');
    } else {
        firstName = fullName;
    }
    console.log('Parse Full Name:', fullName, '-> FirstName:', firstName, 'LastName:', lastName);
    return { firstName, lastName };
}

// 1. Đăng ký bằng Email
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('--- Bắt đầu quy trình đăng ký bằng Email ---');
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const fullName = document.getElementById('signupFullName').value;
    const { firstName, lastName } = parseFullName(fullName);
    console.log('Dữ liệu đăng ký:', { email, password, firstName, lastName });
    try {
        // Gọi đến endpoint registration
        const response = await fetch(`${BASE_API_URL}auth/registration/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                first_name: firstName,
                last_name: lastName
            })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            container.classList.remove("active");
            console.log('Đăng ký thành công. Chuyển sang form đăng nhập.');
        } else {
            let errorMessage = 'Đăng ký thất bại.';
            if (data && typeof data === 'object') {
                errorMessage += '\n' + Object.values(data).flat().join('\n');
            }
            alert(errorMessage);
            console.error('Đăng ký thất bại:', data);
        }
    } catch (error) {
        console.error('Lỗi khi gửi yêu cầu đăng ký:', error);
        alert('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
    }
    console.log('--- Kết thúc quy trình đăng ký bằng Email ---');
});

// 2. Đăng nhập bằng Email
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('--- Bắt đầu quy trình đăng nhập bằng Email ---');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    console.log('Dữ liệu đăng nhập:', { email, password });
    try {
        const response = await fetch(`${BASE_API_URL}auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });
        const data = await response.json();
        if (response.ok) {
            const token = data.key || data.access;
            localStorage.setItem('authToken', token);
            console.log('token',token)
            AuthManager.saveUserData(data); 
            setTimeout(() => window.location.href = '/', 300);
        } else {
            let errorMessage = 'Đăng nhập thất bại.';
            if (data && typeof data === 'object') {
                errorMessage += '\n' + Object.values(data).flat().join('\n');
            } else if (typeof data === 'string') {
                errorMessage = 'Đăng nhập thất bại: ' + data;
            }
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Lỗi khi gửi yêu cầu đăng nhập:', error);
        alert('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
    }
    console.log('--- Kết thúc quy trình đăng nhập bằng Email ---');
});

// 3. Xử lý Google Sign-In (Đã cập nhật)
const GOOGLE_CLIENT_ID = '875195545395-kh54279ju4pea3h5n1b85uj3hohn0aih.apps.googleusercontent.com';

function handleCredentialResponse(response) {
    console.log("--- Phản hồi từ Google đã nhận được ---");
    const idToken = response.credential;
    console.log("ID Token:", idToken);
    sendTokenToBackend(idToken);
}

async function sendTokenToBackend(idToken) {
    // Gọi đến endpoint google-social-auth
    const backendUrl = `${BASE_API_URL}auth/google-social-auth/`;
    console.log('Gửi ID Token đến backend:', backendUrl);
    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                auth_token: idToken
            })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('access_token', data.auth_token.tokens.access);
            localStorage.setItem('refresh_token', data.auth_token.tokens.refresh);
            AuthManager.saveUserData(data); 
            
            setTimeout(() => window.location.href = '/', 300);
        } else {
            let errorMessage = 'Đăng nhập bằng Google thất bại.';
            if (data && typeof data === 'object') {
                errorMessage += '\n' + Object.values(data).flat().join('\n');
            } else if (typeof data === 'string') {
                errorMessage = 'Đăng nhập thất bại: ' + data;
            }
            alert(errorMessage);
            console.error('Đăng nhập thất bại:', data);
        }
    } catch (error) {
        console.error("Lỗi khi gửi ID Token đến backend:", error);
        alert('Đã xảy ra lỗi khi đăng nhập bằng Google. Vui lòng thử lại.');
    }
}

window.onload = function () {
    console.log('Khởi tạo Google Sign-In...');
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: true
    });
    
    // Sau khi khởi tạo xong, mới render nút
    google.accounts.id.renderButton(
        document.getElementById("google-login-button"),
        { theme: "outline", size: "large", text: "signin_with", width: "180" }
    );
    google.accounts.id.renderButton(
        document.getElementById("google-signup-button"),
        { theme: "outline", size: "large", text: "signup_with", width: "180" }
    );
};