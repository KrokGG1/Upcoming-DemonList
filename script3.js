let listsortable = null;
const listid = new URLSearchParams(location.search).get("id");
let listLevels = [];

function init() {

    listLevels = JSON.parse(localStorage.getItem("levels_" + listid));

if (!listLevels || listLevels.length === 0) {
    listLevels = structuredClone(DATA.listLevels[listid] || []);
}

    renderListLevels();

}

function saveListLevels() {
    localStorage.setItem(
        "levels_" + listid,
        JSON.stringify(listLevels)
    );
}

function renderListLevels() {

    const container = document.getElementById("listlevels");

    if (!container) return;

    container.innerHTML = "";

    let place = 1;

    listLevels.forEach((level, index) => {

        if (!level) {
        console.error("Broken level:", index, level);
        return;
    }

        container.innerHTML += `
            <div class="level">

                <a href="${level.link}" target="_blank">
                    <img class="image" src="${level.image}">
                </a>

                <div class="level-name">

                    <div class="name-num">
                        <p class="num">#${place}</p>
                        <p class="name">${level.name}</p>
                    </div>

                    <p class="creator">${level.creator}</p>

                    ${adminMode ? `
                    <div class="buttons">

                        <button onclick="event.preventDefault();moveUp(${index})">⬆</button>

                        <button onclick="event.preventDefault();moveDown(${index})">⬇</button>

                        <button onclick="event.preventDefault();editListLevel(${index})">✏️</button>

                        <button onclick="event.preventDefault();deleteListLevel(${index})">🗑️</button>

                    </div>
                    ` : ""}

                </div>

            </div>
        `;

        place++;

    });

    initSortable()

}

function addListLevel() {

    const name = document.getElementById("levelName").value.trim();
    const creator = document.getElementById("creator").value.trim();
    const link = document.getElementById("link").value.trim();

    let image = document.getElementById("image").value.trim();

    if (name.trim() === "") return;

    if (image === "" && link !== "") {

        loadYoutubeThumbnail(link, function(thumbnail) {

            listLevels.push({
                name,
                creator,
                image: thumbnail,
                link
            });

            saveListLevels();
            renderListLevels();

        });

    } else {

        listLevels.push({
            name,
            creator,
            image,
            link
        });

        saveListLevels();
        renderListLevels();

    }

    document.getElementById("levelName").value = "";
    document.getElementById("creator").value = "";
    document.getElementById("image").value = "";
    document.getElementById("link").value = "";

}

function deleteListLevel(index) {

    if (!confirm("Delete this level?")) return;

    listLevels.splice(index, 1);

    saveListLevels();
    renderListLevels();

}

let editingListIndex = -1;

function editListLevel(index) {

    editingListIndex = index;

    document.getElementById("eName").value = listLevels[index].name;
    document.getElementById("eCreator").value = listLevels[index].creator;
    document.getElementById("eImage").value = listLevels[index].image;
    document.getElementById("eLink").value = listLevels[index].link;

    document.getElementById("editor").style.display = "flex";

}

function moveUp(index) {

    if (index === 0) return;

    [listLevels[index], listLevels[index - 1]] =
    [listLevels[index - 1], listLevels[index]];

    saveListLevels();
    renderListLevels();

}

function moveDown(index) {

    if (index === listLevels.length - 1) return;

    [listLevels[index], listLevels[index + 1]] =
    [listLevels[index + 1], listLevels[index]];

    saveListLevels();
    renderListLevels();

}

function initSortable() {

    if (listsortable) {
        listsortable.destroy();
        listsortable = null;
    }

    if (!adminMode) return;

    const container = document.getElementById("listlevels");

    if (!container) return;

    listsortable = new Sortable(container, {

        animation: 200,

        onEnd(evt) {

            const moved = listLevels.splice(evt.oldIndex, 1)[0];

            listLevels.splice(evt.newIndex, 0, moved);

            saveListLevels();
            renderListLevels();

        }

    });

}

function saveListEdit() {

    const image = document.getElementById("eImage").value;

    listLevels[editingListIndex].name =
        document.getElementById("eName").value;

    listLevels[editingListIndex].creator =
        document.getElementById("eCreator").value;

    listLevels[editingListIndex].image = image;

    listLevels[editingListIndex].link =
        document.getElementById("eLink").value;

    if (image === "" && listLevels[editingListIndex].link !== "") {

        loadYoutubeThumbnail(
            listLevels[editingListIndex].link,
            function(thumbnail) {

                listLevels[editingListIndex].image = thumbnail;

                saveListLevels();
                renderListLevels();
                closeEditor();

            }
        );

        return;
    }

    saveListLevels();
    renderListLevels();
    closeEditor();

}
