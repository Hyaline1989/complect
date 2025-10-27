// ФУНКЦИИ ОТЛАДКИ
function toggleDebug() {
    debugMode = !debugMode;
    const debugInfo = document.getElementById('debugInfo');
    debugInfo.style.display = debugMode ? 'block' : 'none';
    
    if (debugMode) {
        updateDebugInfoWithVacancyData();
    }
}

function updateDebugInfo(message) {
    const debugInfo = document.getElementById('debugInfo');
    debugInfo.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
    debugInfo.scrollTop = debugInfo.scrollHeight;
}

function updateDebugInfoWithVacancyData() {
    const debugInfo = document.getElementById('debugInfo');
    
    let debugHTML = `
        <div style="margin-bottom: 15px;">
            <strong>Отладочная информация - данные из Google Sheets:</strong>
        </div>
    `;
    
    // Добавляем информацию по каждому объекту
    objectsBase.forEach(obj => {
        const vacancyStats = getVacancyStats(obj.name);
        const status = vacancyStats.rawName === 'Не найдено в таблице' ? '❌ Не найден' : 
                      vacancyStats.rawName === 'Ошибка загрузки' ? '🚫 Ошибка' : '✅ Загружен';
        
        debugHTML += `
            <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px;">
                <strong>${obj.name}</strong> - ${status}
                <div style="font-size: 12px; color: #666;">
                    Мужчины: ${vacancyStats.men} | 
                    Женщины: ${vacancyStats.women} | 
                    Семьи: ${vacancyStats.family}
                </div>
                ${vacancyStats.rawName && vacancyStats.rawName !== 'Не найдено в таблице' && vacancyStats.rawName !== 'Ошибка загрузки' ? 
                    `<div style="font-size: 11px; color: #888; margin-top: 3px;">
                        Сопоставлено с: "${vacancyStats.rawName}"
                    </div>` : ''
                }
            </div>
        `;
    });
    
    // Добавляем статистику
    const totalMen = Object.values(vacancyData).reduce((sum, stats) => sum + stats.men, 0);
    const totalWomen = Object.values(vacancyData).reduce((sum, stats) => sum + stats.women, 0);
    const totalFamily = Object.values(vacancyData).reduce((sum, stats) => sum + stats.family, 0);
    const foundCount = Object.values(vacancyData).filter(stats => 
        stats.rawName !== 'Не найдено в таблице' && stats.rawName !== 'Ошибка загрузки'
    ).length;
    
    debugHTML += `
        <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <strong>Статистика:</strong><br>
            - Найдено объектов в таблице: ${foundCount} из ${objectsBase.length}<br>
            - Всего вакансий: Мужчины ${totalMen} | Женщины ${totalWomen} | Семьи ${totalFamily}<br>
            - Время загрузки: ${new Date().toLocaleString()}
        </div>
    `;
    
    debugInfo.innerHTML = debugHTML;
    debugInfo.scrollTop = 0;
}

function updateSyncStatus(message) {
    const statusElement = document.getElementById('syncStatus');
    if (statusElement) {
        statusElement.textContent = message;
        
        if (message.includes('✅') || message.includes('❌')) {
            setTimeout(() => {
                statusElement.textContent = '';
            }, 3000);
        }
    }
}

// ФУНКЦИИ АВТООБНОВЛЕНИЯ
function startAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    if (currentAccessLevel === "user") {
        updateInterval = setInterval(async () => {
            await loadSettingsFromServer();
            filterAndDisplayObjects();
            updateSyncStatus('🔄 Данные автоматически обновлены');
        }, 60000);
    }
}

function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

async function manualSync() {
    updateSyncStatus('🔄 Ручное обновление...');
    await loadSettingsFromServer();
    filterAndDisplayObjects();
    if (currentAccessLevel === "admin") {
        fillMenuWithObjects();
    }
    updateSyncStatus('✅ Данные обновлены');
    
    // Обновляем отладочную информацию если она открыта
    if (debugMode) {
        updateDebugInfoWithVacancyData();
    }
}

// Функция для переворота карточки
function flipCard(button) {
    const flipCard = button.closest('.flip-card');
    flipCard.classList.toggle('flipped');
}