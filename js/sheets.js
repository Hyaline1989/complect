// ФУНКЦИИ ДЛЯ РАБОТЫ С НОВОЙ GOOGLE SHEETS

// Глобальная переменная для интервала мигания
let tabBlinkInterval = null;

async function loadVacancyData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}&range=${SHEET_RANGE}`;
        
        let response;
        try {
            response = await fetch(url);
            if (!response.ok) throw new Error('Direct fetch failed');
        } catch (err) {
            response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
        }
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const newVacancyData = {};
        
        // Временное хранилище для сбора данных по объектам
        const tempData = {};
        
        json.table.rows.forEach((row, index) => {
            if (row.c && row.c.length > 0 && row.c[0] && row.c[0].v) {
                const objectName = row.c[0].v.toString().trim();
                const positionName = row.c[1] ? row.c[1].v.toString().trim() : '';
                
                // Если это строка с итогами по объекту (должность совпадает с названием объекта или пустая)
                if (positionName === objectName || positionName === '') {
                    // Это строка с итогами
                    const totalMen = row.c[5] ? (parseInt(row.c[5].v) || 0) : 0;
                    const totalWomen = row.c[6] ? (parseInt(row.c[6].v) || 0) : 0;
                    const totalFamily = row.c[7] ? (parseInt(row.c[7].v) || 0) : 0;
                    
                    if (!tempData[objectName]) {
                        tempData[objectName] = {
                            men: totalMen,
                            women: totalWomen,
                            family: totalFamily,
                            positions: [],
                            rawName: objectName
                        };
                    } else {
                        // Обновляем итоги
                        tempData[objectName].men = totalMen;
                        tempData[objectName].women = totalWomen;
                        tempData[objectName].family = totalFamily;
                    }
                } else {
                    // Это строка с должностью
                    const posMen = row.c[2] ? (parseInt(row.c[2].v) || 0) : 0;
                    const posWomen = row.c[3] ? (parseInt(row.c[3].v) || 0) : 0;
                    const posFamily = row.c[4] ? (parseInt(row.c[4].v) || 0) : 0;
                    
                    if (posMen > 0 || posWomen > 0 || posFamily > 0) {
                        if (!tempData[objectName]) {
                            tempData[objectName] = {
                                men: 0,
                                women: 0,
                                family: 0,
                                positions: [],
                                rawName: objectName
                            };
                        }
                        
                        tempData[objectName].positions.push({
                            name: positionName,
                            men: posMen,
                            women: posWomen,
                            family: posFamily
                        });
                    }
                }
            }
        });

        // Сопоставляем с нашими объектами - УЛУЧШЕННАЯ ЛОГИКА
        Object.keys(tempData).forEach(rawObjectName => {
            const cleanName = rawObjectName.toLowerCase().trim();
            
            // ПРИОРИТЕТНЫЕ ПРАВИЛА СОПОСТАВЛЕНИЯ
            let matchedObject = null;
            
            // 1. Сначала ищем по точным правилам для сложных случаев
            if (cleanName.includes('спортмастер') && (cleanName.includes('спб') || cleanName.includes('питер') || cleanName.includes('санкт'))) {
                matchedObject = objectsBase.find(obj => obj.name === 'Спортмастер СПБ');
            }
            else if (cleanName.includes('мираторг') && cleanName.includes('тула')) {
                matchedObject = objectsBase.find(obj => obj.name === 'Мираторг Тула');
            }
            else if (cleanName.includes('мираторг') && !cleanName.includes('тула')) {
                matchedObject = objectsBase.find(obj => obj.name === 'Мираторг Брянск');
            }
            else if (cleanName.includes('сберлогистика')) {
                matchedObject = objectsBase.find(obj => obj.name === 'Сберлогистика');
            }
            // 2. Если не нашли по правилам, ищем точное совпадение
            else {
                matchedObject = objectsBase.find(obj => {
                    const objNameLower = obj.name.toLowerCase();
                    return cleanName === objNameLower;
                });
            }
            
            // 3. Если не нашли точное, ищем частичное совпадение
            if (!matchedObject) {
                matchedObject = objectsBase.find(obj => {
                    const objNameLower = obj.name.toLowerCase();
                    return cleanName.includes(objNameLower) || objNameLower.includes(cleanName);
                });
            }
            
            // 4. Если все еще не нашли, используем нечеткое сравнение
            if (!matchedObject) {
                matchedObject = objectsBase.find(obj => {
                    return fuzzyMatch(cleanName, obj.name.toLowerCase());
                });
            }

            if (matchedObject) {
                newVacancyData[matchedObject.name] = tempData[rawObjectName];
            }
        });
        
        // Заполняем нулями объекты, для которых не нашли данные
        objectsBase.forEach(obj => {
            if (!newVacancyData[obj.name]) {
                newVacancyData[obj.name] = {
                    men: 0,
                    women: 0,
                    family: 0,
                    positions: [],
                    rawName: 'Не найдено в таблице'
                };
            }
        });

        // Проверяем изменения в данных
        detectChanges(newVacancyData);
        
        // Обновляем данные
        previousVacancyData = JSON.parse(JSON.stringify(vacancyData));
        vacancyData = newVacancyData;
        
        return vacancyData;
    } catch (err) {
        console.error('Ошибка загрузки данных о вакансиях:', err);
        objectsBase.forEach(obj => {
            vacancyData[obj.name] = {
                men: 0,
                women: 0,
                family: 0,
                positions: [],
                rawName: 'Ошибка загрузки'
            };
        });
        return vacancyData;
    }
}

// Функция для обнаружения изменений ТОЛЬКО значимых
function detectChanges(newData) {
    console.log('🔍 Начинаем проверку изменений...');
    
    const changes = [];
    
    // Проверяем изменения для каждого объекта
    Object.keys(newData).forEach(objectName => {
        const oldStats = vacancyData[objectName];
        const newStats = newData[objectName];
        
        if (!oldStats) {
            // ИГНОРИРУЕМ новые объекты - это не изменение потребности
            console.log(`➡️ Новый объект (игнорируем): ${objectName}`);
        } else {
            // Проверяем изменения в количестве - ТОЛЬКО значимые
            const menChanged = isSignificantChange(oldStats.men, newStats.men);
            const womenChanged = isSignificantChange(oldStats.women, newStats.women);
            const familyChanged = isSignificantChange(oldStats.family, newStats.family);
            
            if (menChanged || womenChanged || familyChanged) {
                console.log(`🔄 ЗНАЧИМОЕ изменение в ${objectName}:`, {
                    men: { old: oldStats.men, new: newStats.men, changed: menChanged },
                    women: { old: oldStats.women, new: newStats.women, changed: womenChanged },
                    family: { old: oldStats.family, new: newStats.family, changed: familyChanged }
                });
                
                changes.push({
                    objectName: objectName,
                    type: 'update',
                    changes: {
                        men: { old: oldStats.men, new: newStats.men, changed: menChanged },
                        women: { old: oldStats.women, new: newStats.women, changed: womenChanged },
                        family: { old: oldStats.family, new: newStats.family, changed: familyChanged }
                    }
                });
            } else {
                console.log(`✅ Без изменений: ${objectName}`);
            }
        }
    });
    
    console.log(`📊 Найдено ЗНАЧИМЫХ изменений: ${changes.length}`);
    
    // Обрабатываем изменения ТОЛЬКО если они есть
    if (changes.length > 0) {
        handleVacancyChanges(changes);
    } else {
        console.log('✅ Значимых изменений не обнаружено');
    }
    
    return changes;
}

// Функция проверки ЗНАЧИМОГО изменения
function isSignificantChange(oldValue, newValue) {
    // Игнорируем изменения между 0 и 0
    if (oldValue === 0 && newValue === 0) {
        return false;
    }
    
    // Игнорируем изменения от null/undefined к 0
    if ((oldValue === null || oldValue === undefined) && newValue === 0) {
        return false;
    }
    
    // Игнорируем изменения от 0 к null/undefined  
    if (oldValue === 0 && (newValue === null || newValue === undefined)) {
        return false;
    }
    
    // Считаем значимым любое изменение чисел
    return oldValue !== newValue;
}

// Обработка изменений в вакансиях
function handleVacancyChanges(changes) {
    console.log('🔔 Обрабатываем ЗНАЧИМЫЕ изменения:', changes);
    
    // Если нет значимых изменений - выходим
    if (changes.length === 0) {
        console.log('🚫 Нет значимых изменений для уведомлений');
        return;
    }
    
    // Проверяем, что функции существуют
    if (typeof saveNotifications === 'undefined') {
        console.error('❌ Функция saveNotifications не определена!');
        return;
    }
    if (typeof showTabNotification === 'undefined') {
        console.error('❌ Функция showTabNotification не определена!');
        return;
    }
    
    // Проверяем localStorage
    try {
        localStorage.setItem('test', 'test');
        console.log('✅ localStorage работает');
    } catch (e) {
        console.error('❌ localStorage не доступен:', e);
    }
    
    // Сохраняем уведомления
    saveNotifications(changes);
    
    // Показываем значок уведомления на вкладке
    showTabNotification();
    
    // Если вкладка активна - показываем уведомления сразу
    if (isTabActive) {
        console.log('📱 Вкладка активна, показываем уведомления');
        console.log('🔍 Проверяем isTabActive:', isTabActive);
        console.log('🔍 Количество изменений для показа:', changes.length);
        showNotifications(changes);
    } else {
        console.log('💤 Вкладка неактивна, сохраняем уведомления');
    }
}

// Показываем значок уведомления на вкладке
function showTabNotification() {
    // Останавливаем предыдущее мигание если было
    if (tabBlinkInterval) {
        clearInterval(tabBlinkInterval);
    }
    
    const originalTitle = document.title.replace('🔔 ', '');
    let blinkState = true;
    
    // Запускаем мигание
    tabBlinkInterval = setInterval(() => {
        document.title = blinkState ? '🔔 ' + originalTitle : originalTitle;
        blinkState = !blinkState;
    }, 1000);
    
    console.log('🎯 Запущено мигание вкладки');
}

// Очищаем значок уведомления и останавливаем мигание
function clearTabNotification() {
    if (tabBlinkInterval) {
        clearInterval(tabBlinkInterval);
        tabBlinkInterval = null;
    }
    
    const originalTitle = document.title.replace('🔔 ', '');
    document.title = originalTitle;
    
    console.log('🧹 Мигание вкладки остановлено');
}

// Показываем уведомления
function showNotifications(changes) {
    console.log('🎯 Показываем уведомления для изменений:', changes.length);
    console.log('🔍 Все изменения:', changes);
    
    if (changes.length === 0) {
        console.log('⚠️ Нет изменений для показа');
        return;
    }
    
    let shownCount = 0;
    changes.forEach((change, index) => {
        if (change.type === 'update') {
            console.log(`📨 Уведомление ${index + 1}:`, change);
            const message = generateNotificationMessage(change);
            console.log(`📝 Текст уведомления: ${message}`);
            showNotificationDialog(message);
            shownCount++;
        }
    });
    
    console.log(`✅ Показано уведомлений: ${shownCount}`);
    
    if (shownCount === 0) {
        console.log('⚠️ Все изменения были типа "new", а не "update"');
    }
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
    console.log('📝 Создаем диалоговое окно:', message);
    
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'vacancy-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <span class="notification-icon">🔔</span>
                <span class="notification-title">Обновление вакансий</span>
                <button class="notification-close" onclick="closeNotification(this)">×</button>
            </div>
            <div class="notification-body">
                ${message}
            </div>
            <div class="notification-footer">
                <button class="notification-ok-btn" onclick="closeNotification(this)">OK</button>
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
    console.log('✅ Диалоговое окно создано');
}

// Функция для закрытия уведомления
function closeNotification(button) {
    const notification = button.closest('.vacancy-notification');
    if (notification) {
        notification.remove();
        // Проверяем, остались ли другие уведомления
        checkRemainingNotifications();
    }
}

// Проверяем оставшиеся уведомления после закрытия
function checkRemainingNotifications() {
    const notifications = document.querySelectorAll('.vacancy-notification');
    if (notifications.length === 0) {
        // Если все уведомления закрыты - останавливаем мигание
        clearTabNotification();
    }
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
    
    console.log('💾 Уведомления сохранены в localStorage');
}

// Загружаем непрочитанные уведомления
function loadPendingNotifications() {
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
    const unreadNotifications = notifications.filter(notification => !notification.read);
    
    if (unreadNotifications.length > 0 && isTabActive) {
        console.log('📥 Загружаем непрочитанные уведомления:', unreadNotifications.length);
        showNotifications(unreadNotifications);
        
        // Помечаем как прочитанные в localStorage, но оставляем мигание
        notifications.forEach(notification => notification.read = true);
        localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
        
        // НЕ останавливаем мигание - оно должно продолжаться пока уведомления не закрыты
    }
}

// Очищаем все уведомления
function clearAllNotifications() {
    localStorage.removeItem(NOTIFICATION_KEY);
    // Закрываем все открытые уведомления
    document.querySelectorAll('.vacancy-notification').forEach(notification => {
        notification.remove();
    });
    // Останавливаем мигание
    clearTabNotification();
    console.log('🗑️ Все уведомления очищены');
}

// УЛУЧШЕННАЯ функция для нечеткого сравнения
function fuzzyMatch(str1, str2) {
    if (!str1 || !str2) return false;
    
    const words1 = str1.split(/\s+/).filter(word => word.length > 2);
    const words2 = str2.split(/\s+/).filter(word => word.length > 2);
    
    // Если есть общие слова
    const commonWords = words1.filter(word1 => 
        words2.some(word2 => 
            word1.includes(word2) || word2.includes(word1)
        )
    );
    
    return commonWords.length > 0;
}

function getVacancyStats(objectName) {
    if (vacancyData[objectName]) {
        return vacancyData[objectName];
    }
    return { men: 0, women: 0, family: 0, positions: [], rawName: 'Не найдено' };
}