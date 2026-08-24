let listsortable = null;
const listid = new URLSearchParams(location.search).get("id");

if (typeof listLevels === "undefined") {
    let listLevels = [];
}

async function initListPage() {

    if (!listLevels || !Array.isArray(listLevels)) {
        listLevels = [];
    }

    renderListLevels();
}

async function saveListLevels() {

    if (listid) {
        localStorage.setItem(
            "levels_" + listid,
            JSON.stringify(listLevels)
        );
    }

    if (typeof save === "function") {
        await save();
    }
}

function renderListLevels() {

    const container = document.getElementById("listlevels");

    if (!container) return;

    container.innerHTML = "";

    let place = 1;

    listLevels.forEach((level, index) => {

        if (!level) return;

        container.innerHTML += `
            <div
                class="level"
                draggable="${adminMode}"
                data-index="${index}"
            >

                <a href="${level.link}" target="_blank">
                    <img
                        class="image"
                        src="${level.image}"
                    >
                </a>

                <div class="level-name">

                    <div class="name-num">
                        <p class="num">#${place}</p>
                        <p class="name">${level.name}</p>
                    </div>

                    <p class="creator">${level.creator}</p>

                    <p class="wr">
                        WR: ${level.wr || ""}
                    </p>

                    ${adminMode ? `
                        <div class="buttons">

                            <button
                                onclick="event.preventDefault(); event.stopPropagation(); listMoveUp(${index})">
                                ⬆
                            </button>

                            <button
                                onclick="event.preventDefault(); event.stopPropagation(); listMoveDown(${index})">
                                ⬇
                            </button>

                            <button
                                onclick="event.preventDefault(); event.stopPropagation(); editListLevel(${index})">
                                ✏️
                            </button>

                            <button
                                onclick="event.preventDefault(); event.stopPropagation(); deleteListLevel(${index})">
                                🗑️
                            </button>

                        </div>
                    ` : ""}

                </div>

            </div>
        `;

        place++;

    });

    initListSortable();
}

async function addListLevel() {

    const name = document
        .getElementById("levelName")
        .value
        .trim();

    const creator = document
        .getElementById("creator")
        .value
        .trim();

    const link = document
        .getElementById("link")
        .value
        .trim();

    let image = document
        .getElementById("image")
        .value
        .trim();

    if (!name) {
        alert("Enter level name");
        return;
    }


    // Если картинки нет, но есть YouTube ссылка
    if (!image && link) {

        loadYoutubeThumbnail(link, async function(thumbnail) {

            listLevels.push({
                name: name,
                creator: creator,
                wr: "",
                image: thumbnail,
                link: link
            });

            clearAddForm();

            await saveListLevels();
            renderListLevels();

        });

        return;
    }

    listLevels.push({
        name: name,
        creator: creator,
        wr: "",
        image: image,
        link: link
    });

    clearAddForm();

    await saveListLevels();
    renderListLevels();
}

function deleteListLevel(index) {

    if (!confirm("Delete this level?")) return;

    listLevels.splice(index, 1);

    saveListLevels();
    renderListLevels();

}

let editingListIndex = -1;

function editListLevel(index) {

    if (
        index < 0 ||
        index >= listLevels.length
    ) {
        return;
    }

    editingListIndex = index;

    const level = listLevels[index];

    document.getElementById("eName").value =
        level.name || "";

    document.getElementById("eCreator").value =
        level.creator || "";

    document.getElementById("eImage").value =
        level.image || "";

    document.getElementById("eLink").value =
        level.link || "";

    document.getElementById("eWR").value =
        level.wr || "";

    document.getElementById("editor").style.display =
        "flex";
}


function clearAddForm() {

    const fields = [
        "levelName",
        "creator",
        "image",
        "link"
    ];

    fields.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });

}

async function listMoveUp(index) {

    if (
        !Number.isInteger(index) ||
        index <= 0 ||
        index >= listLevels.length
    ) {
        return;
    }

    [
        listLevels[index - 1],
        listLevels[index]
    ] = [
        listLevels[index],
        listLevels[index - 1]
    ];

    await saveListLevels();

    renderListLevels();
}

async function listMoveDown(index) {

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= listLevels.length - 1
    ) {
        return;
    }

    [
        listLevels[index],
        listLevels[index + 1]
    ] = [
        listLevels[index + 1],
        listLevels[index]
    ];

    await saveListLevels();

    renderListLevels();
}

function initListSortable() {

    if (listsortable) {

        listsortable.destroy();
        listsortable = null;

    }

    if (!adminMode) return;

    const container = document.getElementById("listlevels");

    if (!container) return;

    listsortable = new Sortable(container, {

        animation: 200,

        draggable: ".level",

        filter: ".buttons, .buttons button, a",

        preventOnFilter: false,

        onEnd: async function(evt) {

            if (
                evt.oldIndex == null ||
                evt.newIndex == null ||
                evt.oldIndex === evt.newIndex
            ) {
                return;
            }

            /*
             * Важно:
             * используем только .level элементы,
             * поэтому separator больше не ломает индексы.
             */

            const levelElements = [
                ...container.querySelectorAll(".level")
            ];

            const oldElement = levelElements[evt.oldIndex];

            const newElement = levelElements[evt.newIndex];

            if (!oldElement || !newElement) {
                return;
            }

            const oldDataIndex =
                Number(oldElement.dataset.index);

            const newDataIndex =
                Number(newElement.dataset.index);

            if (
                Number.isNaN(oldDataIndex) ||
                Number.isNaN(newDataIndex)
            ) {
                return;
            }

            const moved =
                listLevels.splice(oldDataIndex, 1)[0];

            listLevels.splice(newDataIndex, 0, moved);

            await saveListLevels();

            renderListLevels();

        }

    });

}


async function saveListEdit() {

    if (
        editingListIndex < 0 ||
        editingListIndex >= listLevels.length
    ) {
        return;
    }

    const level = listLevels[editingListIndex];

    const name = document
        .getElementById("eName")
        .value
        .trim();

    const creator = document
        .getElementById("eCreator")
        .value
        .trim();

    const image = document
        .getElementById("eImage")
        .value
        .trim();

    const link = document
        .getElementById("eLink")
        .value
        .trim();

    const wr = document
        .getElementById("eWR")
        .value
        .trim();

    if (!name) {
        alert("Enter level name");
        return;
    }

    level.name = name;
    level.creator = creator;
    level.wr = wr;
    level.link = link;


    if (!image && link) {

        loadYoutubeThumbnail(
            link,
            async function(thumbnail) {

                level.image = thumbnail;

                await saveListLevels();

                renderListLevels();

                closeEditor();

            }
        );

        return;
    }

    level.image = image;

    await saveListLevels();

    renderListLevels();

    closeEditor();

    editingListIndex = -1;
}

document.addEventListener(
    "DOMContentLoaded",
    initListPage
);
