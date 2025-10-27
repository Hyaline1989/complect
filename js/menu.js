// ФУНКЦИИ ДЛЯ БУРГЕР-МЕНЮ
function toggleMenu() {
    const menuContent = document.getElementById('menuContent');
    const menuOverlay = document.getElementById('menuOverlay');
    const burgerIcon = document.querySelector('.burger-icon');
    
    if (!isMenuOpen) {
        menuContent.classList.add('active');
        menuOverlay.style.display = 'block';
        burgerIcon.classList.add('active');
        isMenuOpen = true;
    } else {
        menuContent.classList.remove('active');
        menuOverlay.style.display = 'none';
        burgerIcon.classList.remove('active');
        isMenuOpen = false;
    }
}

function fillMenuWithObjects() {
    const menuItems = document.getElementById('menuItems');
    menuItems.innerHTML = '';
    
    const sortedObjects = [...objects].sort((a, b) => {
        const indexA = globalOrder.indexOf(a.id);
        const indexB = globalOrder.indexOf(b.id);
        return indexA - indexB;
    });
    
    sortedObjects.forEach((obj, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.setAttribute('data-id', obj.id);
        menuItem.innerHTML = `
            <label class="menu-checkbox">
                ${currentAccessLevel === "admin" ? '<span class="drag-handle">⋮⋮</span>' : ''}
                <span class="order-number">${index + 1}</span>
                <input type="checkbox" ${obj.visible ? 'checked' : ''} 
                       onchange="handleCheckboxChange(${obj.id}, this.checked)">
                <span class="checkmark"></span>
                <div class="menu-object-info">
                    <strong>${obj.name}</strong>
                    <div class="menu-details">
                        <span>${obj.ageMin}-${obj.ageMax} лет</span>
                        <span>${obj.allowedGenders.join(', ')}</span>
                        <span>${obj.allowedNationalities.join(', ')}</span>
                    </div>
                    <button class="priority-toggle ${obj.priority ? 'priority-active' : ''}" 
                            onclick="togglePriority(${obj.id})">
                        ${obj.priority ? '🚀 В приоритете' : '⚪ Обычный'}
                    </button>
                </div>
            </label>
        `;
        menuItems.appendChild(menuItem);
    });
    
    updateSaveButtonState();
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ДЛЯ ЧЕКБОКСОВ
async function handleCheckboxChange(objectId, isVisible) {
    const object = objects.find(obj => obj.id === objectId);
    if (object) {
        // НЕМЕДЛЕННО обновляем видимость объекта
        object.visible = isVisible;
        
        if (currentAccessLevel === "admin") {
            await saveSettingsToServer(objectId, isVisible, object.priority);
        }
        
        // Обновляем отображение результатов
        filterAndDisplayObjects();
    }
}

function updateSaveButtonState() {
    const saveButton = document.getElementById('saveOrderBtn');
    const adminControls = document.getElementById('adminControls');
    
    if (saveButton && adminControls) {
        if (hasUnsavedChanges) {
            saveButton.innerHTML = '💾 Сохранить порядок *';
            saveButton.style.background = '#e74c3c';
        } else {
            saveButton.innerHTML = '💾 Сохранить порядок';
            saveButton.style.background = '#27ae60';
        }
    }
}

async function togglePriority(objectId) {
    const object = objects.find(obj => obj.id === objectId);
    if (object) {
        object.priority = !object.priority;
        if (currentAccessLevel === "admin") {
            await saveSettingsToServer(objectId, object.visible, object.priority);
        }
        fillMenuWithObjects();
        filterAndDisplayObjects();
    }
}

function checkAllObjects() {
    if (currentAccessLevel === "admin") {
        checkAllObjectsOnServer();
    } else {
        objects.forEach(obj => obj.visible = true);
        fillMenuWithObjects();
        filterAndDisplayObjects();
    }
}

function uncheckAllObjects() {
    if (currentAccessLevel === "admin") {
        uncheckAllObjectsOnServer();
    } else {
        objects.forEach(obj => obj.visible = false);
        fillMenuWithObjects();
        filterAndDisplayObjects();
    }
}

// Обновляем функцию showContent для инициализации перетаскивания
const originalShowContent = window.showContent;
window.showContent = async function() {
    await originalShowContent();
    initDragAndDrop();
};