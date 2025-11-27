// ФУНКЦИИ ДЛЯ РАБОТЫ С SUPABASE
async function loadSettingsFromServer() {
    try {
        const { data, error } = await supabase
            .from('objects_settings')
            .select('*');
        
        if (error) throw error;
        
        // Загружаем глобальный порядок объектов
        const { data: orderData, error: orderError } = await supabase
            .from('global_objects_order')
            .select('*')
            .single();
        
        if (!orderError && orderData && orderData.object_order) {
            globalOrder = orderData.object_order;
        } else {
            globalOrder = objectsBase.map(obj => obj.id);
        }
        
        // Объединяем базовые данные с настройками из базы
        objects = objectsBase.map(baseObj => {
            const serverSettings = data.find(s => s.id === baseObj.id);
            return {
                ...baseObj,
                visible: serverSettings ? serverSettings.visible : true,
                priority: serverSettings ? serverSettings.priority : false
            };
        });
        
        // Загружаем данные о вакансиях
        await loadVacancyData();
        
        return objects;
    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
        objects = objectsBase.map(obj => ({ ...obj, visible: true, priority: false }));
        globalOrder = objectsBase.map(obj => obj.id);
        return objects;
    }
}

async function saveSettingsToServer(objectId, visible, priority) {
    if (currentAccessLevel !== "admin") return;
    
    try {
        const object = objectsBase.find(obj => obj.id === objectId);
        const objectName = object ? object.name : `Объект ${objectId}`;
        
        const { error } = await supabase
            .from('objects_settings')
            .upsert({
                id: objectId,
                name: objectName,
                visible: visible,
                priority: priority,
                updated_at: new Date().toISOString()
            });
        
        if (error) throw error;
        
        console.log('Настройки сохранены на сервер');
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка сохранения настроек: ' + error.message);
    }
}

async function saveGlobalOrderToServer() {
    if (currentAccessLevel !== "admin") return;
    
    try {
        const { error } = await supabase
            .from('global_objects_order')
            .upsert({
                id: 1,
                object_order: globalOrder,
                updated_at: new Date().toISOString()
            });
        
        if (error) throw error;
        
        hasUnsavedChanges = false;
        updateSaveButtonState();
    } catch (error) {
        console.error('Ошибка сохранения глобального порядка:', error);
        alert('Ошибка сохранения порядка: ' + error.message);
    }
}

async function checkAllObjectsOnServer() {
    if (currentAccessLevel !== "admin") return;
    
    try {
        const updates = objects.map(obj => {
            const baseObj = objectsBase.find(b => b.id === obj.id);
            return {
                id: obj.id,
                name: baseObj ? baseObj.name : `Объект ${obj.id}`,
                visible: true,
                priority: obj.priority,
                updated_at: new Date().toISOString()
            };
        });
        
        const { error } = await supabase
            .from('objects_settings')
            .upsert(updates);
        
        if (error) throw error;
        
        objects.forEach(obj => obj.visible = true);
        fillMenuWithObjects();
        filterAndDisplayObjects();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function uncheckAllObjectsOnServer() {
    if (currentAccessLevel !== "admin") return;
    
    try {
        const updates = objects.map(obj => {
            const baseObj = objectsBase.find(b => b.id === obj.id);
            return {
                id: obj.id,
                name: baseObj ? baseObj.name : `Объект ${obj.id}`,
                visible: false,
                priority: obj.priority,
                updated_at: new Date().toISOString()
            };
        });
        
        const { error } = await supabase
            .from('objects_settings')
            .upsert(updates);
        
        if (error) throw error;
        
        objects.forEach(obj => obj.visible = false);
        fillMenuWithObjects();
        filterAndDisplayObjects();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}