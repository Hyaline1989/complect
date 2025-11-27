// НАЗНАЧАЕМ ОБРАБОТЧИКИ СОБЫТИЙ
document.addEventListener('DOMContentLoaded', function() {
    if (checkSession()) {
        showContent();
    } else {
        document.getElementById('password').focus();
    }
    
    document.getElementById('age').addEventListener('input', filterAndDisplayObjects);
    document.getElementById('gender').addEventListener('change', filterAndDisplayObjects);
    document.getElementById('nationality').addEventListener('change', filterAndDisplayObjects);
    document.getElementById('hasConviction').addEventListener('change', filterAndDisplayObjects);
    
    // Добавляем глобальные функции
    window.flipCard = function(button) {
        const flipCard = button.closest('.flip-card');
        flipCard.classList.toggle('flipped');
    };
    
    window.clearAllNotifications = clearAllNotifications;
    window.closeNotification = closeNotification;
    window.testNotification = testNotification; // ← ДОБАВЛЯЕМ ТЕСТОВУЮ ФУНКЦИЮ
    
    // Отслеживаем видимость вкладки
    document.addEventListener('visibilitychange', function() {
        isTabActive = !document.hidden;
        
        if (isTabActive) {
            loadPendingNotifications();
        }
    });
    
    isTabActive = !document.hidden;
});