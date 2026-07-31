let sortable = null;
let adminMode = localStorage.getItem("adminMode") === "true";

const id = new URLSearchParams(location.search).get("id");

// ================================

async function save() {

    // localStorage как кэш
    if (id) {
    localStorage.setItem("levels_" + id, JSON.stringify(listLevels));
} else {
    localStorage.setItem("levels", JSON.stringify(levels));
}

    if (typeof changes !== "undefined") {
        localStorage.setItem("changes", JSON.stringify(changes));
    }

    if (typeof lists !== "undefined") {
        localStorage.setItem("lists", JSON.stringify(lists));
    }

    const data = await loadGithubData();

    // Главный список
    if (typeof levels !== "undefined" && !id) {
        data.defaultLevels = levels;
    }

    // Другие списки
    if (typeof listLevels !== "undefined" && id) {
        data.listLevels[id] = listLevels;
    }

    // Upcoming Changes
    if (typeof changes !== "undefined") {
        data.defaultChanges = changes;
    }

    // Other Lists
    if (typeof lists !== "undefined") {
        data.defaultLists = lists;
    }

    await saveGithubData(data);

}


// ================================

function renderLevels() {

    const container = document.getElementById("levels");

     if (!container) return;

    container.innerHTML = "";

    let place = 1;

    const arr = id ? listLevels : levels;

        arr.forEach((level, index) => {

        if(level.separator){

    container.innerHTML += `
    <div class="dfc">

        <p>
            - - - - - - - - ${level.separator} - - - - - - - -
        </p>

        ${adminMode ? `
            <button class="spbut" onclick="editSeparator(${index})">✏️</button>
            <button class="spbut" onclick="deleteLevel(${index})">🗑️</button>
        ` : ""}

    </div>
    `;

    return;
}


        container.innerHTML += `
<div class="level"
     draggable="true"
     data-index="${index}">

    <a href="${level.link}" target="_blank">
        <img class="image" src="${level.image}">
    </a>

    <div class="level-name">

        <div class="name-num">
             <p class="num">#${place}</p>
            <p class="name">${level.name}</p>
        </div>

        <p class="creator">${level.creator}</p>
        <p class="wr">WR: ${level.wr}</p>

        ${adminMode ? `
<div class="buttons">

    <button onclick="event.preventDefault();moveUp(${index})">⬆</button>

    <button onclick="event.preventDefault();moveDown(${index})">⬇</button>

    <button onclick="event.preventDefault();editLevel(${index})">✏️</button>

    <button onclick="event.preventDefault();deleteLevel(${index})">🗑️</button>

</div>
` : ""}

    </div>

</div>
`;
        place++;

    });
    initSortable();
}

function initSortable() {

    if (sortable) {
        sortable.destroy();
        sortable = null;
    }

    if (!adminMode) return;

    const container = document.getElementById("levels");
    if (!container) return;

    sortable = new Sortable(container, {

        animation: 200,

        filter: ".spbut,.buttons button",

        preventOnFilter: false,

        onEnd: async function (evt) {

            const arr = id ? listLevels : levels;

            const moved = arr.splice(evt.oldIndex, 1)[0];
            arr.splice(evt.newIndex, 0, moved);

            await save();
            renderLevels();

        }

    });

}

// ================================

function getYoutubeThumbnail(url) {

    let id = "";

    if (url.includes("youtu.be/")) {

        id = url.split("youtu.be/")[1].split("?")[0];

    } else if (url.includes("watch?v=")) {

        id = url.split("watch?v=")[1].split("&")[0];

    }

    if (!id) return "";

    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

}

async function addLevel() {

    const name = document.getElementById("levelName").value;

    const creator = document.getElementById("creator").value;

    const wr = document.getElementById("wr").value;

    const link = document.getElementById("link").value;

    let image = document.getElementById("image").value;

    if (image === "" && link !== "") {

    image = getYoutubeThumbnail(link);

}

    if (name.trim() === "") return;

   if (image === "" && link !== "") {

    loadYoutubeThumbnail(link, async function(thumbnail){

        const arr = id ? listLevels : levels;

        arr.push({
            name,
            creator,
            wr,
            image: thumbnail,
            link
        });

        await save();
        renderLevels();

    });

} else {

       const arr = id ? listLevels : levels;

    arr.push({
        name,
        creator,
        wr,
        image,
        link
    });

    await save();
    renderLevels();

}

    document.getElementById("levelName").value = "";
    document.getElementById("creator").value = "";
    document.getElementById("wr").value = "";
    document.getElementById("image").value = "";
    document.getElementById("link").value = "";

}

