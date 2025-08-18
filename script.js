function getData() {
    return JSON.parse(localStorage.getItem("todoData")) || {};
}

function saveData(data) {
    localStorage.setItem("todoData", JSON.stringify(data));
}

function addCategory(name) {
    let data = getData();
    if (!data[name]) {
        data[name] = { dailyTasks: [], overallTasks: [], notes: "" };
        saveData(data);
    }
}

function loadCategories() {
    let container = document.getElementById("category-container");
    container.innerHTML = "";
    let data = getData();
    Object.keys(data).forEach(category => {
        let div = document.createElement("div");
        div.className = "category";
        div.style.display = "flex";
        div.style.alignItems = "center";
        // Category name span
        let nameSpan = document.createElement("span");
        nameSpan.textContent = category;
        nameSpan.style.cursor = "pointer";
        nameSpan.onclick = () => {
            window.location.href = `category.html?category=${encodeURIComponent(category)}`;
        };
        // Spacer for blank space
        let spacer = document.createElement("span");
        spacer.style.flex = "1";
        // Edit button
        let editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.style.marginRight = "4px";
        editBtn.onclick = function(e) {
            e.stopPropagation();
            const newName = prompt("Edit category name:", category);
            if (newName && newName.trim() !== "" && newName !== category) {
                let data = getData();
                // Prevent duplicate category names
                if (data[newName]) {
                    alert("A category with that name already exists.");
                    return;
                }
                data[newName] = data[category];
                delete data[category];
                saveData(data);
                loadCategories();
            }
        };
        div.appendChild(nameSpan);
        div.appendChild(spacer);
        div.appendChild(editBtn);
        container.appendChild(div);
    });
}

