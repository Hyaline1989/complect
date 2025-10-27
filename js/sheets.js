// ФУНКЦИИ ДЛЯ РАБОТЫ С НОВОЙ GOOGLE SHEETS
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
        
        vacancyData = {};
        
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

        // ОТЛАДОЧНАЯ ИНФОРМАЦИЯ - посмотрим что пришло из таблицы
        console.log('📊 Данные из таблицы:', tempData);
        
        // Сопоставляем с нашими объектами - УЛУЧШЕННАЯ ЛОГИКА
        Object.keys(tempData).forEach(rawObjectName => {
            const cleanName = rawObjectName.toLowerCase().trim();
            
            console.log(`🔍 Ищем совпадение для: "${rawObjectName}" (${cleanName})`);
            
            // ПРИОРИТЕТНЫЕ ПРАВИЛА СОПОСТАВЛЕНИЯ
            let matchedObject = null;
            
            // 1. Сначала ищем по точным правилам для сложных случаев
            if (cleanName.includes('спортмастер') && (cleanName.includes('спб') || cleanName.includes('питер') || cleanName.includes('санкт'))) {
                matchedObject = objectsBase.find(obj => obj.name === 'Спортмастер СПБ');
                console.log(`✅ Найдено по правилу СПБ: "${rawObjectName}" -> "Спортмастер СПБ"`);
            }
            else if (cleanName.includes('мираторг') && cleanName.includes('тула')) {
                matchedObject = objectsBase.find(obj => obj.name === 'Мираторг Тула');
                console.log(`✅ Найдено по правилу Тула: "${rawObjectName}" -> "Мираторг Тула"`);
            }
            else if (cleanName.includes('мираторг') && !cleanName.includes('тула')) {
                matchedObject = objectsBase.find(obj => obj.name === 'Мираторг Брянск');
                console.log(`✅ Найдено по правилу Брянск: "${rawObjectName}" -> "Мираторг Брянск"`);
            }
            else if (cleanName.includes('сберлогистика')) {
                matchedObject = objectsBase.find(obj => obj.name === 'Сберлогистика');
                console.log(`✅ Найдено по правилу Сбер: "${rawObjectName}" -> "Сберлогистика"`);
            }
            // 2. Если не нашли по правилам, ищем точное совпадение
            else {
                matchedObject = objectsBase.find(obj => {
                    const objNameLower = obj.name.toLowerCase();
                    return cleanName === objNameLower;
                });
                
                if (matchedObject) {
                    console.log(`✅ Точное совпадение: "${rawObjectName}" -> "${matchedObject.name}"`);
                }
            }
            
            // 3. Если не нашли точное, ищем частичное совпадение
            if (!matchedObject) {
                matchedObject = objectsBase.find(obj => {
                    const objNameLower = obj.name.toLowerCase();
                    return cleanName.includes(objNameLower) || objNameLower.includes(cleanName);
                });
                
                if (matchedObject) {
                    console.log(`✅ Частичное совпадение: "${rawObjectName}" -> "${matchedObject.name}"`);
                }
            }
            
            // 4. Если все еще не нашли, используем нечеткое сравнение
            if (!matchedObject) {
                matchedObject = objectsBase.find(obj => {
                    return fuzzyMatch(cleanName, obj.name.toLowerCase());
                });
                
                if (matchedObject) {
                    console.log(`✅ Нечеткое совпадение: "${rawObjectName}" -> "${matchedObject.name}"`);
                }
            }

            if (matchedObject) {
                vacancyData[matchedObject.name] = tempData[rawObjectName];
                console.log(`🎯 ФИНАЛЬНОЕ СОПОСТАВЛЕНИЕ: "${rawObjectName}" -> "${matchedObject.name}"`);
            } else {
                console.log(`❌ Не найдено сопоставление для: "${rawObjectName}"`);
                // Выведем все доступные объекты для отладки
                console.log('📋 Доступные объекты:', objectsBase.map(obj => obj.name));
            }
        });
        
        // Заполняем нулями объекты, для которых не нашли данные
        objectsBase.forEach(obj => {
            if (!vacancyData[obj.name]) {
                vacancyData[obj.name] = {
                    men: 0,
                    women: 0,
                    family: 0,
                    positions: [],
                    rawName: 'Не найдено в таблице'
                };
                console.log(`⚠️ Объект не найден в таблице: "${obj.name}"`);
            }
        });

        // ФИНАЛЬНАЯ ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
        console.log('🎯 ФИНАЛЬНЫЕ ДАННЫЕ:', vacancyData);
        
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