// ================================

async function deleteLevel(index) {

    if (!confirm("Delete this level?"))
        return;

    const arr = id ? listLevels : levels;

    arr.splice(index, 1);

    await save();

    renderLevels();

}

// ================================

let editingIndex = -1;

function editLevel(index){

    editingIndex=index;

    const arr = id ? listLevels : levels;
    const level = arr[index];

    document.getElementById("eName").value=level.name;

    document.getElementById("eCreator").value=level.creator;

    document.getElementById("eWR").value=level.wr;

    document.getElementById("eImage").value=level.image;

    document.getElementById("eLink").value=level.link;

    document.getElementById("editor").style.display="flex";

}

// ================================

async function moveUp(index) {

    if (index === 0)
        return;

    const arr = id ? listLevels : levels;

        [arr[index], arr[index - 1]] =
        [arr[index - 1], arr[index]];

    await save();

    renderLevels();

}

// ================================

async function moveDown(index) {

    const arr = id ? listLevels : levels;

    if (index === arr.length - 1) return;

    [arr[index], arr[index + 1]] =
    [arr[index + 1], arr[index]];

    await save();
    renderLevels();
}

// ================================

function closeEditor(){

    document.getElementById("editor").style.display="none";

}

async function saveEdit(){

    const image = document.getElementById("eImage").value;

    const arr = id ? listLevels : levels;

        arr[editingIndex].name = document.getElementById("eName").value;
        arr[editingIndex].creator = document.getElementById("eCreator").value;
        arr[editingIndex].wr = document.getElementById("eWR").value;
        arr[editingIndex].image = image;
        arr[editingIndex].link = document.getElementById("eLink").value;

if (image === "" && arr[editingIndex].link !== "") {

    loadYoutubeThumbnail(arr[editingIndex].link, async function(thumbnail){

        arr[editingIndex].image = thumbnail;

        await save();
        renderLevels();
        closeEditor();

    });

    return;
}

    await save();

    renderLevels();

    closeEditor();

}

// =========================

async function addSeparator(){

    const text = prompt("Separator name");

    if(!text) return;

    const arr = id ? listLevels : levels;

        arr.push({
        separator: text
    });

    await save();
    renderLevels();

}

async function editSeparator(index){

    const arr = id ? listLevels : levels;

    const name = prompt(
        "Separator name",
        arr[index].separator
    );

    if (!name) return;

    arr[index].separator = name;

    await save();
    renderLevels();

}

function loadYoutubeThumbnail(videoUrl, callback) {

    let id = "";

    if (videoUrl.includes("watch?v=")) {

        id = videoUrl.split("watch?v=")[1].split("&")[0];

    } else if (videoUrl.includes("youtu.be/")) {

        id = videoUrl.split("youtu.be/")[1].split("?")[0];

    }

    if (!id) {

        callback("");
        return;

    }

    const max = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    const hq = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

    const img = new Image();

    img.onload = function () {

        if (img.naturalWidth > 120) {

            callback(max);

        } else {

            callback(hq);

        }

    };

    img.onerror = function () {

        callback(hq);

    };

    img.src = max;

}

// ==================

async function toggleAdmin() {

    if (adminMode) {

        adminMode = false;
        localStorage.removeItem("githubToken");
        localStorage.setItem("adminMode", "false");

        renderLevels();
        renderChanges();
        updateAdminButtons();

        return;
    }

    const token = prompt("GitHub Personal Access Token");

    if (!token) return;

    try {

        const response = await fetch("https://api.github.com/user", {

            headers: {
                Authorization: "Bearer " + token,
                Accept: "application/vnd.github+json"
            }

        });

        if (!response.ok) {
            alert("Invalid token");
            return;
        }

        const user = await response.json();

        if (user.login !== "KrokGG1") {

            alert("Access denied");
            return;

        }

        adminMode = true;

        localStorage.setItem("githubToken", token);
        localStorage.setItem("adminMode", "true");

        location.reload();

    } catch {

        alert("Connection error");

    }

}