function loadCategoryData(categoryName) {
    let data = getData();
    let category = data[categoryName];
    // Ensure arrays exist for backward compatibility
    if (!category.dailyTasks) category.dailyTasks = [];
    if (!category.overallTasks) category.overallTasks = [];
    let dailyTaskList = document.getElementById("dailyTaskList");
    let overallTaskList = document.getElementById("overallTaskList");
    dailyTaskList.innerHTML = "";
    overallTaskList.innerHTML = "";

    // Daily Tasks
    // Store daily completion status per day in localStorage
    let todayKey = new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,'0') + '-' + String(new Date().getDate()).padStart(2,'0');
    let dailyStatus = JSON.parse(localStorage.getItem('dailyTaskStatus')) || {};
    if (!dailyStatus[categoryName]) dailyStatus[categoryName] = {};
    if (!dailyStatus[categoryName][todayKey]) {
        // First load for today, initialize status from tasks
        dailyStatus[categoryName][todayKey] = category.dailyTasks.map(task => !!task.done);
        localStorage.setItem('dailyTaskStatus', JSON.stringify(dailyStatus));
    }
    // Sync task.done with stored status
    category.dailyTasks.forEach((task, index) => {
        task.done = dailyStatus[categoryName][todayKey][index] || false;
    });
    category.dailyTasks.forEach((task, index) => {
        let li = document.createElement("li");
        li.className = task.done ? "done-green" : "";
        // Create text span
        let textSpan = document.createElement("span");
        textSpan.textContent = task.text;
        li.appendChild(textSpan);
        // Actions
        let actionsSpan = document.createElement("span");
        actionsSpan.className = "task-actions";
        // Check button
        let checkBtn = document.createElement("button");
        checkBtn.className = "check-btn";
        checkBtn.textContent = "✔️";
        checkBtn.onclick = function() { toggleDailyDone(categoryName, index); };
        actionsSpan.appendChild(checkBtn);
        // Edit button (moved next to check)
        let editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.style.marginLeft = "8px";
        editBtn.onclick = function() {
            const newText = prompt("Edit task text:", task.text);
            if (newText !== null && newText.trim() !== "") {
                let data = getData();
                data[categoryName].dailyTasks[index].text = newText.trim();
                saveData(data);
                loadCategoryData(categoryName);
            }
        };
        actionsSpan.appendChild(editBtn);
        // Delete button
        let deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "❌";
        deleteBtn.style.marginLeft = "8px";
        deleteBtn.onclick = function() { deleteDailyTask(categoryName, index); };
        actionsSpan.appendChild(deleteBtn);
        li.appendChild(actionsSpan);
        dailyTaskList.appendChild(li);
    });

    // Overall Tasks
    category.overallTasks.forEach((task, index) => {
        let li = document.createElement("li");
        li.className = task.done ? "done-green" : "";
        li.style.position = "relative";
        // Star button (important)
        if (typeof task.important === 'undefined') task.important = false;
        let starBtn = document.createElement("button");
        starBtn.className = "star-btn";
        starBtn.style.position = "absolute";
        starBtn.style.left = "-36px";
        starBtn.style.top = "50%";
        starBtn.style.transform = "translateY(-50%)";
        starBtn.style.background = "none";
        starBtn.style.border = "none";
        starBtn.style.padding = "0";
        starBtn.style.cursor = "pointer";
        starBtn.style.fontSize = "24px";
        starBtn.innerHTML = task.important ? '★' : '☆';
        starBtn.style.color = task.important ? '#FFD700' : '#888';
        starBtn.onclick = function(e) {
            e.stopPropagation();
            let data = getData();
            data[categoryName].overallTasks[index].important = !data[categoryName].overallTasks[index].important;
            saveData(data);
            loadCategoryData(categoryName);
        };
        li.appendChild(starBtn);
        // Create text span
        let textSpan = document.createElement("span");
        textSpan.textContent = task.text;
        li.appendChild(textSpan);
        // Actions
        let actionsSpan = document.createElement("span");
        actionsSpan.className = "task-actions";
        // Check button
        let checkBtn = document.createElement("button");
        checkBtn.className = "check-btn";
        checkBtn.textContent = "✔️";
        checkBtn.onclick = function() { toggleOverallDone(categoryName, index); };
        actionsSpan.appendChild(checkBtn);
        // Edit button (moved next to check)
        let editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.style.marginLeft = "8px";
        editBtn.onclick = function() {
            const newText = prompt("Edit task text:", task.text);
            if (newText !== null && newText.trim() !== "") {
                let data = getData();
                data[categoryName].overallTasks[index].text = newText.trim();
                saveData(data);
                loadCategoryData(categoryName);
            }
        };
        actionsSpan.appendChild(editBtn);
        // Delete button
        let deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "❌";
        deleteBtn.style.marginLeft = "8px";
        deleteBtn.onclick = function() { deleteOverallTask(categoryName, index); };
        actionsSpan.appendChild(deleteBtn);
        li.appendChild(actionsSpan);
        overallTaskList.appendChild(li);
    });

    document.getElementById("notesArea").value = category.notes || "";
}

function addTask(categoryName, text, type) {
    let data = getData();
    if (!data[categoryName]) {
        data[categoryName] = { dailyTasks: [], overallTasks: [], notes: "" };
    }
    // Ensure arrays exist for backward compatibility
    if (!data[categoryName].dailyTasks) data[categoryName].dailyTasks = [];
    if (!data[categoryName].overallTasks) data[categoryName].overallTasks = [];
    if (type === "daily") {
        data[categoryName].dailyTasks.push({ text: text, done: false });
    } else {
        data[categoryName].overallTasks.push({ text: text, done: false });
    }
    saveData(data);
}
function toggleOverallDone(categoryName, index) {
    let data = getData();
    // Mark as done and add to daily log
    let task = data[categoryName].overallTasks[index];
    task.done = true;
    // Save to accomplishmentLogs (just the text)
    saveAccomplishmentLog(task.text);
    // Remove from overall tasks
    data[categoryName].overallTasks.splice(index, 1);
    saveData(data);
    loadCategoryData(categoryName);
    // If daily log modal is open, update it
    const modal = document.getElementById('dailyLogModal');
    if (modal && modal.style.display === 'flex') {
        updateDailyLogModal();
    }
}

