// ФУНКЦИИ ДЛЯ РАБОТЫ С ПАРОЛЕМ
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        checkPassword();
    }
}

async function checkPassword() {
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    if (password === PASSWORDS.user) {
        startSession("user");
        await showContent();
    } else if (password === PASSWORDS.admin) {
        startSession("admin");
        await showContent();
    } else {
        errorMessage.style.display = 'block';
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}

// ФУНКЦИИ СЕССИИ
function startSession(accessLevel) {
    const sessionData = {
        accessLevel: accessLevel,
        loginTime: new Date().getTime(),
        expires: new Date().getTime() + SESSION_DURATION
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    currentAccessLevel = accessLevel;
    
    sessionTimer = setTimeout(() => {
        alert("Время сессии истекло. Пожалуйста, войдите снова.");
        logout();
    }, SESSION_DURATION);
}

function checkSession() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return false;

    const session = JSON.parse(sessionData);
    const now = new Date().getTime();

    if (now > session.expires) {
        localStorage.removeItem(SESSION_KEY);
        return false;
    }

    session.expires = now + SESSION_DURATION;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
        alert("Время сессии истекло. Пожалуйста, войдите снова.");
        logout();
    }, SESSION_DURATION);

    currentAccessLevel = session.accessLevel;
    return true;
}

function logout() {
    stopAutoUpdate();
    if (sessionTimer) {
        clearTimeout(sessionTimer);
        sessionTimer = null;
    }
    
    localStorage.removeItem(SESSION_KEY);
    currentAccessLevel = "";
    
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('content').style.display = 'none';
    document.getElementById('burgerMenu').style.display = 'none';
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
}

async function showContent() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    
    const userInfo = document.getElementById('userInfo');
    const burgerMenu = document.getElementById('burgerMenu');
    const adminControls = document.getElementById('adminControls');
    
    await loadSettingsFromServer();
    
    startAutoUpdate();
    
    if (currentAccessLevel === "admin") {
        userInfo.innerHTML = `
            <div class="user-badge-container">
                <img src="images/witch.jpg" class="avatar admin-avatar" alt="Админ">
                <div class="admin-badge">Администратор</div>
                <button class="logout-btn" onclick="logout()">🚪 Выйти</button>
            </div>
        `;
        burgerMenu.style.display = 'flex';
        adminControls.style.display = 'block';
        fillMenuWithObjects();
    } else {
        userInfo.innerHTML = `
            <div class="user-badge-container">
                <img src="images/pumpkin.jpg" class="avatar user-avatar" alt="Пользователь">
                <div class="user-badge">Пользователь</div>
                <button class="logout-btn" onclick="logout()">🚪 Выйти</button>
            </div>
        `;
        burgerMenu.style.display = 'none';
        adminControls.style.display = 'none';
    }
    
    filterAndDisplayObjects();
}