function logoutAdmin() {

    adminMode = false;

    localStorage.setItem("adminMode", "false");

    updateAdminButtons();

    location.reload(); // если на странице есть админ-панель
}

function updateAdminButtons() {

    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (loginBtn) {
        loginBtn.style.display = adminMode ? "none" : "block";
    }

    if (logoutBtn) {
        logoutBtn.style.display = adminMode ? "block" : "none";
    }
}
const panel = document.querySelector(".admin-panel");

if (panel) {
    panel.style.display = adminMode ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {

    updateAdminButtons();

    const panel = document.querySelector(".admin-panel");

    if (panel) {
        panel.style.display = adminMode ? "block" : "none";
    }

});

async function saveChanges() {
    await save();
}

async function saveChange() {

    const name = document.getElementById("changeName").value.trim();
    const icon = document.getElementById("changeIcon").getValue();

    if (name.trim() === "") return;

    if (editingChange === -1) {

        // Добавление
        changes.push({
            name,
            icon
        });

    } else {

        // Изменение
        changes[editingChange].name = name;
        changes[editingChange].icon = icon;

        editingChange = -1;

    }

    await saveChanges();
    renderChanges();

    document.getElementById("changeName").value = "";
    document.getElementById("changeIcon").selectedIndex = 0;

}
function renderChanges() {

    const list = document.getElementById("changesList");

    if (!list) return;

    list.innerHTML = "";

    changes.forEach((change, index) => {

        list.innerHTML += `
            <li class="l">
                ${change.icon} ${change.name}

                ${adminMode ? `
                    <button id="changebtn111" onclick="editChange(${index})">✏️</button>
                    <button id="changebtn111" onclick="deleteChange(${index})">🗑️</button>
                ` : ""}
            </li>
        `;

    });

}

async function deleteChange(index) {

    changes.splice(index, 1);

    await saveChanges();
    renderChanges();

}

let editingChange = -1;

function editChange(index) {

    editingChange = index;

    document.getElementById("changeName").value = changes[index].name;
    const select = document.getElementById("changeIcon");

const option = [...select.querySelectorAll(".select-items div")]
    .find(div => div.dataset.value === changes[index].icon);

if (option) {

    select.querySelector(".select-selected").innerHTML = option.innerHTML;

    select.getValue = () => option.dataset.value;

}

}
const customSelect = document.getElementById("changeIcon");

if (customSelect) {

    const selected = customSelect.querySelector(".select-selected");

    const items = customSelect.querySelector(".select-items");

    let selectedValue = "🔴";

    selected.onclick = () => {

        customSelect.classList.toggle("open");

    };

    items.querySelectorAll("div").forEach(item => {

        item.onclick = () => {

            selected.innerHTML = item.innerHTML;

            selectedValue = item.dataset.value;

            customSelect.classList.remove("open");

        };

    });

    document.addEventListener("click", e => {

        if (!customSelect.contains(e.target)) {

            customSelect.classList.remove("open");

        }

    });

    customSelect.getValue = () => selectedValue;

}

async function init() {

    const data = await loadGithubData();

    if (id) {

        listLevels = structuredClone(data.listLevels[id] || []);

    } else {

        levels = structuredClone(data.defaultLevels || []);

    }

    changes = structuredClone(data.defaultChanges || []);

    if (typeof lists !== "undefined") {
        lists = structuredClone(data.defaultLists || []);
    }

    // восстановление админки
    const token = localStorage.getItem("githubToken");

    if (token) {

        const response = await fetch("https://api.github.com/user", {

            headers: {
                Authorization: "Bearer " + token,
                Accept: "application/vnd.github+json"
            }

        });

        if (response.ok) {

            const user = await response.json();

            if (user.login === "KrokGG1") {

                adminMode = true;
                localStorage.setItem("adminMode", "true");

            }

        }

    }

    renderLevels();

    if (typeof renderChanges === "function")
        renderChanges();

    if (typeof renderLists === "function")
        renderLists();

    if (typeof renderListLevels === "function")
        renderListLevels();

    updateAdminButtons();

}
document.addEventListener("DOMContentLoaded", init);