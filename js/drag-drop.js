// ФУНКЦИИ ДЛЯ ПЕРЕТАСКИВАНИЯ
function initDragAndDrop() {
    if (currentAccessLevel !== "admin") return;
    
    // Перетаскивание в меню
    const menuItems = document.getElementById('menuItems');
    if (menuItems) {
        new Sortable(menuItems, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: function(evt) {
                updateMenuOrder();
            }
        });
    }
    
    // Перетаскивание карточек в результатах
    const resultsContainer = document.getElementById('results');
    if (resultsContainer) {
        new Sortable(resultsContainer, {
            handle: '.drag-handle-main',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: function(evt) {
                updateGlobalOrderFromCards();
            }
        });
    }
}

function updateMenuOrder() {
    const menuItems = document.getElementById('menuItems');
    const newOrder = Array.from(menuItems.children).map(item => 
        parseInt(item.getAttribute('data-id'))
    );
    
    // Обновляем глобальный порядок
    globalOrder = newOrder;
    hasUnsavedChanges = true;
    updateSaveButtonState();
    
    // Обновляем номера в меню
    fillMenuWithObjects();
    
    // Обновляем отображение результатов
    filterAndDisplayObjects();
}

function updateGlobalOrderFromCards() {
    const resultsContainer = document.getElementById('results');
    const visibleObjects = Array.from(resultsContainer.children).map(card => 
        parseInt(card.getAttribute('data-id'))
    );
    
    // Обновляем порядок только для видимых объектов
    const hiddenObjects = globalOrder.filter(id => !visibleObjects.includes(id));
    globalOrder = [...visibleObjects, ...hiddenObjects];
    hasUnsavedChanges = true;
    updateSaveButtonState();
    
    // Обновляем меню
    fillMenuWithObjects();
}

function saveGlobalOrder() {
    saveGlobalOrderToServer();
}

function resetGlobalOrder() {
    if (currentAccessLevel !== "admin") return;
    
    if (confirm("Сбросить порядок объектов к исходному?")) {
        globalOrder = objectsBase.map(obj => obj.id);
        hasUnsavedChanges = true;
        updateSaveButtonState();
        fillMenuWithObjects();
        filterAndDisplayObjects();
    }
}