function toggleDailyDone(categoryName, index) {
    let data = getData();
    let task = data[categoryName].dailyTasks[index];
    // Update daily status in localStorage
    let todayKey = new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,'0') + '-' + String(new Date().getDate()).padStart(2,'0');
    let dailyStatus = JSON.parse(localStorage.getItem('dailyTaskStatus')) || {};
    if (!dailyStatus[categoryName]) dailyStatus[categoryName] = {};
    if (!dailyStatus[categoryName][todayKey]) dailyStatus[categoryName][todayKey] = data[categoryName].dailyTasks.map(task => !!task.done);
    dailyStatus[categoryName][todayKey][index] = !dailyStatus[categoryName][todayKey][index];
    task.done = dailyStatus[categoryName][todayKey][index];
    localStorage.setItem('dailyTaskStatus', JSON.stringify(dailyStatus));
    if (task.done) {
        saveAccomplishmentLog(task.text);
    }
    saveData(data);
    loadCategoryData(categoryName);
    // If daily log modal is open, update it
    const modal = document.getElementById('dailyLogModal');
    if (modal && modal.style.display === 'flex') {
        updateDailyLogModal();
    }
}
// Save accomplishment to localStorage for today
function saveAccomplishmentLog(text) {
    const now = new Date();
    // Get local date in YYYY-MM-DD format
    const dateKey = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    let logs = JSON.parse(localStorage.getItem('accomplishmentLogs')) || {};
    if (!logs[dateKey]) logs[dateKey] = [];
    // Get category and color
    let todoData = JSON.parse(localStorage.getItem('todoData')) || {};
    let category = null;
    let color = null;
    // Try to find the category for this text
    Object.keys(todoData).forEach(cat => {
        if (todoData[cat].dailyTasks.some(task => task.text === text) || todoData[cat].overallTasks.some(task => task.text === text)) {
            category = cat;
        }
    });
    // Get color for category
    if (category) {
        let colors = JSON.parse(localStorage.getItem('categoryColors')) || {};
        color = colors[category] || null;
    }
    // Save as object with text, category, color
    let entry = { text, category, color };
    // Prevent duplicates by text
    if (!logs[dateKey].some(e => (typeof e === 'object' ? e.text : e) === text)) logs[dateKey].push(entry);
    localStorage.setItem('accomplishmentLogs', JSON.stringify(logs));
}
// Helper to update daily log modal
function updateDailyLogModal() {
    let data = getData();
    let accomplishments = [];
    Object.keys(data).forEach(category => {
        if (Array.isArray(data[category].dailyTasks)) {
            data[category].dailyTasks.forEach(task => {
                if (task.done) {
                    accomplishments.push(`${category} (Daily): ${task.text}`);
                }
            });
        }
        if (Array.isArray(data[category].overallTasks)) {
            data[category].overallTasks.forEach(task => {
                if (task.done) {
                    accomplishments.push(`${category} (Overall): ${task.text}`);
                }
            });
        }
    });
    const logList = document.getElementById("dailyLogList");
    logList.innerHTML = "";
    if (accomplishments.length === 0) {
        logList.innerHTML = '<li>No accomplishments yet today!</li>';
    } else {
        accomplishments.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            logList.appendChild(li);
        });
    }
}

function deleteDailyTask(categoryName, index) {
    let data = getData();
    data[categoryName].dailyTasks.splice(index, 1);
    saveData(data);
    loadCategoryData(categoryName);
}

function deleteOverallTask(categoryName, index) {
    let data = getData();
    data[categoryName].overallTasks.splice(index, 1);
    saveData(data);
    loadCategoryData(categoryName);
}

function saveNotes(categoryName, notes) {
    let data = getData();
    data[categoryName].notes = notes;
    saveData(data);
}
function deleteCategory(categoryName) {
    let data = getData();
    delete data[categoryName];
    saveData(data);
    loadCategories();
// Add CSS for green background when done
}