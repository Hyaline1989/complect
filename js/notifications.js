// СИСТЕМА УВЕДОМЛЕНИЙ ОБ ИЗМЕНЕНИЯХ

// Обработка изменений в вакансиях
function handleVacancyChanges(changes) {
    console.log('🔔 Обнаружены изменения:', changes);
    
    // Сохраняем уведомления
    saveNotifications(changes);
    
    // Показываем значок уведомления на вкладке
    showTabNotification();
    
    // Если вкладка активна - показываем уведомления сразу
    if (isTabActive) {
        showNotifications(changes);
    }
}

// Показываем значок уведомления на вкладке
function showTabNotification() {
    // Меняем favicon и title
    const originalTitle = document.title;
    const hasNotification = document.title.includes('🔔');
    
    if (!hasNotification) {
        document.title = '🔔 ' + originalTitle;
        
        // Создаем мигающий favicon
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            const originalFavicon = favicon.href;
            
            // Создаем favicon с восклицательным знаком (простая версия)
            let blinkState = true;
            const blinkInterval = setInterval(() => {
                if (isTabActive && document.title.includes('🔔')) {
                    document.title = blinkState ? '🔔 Подбор объекта для вахты' : 'Подбор объекта для вахты';
                    blinkState = !blinkState;
                } else {
                    clearInterval(blinkInterval);
                    document.title = originalTitle;
                }
            }, 1000);
        }
    }
}

// Показываем уведомления
function showNotifications(changes) {
    changes.forEach(change => {
        if (change.type === 'update') {
            const message = generateNotificationMessage(change);
            showNotificationDialog(message);
        }
    });
    
    // Очищаем значок уведомления
    clearTabNotification();
}

// Генерируем текст уведомления
function generateNotificationMessage(change) {
    const { objectName, changes } = change;
    const messages = [];
    
    if (changes.men.changed) {
        const diff = changes.men.new - changes.men.old;
        const direction = diff > 0 ? 'увеличилась' : 'уменьшилась';
        messages.push(`👨 потребность для мужчин ${direction} на ${Math.abs(diff)}`);
    }
    
    if (changes.women.changed) {
        const diff = changes.women.new - changes.women.old;
        const direction = diff > 0 ? 'увеличилась' : 'уменьшилась';
        messages.push(`👩 потребность для женщин ${direction} на ${Math.abs(diff)}`);
    }
    
    if (changes.family.changed) {
        const diff = changes.family.new - changes.family.old;
        const direction = diff > 0 ? 'увеличилось' : 'уменьшилось';
        messages.push(`👨‍👩‍👧‍👦 количество семейных комнат ${direction} на ${Math.abs(diff)}`);
    }
    
    return `Потребность на <strong>${objectName}</strong> обновлена:<br>${messages.join('<br>')}`;
}

// Показываем диалоговое окно уведомления
function showNotificationDialog(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'vacancy-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <span class="notification-icon">🔔</span>
                <span class="notification-title">Обновление вакансий</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-body">
                ${message}
            </div>
            <div class="notification-footer">
                <small>${new Date().toLocaleTimeString()}</small>
            </div>
        </div>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #3498db;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, NOTIFICATION_TIMEOUT);
}

// Очищаем значок уведомления
function clearTabNotification() {
    const originalTitle = document.title.replace('🔔 ', '');
    document.title = originalTitle;
}

// Сохраняем уведомления в localStorage
function saveNotifications(changes) {
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
    const newNotifications = changes.map(change => ({
        ...change,
        timestamp: new Date().toISOString(),
        read: false
    }));
    
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify([
        ...notifications,
        ...newNotifications
    ]));
}

// Загружаем непрочитанные уведомления
function loadPendingNotifications() {
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
    const unreadNotifications = notifications.filter(notification => !notification.read);
    
    if (unreadNotifications.length > 0 && isTabActive) {
        showNotifications(unreadNotifications);
        
        // Помечаем как прочитанные
        notifications.forEach(notification => notification.read = true);
        localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
    }
}

// Очищаем все уведомления
function clearAllNotifications() {
    localStorage.removeItem(NOTIFICATION_KEY);
}

// Отслеживаем видимость вкладки
document.addEventListener('visibilitychange', function() {
    isTabActive = !document.hidden;
    
    if (isTabActive) {
        // При активации вкладки проверяем непрочитанные уведомления
        loadPendingNotifications();
        clearTabNotification();
    }
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    isTabActive = !document.hidden;
});